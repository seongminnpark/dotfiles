import tree from 'state';
import moment from 'moment';

export default async (data) => {
  if (data && data.redirect) {
    chrome.tabs.create({url: data.redirect, active: true}, (tab) => {
      if (tab && tab.id) {
        tree.set(['couponsDisabledSites', `groupon.com_${tab.id}`], moment().add(10, 'minutes').unix());
      }
    });
  }
};