import invoke from 'messenger';
import tldjs from 'tldjs';
import _ from 'lodash';
import tree from 'state';

let domain;

export default function sendMetric(method, ...args) {
  const data = _.find(args, (arg) => {
    return !_.isString(arg);
  });

  if (!data) {
    domain = tldjs.getDomain(location.href);
  } else {
    domain = data.domain || tldjs.getDomain(location.href);

    data.domain = domain;
    data.pageViewId = tree.get('pageViewId');
  }
  invoke('wbAnalytics', {method, priceCheckId: window.priceCheckId, domain, args});
}