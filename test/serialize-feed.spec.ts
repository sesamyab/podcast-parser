import { describe, it, expect } from 'vitest';
import { generateRssFeed } from '../src/serialize-feed';
import { SesamyFeed } from '@sesamy/podcast-schemas';

describe('generateRssFeed', () => {
  it('should handle feed with episodes', () => {
    const testFeedWithEpisodes: SesamyFeed = {
      title: 'Test Podcast',
      titleWithUsername: 'Test Podcast',
      description: 'Test podcast description',
      subtitle: 'Test podcast subtitle',
      summary: 'Test podcast summary',
      descriptionWithHtml: 'Test podcast description',
      podcastType: 'EPISODIC',
      isExplicit: false,
      isHidden: false,
      isComplete: false,
      publishDate: '2025-06-10T12:41:12.874Z',
      link: 'https://example.com/feed',
      rssUrl: 'https://example.com/feed.rss',
      language: 'en',
      author: 'Test Author',
      image: 'https://example.com/image.jpg',
      copyright: 'Test Copyright',
      categories: ['Technology'],
      externalIds: {},
      totalSeasons: 1,
      totalEpisodes: 1,
      owner: {
        name: 'Test Owner',
        email: 'test@example.com',
      },
      episodes: [
        {
          guid: 'episode-1',
          title: 'Episode 1',
          description: 'First episode',
          subtitle: 'Episode subtitle',
          summary: 'Episode summary',
          descriptionWithHtml: 'First episode description',
          url: 'https://example.com/episode1.mp3',
          link: 'https://example.com/episodes/1',
          image: 'https://example.com/episode1.jpg',
          duration: 3600, // 1 hour in seconds
          isExplicit: false,
          episodeType: 'full',
          contentType: 'audio/mpeg',
          contentLength: 50000000,
          publishDate: '2025-06-10T12:00:00.000Z',
          season: 1,
          episode: 1,
          isLocked: false,
          isSesamy: false,
          isSample: false,
          permissions: [],
          tags: [],
        },
      ],
      products: [],
      sesamy: {
        vendorId: 'test',
        isPrivate: false,
        feedId: undefined,
        brandId: undefined,
      },
    };

    const rssFeed = generateRssFeed(testFeedWithEpisodes);

    // Check that episode is included
    expect(rssFeed).toContain('<item permissions="">');
    expect(rssFeed).toContain('<title>Episode 1</title>');
    expect(rssFeed).toContain('<description>First episode</description>');
    expect(rssFeed).toContain('<guid isPermaLink="false">episode-1</guid>');
    expect(rssFeed).toContain('<itunes:duration>01:00:00</itunes:duration>');
    expect(rssFeed).toContain('<itunes:episode>1</itunes:episode>');
    expect(rssFeed).toContain('<itunes:season>1</itunes:season>');
    expect(rssFeed).toContain('<enclosure');
    expect(rssFeed).toContain('url="https://example.com/episode1.mp3"');
    expect(rssFeed).toContain('type="audio/mpeg"');
    expect(rssFeed).toContain('length="50000000"');
  });

  it('should handle feed with locked episodes', () => {
    const testFeedWithLockedEpisodes: SesamyFeed = {
      title: 'Premium Podcast',
      titleWithUsername: 'Premium Podcast',
      description: 'Premium podcast description',
      subtitle: 'Premium podcast subtitle',
      summary: 'Premium podcast summary',
      descriptionWithHtml: 'Premium podcast description',
      podcastType: 'EPISODIC',
      isExplicit: false,
      isHidden: false,
      isComplete: false,
      publishDate: '2025-06-10T12:41:12.874Z',
      link: 'https://example.com/premium-feed',
      rssUrl: 'https://example.com/premium-feed.rss',
      language: 'en',
      author: 'Premium Author',
      image: 'https://example.com/premium.jpg',
      copyright: 'Premium Copyright',
      categories: ['Business'],
      externalIds: {},
      totalSeasons: 1,
      totalEpisodes: 2,
      owner: {
        name: 'Premium Owner',
        email: 'premium@example.com',
      },
      episodes: [
        {
          guid: 'free-episode',
          title: 'Free Episode',
          description: 'This is free',
          subtitle: 'Free episode subtitle',
          summary: 'Free episode summary',
          descriptionWithHtml: 'This is free',
          url: 'https://example.com/free.mp3',
          link: 'https://example.com/episodes/free',
          duration: 1800,
          isExplicit: false,
          episodeType: 'full',
          contentType: 'audio/mpeg',
          contentLength: 25000000,
          publishDate: '2025-06-10T12:00:00.000Z',
          season: 1,
          episode: 1,
          isLocked: false,
          isSesamy: false,
          isSample: false,
          permissions: [],
          tags: [],
        },
        {
          guid: 'premium-episode',
          title: 'Premium Episode',
          description: 'This is premium',
          subtitle: 'Premium episode subtitle',
          summary: 'Premium episode summary',
          descriptionWithHtml: 'This is premium',
          url: 'https://example.com/premium.mp3',
          link: 'https://example.com/episodes/premium',
          duration: 3600,
          isExplicit: false,
          episodeType: 'full',
          contentType: 'audio/mpeg',
          contentLength: 50000000,
          publishDate: '2025-06-10T11:00:00.000Z',
          season: 1,
          episode: 2,
          isLocked: true,
          isSesamy: true,
          isSample: false,
          permissions: ['premium-access'],
          tags: [],
        },
      ],
      products: [],
      sesamy: {
        vendorId: 'premium',
        isPrivate: false,
        feedId: undefined,
        brandId: undefined,
      },
    };

    const rssFeed = generateRssFeed(testFeedWithLockedEpisodes);

    // Check that free episode is in regular items
    expect(rssFeed).toContain('<item permissions="">');
    expect(rssFeed).toContain('<title>Free Episode</title>');

    // Check that locked episode is in sesamy:sesamy-item
    expect(rssFeed).toContain(' <sesamy:sesamy-item permissions="premium-access" locked="true">');
    expect(rssFeed).toContain('<title>Premium Episode</title>');

    // The locked episode should have the locked attribute
    const lockedSection = rssFeed.substring(rssFeed.indexOf('<sesamy:sesamy-item>'));
    expect(lockedSection).toContain('locked="true"');
  });

  it('should handle products in feed', () => {
    const testFeedWithProducts: SesamyFeed = {
      title: 'Product Podcast',
      titleWithUsername: 'Product Podcast',
      description: 'Podcast with products',
      subtitle: 'Product podcast subtitle',
      summary: 'Product podcast summary',
      descriptionWithHtml: 'Podcast with products',
      podcastType: 'EPISODIC',
      isExplicit: false,
      isHidden: false,
      isComplete: false,
      publishDate: '2025-06-10T12:41:12.874Z',
      link: 'https://example.com/product-feed',
      rssUrl: 'https://example.com/product-feed.rss',
      language: 'en',
      author: 'Product Author',
      image: 'https://example.com/product.jpg',
      copyright: 'Product Copyright',
      categories: ['Business'],
      externalIds: {},
      totalSeasons: 0,
      totalEpisodes: 0,
      owner: {
        name: 'Product Owner',
        email: 'product@example.com',
      },
      episodes: [],
      products: [
        {
          id: 'product-1',
          title: 'Premium Access',
          description: 'Get premium access',
          priceOverrides: [],
          sellingPoints: ['Ad-free content', 'Early access'],
          price: 9.99,
          currency: 'USD',
          period: 'MONTH',
          time: 1,
          purchaseType: 'RECURRING',
          purchaseUrl: 'https://example.com/buy',
          packageType: 'SINGLE',
          image: 'https://example.com/product1.jpg',
          type: 'Recurring',
        },
      ],
      sesamy: {
        vendorId: 'product-vendor',
        isPrivate: false,
        feedId: undefined,
        brandId: undefined,
      },
    };

    const rssFeed = generateRssFeed(testFeedWithProducts);

    // Check that product information is included
    expect(rssFeed).toContain('<sesamy:product>');
    expect(rssFeed).toContain('<id>product-1</id>');
    expect(rssFeed).toContain('<sesamy:id>product-1</sesamy:id>');
    expect(rssFeed).toContain('<title>Premium Access</title>');
    expect(rssFeed).toContain('<sesamy:title>Premium Access</sesamy:title>');
    expect(rssFeed).toContain('<price>9.99</price>');
    expect(rssFeed).toContain('<sesamy:price>9.99</sesamy:price>');
    expect(rssFeed).toContain('<sesamy:currency>USD</sesamy:currency>');
    expect(rssFeed).toContain('<sesamy:purchase-type>RECURRING</sesamy:purchase-type>');
    expect(rssFeed).toContain('<sesamy:package-type>SINGLE</sesamy:package-type>');
    expect(rssFeed).toContain('<sesamy:selling-point>Ad-free content</sesamy:selling-point>');
    expect(rssFeed).toContain('<sesamy:selling-point>Early access</sesamy:selling-point>');
  });
});
