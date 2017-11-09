import {WIKIBUY_URL} from 'constants';
import * as analytics from '../utility/analytics';
import currentTab from '../utility/currentTab';
import showSiteHub from 'messaging/notifications/outbound/showSiteHub';
import publicSuffixList from 'iv-public-suffix-list';
import Url from 'url';
import getSite from 'cache/siteCache';
import tree from 'state';
import Promise from 'bluebird';
import _ from 'lodash';

function checkForCommon(tab) {
  return new Promise(resolve => {
    chrome.tabs.sendMessage(tab.id, {type: 'isCommonLoaded'}, (response) => {
      resolve({loadCommon: response && response.loaded ? false : true})
    });
  })
  .timeout(1000)
  .catch(e => {
    console.log(e);
  });
}

function checkSiteHub(tab, siteData) {
  return new Promise(resolve => {
    chrome.tabs.sendMessage(tab.id, {type: 'isCommonLoaded'}, (response) => {
      showSiteHub(tab.id, {site: siteData}).then((loadApp) => {
        resolve({loadApp});
      });
    });
  })
  .timeout(1000)
  .catch(e => {
    return {loadApp: true};
    console.log(e);
  });
}

chrome.browserAction.onClicked.addListener(async () => {
  const tab = await currentTab();
  if (tab) {
    const parsed = tab.url ? Url.parse(tab.url) : null;
    const domain = parsed ? publicSuffixList.getDomain(parsed.hostname) : null;
    const siteData = await getSite(domain);
    if (tree.get(['couponsDisabledSites', `${domain}_${tab.id}`]) && !_.get(siteData, 'siteData.flags.siteHubStandDown')) {
      tree.set(['couponsDisabledSites', `${domain}_${tab.id}`], 0);
    }
    const commonInfo = await checkForCommon(tab)
    const loadInfo = await checkSiteHub(tab, siteData);
    if (commonInfo && commonInfo.loadCommon && loadInfo && loadInfo.loadApp) {
      chrome.tabs.executeScript(tab.id, {file: 'GENERATED/commons.js'}, () => {
        chrome.tabs.executeScript(tab.id, {file: 'GENERATED/sitehub.js'});
      });
    } else if (loadInfo && loadInfo.loadApp) {
      chrome.tabs.executeScript(tab.id, {file: 'GENERATED/sitehub.js'});
    }
  } else {
    chrome.tabs.create({url: WIKIBUY_URL + '/home', active: true});
  }
  analytics.track('browserAction');
});