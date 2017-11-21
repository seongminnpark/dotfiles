import {tryCoupons, dropCookie as drop, initTigger} from 'content/coupons';
import tree from 'state';
import sendMetric from 'utility/sendMetric';
import uuid from 'node-uuid';
import followAffiliateLink from 'messenger/outbound/followAffiliateLink';
import _ from 'lodash';
import hasFeature from 'utility/hasFeature';
import delay from 'utility/delay';
import moment from 'moment';
import {getSavings, setConfig} from 'iv-tigger';
import siteCache from 'messenger/outbound/siteCache';
import couponsMessenger from 'messenger/outbound/couponsMessenger';
import currentDomain from 'utility/currentDomain';
import runPinnedTab from 'messenger/outbound/pinnedTab';
import dewey from 'utility/dewey';
import { ORIGIN_SITE_API } from 'constants';
import getCustomAffiliateUrl from 'utility/customAffiliateUrl';
import {
  getElement,
  getPromoCodeEl
} from 'content/roo';

let tryingCodes = false;
let ignoredCode;
const cursor = tree.select('couponView');

export function throttleNotification() {
  const domain = currentDomain();
  if (domain !== 'amazon.com' && domain !== 'aliexpress.com') {
    couponsMessenger({domain, message: 'triedCodes'});
  }
}

export async function dropCookie(clickId) {
  if (
    !cursor.get('disableAffiliate') &&
    !tree.get(['offers', 'coupons', 'disableAffiliate']) &&
    !(tree.get(['couponsDisabledSites', `${currentDomain()}_${tree.get('tabId')}`]) > moment().unix()) &&
    !(tree.get(['couponsAffiliateDisabledSites', `${currentDomain()}_${tree.get('tabId')}`]) > moment().unix())
  ) {
    try {
      const url = getCustomAffiliateUrl(currentDomain(), clickId) || await drop(clickId);

      if (url) {
        const pinId = 'coupons' + clickId;
        runPinnedTab({
          url,
          id: pinId,
          timeout: 10000,
          cb: {
            type: 'aff'
          }
        });
        await followAffiliateLink(url);
      }
    } catch(e) {}
  }
}

export function resetResult() {
  cursor.set('hadPreviousResult', !!cursor.get('result'));
  cursor.set('result', null);
}

export async function tryCodes({disableAffiliate}) {
  tryingCodes = true;
  const clickId = uuid.v4().replace(/-/g, '');
  const domain = currentDomain();
  const droppedCookie = !disableAffiliate;
  if (!disableAffiliate) {
    dropCookie(clickId);
  }
  sendMetric('track', 'tryCoupons', {
    domain,
    clickId,
    droppedCookie,
    currentLocation: window.location
  });

  const siteAPIData = await siteCache(domain);
  const siteData = {
    domain,
    pageTypes: _.get(siteAPIData, 'siteData.pageTypes')
  };
  dewey.run({callSource: 'coupons_start'});
  const couponStartTime = new Date().getTime();
  const result = await tryCoupons(_.get(siteAPIData, 'siteData.coupons.shopify') ? 'shopify.com' : currentDomain(), cursor.get('coupons'), siteData) || {};
  if (_.get(result, 'bestCoupon')) {
    try {
      const code = _.get(result, 'bestCoupon.code');
      if (code) {
        ignoredCode = code.toLowerCase();
      }
    } catch (e) {}
  }
  result.duration = new Date().getTime() - couponStartTime;
  if (result) {
    if (result.affiliateRedirect || result.pageReload) {
      sessionStorage.setItem('couponRun', JSON.stringify({clickId, droppedCookie, result}));
    }

    if (result.affiliateRedirect) {
      const url = await drop(clickId);
      if (url) {
        window.location.href = url;
        return;
      }
    } else if (result.pageReload) {
      return;
    }
    handleResult({result, droppedCookie, clickId});
  }
}

export function handleResult({result, droppedCookie, clickId}) {
  cursor.set('resultTemp', _.assign(result, {droppedCookie, clickId}));
  dewey.run({callSource: 'coupons_end', siteData: tree.get('siteAPIData').siteData});
  throttleNotification();
  tryingCodes = false;
}

export function claimCredit() {
  cursor.set('creditClaimed', true);
}

export async function viewAllCodes() {
  sendMetric('track', 'viewAllCodes', {
    domain: currentDomain(),
    currentLocation: window.location
  });
}

export async function copyCode(code) {
  const clickId = uuid.v4().replace(/-/g, '');
  dropCookie(clickId);
  sendMetric('trackClick', 'copyCouponCode', code, {
    domain: currentDomain(),
    pagePath: location.pathname,
    clickId
  });
}

export async function initCoupons(options) {
  let config = false;
  const domain = currentDomain();

  const siteAPIData = await siteCache(domain);
  let {coupons, ignoreAffiliate} = _.get(siteAPIData, 'siteData.coupons', {});
  let disableAffiliate = false;
  if (ignoreAffiliate || hasFeature('ext_tigger_af_off') || tree.get(['couponsAffiliateDisabledSites', `${domain}_${tree.get('tabId')}`]) > moment().unix()) {
    cursor.set('disableAffiliate', true);
    disableAffiliate = true;
  }
  let couponCount = coupons && coupons.length;
  setConfig({
    LOG_FN: (name, data) => {
      sendMetric('track', name, data);
    },
    SITE_API: ORIGIN_SITE_API
  });

  if (hasFeature('user_contributed_codes_tigger')) {
    const script = _.get(siteAPIData, 'siteData.coupons.script');
    if (script) {
      setupCouponListener(script);
    }
  }

  let estimatedRunTime;
  let pageCoupons;
  let tiggerFinished;
  let backoff = 500;
  while (!tiggerFinished) {
    const resp = await initTigger(_.get(siteAPIData, 'siteData.coupons.shopify') ? 'shopify.com' : domain, coupons);
    estimatedRunTime = resp.estimatedRunTime;
    pageCoupons = resp.pageCoupons;
    tiggerFinished = estimatedRunTime !== undefined;
    await delay(backoff);
    backoff *= 2;
    if (backoff > 5000) {
      backoff = 5000;
    }
  }
  // Use estimatedRunTime to determine whether it's a checkout page
  let previousRun;
  if (estimatedRunTime) {
    sendMetric('track', 'couponCheck', {
      domain,
      pagePath: location.pathname
    });
    if (tree.get(['couponsDisabledSites', `${domain}_${tree.get('tabId')}`]) > moment().unix()) {
      disableAffiliate = true;
      return config; // Bail if we are standing down
    }

    try {
      previousRun = JSON.parse(sessionStorage.getItem('couponRun'));
      if (previousRun) {
        const siteData = {
          domain,
          pageTypes: _.get(siteAPIData, 'siteData.pageTypes')
        };
        const {savings, originalTotal} = await getSavings(siteData);
        previousRun.result.savings = savings;
        previousRun.result.originalTotal = originalTotal;
        delete previousRun.result.pageReload;
        sessionStorage.removeItem('couponRun');
      }
    } catch (e) {
      // log('tiggerScriptError', {error: e, domain});
      sessionStorage.removeItem('couponRun');
    }

    if (pageCoupons) {
      coupons = [];
      couponCount = pageCoupons;
    }
    config = {
      coupons,
      estimatedRunTime,
      disableAffiliate,
      couponCount,
      pageWasReloaded: !!previousRun
    };
  }
  tree.set('couponsConfig', config);
  if (previousRun) {
    handleResult(previousRun);
  }
  return config;
}

export async function initOnlyShowCoupons() {
  const domain = currentDomain();
  const siteAPIData = await siteCache(domain);
  const {coupons, ignoreAffiliate} = _.get(siteAPIData, 'siteData.coupons', {});
  let disableAffiliate = false;
  if (ignoreAffiliate || hasFeature('ext_tigger_af_off') || tree.get(['couponsAffiliateDisabledSites', `${domain}_${tree.get('tabId')}`]) > moment().unix()) {
    cursor.set('disableAffiliate', true);
    disableAffiliate = true;
  }
  if (tree.get(['couponsDisabledSites', `${domain}_${tree.get('tabId')}`]) > moment().unix()) {
    disableAffiliate = true;
    return false;
  }
  const couponCount = coupons && coupons.length;
  const config = {
    coupons,
    estimatedRunTime: 0,
    disableAffiliate,
    couponCount,
    pageWasReloaded: false,
    noScript: true
  };
  tree.set('couponsConfig', config);
  return config;
}

export async function updateEmailSubscriptions(subscriptions) {
  return await couponsMessenger({message: 'updateSubscriptions', subscriptions});
}

async function setupCouponListener(script) {
  try {
    if (script.promoApplyAction) {
      const promoApplyElement = getElement(script.promoApplyAction);
      if (promoApplyElement) {
        promoApplyElement.addEventListener('click', (e) => {
          if (!tryingCodes) {
            const promoInputEl = getPromoCodeEl(script);
            if (promoInputEl) {
              const code = promoInputEl.value;
              if (_.get(code, 'length') && code.toLowerCase() !== ignoredCode) {
                // Fire an event
                const domain = currentDomain();
                sendMetric('track', 'userContributedCode', {
                  domain,
                  pagePath: location.pathname,
                  code
                });
              }
            }
          }
        });
      }
    }
  } catch (e) {}
}
