import tldjs from 'tldjs';
import cache from 'cache/cashbackCache';
import moment from 'moment';
import {
  getCashback,
  setConfig,
  isCashBackURL as isCashBackURLTigger,
  setSiteAPIForCashBack
} from 'iv-tigger';
import {SITE_API, WIKIBUY_API} from 'constants';
import {track} from 'utility/analytics';
import localStore from 'storage/local';
import _ from 'lodash';
import uuid from 'node-uuid';
import getPreferences from 'cache/preferencesCache';
import {updatePreferences} from 'api/preferences';
import {standDown} from 'monitors/afsrcMonitor';
import {runPinnedTab} from '../utility/pinnedTab';
import hasFeature from 'utility/hasFeature';
import isFullAccount from 'utility/isFullAccount';

const historyVersion = '2';

setSiteAPIForCashBack(SITE_API.replace(/\/v1|\/v2/, ''));

setConfig({
  LOG_FN: (name, data) => {
    track(name, data);
  }
});

(function init() {
  resetHistoryToVersion();
}());

async function resetHistoryToVersion() {
  const {cashbackHistory} = await localStore.get('cashbackHistory');
  const newHistory = _(cashbackHistory)
    .sortBy('timestamp')
    .reverse()
    .take(10)
    .filter((h) => {
      return h.version === historyVersion;
    })
    .value();
  await localStore.set({cashbackHistory: newHistory});
}

async function appendCashbackHistory(domain) {
  const {cashbackHistory} = await localStore.get('cashbackHistory');
  const record = _.find(cashbackHistory, (h) => h.domain === domain);
  if (record) {
    record.count++;
    record.timestamp = Date.now();
  } else {
    const newRecord = {
      domain,
      count: 1,
      timestamp: Date.now(),
      version: historyVersion
    };
    (cashbackHistory || []).push(newRecord);
  }
  const newHistory = _(cashbackHistory)
    .sortBy('timestamp')
    .reverse()
    .take(10)
    .filter((h) => {
      return h.version === historyVersion;
    })
    .value();
  await localStore.set({cashbackHistory: newHistory});
}

function checkToShowCashback(url) {
  const domain = tldjs.getDomain(url);
  const cashback = cache.get(domain);
  appendCashbackHistory(domain);
  const checkData = {
    activated: false,
    dismissed: false,
    hasSeenFirst: false,
    seenCount: 0
  };
  if (cashback && cashback.activated) {
    checkData.activated = true;
  }
  if (cashback && cashback.dismissed && moment(cashback.dismissed).add(60, 'minute').isAfter(moment())) {
    checkData.dismissed = true;
  }
  if (cashback && cashback.hasSeenFirst && moment(cashback.hasSeenFirst).add(60, 'minute').isAfter(moment())) {
    checkData.hasSeenFirst = true;
  }
  if (cashback && cashback.seenCount) {
    checkData.seenCount = cashback.seenCount;
  }
  return checkData;
}

export async function activateInPinnedTab({url, tabId, pageViewId}) {
  standDown(url, 'ebatesActivate', tabId);
  const domain = tldjs.getDomain(url);
  cache.set(domain, {activated: Date.now()});
  const pinId = `cashback${domain}`;
  const clickId = uuid.v4().replace(/-/g, '');
  track('cashbackRedirect', {
    clickId,
    domain,
    pageViewId
  });
  const result = await runPinnedTab({
    url: `${WIKIBUY_API}/redirect?r=1&url=${encodeURIComponent(`http://${domain}`)}&channel=cashback&clickId=${clickId}`,
    id: pinId,
    done: (tab) => { return domain === tldjs.getDomain(tab.url); }
  });
  result.domain = domain;
  return result;
}

export async function isCashBackURL(url) {
  const isCashBack = await isCashBackURLTigger(url);
  return _.isBoolean(isCashBack) ? {isMatch: isCashBack} : isCashBack;
}

export async function saveCashBackNotificationSettings({notificationSetting, firstTimeSeenDate}) {
  const prefs = await getPreferences();
  const cashback = _.assign(prefs.cashback, {notificationSetting, firstTimeSeenDate});
  await updatePreferences({cashback});
}

export async function getCashBackNotificationSettings() {
  const prefs = await getPreferences();
  return _.defaults(prefs.cashback, {notificationSetting: 'ALL'});
}

export default async ({url}) => {
  const isEbates = hasFeature('ebates_customer_group');
  const cashback = await getCashback(url);
  if (cashback && cashback.reward && !isEbates) {
    const checkData = checkToShowCashback(url);
    cashback.user = checkData;
    return cashback;
  }
};