import {initCashback} from './cashbackActions';
import tree, {addLoader} from 'state';
import Promise from 'bluebird';
import Coupon from 'pages/Coupon';
import loadApp from 'utility/loadApp';
import {Route} from 'react-router';
import React from 'react';
import _ from 'lodash';
import sendMetric from 'utility/sendMetric';
import currentDomain from 'utility/currentDomain';
import couponsMessenger from 'messenger/outbound/couponsMessenger';
import saveCashBackNotificationSettings from 'messenger/outbound/saveCashBackNotificationSettings';

addLoader('offers', async (data, path) => {
  if (!data || data.stale) {
    loadOffers(path);
  }
});

async function loadOffers(path) {
  tree.set(path.concat(['$isLoading']), true);
  let coupons;
  if (tree.get('couponsThrottled')) {
    const siteAPIData = tree.get('siteAPIData');
    coupons = tree.get('couponView');
    coupons.couponsThrottled = true;
    coupons.type = _.get(siteAPIData, 'siteData.coupons.type');
    tree.set(['couponView', 'shouldDismissTooltip'], true);
  } else {
    const siteAPIData = tree.get('siteAPIData');
    coupons = {
      coupons: !_.get(siteAPIData, 'siteData.coupons.ignoreSite') && _.get(siteAPIData, 'siteData.coupons.coupons'),
      type: _.get(siteAPIData, 'siteData.coupons.type')
    };
  }
  try {
    const cashback = await initCashback();
    if (cashback && cashback.user && tree.get('warnAboutStandDown')) {
      delete cashback.user.activated;
    }
    tree.set(path, {
      coupons,
      cashback
    });
  } catch(err) {
    tree.set(path, {error: 'Error fetching offers'});
    console.log(err);
  }
}

export async function tryCoupons() {
  const domain = currentDomain();
  couponsMessenger({domain, message: 'endThrottle'});
  const couponsThrottled = tree.get('couponsThrottled');
  const throttleTooltipShown = tree.select('couponView').get('showThrottleToolTip');
  if (couponsThrottled && throttleTooltipShown) {
    tree.set(['couponView', 'showThrottleToolTip'], false);
    tree.set(['siteHubView', 'visible'], false);
    tree.set(['couponView', 'shouldTryCoupons'], true);
  } else {
    tree.set(['siteHubView', 'visible'], false);
    const loadOptions = {
      initialRoute: '/coupons',
      cssUrl: 'GENERATED/coupons.css',
      route: (
        <Route path="coupons" component={Coupon}/>
      )
    };
    loadOptions.disableDelay = true;
    loadApp(loadOptions, () => {
      tree.set(['couponView', 'shouldTryCoupons'], true);
    });
    sendMetric('track', 'tryCouponsSiteHub', {
      domain,
      currentLocation: window.location
    });
  }
}


export async function saveNotificationSettings(notificationSettings) {
  saveCashBackNotificationSettings(notificationSettings);
}