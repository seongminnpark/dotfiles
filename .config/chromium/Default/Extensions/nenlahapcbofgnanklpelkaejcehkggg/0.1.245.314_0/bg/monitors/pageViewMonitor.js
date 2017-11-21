import _ from 'lodash';
import {isWhitelisted, isTracklisted} from './libs/listCache';
import {showInactiveIcon} from 'monitors/activeMonitor';
import {track} from '../utility/analytics';
import hasFeature from '../utility/hasFeature';
import publicSuffixList from 'iv-public-suffix-list';
import Url from 'url';
import Promise from 'bluebird';
import tree from 'state';
import uuid from 'node-uuid';
import getSite from '../cache/siteCache';
import giftCardDomains from '../resources/gift-cards.json';

async function getUser(tab) {
  return {
    settings: tree.get(['settings']),
    session: tree.get(['session']),
    couponsDisabledSites: tree.get('couponsDisabledSites'),
    couponsAffiliateDisabledSites: tree.get('couponsAffiliateDisabledSites'),
    tabId: tab.id
  };
}

async function fetchInitialData(domain, tab) {
  const [resp, siteAPIData] = await Promise.all([getUser(tab), getSite(domain)]);
  return {resp, siteAPIData};
}

async function getLists(domain) {
  const [whitelisted, tracklisted] = await Promise.all([
    isWhitelisted(domain),
    isTracklisted(domain)
  ]);
  return {whitelisted, tracklisted};
}

// Check to see if we should load up our site app
function checkSiteURL(domain, url) {
  try {
    const result = require('../../notifications/content/sites/' + domain + '/init');
    if (result) {
      return result.default(url);
    }
  } catch (e) {}
}

async function analyzeData(data, domain, tab, trackOpts = {}) {
  const {
    pageObj,
    pageViewObj
  } = trackOpts;

  const siteAPIData = _.get(data, 'siteAPIData');

  const scripts = [];
  let scriptLoaded = false;
  let ignoreCommon = false;
  let deweyLoading = false;
  let watch = _.get(siteAPIData, 'meta.watch');

  // Pre-load sites via content script for improved performance
  if (domain.match(/amazon\.com|bestbuy\.com|homedepot\.com/)) {
    ignoreCommon = true;
    scriptLoaded = true;
  } else if (checkSiteURL(domain, tab.url)) {
    scripts.push({file: 'GENERATED/site.js'});
    scriptLoaded = true;
  } else if (domain.match(/opentable\.com|yelp\.com/)) {
    scripts.push({file: 'GENERATED/deals.js'});
  } else if (hasFeature('show_hotel_storm') && domain.match(/expedia\.com|priceline\.com|^hotels\.com|^kayak\.com|^booking\.com/)) {
    scripts.push({file: 'GENERATED/hotel.js'});
  }

  const couponsData = _.get(siteAPIData, 'siteData.coupons');
  if (
    (couponsData && !couponsData.ignoreSite && couponsData.coupons.length) ||
    hasFeature('apply_page_coupons') &&
    (domain === 'aliexpress.com' || (hasFeature('apply_page_coupons_amazon') && domain === 'amazon.com'))
  ) {
    ignoreCommon = false;
    scriptLoaded = false;
    // Included in coupon script
    // TODO: remove after investigation
    if (domain === 'groupon.com') {
      track('pushCouponScriptStart', pageObj, pageViewObj);
    }
    if (domain === 'bestbuy.com' || domain === 'homedepot.com' || domain === 'amazon.com') {
      ignoreCommon = true;
    }
    // end TODO
    watch = false;
    if (hasFeature('coupon_redesign')) {
      scripts.push({file: 'GENERATED/coupons.js'});
    } else {
      scripts.push({file: 'GENERATED/couponsOld.js'});
    }
  } else if (_.get(siteAPIData, 'siteData.cashback') && !_.get(siteAPIData, 'siteData.cashback.disabled')) {
    ignoreCommon = false;
    scriptLoaded = false;
    scripts.push({file: 'GENERATED/cashback.js'});
  }

  if (hasFeature('show_gift_cards')) {
    const gitfCardData = _.find(giftCardDomains, {domain});
    if (gitfCardData && gitfCardData.match_pattern) {
      const pattern = new RegExp(gitfCardData.match_pattern, 'i');
      if (tab.url.match(pattern)) {
        scripts.push({file: 'GENERATED/giftcards.js'});
      }
    }
  }

  if (hasFeature('show_precog')) {
    if (domain === 'kohls.com' && tab.url.match(/\/product\/prd-/)) {
      scripts.push({file: 'GENERATED/precog.js'});
    }
  }

  if (hasFeature('show_custom_notification') && _.get(siteAPIData, 'siteData.notifications.length')) {
    ignoreCommon = false;
    scriptLoaded = false;
    scripts.push({file: 'GENERATED/customNotification.js'});
  }

  if (!scriptLoaded) {
    const siteData = _.get(siteAPIData, 'siteData');
    const pageDataEnabled = !!_.get(siteAPIData, 'meta.page_data_enabled');
    if (checkShopifyURL(tab.url) || pageDataEnabled || (siteData && !_.isEmpty(siteData))) {
      deweyLoading = true;
      scripts.push({file: 'GENERATED/dewey.js'});
    }
  }
  if (watch && !ignoreCommon) {
    scripts.push({file: 'GENERATED/watch.js'});
  }

  if (scripts.length) {
    if (ignoreCommon) {
      _.forEach(scripts, script => {
        chrome.tabs.executeScript(tab.id, script);
      });
    } else {
      chrome.tabs.executeScript(tab.id, {file: 'GENERATED/commons.js'}, () => {
        _.forEach(scripts, script => {
          chrome.tabs.executeScript(tab.id, script);
        });
      });
      if (deweyLoading) {
        // use appLoaded utility for dewey to keep track of apps that need to load before it starts emitting
        const loadingApps = _.map(scripts, script => {
          return script.file.match(/GENERATED\/(.*)\.js/)[1];
        });
        tree.set('loadingApps', loadingApps);
      }
    }
  }
}

function checkGoogleShoppingURL(url, domain) {
  if (domain === 'google.com') {
    return url.match(/google\.com\/search.*&tbm=shop|google\.com\/shopping/i);
  }
}

function checkShopifyURL(url) {
  return /\.com\/\d+\/checkouts\/[\w\d]+/.test(url);
}

function checkHotelsURL(domain) {
  return /^expedia\.com|^priceline\.com|^hotels\.com|^kayak\.com|^booking\.com/.test(domain);
}

async function trackPage(request, parsed, domain, sender, sendResponse) {
  const pageViewId = uuid.v4();
  sendResponse(pageViewId);
  showInactiveIcon(sender.tab.id);
  getLists(domain).then(async ({whitelisted, tracklisted}) => {
    try {
      if (whitelisted || tracklisted || checkGoogleShoppingURL(parsed.href, domain) || checkShopifyURL(parsed.href) || checkHotelsURL(domain)) {
        const pageObj = {
          domain,
          title: request.title,
          url: parsed.href,
          pageViewId
        };
        const pageViewObj = {
          page: {
            path: parsed.pathname,
            referrer: request.referrer,
            search: parsed.search || '',
            title: request.title,
            url: parsed.href
          },
          integrations: {
            'Customer.io': false
          }
        };
        track('pageView', pageObj, pageViewObj);

        // Fetch site api data
        const tab = sender.tab;
        const data = await fetchInitialData(domain, tab);
        analyzeData(data, domain, tab, {pageObj, pageViewObj});
      }
    } catch (e) {}
  });
  return true;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'extLink') {
    track('extLink', {
      link: request.link,
      url: request.url,
      title: request.title,
      referrer: request.referrer
    });
    return;
  }
  if (request.type !== 'pageView' || navigator.userAgent.indexOf('Firefox') > -1) { return; }
  const parsed = request.url ? Url.parse(request.url) : null;
  const domain = parsed ? publicSuffixList.getDomain(parsed.hostname) : null;
  if (parsed) {
    trackPage(request, parsed, domain, sender, sendResponse);
  }
});
