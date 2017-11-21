import xhr from '../utility/xhr';
import cheerio from 'cheerio';
import _ from 'lodash';
import LRU from 'lru-cache';
import Promise from 'bluebird';
import moment from 'moment';

import domainData from '../resources/gift-cards.json';

const MIN_PERCENT = 0.01;

const cache = LRU({
  max: 15,
  maxAge: 1000 * 60 * 60 * 1 // 1 hour
});

function parsePrice(price) {
  return parseInt(price.replace(/[^0-9]/gi, ''));
}

async function getCards(domain, url) {
  const data = _.find(domainData, {domain});
  if (!data) {
    return null;
  }
  if (data.match_pattern) {
    const pattern = new RegExp(data.match_pattern, 'i');
    if (!url.match(pattern)) {
      return null;
    }
  } else {
    return null;
  }

  let html = cache.get(domain);
  if (!html) {
    const url = data.url;
    html = await xhr('GET', url);
    if (html) {
      cache.set(domain, html);
    }
  }
  const $ = cheerio.load(html);
  const cards = [];
  $('.sortable-merchant-products [itemprop=offers]').each((i, el) => {
    const elements = [];
    $(el).find('td').each((i, el) => {
      let text = $(el).text();
      text = _.filter(text.split('\n'), s => s.trim().length).join(' ');
      if (text.length) {
        elements.push(text);
      }
    });
    const type = elements[0].trim();
    const value = parsePrice(elements[1].trim());
    const percent = parseFloat(elements[2].trim().replace('%', '')) / 100.0;
    const price = parsePrice(elements[3].trim());
    cards.push({type, value, percent, price, url: data.url});
  });
  return cards;
}

export default async function findGiftCards(input) {
  const cards = await getCards(input.domain, input.url);
  const card = _.get(cards, '[0]');
  if (card && card.percent >= MIN_PERCENT) {
    return card;
  }
}