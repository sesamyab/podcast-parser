# podcast-parser

A library for parsing podcast RSS feeds to JSON and the Sesamy format. It also provides functionality to serialize podcast data back to RSS format.

## Installation

```bash
npm install @sesamy/podcast-parser
```

## Features

- Parse podcast RSS feeds to JSON format
- Convert podcast feed data to Sesamy's format
- Serialize podcast data back to RSS format
- Support for special Sesamy elements like locked episodes and product information
- Handle podcast metadata including iTunes-specific attributes
- Process episode enclosures and durations

## Usage

### Parsing a Podcast Feed

```javascript
const { parseFeedToJson } = require('@sesamy/podcast-parser');

// Parse from a URL
const podcastFeed = await parseFeedToJson('https://example.com/podcast/feed.xml');

// Or parse from a string containing RSS XML
const xmlString = '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0">...</rss>';
const podcastFeedFromString = parseFeedToJson(xmlString);
```

### Converting to Sesamy Format

```javascript
const { parseFeedToSesamy } = require('@sesamy/podcast-parser');

// Convert the JSON feed to Sesamy format
const sesamyPodcastFeed = parseFeedToSesamy(podcastFeed);

// This provides access to Sesamy-specific features like:
console.log(sesamyPodcastFeed.products); // Product information
console.log(sesamyPodcastFeed.episodes); // All episodes including locked ones
console.log(sesamyPodcastFeed.sesamy.isPrivate); // Sesamy-specific metadata
```

### Serializing Back to RSS

```javascript
const { generateRssFeed } = require('@sesamy/podcast-parser');

// Convert a Sesamy feed object back to RSS XML
const rssFeed = generateRssFeed(sesamyPodcastFeed);
console.log(rssFeed); // XML string with RSS feed
```

## Working with Feed Data

The parsed feed contains standard podcast elements as well as Sesamy-specific features:

```javascript
// Basic podcast information
console.log(sesamyPodcastFeed.title); // Podcast title
console.log(sesamyPodcastFeed.description); // Podcast description
console.log(sesamyPodcastFeed.image); // Podcast artwork

// Accessing episodes
sesamyPodcastFeed.episodes.forEach(episode => {
  console.log(episode.title); // Episode title
  console.log(episode.publishDate); // Publication date
  console.log(episode.url); // Audio file URL
  console.log(episode.isLocked); // Whether this is a locked episode
  console.log(episode.permissions); // Required permissions to access
});

// Working with products
sesamyPodcastFeed.products.forEach(product => {
  console.log(product.id); // Product ID
  console.log(product.title); // Product title
  console.log(product.price); // Product price
  console.log(product.currency); // Product currency
  console.log(product.purchaseType); // Type of purchase (Single or Recurring)
});
```

## License

MIT
