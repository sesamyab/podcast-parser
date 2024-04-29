import { describe, it } from 'vitest';
import { sesamyFeedSchema } from '../../src/json/sesamy-feed';

export const feed = {
  description: 'Test description',
  language: 'en',
  title: 'Test title',
  titleWithUsername: 'Test title',
  isHidden: false,
  isExplicit: false,
  isComplete: false,
  podcastType: 'EPISODIC',
  episodes: [],
  products: [],
  categories: ['Test category'],
  publishDate: '2023-01-28T11:15:35.803Z',
  externalIds: {},
  link: 'https://example.com',
  totalSeasons: 1,
  totalEpisodes: 1,
  sesamy: {
    isPrivate: false,
  },
};

describe('feed', () => {
  it('should create a valid feed', () => {
    sesamyFeedSchema.parse(feed);
  });
});
