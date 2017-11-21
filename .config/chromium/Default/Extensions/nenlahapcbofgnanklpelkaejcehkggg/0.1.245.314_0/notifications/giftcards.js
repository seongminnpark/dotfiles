import React from 'react';
import GiftCard from 'pages/GiftCard';
import {Route} from 'react-router';
import loadApp from 'utility/loadApp';
import setBrowserAction from 'messenger/outbound/setBrowserAction';
import findGiftCards from 'messenger/outbound/findGiftCards';
import tree from 'state';
import tldjs from 'tldjs';
import getUser from 'messenger/outbound/getUser';
import giftCardMessenger from 'messenger/outbound/giftCardMessenger';
import Promise from 'bluebird';
import _ from 'lodash';

function fetchInitialData() {
  return Promise.all([getUser()])
    .spread((resp) => {
      if (resp) {
        tree.set('session', _.get(resp, 'session'));
        tree.set('events', _.get(resp, 'settings.events'));
        tree.set('settings', _.get(resp, 'settings'));
        tree.set('pageViewId', window.__wb_page_view_id);
        tree.set('tabId', _.get(resp, 'tabId'));
      }
    });
}

async function checkForCards(url, domain) {
  const card = await findGiftCards({domain, url});
  // Yield to coupons and cash back
  if (tree.get('couponsVisible')) {
    return;
  } else if (tree.get('cashBackVisible')) {
    return;
  }
  if (card) {
    setBrowserAction({active: true});
    tree.set('giftCardView', {
      giftcard: card,
      domain
    });
    loadApp({
      initialRoute: '/giftcards',
      cssUrl: 'GENERATED/giftcards.css',
      route: (
        <Route path="giftcards" component={GiftCard}/>
      )
    });
  }
}


async function init() {
  await fetchInitialData();
  try {
    const url = window.location.href;
    const domain = tldjs.getDomain(url);
    const isThrottled = await giftCardMessenger({domain, message: 'isThrottled'});
    if (!isThrottled) {
      checkForCards(url, domain);
    }
  } catch (e) {}
}
if (document.readyState !== 'loading') {
  init();
} else {
  document.addEventListener('DOMContentLoaded', init);
}