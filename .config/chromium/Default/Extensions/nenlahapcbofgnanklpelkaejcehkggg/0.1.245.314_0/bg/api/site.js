import xhr from 'utility/xhr';
import {SITE_API, SITE_API_V3} from '../constants';

export async function getSite(domain) {
  if (/\//.test(domain)) {
    // Some shopify sites have a '/' in them
    return {
      meta: {}
    };
  }
  return await xhr('GET', `${SITE_API_V3}/site/${domain}`);
}

export async function getBloom() {
  return await xhr('GET', `${SITE_API}/blacklist_bloom`);
}