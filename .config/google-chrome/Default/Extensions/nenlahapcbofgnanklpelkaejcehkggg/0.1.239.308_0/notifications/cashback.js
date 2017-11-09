import React from 'react';
import Cashback from 'pages/Cashback';
import {Route} from 'react-router';
import loadApp from 'utility/loadApp';
import tree from 'state';
import _ from 'lodash';
import setBrowserAction from 'messenger/outbound/setBrowserAction';
import siteCache from 'messenger/outbound/siteCache';
import hasFeature from 'utility/hasFeature';
import tldjs from 'tldjs';
import moment from 'moment';
import {initCashback} from 'actions/cashbackActions';
import dewey from './utility/dewey';
import Promise from 'bluebird';
import getUser from 'messenger/outbound/getUser';

function fetchInitialData() {
  return Promise.all([getUser(), siteCache(), initCashback()])
    .spread((resp, siteAPIData, cashback) => {
      if (resp) {
        tree.set('session', _.get(resp, 'session'));
        tree.set('events', _.get(resp, 'settings.events'));
        tree.set('settings', _.get(resp, 'settings'));
        tree.set('couponsDisabledSites', _.get(resp, 'couponsDisabledSites'));
        tree.set('couponsAffiliateDisabledSites', _.get(resp, 'couponsAffiliateDisabledSites'));
        tree.set('pageViewId', window.__wb_page_view_id);
        tree.set('tabId', _.get(resp, 'tabId'));
      }

      tree.merge({siteAPIData});
      tree.merge({cashback});
    });
}

async function init() {
  await fetchInitialData();
  const cashback = tree.get('cashback');
  const settings = tree.get('settings');
  const cashbackPrefs = _.get(settings, 'notificationPreferences.cashbackPrefs');
  tree.set('cashbackVisible', false);
  const domain = tldjs.getDomain(location.href);
  if (tree.get(['couponsDisabledSites', `${domain}_${tree.get('tabId')}`]) > moment().unix()) {
    return false;
  }
  setBrowserAction({active: !!cashback, cashback});
  // TODO: remove all references to "isCashBackURL" connected to this (all the way through Tigger)
  // TODO: remove the redundant Tigger request for cashback data; pull in cashback data from site api
  //
  const {siteData} = await siteCache();
  let deweyResult = tree.get(['deweyResult']);
  let pageType = _.get(deweyResult, 'pageType');
  if (!deweyResult || !pageType) {
    pageType = await new Promise(res => {
      dewey.emitter.on('result', result => {
        deweyResult = result;
        const pageType = _.get(result, 'pageType');
        if (pageType) {
          res(pageType);
        }
      });
    });
  }
  // TODO: move dewey into pageData; subscribe to page data and listen for cashback page type
  let showCashback;
  if (cashbackPrefs) {
    showCashback = cashbackPrefs.indexOf(pageType) !== -1;
  } else {
    pageType = _.snakeCase(pageType);
    const pagesToShowOn = new Set(siteData.cashback.minNotificationsPageTypes);
    showCashback = pagesToShowOn.has(pageType) ||
      (hasFeature('product_page_cb_notif') && pageType === 'productPage') ||
      (hasFeature('home_page_cb_notif') && pageType === 'homePage') ||
      (hasFeature('search_page_cb_notif') && pageType === 'searchPage');
    const notificationSetting = _.get(cashback, 'user.notifications.notificationSetting');
    showCashback = notificationSetting === 'NONE' ? false : showCashback;
  }

  if (cashback && showCashback && !_.get(cashback, 'user.activated') && !_.get(cashback, 'user.dismissed')) {
    const viewData = tree.get('cashbackView') || cashback;
    tree.set('cashbackView', {...viewData, isCashbackURLMatch: showCashback, deweyResult});
    loadApp({
      initialRoute: '/cashback',
      cssUrl: 'GENERATED/cashback.css',
      route: (
        <Route path="cashback" component={Cashback}/>
      ),
      disableDelay: true
    });
    tree.set('cashbackVisible', true);
  }
}

if (document.readyState !== 'loading') {
  init();
} else {
  document.addEventListener('DOMContentLoaded', init);
}