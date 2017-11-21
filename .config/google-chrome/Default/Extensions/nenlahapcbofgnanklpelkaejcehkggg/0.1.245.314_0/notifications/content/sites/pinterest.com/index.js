import _ from 'lodash';
import tree from 'state';
import getDeal from 'messenger/outbound/getDeal';
import hasFeature from 'utility/hasFeature';
import delay from 'utility/delay';
import regex from 'utility/regex';
import {ignoreRun, displayDeal, loadDeal} from 'actions/notificationActions';

let showingNotification = false;
let currentASIN = null;

async function getASIN() {
  try {
    let el = document.querySelector('.linkModuleActionButton');
    let attemps = 10;
    while (!el) {
      await delay(200);
      el = document.querySelector('.linkModuleActionButton');
      --attemps;
      if (attemps <= 0) {
        break;
      }
    }
    if (!el) {
      return null;
    }
    const url = el.href;
    if (url.indexOf('amazon.com') !== -1) {
      return regex(/\/([A-Z0-9]{10})(\/|$)/, url);
    }
  } catch (e) {}
}

async function run() {
  async function onChange() {
    const asin = await getASIN();
    if (asin) {
      if (asin !== currentASIN) {
        const deal = await getDeal({asin, showAmazonSavings: true, vendor: 'pinterest.com'});
        if (deal) {
          if (!showingNotification) {
            showingNotification = true;
            loadDeal(deal);
          } else {
            displayDeal(deal);
          }
        }
        currentASIN = asin;
      }
    } else {
      ignoreRun();
    }
  }

  const selectors = ['.mainContainer'];
  _.forEach(selectors, selector => {
    const el = document.querySelector(selector);
    if (el) {
      const observer = new MutationObserver(onChange);
      observer.observe(el, {
        childList: true,
        subtree: true
      });
    }
  });
  onChange();
}

export default function getSite() {
  if (!hasFeature('notif_deals_other_sites')) {
    return false;
  }
  let active = false;
  if (window.location.href.match(/\/pin\//i)) {
    tree.set('trigger', 'productPage');
    run();
    active = true;
  }
  return {active};
}