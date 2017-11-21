import * as analytics from '../utility/analytics';
import hasFeature from 'utility/hasFeature';

let idleTracker = null;
chrome.idle.onStateChanged.addListener(state => {
  if (hasFeature('check_idle_state')) {
    const arg = {
      integrations: {
        'Customer.io': false
      }
    };
    if (state === 'idle') {
      idleTracker = new Date().getTime();
      analytics.track('idleStart', null, arg);
    } else if (state === 'active' && idleTracker) {
      const elapsed = new Date().getTime() - idleTracker;
      const properties = {elapsed};
      analytics.track('idleComplete', properties, arg);
    }
  }
});