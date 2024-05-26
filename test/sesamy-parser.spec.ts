import { describe, it, expect } from 'vitest';
import fs from 'fs';
import { parseFeedToSesamy, parseFeedToJson } from '../src';

// Mock structuredClone globally before your tests
global.structuredClone = obj => JSON.parse(JSON.stringify(obj));

const fredagspodden = fs.readFileSync('./test/fixtures/fredagspodden.rss');
const spar = fs.readFileSync('./test/fixtures/spar.rss');
const acast = fs.readFileSync('./test/fixtures/acast.rss');
const kjente = fs.readFileSync('./test/fixtures/kjente.rss');
const fof = fs.readFileSync('./test/fixtures/fof.rss');

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

  it('Check collection products from ps', async () => {
    const feedJson = await parseFeedToJson(fof.toString());
    const sesamyFeed = parseFeedToSesamy(feedJson);

    expect(sesamyFeed.title).toBe('Filip & Fredrik podcast');

    expect(sesamyFeed.products.length).toBe(6);
    expect(sesamyFeed.products[5]).toEqual({
      currency: 'SEK',
      description: 'Köp alla 5 avsnitt av Filip & Fredrik Svarar som släpps i December 2023',
      id: 'b9f77f05-3ec0-4fc2-a9b1-f61e413ab7d9',
      image: 'https://assets.pod.space/system/products/images/b9f/77f/05-/large/FFS_omslag.jpg',
      packageType: 'COLLECTION',
      period: undefined,
      price: 59,
      priceOverrides: [],
      purchaseType: 'OWN',
      sellingPoints: [],
      time: undefined,
      title: 'Paket med 5 avsnitt',
      type: 'Single Purchase',
    });
  });

  it('Check Kjente Proxy feed', async () => {
    const feedJson = await parseFeedToJson(kjente.toString());
    const sesamyFeed = parseFeedToSesamy(feedJson);

    expect(sesamyFeed.title).toBe('Markus Test');
    expect(sesamyFeed.subtitle).toBe(
      'Kjente Norske ordtak i en tolkning av Even C. Jystad.Buy at https://sesamy.com/podcasts/sid:oPWrf4FIdFVRpS0chQ5Nj',
    );
    expect(sesamyFeed.products.length).toBe(3);

    expect(sesamyFeed).toEqual({
      title: 'Markus Test',
      titleWithUsername: 'Markus Test',
      externalIds: {},
      subtitle:
        'Kjente Norske ordtak i en tolkning av Even C. Jystad.Buy at https://sesamy.com/podcasts/sid:oPWrf4FIdFVRpS0chQ5Nj',
      description:
        'Kjente Norske ordtak i en tolkning av Even C. Jystad.Buy at https://sesamy.com/podcasts/sid:oPWrf4FIdFVRpS0chQ5Nj',
      descriptionWithHtml:
        'Kjente Norske ordtak i en tolkning av Even C. Jystad.Buy at https://sesamy.com/podcasts/sid:oPWrf4FIdFVRpS0chQ5Nj',
      summary:
        'Kjente Norske ordtak i en tolkning av Even C. Jystad.Buy at https://sesamy.com/podcasts/sid:oPWrf4FIdFVRpS0chQ5Nj',
      image:
        'https://assets.pod.space/system/shows/images/420/557/4c-/large/1660572666058-e3f2c312c751a91ad2ce104f36cbd69e.jpeg',
      link: 'https://commerce.sesamy.dev/products/sid:kTVA3vfdEG1CMeXFzlM4q',
      author: 'Even C Jystad',
      owner: {
        name: 'Markus',
        email: 'markus@sesamy.com',
      },
      publishDate: '2022-08-15T14:14:23.000Z',
      language: 'en',
      rssUrl: 'https://feed.sesamy.dev/sid:kTVA3vfdEG1CMeXFzlM4q',
      copyright: 'Sesamy AB',
      isHidden: false,
      isExplicit: false,
      isComplete: false,
      podcastType: 'EPISODIC',
      totalSeasons: 0,
      totalEpisodes: 1,
      episodes: [
        {
          guid: '62fa54bf2c75a2001385f865',
          title: 'Forord - Kjente Norske Ordtak',
          subtitle: 'Even snakker om kjente norske ordtak.',
          description: 'Even snakker om kjente norske ordtak.',
          descriptionWithHtml: '<p>Even snakker om kjente norske ordtak.</p>',
          summary: '',
          url: 'https://splice.sesamy.dev/sid:kTVA3vfdEG1CMeXFzlM4q/62fa54bf2c75a2001385f865.mp3',
          link: 'https://pod.space/kjentenorskeordtak/forord',
          image:
            'https://assets.pod.space/system/shows/images/420/557/4c-/large/1660572666058-e3f2c312c751a91ad2ce104f36cbd69e.jpeg',
          duration: 71,
          isExplicit: false,
          publishDate: '2022-08-15T14:14:23.000Z',
          episodeType: 'trailer',
          contentType: 'audio/mpeg',
          contentLength: 1149056,
          episode: undefined,
          isLocked: false,
          isSample: false,
          isSesamy: false,
          permissions: ['rss_ob7yXk1n984zMpyh-w9Un', 'rss_1K-03nMwHqboV2DsVuhwn', 'rss_kazJObDoNRFOJ-aApucZU'],
        },
      ],
      products: [
        {
          id: 'rss_1K-03nMwHqboV2DsVuhwn',
          title: 'Markus Bundle',
          description: 'The test show bundle',
          priceOverrides: [],
          sellingPoints: [],
          price: 5,
          currency: 'EUR',
          period: 'MONTH',
          time: 1,
          purchaseType: 'RECURRING',
          packageType: 'SINGLE',
          image:
            'https://images.sesamy.com/products/dedc1b40-c810-4cbf-adcf-5f85c3c71780/content/fbba0196-29e0-43e0-90a7-d18c3a34e574/1200535.jpg',
          type: 'Recurring',
        },
        {
          id: 'rss_kazJObDoNRFOJ-aApucZU-undefined',
          title: 'Forord - Kjente Norske Ordtak',
          description: 'Even snakker om kjente norske ordtak.',
          priceOverrides: [],
          sellingPoints: [],
          price: 9,
          currency: 'SEK',
          period: 'MONTH',
          time: 1,
          purchaseType: 'OWN',
          packageType: 'SINGLE',
          image:
            'https://images.sesamy.com/products/5f9355bc-b8f8-425c-8bfc-c6ec7a25eb83/content/8578b63c-b9cf-41db-b406-00b6daf07fbf/1200876.jpg',
          type: 'Single Purchase',
        },
        {
          id: 'rss_ob7yXk1n984zMpyh-w9Un',
          title: 'Markus Monthly',
          description: 'Desc',
          priceOverrides: [],
          sellingPoints: [],
          price: 5,
          currency: 'EUR',
          period: 'MONTH',
          time: 1,
          purchaseType: 'RECURRING',
          packageType: 'SINGLE',
          image:
            'https://images.sesamy.com/products/a231512b-773e-45d4-8246-8c4b120d53ce/content/f6eaa3e5-e278-4bb9-8359-ffc199c18429/1200349.jpg',
          type: 'Recurring',
        },
      ],
      categories: ['Education', 'History'],
      sesamy: {
        brandId: undefined,
        feedId: undefined,
        vendorId: 'demo',
        isPrivate: false,
      },
    });
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
