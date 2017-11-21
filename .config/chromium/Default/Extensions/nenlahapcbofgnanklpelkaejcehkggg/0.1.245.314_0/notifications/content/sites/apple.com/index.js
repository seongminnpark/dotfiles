import _ from 'lodash';
import tree from 'state';
import getPriceFromSelector from '../../utility/getPriceFromSelector';
import regex from 'utility/regex';
import delay from 'utility/delay';
import getDeal from 'messenger/outbound/getDeal';
import {loadDeal} from 'actions/notificationActions';
import hasFeature from 'utility/hasFeature';

let showingNotification = false;
let input;

function getTextFromSelectors(selectors) {
  let text;
  _.forEach(selectors, s => {
    if (text) {
      return;
    }
    const textEl = document.querySelector(s);
    if (textEl && textEl.innerText) {
      text = textEl.innerText;
    }
  });
  return text;
}

function getOGProperty(property) {
  const selector = `[property="og:${property}"]`;
  const el = document.querySelector(selector);
  if (el) {
    return el.content;
  }
  return null;
}

function getItempropValue(key) {
  const el = document.querySelector(`[itemprop=${key}`);
  if (el) {
    const value = el.querySelector('[itemprop=name]');
    if (value) {
      return value.content;
    }
  }
}

async function getProductInfo() {
  try {
    const brand = getItempropValue('brand');
    const mpn = _.get(document.querySelector('#productPartNumber'), 'value');
    const price = getPriceFromSelector('[itemprop=offers] [itemprop=price]');
    return {brand, mpn, price};
  } catch (e) {
    return null;
  }
}

async function run() {
  // Get product info
  async function onChange() {
    const product = await getProductInfo();
    if (_.get(product, 'brand') && _.get(product, 'mpn')) {
      const newInput = {brand: product.brand, mpn: product.mpn, price: product.price, vendor: 'apple.com'};
      if (!_.isEqual(newInput, input)) {
        input = newInput;
        const deal = await getDeal(input);
        if (deal) {
          if (!showingNotification) {
            showingNotification = true;
            loadDeal(deal);
          }
        }
      }
    }
  }

  const selectors = ['.as-pdp-main'];
  _.forEach(selectors, selector => {
    const el = document.querySelector(selector);
    if (el) {
      const observer = new MutationObserver(onChange);
      observer.observe(el, {
        childList: true,
        subtree: true
      });
    }
  });
  onChange();
}

export default function getSite() {
  if (!hasFeature('notif_deals_other_sites')) {
    return false;
  }
  let active = false;
  if (window.location.href.match(/shop\/product\//i)) {
    tree.set('trigger', 'productPage');
    run();
    active = true;
  }
  return {active};
}