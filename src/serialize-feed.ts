import iso6392BTo1 from './utils/country-codes';
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

  if (episode.image) {
    item['itunes:image'] = {
      '@_href': episode.image,
    };
  }

  return item;
}

export function generateRssFeed(feed: SesamyFeed): Rss {
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
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      language: iso6392BTo1(feed.language!) || 'en',
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
        price: product.price,
        currency: product.currency,
        type: product.type,
        title: product.title,
        description: product.description || '',
        image: product.image,
        purchase_type: product.purchaseType,
        period: product.period,
        time: product.time,
      })),
      'sesamy:sesamy-item': lockedEpisodes,
      item: episodes,
    },
  };

  if (feed.user) {
    console.log('feed.user', feed.user);

    rss.channel['sesamy:user'] = {
      'sesamy:id': feed.user.id,
      'sesamy:name': feed.user.name,
      'sesamy:email': feed.user.email,
    };
  }

  return rss;
}
