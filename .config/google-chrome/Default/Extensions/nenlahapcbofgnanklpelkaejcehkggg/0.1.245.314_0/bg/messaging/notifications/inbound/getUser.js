import tree from 'state';

export default (data, tab) => {
  return {
    settings: tree.get(['settings']),
    session: tree.get(['session']),
    couponsDisabledSites: tree.get('couponsDisabledSites'),
    couponsAffiliateDisabledSites: tree.get('couponsAffiliateDisabledSites'),
    tabId: tab.id
  };
};