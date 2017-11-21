import _ from 'lodash';
import tree from 'state';
import getPriceFromSelector from '../../utility/getPriceFromSelector';
import regex from 'utility/regex';
import delay from 'utility/delay';
import getDeal from 'messenger/outbound/getDeal';
import {loadDeal} from 'actions/notificationActions';
import hasFeature from 'utility/hasFeature';

let showingNotification = false;

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

async function getProductInfo() {
  try {
    const title = getOGProperty('title');
    const image = getOGProperty('image');
    const price = getPriceFromSelector('#price .item-price');
    const sku = getTextFromSelectors(['[itemprop=productID]']);
    let gtin = regex(/upc_code:\s'([0-9]+)'/, document.body.innerHTML);
    let attempts = 10;
    while (!gtin || !gtin.length) {
      await delay(200);
      gtin = regex(/upc_code:\s'([0-9]+)'/, document.body.innerHTML);
      --attempts;
      if (attempts <= 0) {
        break;
      }
    }
    const brand = title.split(' - ')[0];
    const mpn = getTextFromSelectors(['#model-value']);
    return {
      title,
      image,
      price,
      sku,
      gtin,
      brand,
      mpn,
      url: window.location.href,
      vendor: 'bestbuy.com',
      wbpid: `bestbuy.com_${sku}`
    };
  } catch (e) {
    return null;
  }
}

async function run() {
  // Get product info
  const product = await getProductInfo();
  if (_.get(product, 'gtin')) {
    const deal = await getDeal({gtin: product.gtin, price: product.price, vendor: 'bestbuy.com'});
    if (deal) {
      if (!showingNotification) {
        showingNotification = true;
        loadDeal(deal);
      }
    }
  }
}

export default function getSite() {
  if (!hasFeature('notif_deals_other_sites')) {
    return false;
  }
  let active = false;
  if (window.location.href.match(/site\/.*\.p\?.*skuId=/i)) {
    tree.set('trigger', 'productPage');
    run();
    active = true;
  }
  return {active};
}