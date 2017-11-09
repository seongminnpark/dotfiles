import _ from 'lodash';
import tree from 'state';
import getPriceFromSelector from '../../utility/getPriceFromSelector';
import getDeal from 'messenger/outbound/getDeal';
import delay from 'utility/delay';
import {loadDeal} from 'actions/notificationActions';
import hasFeature from 'utility/hasFeature';

let showingNotification = false;

async function parseData() {
  try {
    let text = 'serverData.product = ';
    let start = document.body.innerHTML.indexOf(text);
    let attempts = 20;
    while (start === -1) {
      await delay(100);
      start = document.body.innerHTML.indexOf(text);
      --attempts;
      if (attempts <= 0) {
        break;
      }
    }
    if (start !== -1) {
      const s = document.body.innerHTML.substr(start).replace(text, '');
      text = '};';
      const end = s.indexOf(text) + 1;
      const dataString = s.substr(0, end).trim();
      const data = JSON.parse(dataString);
      return data;
    }
  } catch (e) {}
}

async function getProductInfo() {
  try {
    const data = await parseData();
    if (data) {
      const price = getPriceFromSelector('#ajaxPrice');
      const sku = _.get(data, 'itemId').toString();
      return {
        title: _.get(data, 'info.productLabel'),
        image: _.get(data, 'media.mediaList[0].location').replace('/65/', '/400/').replace('_65', '_400'),
        price,
        brand: _.get(data, 'info.brandName'),
        gtin: _.get(data, 'info.upc'),
        mpn: _.get(data, 'info.modelNumber'),
        sku,
        url: window.location.href,
        wbpid: `homedepot.com_${sku}`,
        vendor: 'homedepot.com'
      };
    }
    return null;
  } catch (e) {
    return null;
  }
}

async function run() {
  // Get product info
  const product = await getProductInfo();
  if (_.get(product, 'gtin')) {
    const deal = await getDeal({gtin: product.gtin, price: product.price, vendor: 'homedepot.com'});
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
  if (window.location.href.match(/\/p\//i)) {
    tree.set('trigger', 'productPage');
    run();
    active = true;
  }
  return {active};
}