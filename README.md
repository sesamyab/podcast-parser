# podcast-parser

A library for parsing podcast feeds to JSON and the Sesamy format. It also provides a function to serizalize a feed to an RSS file.

## Installation

```bash
npm install @sesamy/podcast-parser
```

## Usage

```javascript
const { parseFeedToJson, parseFeedToSesamy } = require('@sesamy/podcast-parser');

const podcastFeed = await parseFeedToJson(podcast_feed_url);
const sesamyPodcastFeed = parseFeedToSesamy(podcastFeed);

// And serialize the feed back to an RSS file
const rssFeed = serializeFeedToRss(podcastFeed);
```
