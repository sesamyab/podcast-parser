import { describe, it, expect } from 'vitest';
import fs from 'fs';
import { parseFeedToSesamy } from '../src/sesamy-parser';
import parseFeedToJson from '../src/feed-parser';

// Mock structuredClone globally before your tests
global.structuredClone = obj => JSON.parse(JSON.stringify(obj));

const fredagspodden = fs.readFileSync('./test/fixtures/fredagspodden.rss');
const spar = fs.readFileSync('./test/fixtures/spar.rss');
const acast = fs.readFileSync('./test/fixtures/acast.rss');

describe('Sesamy parser service tests', () => {
  it('Check podspace feed', async () => {
    const fredagpoddenJson = await parseFeedToJson(fredagspodden.toString());

    const sesamyFeed = parseFeedToSesamy(fredagpoddenJson);
    expect(sesamyFeed.title).toBe('Fredagspodden');
    expect(sesamyFeed.subtitle).toBe('Fredagspodden med Hannah Widell och Amanda Schulman');

    expect(sesamyFeed.description).toBe('Fredagspodden med Hannah Widell och Amanda Schulman');
    expect(sesamyFeed.summary).toBe('Fredagspodden med Hannah Widell och Amanda Schulman');
    expect(sesamyFeed.image).toBe(
      'https://assets.pod.space/system/shows/images/72f/269/8e-/large/fredagspoddentagg.jpg',
    );
    expect(sesamyFeed.author).toBe('Perfect Day Media');
    expect(sesamyFeed.owner?.email).toBe('johan.dahlberg@perfectdaymedia.se');
    expect(sesamyFeed.owner?.name).toBe('Johan Dahlberg');

    expect(sesamyFeed.publishDate).toBe('2022-08-18T22:00:00.000Z');
    expect(sesamyFeed.language).toBe('sv');
    expect(sesamyFeed.rssUrl).toBe('https://feed.pod.space/fredagspodden');
    expect(sesamyFeed.copyright).toBe('Perfect Day Media');
    expect(sesamyFeed.isHidden).toBe(false);
    expect(sesamyFeed.isExplicit).toBe(false);
    expect(sesamyFeed.isComplete).toBe(false);
    expect(sesamyFeed.podcastType).toBe('EPISODIC');
    expect(sesamyFeed.totalSeasons).toBe(0);

    expect(sesamyFeed.totalEpisodes).toBe(568);

    expect(sesamyFeed.categories[0]).toBe('Personal Journals');
    expect(sesamyFeed.sesamy.isPrivate).toBe(false);
  });

  it('Check Sesamy Feed Proxy feed', async () => {
    const sparJson = await parseFeedToJson(spar.toString());
    const sesamyFeed = parseFeedToSesamy(sparJson);

    const product = sesamyFeed.products[0];
    expect(sesamyFeed.products.length).toBe(1);

    expect(product.id).toBe('d2edWmywhM65BEETmjZ0l');
    expect(product.currency).toBe('SEK');
    expect(product.description).toBe('Lyssna obegränsat på alla podcasts från Third Ear Studio. Avsluta när du vill.');
    expect(product.title).toBe('Alla podcasts från Third Ear Studio');
    expect(product.type).toBe('Recurring');
    expect(product.price).toBe(49);
    expect(product.image).toBe(
      'https://assets.pippa.io/shows/616ebe1886d7b1398620b943/1653852897984-a323f878a9d212e6dbe4e47fc0f062fa.jpeg',
    );
    expect(product.priceOverrides?.length).toBe(0);

    expect(sesamyFeed.episodes.length).toBe(60);
    const episode = sesamyFeed.episodes[0];
    expect(episode.guid).toBe('629ee6ff30a61300135f40a4');
    expect(episode.title).toBe('1. Fallet Catrine da Costa - Allmänläkaren och Obducenten');
    expect(episode.subtitle).toBe(
      '<p>För 38 år sen försvinner den prostituerade och hemlösa kvinnan Catrine da Costa spårlöst pingsthelgen 1984, ingen vet vart hon tagit vägen, och inte många saknar henne. Men, i mitten av juli larmar en man som brukar promenera med en hund vid Karlberg om',
    );
    expect(episode.description).toBe(
      'För 38 år sen försvinner den prostituerade och hemlösa kvinnan Catrine da Costa spårlöst pingsthelgen 1984, ingen vet vart hon tagit vägen, och inte många saknar henne. Men, i mitten av juli larmar en man som brukar promenera med en hund vid Karlberg om att några plastsäckar börjat lukta illa. När polisen kommer på plats ser de delar av en kropp, som de misstänker tillhör en kvinna. Det kommer bli starten på en polisutredning som skakar om hela Sverige.Vill du stödja Spårs journalistik och få exklusiv tillgång till säsongen en gång i veckan bli prenumerant. Du kan prenumerera via Thirdearstudio.com och då får du full tillgång till den här podden och alla andra program vi gör på Third Ear Studio, såsom Skuggland, DOKland och Uppgång och Fall. Du kan också prenumerera via Acast:   https://plus.acast.com/s/sparpodcast eller via Apple Podcaster: https://podcasts.apple.com/se/channel/third-ear-se/id6442569298?l=en See acast.com/privacy for privacy and opt-out information.',
    );
    expect(episode.summary).toBe(
      'För 38 år sen försvinner den prostituerade och hemlösa kvinnan Catrine da Costa spårlöst pingsthelgen 1984, ingen vet vart hon tagit vägen, och inte många saknar henne. Men, i mitten av juli larmar en man som brukar promenera med en hund vid Karlberg om att några plastsäckar börjat lukta illa. När polisen kommer på plats ser de delar av en kropp, som de misstänker tillhör en kvinna. Det kommer bli starten på en polisutredning som skakar om hela Sverige.Vill du stödja Spårs journalistik och få exklusiv tillgång till säsongen en gång i veckan bli prenumerant. Du kan prenumerera via Thirdearstudio.com och då får du full tillgång till den här podden och alla andra program vi gör på Third Ear Studio, såsom Skuggland, DOKland och Uppgång och Fall. Du kan också prenumerera via Acast:   https://plus.acast.com/s/sparpodcast eller via Apple Podcaster: https://podcasts.apple.com/se/channel/third-ear-se/id6442569298?l=en See acast.com/privacy for privacy and opt-out information.',
    );
    expect(episode.url).toBe('https://splice.sesamy.com/sid:InYYzPf__ogPcPBsoTtxs/629ee6ff30a61300135f40a4.mp3');
    expect(episode.link).toBe(
      'https://shows.acast.com/sparpodcast/episodes/premium-fallet-catrine-da-costa-allmanlakaren-och-obducenten',
    );
    expect(episode.image).toBe(
      'https://assets.pippa.io/shows/616ebe1886d7b1398620b943/1653852897984-a323f878a9d212e6dbe4e47fc0f062fa.jpeg',
    );
    expect(episode.duration).toBe(1913);
    expect(episode.isExplicit).toBe(true);
    expect(episode.publishDate).toBe('2022-06-14T08:44:00.000Z');
    expect(episode.episodeType).toBe('full');
    expect(episode.contentType).toBe('audio/mpeg');
    expect(episode.contentLength).toBe(30169216);
    expect(episode.season).toBe(8);
    expect(episode.episode).toBe(1);
    expect(episode.isLocked).toBe(false);
    expect(episode.isSample).toBe(false);
    expect(episode.isSesamy).toBe(false);
    expect(episode.permissions.length).toBe(0);
  });

  it('Spotify url', async () => {
    const feedJson = await parseFeedToJson(acast.toString());
    const links = feedJson.rss.channel['atom:link'] || [];

    links.push({
      '@_href': 'https://open.spotify.com/show/41zWZdWCpVQrKj7ykQnXRc',
      '@_rel': 'spotify',
    });

    feedJson.rss.channel['atom:link'] = links;
    const sesamyFeed = parseFeedToSesamy(feedJson);

    expect(sesamyFeed.externalIds.spotifyUrl).toBe('https://open.spotify.com/show/41zWZdWCpVQrKj7ykQnXRc');
  });
});
