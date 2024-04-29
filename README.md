# podcast-parser

A library for parsing podcast feeds to JSON and the Sesamy format.

## Installation

```bash
npm install @sesamy/podcast-parser
```

## Usage

```javascript
const { parseFeedToJson, parseFeedToSesamy } = require('@sesamy/podcast-parser');

const podcastFeed = await parseFeedToJson(podcast_feed_url);
const sesamyPodcastFeed = parseFeedToSesamy(podcastFeed);
```
