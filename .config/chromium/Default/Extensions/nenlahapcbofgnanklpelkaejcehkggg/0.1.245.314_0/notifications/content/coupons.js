import {initSite, tryCoupons as tryTigger, dropCookie as dropCookieTigger} from 'iv-tigger';
import _ from 'lodash';

export async function dropCookie(...args) {
  return dropCookieTigger(...args);
}

export async function initTigger(domain, coupons, options) {
  let result;
  try {
    result = await initSite(domain, coupons, options);
  } catch (e) {
    result = {error: 'Tigger internal error', message: e.message};
  }
  return result;
}

export async function tryCoupons(domain, coupons, siteData) {
  let result;
  try {
    result = await tryTigger(domain, _.cloneDeep(coupons), siteData);
  } catch (e) {
    result = {error: 'Tigger internal error', message: e.message};
    throw e;
  }
  return result;
}