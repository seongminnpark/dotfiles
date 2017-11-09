import _ from 'lodash';
import xhr from '../utility/xhr';
import cheerio from 'cheerio';
import runPricing from 'iv-supersonic/dist/pricingEstimates_browser';

import sampleInput from '../resources/precog-input.json';

const cache = {};

function formatPostData(params) {
  return _(params)
    .map(d => `${d.name}=${d.value}`)
    .value()
    .join('&');
}

async function addItemToCart(request) {
  const headers = {};
  _.forEach(request.headers, (header) => {
    headers[header.name] = header.value;
  });
  const data = formatPostData(request.postData.params);
  return await xhr(request.method, request.url, data, headers, true);
}

async function testCoupon(coupon, session) {
  const url = 'https://www.kohls.com/checkout/v2/json/applied_discounts_json.jsp?_DARGS=/checkout/v2/includes/discounts_update_forms.jsp.2';
  const headers = {
    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
  };
  const data = `_dyncharset=UTF-8&_dynSessConf=${session}&%2Fatg%2Fcommerce%2Forder%2Fpurchase%2FKLSPaymentInfoFormHandler.promoCode=${coupon}&_D%3A%2Fatg%2Fcommerce%2Forder%2Fpurchase%2FKLSPaymentInfoFormHandler.promoCode=+&%2Fatg%2Fcommerce%2Forder%2Fpurchase%2FKLSPaymentInfoFormHandler.paymentInfoSuccessURL=wallet_applied_discounts_tr_success_url&_D%3A%2Fatg%2Fcommerce%2Forder%2Fpurchase%2FKLSPaymentInfoFormHandler.paymentInfoSuccessURL=+&%2Fatg%2Fcommerce%2Forder%2Fpurchase%2FKLSPaymentInfoFormHandler.paymentInfoErrorURL=wallet_applied_discounts_tr_success_url&_D%3A%2Fatg%2Fcommerce%2Forder%2Fpurchase%2FKLSPaymentInfoFormHandler.paymentInfoErrorURL=+&%2Fatg%2Fcommerce%2Forder%2Fpurchase%2FKLSPaymentInfoFormHandler.useForwards=true&_D%3A%2Fatg%2Fcommerce%2Forder%2Fpurchase%2FKLSPaymentInfoFormHandler.useForwards=+&apply_promo_code=submit&_D%3Aapply_promo_code=+&_DARGS=%2Fcheckout%2Fv2%2Fincludes%2Fwallet_discounts_update_forms.jsp.2`;
  return await xhr('POST', url, data, headers, true);
}

async function getCartSession() {
  const url = 'https://www.kohls.com/checkout/shopping_cart.jsp';
  const html = await xhr('GET', url);
  const $ = cheerio.load(html);
  const session = $('input[name="_dynSessConf"]').val();
  return session;
}

async function testCoupons(coupons) {
  const session = await getCartSession();
  const promises = _.map(coupons, coupon => testCoupon(coupon, session));
  await Promise.all(promises);
}

export async function runATC(request, coupons, tab) {
  await addItemToCart(request);
  await testCoupons(coupons);

  const url = 'https://www.kohls.com/checkout/shopping_cart.jsp';
  chrome.tabs.update(tab.id, {url});
}

async function checkCoupons(input) {
  try {
    const response = await runPricing(input);
    const pricing = _.get(response, 'options[0]');
    if (pricing) {
      pricing.discount = (pricing.subtotal + pricing.shipping + pricing.tax) - pricing.total;
      return {
        discount: pricing.discount,
        savingsPercent: pricing.discount / pricing.total,
        coupons: pricing.coupons
      };
    }
    return null;
  } catch (e) {}
}

async function getCoupons() {
  const url = 'http://site.wikibuy.com/v2/coupons?tld=kohls.com';
  const data = await xhr('GET', url);
  if (data) {
    return _.map(data.items, 'code');
  }
}

export default async function checkPrecog(data) {
  try {
    const cacheId = `${data.productId}-${data.id}`;
    const lookup = cache[cacheId];
    let result;
    let item;
    if (lookup && lookup.expiration > new Date().getTime()) {
      result = lookup.result;
      item = lookup.item;
    }
    if (!result) {
      const input = _.cloneDeep(sampleInput);
      item = input.items[0];
      item.product.url = data.url;
      item.request.url = 'https://www.kohls.com/catalog/navigation.jsp?_DARGS=/catalog/v2/fragments/pdp_addToBag_Form.jsp';
      const params = item.request.postData.params;

      const productIdParam = _.find(params, {name: '%2Fatg%2Fcommerce%2Forder%2Fpurchase%2FCartModifierFormHandler.productId'});
      productIdParam.value = data.productId;

      const catalogRefIdParam = _.find(params, {name: '%2Fatg%2Fcommerce%2Forder%2Fpurchase%2FCartModifierFormHandler.catalogRefIds'});
      catalogRefIdParam.value = data.id;

      const coupons = await getCoupons();
      if (coupons) {
        input.vars.coupons = _.take(coupons, 1);
      } else {
        return;
      }
      result = await checkCoupons(input);
      if (result) {
        cache[cacheId] = {
          expiration: new Date().getTime() + 20 * 60 * 1000,
          result,
          item
        };
      }
    }
    return result;
  } catch (e) {}
}
