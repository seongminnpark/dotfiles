import _ from 'lodash';
import sendMetric from 'utility/sendMetric';
import Promise from 'bluebird';
import honeyStateCache from 'messenger/outbound/honeyStateCache';
import tree from 'state';
import getShopifyDomain from 'content/utility/shopify';
import {exponential} from 'backoff';

let currentDomain;


function waitForSelector(selectorFn, cb) {
  const el = selectorFn();
  if (el) {
    return cb(el);
  }
  const exponentialBackoff = exponential({
    randomisationFactor: 0,
    initialDelay: 50,
    maxDelay: 1500
  });

  exponentialBackoff.backoff();
  exponentialBackoff.on('ready', () => {
    const el = selectorFn();
    if (el) {
      cb(el);
      return;
    } else {
      exponentialBackoff.backoff();
    }
  });
}

function buttonsLoaded() {
  try {
    const selector = document
      .querySelector('#honeyContainer')
      .shadowRoot
      .querySelector('#honey')
      .querySelectorAll('button');
    return selector.length && selector;
  } catch (e) {
    return false;
  }
}

function ebatesLoaded() {
  try {
    return document.querySelector('.ebates-notification');
  } catch (e) {
    return false;
  }
}

function popupLoaded() {
  return document.querySelector('#honeyContainer');
}

function addTryCouponsEvtListener() {
  waitForSelector(buttonsLoaded, (buttons) => {
    const hButton = _.last(buttons);
    const tryCouponsButtonFound = hasTryCouponsButton(buttons);

    hButton && hButton.addEventListener('click', () => {
      sendMetric('track', 'honeyFindSavings', {
        domain: getDomain(),
        pagePath: location.pathname,
        url: location.href
      });

      if (tryCouponsButtonFound) {
        sendMetric('track', 'honeyTryCoupons', {
          domain: getDomain(),
          pagePath: location.pathname,
          url: location.href
        });
      }

      honeyStateCache({action: 'initSavingsCheck'});
      // Set state in bg in case page reloads
      checkUntilTimeout(savingsLoaded, 40000, 500, handleHoneySavings);
    });
  });
}

async function initHoneyChecking() {
  try {
    const honeyIsRunning = await honeyStateCache({action: 'getHoneyState'});
    if (honeyIsRunning) {
      checkUntilTimeout(savingsLoaded, 40000, 500, handleHoneySavings);
    }
    waitForSelector(popupLoaded, (customEl) => {
      addTryCouponsEvtListener();
      const changeVisibility = _.debounce((visible) => {
        sendMetric('track', visible ? 'showHoney' : 'hideHoney', {
          domain: getDomain(),
          pagePath: location.pathname,
          url: location.href
        });
      }, 1000);
      const observer = new MutationObserver((mutations) => {
        _.forEach(mutations, (mutationRecord) => {
          const visibility = _.get(mutationRecord, 'target.style.visibility');
          if (visibility === 'hidden') {
            changeVisibility(false);
          } else if (visibility === 'initial') {
            changeVisibility(true);
          }
        });
      });
      const target = customEl ? customEl.shadowRoot.querySelector('#honey') : null;
      if (target) {
        observer.observe(target, {attributes: true, attributeFilter: ['style']});
      }
    });
  } catch (e) {}
}

export default (domain) => {
  currentDomain = domain;
  initHoneyChecking();
  initEbatesChecking();
};

async function checkUntilTimeout(check, timeout, interval, cb) {
  const timeoutID = setTimeout(cb, timeout);
  let result = check();
  while (!result) {
    await delay(interval);
    result = check();
  }
  clearTimeout(timeoutID);
  cb(result);
}

function delay(interval) {
  return new Promise((res) => {
    setTimeout(res, interval);
  });
}

function handleHoneySavings(data) {
  if (!data) return;
  const {savings, originalPrice} = data;
  honeyStateCache({action: 'endSavingsCheck'});
  sendMetric('track', 'honeySavingsFound', {
    originalPrice,
    savings,
    domain: getDomain(),
    pagePath: location.pathname,
    url: location.href
  });
  tree.set(['warnAboutStandDown'], true);
}

function getDomain() {
  if (currentDomain) {
    return currentDomain;
  }

  let domain = location.hostname.replace(/^www\./, '');
  domain = getShopifyDomain(domain) || domain;
  return domain;
}

function hasTryCouponsButton(buttons) {
  return _.find(buttons, button => {
    return /coupon(?:s)?|code(?:s)?/i.test(button.innerHTML);
  })
  ||
  _.find(document
    .querySelector('#honeyContainer')
    .shadowRoot
    .querySelector('#honey')
    .querySelectorAll('span'), span => span.innerHTML === 'Coupon codes');
}

const savingsModalParsers = [
  () => {
    try {
      const savedRe = /Honey saved you \$([\d\.]+)!/;

      const savings = _.find(document
          .querySelector('#honeyContainer')
          .shadowRoot
          .querySelector('#honey')
          .querySelectorAll('div'), div => savedRe.test(div.innerHTML)
        )
        .innerHTML
        .match(savedRe)[1]
        .replace('.', '');

      if (savings) {
        const originalPrice = document
          .querySelector('#honeyContainer')
          .shadowRoot
          .querySelector('#honey')
          .querySelector('strike')
          .innerHTML
          .replace('.', '')
          .replace('$', '')
          .replace(',', '');

        return {savings, originalPrice};
      }
    } catch (e) {
      return false;
    }
  },
  () => {
    try {
      const savedRe = /\$([\d\.]+) saved!/;

      const savings = _.last(_.filter(document
          .querySelector('#honeyContainer')
          .shadowRoot
          .querySelector('#honey')
          .querySelectorAll('div'), div => savedRe.test(div.innerText)))
      .innerText
      .match(savedRe)[1]
      .replace('.', '')
      .replace('$', '')
      .replace(',', '');

      if (savings) {
        const spans = document
          .querySelector('#honeyContainer')
          .shadowRoot
          .querySelector('#honey')
          .querySelectorAll('span');

        const textIdx = _.findIndex(spans, span => /original\stotal/i.test(span.innerText));
        const originalPrice = spans[textIdx + 1]
          .innerText
          .replace('.', '')
          .replace('$', '')
          .replace(',', '');

        return {savings, originalPrice};
      }
    } catch (e) {
      return false;
    }
  },
  () => {
    try {
      if (/doesn't have working codes/.test(document.querySelector('#honeyContainer').shadowRoot.innerHTML)) {
        return {savings: 0, originalPrice: 1};
      }
      return false;
    } catch (e) {
      return false;
    }
  },
  () => {
    try {
      const savedRe = /(You saved).*(\$-)(\d+\.\d+)/;
      const savings = document.querySelector('#honeyContainer').shadowRoot.innerHTML.match(savedRe)[3];

      if (savings) {
        const originalPriceRe = /(Without Honey)[^\$]+\$(\d+\.\d+)/;
        const originalPrice = document.querySelector('#honeyContainer').shadowRoot.innerHTML.match(originalPriceRe)[2];

        return {savings, originalPrice};
      }
    } catch (e) {
      return false;
    }
  }
];

function savingsLoaded() {
  let result;
  _.forEach(savingsModalParsers, parser => {
    const found = parser();
    if (_.has(found, 'savings')) {
      result = found;
      return;
    }
  });
  return result;
}

async function initEbatesChecking() {
  const honeyIsRunning = await honeyStateCache({action: 'getHoneyState'});
  if (!honeyIsRunning) {
    waitForSelector(ebatesLoaded, ebates => {
      sendMetric('track', 'ebatesNotif', {
        domain: getDomain(),
        pagePath: location.pathname,
        url: location.href
      });

      ebates.querySelector('.ebates-notification-button.ebates-notification-button-activate').addEventListener('click', () => {
        sendMetric('track', 'ebatesActivate', {
          domain: getDomain(),
          pagePath: location.pathname,
          url: location.href
        });
      });

      ebates.querySelector('.ebates-notification-close').addEventListener('click', () => {
        sendMetric('track', 'ebatesDismiss', {
          domain: getDomain(),
          pagePath: location.pathname,
          url: location.href
        });
      });
    });
  }
}
