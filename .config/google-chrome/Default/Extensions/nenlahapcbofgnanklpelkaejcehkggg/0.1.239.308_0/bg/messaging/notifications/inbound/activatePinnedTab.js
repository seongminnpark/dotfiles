import {activateInPinnedTab} from 'logic/cashback';

export default (data = {}, tab) => {
  return activateInPinnedTab({url: tab.url, tabId: tab.id, pageViewId: data.pageViewId});
};