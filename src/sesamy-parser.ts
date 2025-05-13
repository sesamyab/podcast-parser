import sanitizeHtml from 'sanitize-html';
import { toSeconds } from './utils/itunes-duration';
import { tryParseInt } from './utils/try-parse-int';
import {
  RssFeed,
  ItunesCategory,
  Item,
  sesamyFeedEpisodeSchema,
  SesamyFeed,
  SesamyFeedProduct,
} from '@sesamy/podcast-schemas';

/**
 * Returns the categories including the nested ones
 * @param unparsedCategories
 * @returns
 */
function getCategories(unparsedCategories: ItunesCategory[]): string[] {
  let results: string[] = [];
  unparsedCategories.forEach((item: ItunesCategory) => {
    if (item['itunes:category']) {
      results = results.concat(getCategories(item['itunes:category']));
    }
    if (item['@_text']) {
      results.push(item['@_text']);
    }
  });
  return results;
}

/**
 * Convert plain episodes into Sesamy format
 *
 * @param episode
 * @param showImage
 * @returns
 */
function decorateEpisode(episode: Item, isSesamy: boolean, isLocked: boolean, showImage?: string) {
  const enclosure = episode.enclosure?.find(item => item['@_type'] === 'audio/mpeg');
  const url = enclosure?.['@_url'];
  const title = episode.title ?? episode['itunes:title'] ?? '';

  const image = episode['itunes:image']?.['@_href'] ?? showImage ?? '';

  const tags = Array.isArray(episode['omny:clipCustomField'])
    ? episode['omny:clipCustomField'].map(cf => `${cf['@_key']}:${cf['@_value']}`)
    : [];

  const permissions = episode['@_permissions']?.split('|').filter(Boolean) ?? [];

  return sesamyFeedEpisodeSchema.parse({
    guid: episode?.guid['#text'],
    title,
    subtitle: episode['itunes:subtitle'],
    description: sanitizeHtml(episode.description || '', {
      allowedTags: [],
      allowedAttributes: {},
    }),
    descriptionWithHtml: sanitizeHtml(episode['content:encoded'] || episode.description || '', {
      allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
      selfClosing: ['br'],
      allowedAttributes: {
        a: ['href'],
      },
    }),
    summary: sanitizeHtml(episode['itunes:summary'] || '', {
      allowedTags: [],
      allowedAttributes: {},
    }),
    url,
    link: episode.link,
    image,
    duration: toSeconds(episode['itunes:duration'] ?? ''),
    isExplicit: episode['itunes:explicit'] === 'yes',
    episodeType: episode['itunes:episodeType'],
    contentType: enclosure?.['@_type'],
    contentLength: tryParseInt(enclosure?.['@_length']),
    publishDate: episode.pubDate ? new Date(episode.pubDate).toISOString() : undefined,
    season: episode['itunes:season'],
    episode: episode['itunes:episode'],
    isLocked: episode['@_locked'] || !!permissions?.length || isLocked,
    isSesamy,
    isSample: episode['@_sample'] || false,
    permissions,
    tags,
  });
}

/**
 * This functions converts an XML RSS feed into a Sesamy customized type
 * @param feed
 * @returns
 */
export function parseFeedToSesamy(feed: RssFeed) {
  const { rss } = feed;
  const { channel } = rss;
  if (!channel) {
    throw new Error('RSS Format not found.');
  }

  const image =
    channel['itunes:image'] && channel['itunes:image']['@_href']
      ? channel['itunes:image']['@_href']
      : channel?.image?.url;

  // The raw episode data. Does not contained locked episodes from Sesamy.
  const rssItems: Item[] = channel['item'] ?? [];

  // So lockedEpisodes do not come from the item field
  const rawLockedRssItems: Item[] = channel['sesamy:sesamy-item'] || [];

  const unlockedRssItems = rssItems.map((rssItem: Item) => {
    return decorateEpisode(rssItem, false, false, image);
  });

  const lockedRssItems = rawLockedRssItems.map((rssItem: Item) => {
    return decorateEpisode(rssItem, true, true, image);
  });

  const episodes = [...unlockedRssItems, ...lockedRssItems];

  const atomLinks = channel['atom:link'];

  const atomLink = atomLinks?.find(link => link['@_rel'] === 'self');
  const rssUrl = atomLink?.['@_href'] || '';

  const itunesType = channel['itunes:type'];
  const isHidden = /yes/i.test(channel['itunes:block'] ?? '');
  const isComplete = /yes/i.test(channel['itunes:complete'] ?? '');
  const isExplicit = /yes/i.test(channel['itunes:explicit'] ?? '');
  // Pick the highest season from episodes
  const totalSeasons = Math.max(
    ...episodes.map(episode => {
      return episode.season ?? 0;
    }),
    0,
  );
  const rawProducts = channel['sesamy:product'] ?? [];

  const products = rawProducts.map(item => {
    const lockedEpisodeWithImage = lockedRssItems.find(lockedEpisode => {
      return item['sesamy:id'] && lockedEpisode.permissions.includes(item['sesamy:id']) && lockedEpisode.image;
    });

    let purchaseType = item['sesamy:purchase-type'];
    let packageType = item['sesamy:package-type'];
    let type: 'Single Purchase' | 'single' | 'Recurring' | undefined;

    // Fallbacks for old formats
    switch (item['sesamy:purchase-type']) {
      case 'OWN':
        type = 'Single Purchase';
        break;
      case 'RECURRING':
        type = 'Recurring';
        break;
      case 'SINGLE':
        type = 'Single Purchase';
        break;
      default:
        switch (item.type?.toLocaleLowerCase()) {
          case 'recurring':
            type = 'Recurring';
            purchaseType = purchaseType || 'RECURRING';
            break;
          default:
            type = 'Single Purchase';
            purchaseType = purchaseType || 'OWN';
            break;
        }
    }

    const id = item['sesamy:id'] || item.id || '';

    if (!packageType) {
      const matchingEpisodes = episodes.filter(e => {
        return e.permissions.includes(id);
      });

      packageType = matchingEpisodes.length > 1 ? 'COLLECTION' : 'SINGLE';
    }

    // Add fallbacks. Remove once all systems are updated
    const product: SesamyFeedProduct = {
      id,
      title: item['sesamy:title'] || item.title || '',
      description: item['sesamy:description'] || item.description || '',
      priceOverrides: (item['sesamy:price-override'] ?? []).map(po => ({
        price: po['sesamy:price'],
        currency: po['sesamy:currency'],
        market: po['sesamy:market'],
      })),
      sellingPoints: item['sesamy:selling-point'] ?? [],
      price: item['sesamy:price'] || item.price || 0,
      currency: item['sesamy:currency'] || item.currency || '',
      period: item['sesamy:period'] || item.period,
      time: item['sesamy:time'] || item.time,
      purchaseType: purchaseType || 'OWN',
      packageType,

      // We get the first episode image or fallback to the show image
      image: item['sesamy:image'] || (item.image ?? lockedEpisodeWithImage?.image ?? image),

      // @deprecated
      type,
    };

    return product;
  });

  const owner = channel['itunes:owner'];
  const unparsedCategories = channel['itunes:category'] ?? [];
  const spotifyLink = channel['atom:link']?.find(link => link['@_rel'] === 'spotify');

  const sesamyFeed: SesamyFeed = {
    title: channel['sesamy:title'] || channel.title,
    titleWithUsername: channel.title,
    subtitle: channel['itunes:subtitle'] || channel.description,
    externalIds: {
      acastId: channel['acast:showId'],
      spotifyUrl: spotifyLink?.['@_href'],
    },
    description: sanitizeHtml(channel.description || '', {
      allowedTags: [],
      allowedAttributes: {},
    }),
    descriptionWithHtml: sanitizeHtml(channel['content:encoded'] || channel.description || '', {
      allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
      selfClosing: ['br'],
      allowedAttributes: {
        a: ['href'],
      },
    }),
    summary: sanitizeHtml(channel['itunes:summary'] || '', {
      allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p'],
      allowedAttributes: {
        a: ['href'],
      },
    }),
    image,
    link: channel.link || '',
    author: channel['itunes:author'],
    owner: owner
      ? {
          name: owner['itunes:name'],
          email: owner['itunes:email'],
        }
      : undefined,
    publishDate: channel.pubDate ? new Date(channel.pubDate).toISOString() : undefined,
    language: channel.language,
    rssUrl,
    copyright: channel.copyright,
    isHidden,
    isExplicit,
    isComplete,
    podcastType: itunesType?.toLocaleLowerCase() === 'serial' ? 'SERIAL' : 'EPISODIC',
    totalSeasons,
    totalEpisodes: episodes.length,
    episodes,
    products,
    categories: getCategories(unparsedCategories),
    sesamy: {
      // Adding the fields manually to have more control and defined types
      feedId: channel['sesamy:feed-id'],
      brandId: channel['sesamy:brand-id'],
      vendorId: channel['sesamy:vendor-id'],
      isPrivate: channel['sesamy:private'] ? true : false,
    },
  };

  const user = channel['sesamy:user'];
  if (user) {
    // Deprecated
    if (typeof user === 'string') {
      sesamyFeed.user = {
        name: user,
        id: '',
        email: '',
      };
    } else {
      sesamyFeed.user = {
        id: user['sesamy:id'],
        name: user['sesamy:name'],
        email: user['sesamy:email'],
      };
    }
  }

  return sesamyFeed;
}
