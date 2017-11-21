import React from 'react';
import Precog from 'pages/Precog';
import {Route} from 'react-router';
import loadApp from 'utility/loadApp';
import precogMessenger from 'messenger/outbound/precogMessenger';
import checkPrecog from 'messenger/outbound/checkPrecog';
import tree from 'state';
import tldjs from 'tldjs';
import getUser from 'messenger/outbound/getUser';
import delay from 'utility/delay';
import regex from 'utility/regex';
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

let lastId;

async function checkKohls() {
  try {
    const id = _.get(document.querySelector('#addToBagSkuId'), 'value');
    if (id && id !== lastId) {
      lastId = id;
      const productId = regex(/prd-([0-9]+)/, window.location.href);
      const data = {
        id,
        productId,
        url: window.location.href,
        domain: 'kohls.com'
      };
      const precog = await checkPrecog(data);
      if (precog && precog.discount) {
        tree.set('precogView', {
          precog
        });
        loadApp({
          initialRoute: '/precog',
          cssUrl: 'GENERATED/precog.css',
          route: (
            <Route path="precog" component={Precog}/>
          )
        });
      }
      return;
    }
  } catch (e) {}
  await delay(1000);
  checkKohls();
}


async function init() {
  await fetchInitialData();
  try {
    const url = window.location.href;
    const domain = tldjs.getDomain(url);
    if (domain === 'kohls.com' && url.match(/\/product\/prd-/)) {
      const isThrottled = await precogMessenger({domain, message: 'isThrottled'});
      if (!isThrottled) {
        checkKohls();
      }
    }
  } catch (e) {}
}
if (document.readyState !== 'loading') {
  init();
} else {
  document.addEventListener('DOMContentLoaded', init);
}