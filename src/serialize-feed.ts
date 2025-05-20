import { XMLBuilder } from 'fast-xml-parser';
import { Item, Rss, RssBoolean, SesamyFeed, SesamyFeedEpisode } from '@sesamy/podcast-schemas';

function formatDuration(totalSeconds: number): string {
  if (!totalSeconds) {
    return '';
  }

  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  const minutes = (Math.floor(totalSeconds / 60) % 60).toString().padStart(2, '0');
  const hours = (Math.floor(totalSeconds / 3600) % 60).toString().padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
}

function boolToString(bool?: boolean): RssBoolean {
  return bool ? 'yes' : 'no';
}

function utcDate(date?: string) {
  if (!date) {
    return undefined;
  }

  return new Date(Date.parse(date)).toUTCString();
}

function renderItem(episode: SesamyFeedEpisode) {
  const item: Item = {
    link: episode.link,
    guid: {
      '@_isPermaLink': false,
      '#text': episode.guid,
    },
    title: episode.title,
    description: episode.description,
    'content:encoded': episode.descriptionWithHtml,
    'itunes:subtitle': episode.description?.slice(0, Math.min(255, episode.description.length)),
    'itunes:duration': formatDuration(episode.duration!),
    'itunes:episodeType': episode.episodeType || 'full',
    '@_permissions': episode.permissions.join('|'),
    enclosure: episode.url
      ? [
          {
            '@_url': episode.url,
            '@_length': episode.contentLength?.toString() || '',
            '@_type': 'audio/mpeg',
          },
        ]
      : [],
    'itunes:episode': episode.episode,
    'itunes:season': episode.season,
    pubDate: utcDate(episode.publishDate)!,
  };

  if (episode.isLocked) {
    item['@_locked'] = true;
  }

  if (episode.image) {
    item['itunes:image'] = {
      '@_href': episode.image,
    };
  }

  return item;
}

export function generateRssFeed(feed: SesamyFeed): string {
  const episodes: Item[] = feed.episodes.filter(episode => !episode.isLocked).map(renderItem);

  const lockedEpisodes: Item[] = feed.episodes.filter(episode => episode.isLocked).map(renderItem);

  const rss: Rss = {
    '@_version': '2.0',
    '@_xmlns:atom': 'http://www.w3.org/2005/Atom',
    '@_xmlns:itunes': 'http://www.itunes.com/dtds/podcast-1.0.dtd',
    '@_xmlns:sesamy': 'http://schemas.sesamy.com/feed/1.0',
    '@_xmlns:googleplay': 'http://www.google.com/schemas/play-podcasts/1.0',
    '@_xmlns:content': 'http://purl.org/rss/1.0/modules/content/',
    channel: {
      title: feed.titleWithUsername || feed.title,
      link: feed.link,
      'atom:link': [
        {
          '@_rel': 'self',
          '@_type': 'application/rss+xml',
          '@_href': feed.link,
        },
      ],
      copyright: 'Sesamy AB',
      description: feed.description,
      pubDate: utcDate(feed.publishDate),
      lastBuildDate: new Date().toUTCString(),
      language: feed.language || 'en',
      ttl: 30,
      image: {
        url: feed.image || '',
        title: feed.titleWithUsername || feed.title,
        link: feed.link,
      },
      'googleplay:block': boolToString(feed.sesamy.isPrivate),
      'itunes:block': boolToString(feed.sesamy.isPrivate),
      'itunes:image': {
        '@_href': feed.image || '',
      },
      'itunes:summary': feed.description,
      'itunes:author': feed.author,
      'itunes:category': feed.categories.map(category => ({
        '@_text': category,
      })),
      'itunes:owner': {
        'itunes:name': feed.owner?.name || '',
        'itunes:email': feed.owner?.email || 'feed@sesamy.com',
      },
      'itunes:explicit': boolToString(feed.isExplicit),
      'sesamy:title': feed.title,
      'sesamy:private': feed.sesamy.isPrivate.toString(),
      'sesamy:vendor-id': feed.sesamy.vendorId,
      'sesamy:product': feed.products.map(product => ({
        id: product.id,
        'sesamy:id': product.id,
        price: product.price,
        'sesamy:price': product.price,
        description: product.description || '',
        'sesamy:description': product.description || '',
        currency: product.currency,
        'sesamy:currency': product.currency,
        type: product.type,
        'sesamy:type': product.type,
        title: product.title,
        'sesamy:title': product.title,
        image: product.image,
        'sesamy:image': product.image,
        purchase_type: product.purchaseType,
        'sesamy:purchase-type': product.purchaseType,
        'sesamy:package-type': product.packageType,
        'sesamy:purchase-url': product.purchaseUrl,
        period: product.period,
        'sesamy:period': product.period,
        time: product.time,
        'sesamy:time': product.time,
        'sesamy:selling-point': product.sellingPoints || [],
      })),
      'sesamy:sesamy-item': lockedEpisodes,
      item: episodes,
    },
  };

  if (feed.user) {
    rss.channel['sesamy:user'] = {
      'sesamy:id': feed.user.id,
      'sesamy:name': feed.user.name,
      'sesamy:email': feed.user.email,
    };
  }

  const options = {
    format: true,
    ignoreAttributes: false,
    allowBooleanAttributes: true,
    suppressBooleanAttributes: false,
    suppressEmptyNode: true,
  };

  const builder = new XMLBuilder(options);

  return `<?xml version="1.0"?>\n${builder.build({
    rss,
  })}`;
}
