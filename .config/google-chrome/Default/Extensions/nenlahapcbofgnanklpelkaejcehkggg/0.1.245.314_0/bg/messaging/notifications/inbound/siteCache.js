import {default as getSite, setSite} from 'cache/siteCache';
import tldjs from 'tldjs';
import _ from 'lodash';

export default (data = null, tab) => {
  if (data) {
    if (_.isString(data)) {
      return getSite(data);
    } else if (_.isObject(data) && data.setSite) {
      setSite(data.domain, _.omit(data, ['domain, setSite']));
    }
  }

  if (tab) {
    const domain = tldjs.getDomain(tab.url);
    const subdomain = tldjs.getSubdomain(tab.url);
    const fullDomain = `${subdomain}.${domain}`;
    return getSite(subdomain ? fullDomain : domain);
  }
};