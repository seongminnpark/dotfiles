import {addRunResultToCart} from 'iv-wb-light/dist/iv-wb-light-chrome';
import _ from 'lodash';
import promisifyChromeFunctions from 'utility/promisifyChromeFunctions';
promisifyChromeFunctions(chrome.tabs);

export default async (result, tab) => {
  if (_.get(result, 'vendor') === 'amazon.com') {
    await addRunResultToCart(result);
    await chrome.tabs.createAsync({url: 'https://www.amazon.com/gp/cart/view.html', active: true});
  }
};