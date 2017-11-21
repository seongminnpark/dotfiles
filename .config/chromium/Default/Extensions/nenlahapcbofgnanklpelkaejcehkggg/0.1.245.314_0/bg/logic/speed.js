import tldjs from 'tldjs';
import ignorePatterns from '../resources/ignore-patterns.json';

const negativeMatches = /impression-tracking\?|adsensecustomsearchads|async_ads|ams-ads-cornerstone-creatives|amazon-adsystem|ad_feedback|ads-search/i;

chrome.webRequest.onBeforeRequest.addListener((details) => {
  if (details.tabId === -1) {
    return;
  }
  if (details.type === 'image') {
    return;
  }
  if (details.url.match(negativeMatches)) {
    return {cancel: true};
  }
  const subdomain = tldjs.getSubdomain(details.url);
  const domain = tldjs.getDomain(details.url);
  const check = (subdomain ? `${subdomain}.` : '') + domain;
  if (ignorePatterns[check]) {
    return {cancel: true};
  }
}, {urls: ['http://*/*', 'https://*/*', 'chrome-extension://*/*']}, ['blocking']);