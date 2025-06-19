import { RssFeed } from '@sesamy/podcast-schemas';
import { XMLParser } from 'fast-xml-parser';

export async function parseFeedToJson(text: string): Promise<RssFeed> {
  const arrayNodes = [
    'item',
    'atom:link',
    'podaccess:item',
    'itunes:category',
    'sesamy:sesamy-item',
    'sesamy:product',
    'sesamy:selling-point',
    'sesamy:price-override',
    'enclosure',
    'omny:clipCustomField',
  ];

  const booleanTagNames = ['sesamy:sellable', 'sesamy:hidden'];

  const options = {
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    attributeValueProcessor: (_key: string, value: string) => {
      if (value.toLowerCase() === 'true') {
        return true;
      }
      if (value.toLowerCase() === 'false') {
        return false;
      }
      return value;
    },
    parseNodeValue: (val: string, tagName: string) => {
      // Parse specific tag names as boolean values
      if (booleanTagNames.includes(tagName)) {
        return val === 'true';
      }
      return val;
    },
    isArray: (name: string) => {
      return arrayNodes.includes(name);
    },
  };

  const parser = new XMLParser(options);
  const jsonFeed = parser.parse(text);

  return jsonFeed;
}
