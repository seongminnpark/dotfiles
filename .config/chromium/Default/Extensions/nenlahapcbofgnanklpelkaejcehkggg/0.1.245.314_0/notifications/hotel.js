import React from 'react';
import Hotel from 'pages/Hotel';
import {Route} from 'react-router';
import loadApp from 'utility/loadApp';
import setBrowserAction from 'messenger/outbound/setBrowserAction';
import findHotel from 'messenger/outbound/findHotel';
import tree from 'state';
import initSite from 'content/hotels';
import getUser from 'messenger/outbound/getUser';
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

async function checkForHotel(data) {
  const hotel = await findHotel(data);
  if (_.isArray(hotel) && hotel.length) {
    setBrowserAction({active: true});
    tree.set('hotelView', {
      hotels: hotel
    });
    loadApp({
      initialRoute: '/hotel',
      cssUrl: 'GENERATED/hotel.css',
      route: (
        <Route path="hotel" component={Hotel}/>
      )
    });
  } else if (hotel && hotel.discount) {
    setBrowserAction({active: true});
    tree.set('hotelView', {
      hotel
    });
    loadApp({
      initialRoute: '/hotel',
      cssUrl: 'GENERATED/hotel.css',
      route: (
        <Route path="hotel" component={Hotel}/>
      )
    });
  }
}


async function init() {
  await fetchInitialData();
  try {
    const data = await initSite();
    if (data && !data.error) {
      checkForHotel(data);
    }
  } catch (e) {
    console.log(e);
  }
}
if (document.readyState !== 'loading') {
  init();
} else {
  document.addEventListener('DOMContentLoaded', init);
}