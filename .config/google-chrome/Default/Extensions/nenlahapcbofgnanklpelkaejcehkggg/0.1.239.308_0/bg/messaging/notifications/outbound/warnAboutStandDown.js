import {invokeInTab} from '../index';

export default (tabId, data) => {
  return invokeInTab(tabId, 'warnAboutStandDown', data);
}