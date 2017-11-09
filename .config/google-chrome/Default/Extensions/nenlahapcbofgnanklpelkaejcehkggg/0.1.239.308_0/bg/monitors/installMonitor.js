import * as analytics from '../utility/analytics';
import {WIKIBUY_URL} from 'constants';
import {loadSettings} from 'storage/settings';
import tree from 'state';
import uuid from 'node-uuid';
import personalization from '../logic/personalization';


function setIds() {
  chrome.storage.local.get('installId', ({installId}) => {
    let id = installId;
    if (!id) {
      id = uuid.v4();
      chrome.storage.local.set({installId: id});
    }
    tree.set('installId', id);
  });
  if (chrome.storage.sync) {
    chrome.storage.sync.get('profileId', ({profileId}) => {
      let id = profileId;
      if (!id) {
        id = uuid.v4();
        chrome.storage.sync.set({profileId: id});
      }
      tree.set('profileId', id);
      chrome.runtime.setUninstallURL(`${WIKIBUY_URL}/uninstall-survey?profileId=${tree.get('profileId')}`);
    });
  }
}

async function onInstall() {
  const version = chrome.runtime.getManifest().version;
  setTimeout(() => {
    analytics.track('extensionInstalled', {extensionVersion: version}, {
      integrations: {
        'Customer.io': true
      }
    });
    // Load personalization data
    personalization();
  }, 2000);
  const settings = await loadSettings();
  if (settings && settings.showWebsiteOnboarding) {
    chrome.cookies.get({url: WIKIBUY_URL, name: 'extSkipOnboarding'}, (cookie) => {
      if (!cookie) {
        chrome.tabs.create({url: `${WIKIBUY_URL}/onboarding`, active: true});
      }
      tree.set(['settings', 'showWebsiteOnboarding'], false);
    });
  }
}

function onUpdate() {
  const version = chrome.runtime.getManifest().version;
  setTimeout(() => {
    analytics.track('extensionUpdated', {extensionVersion: version}, {
      integrations: {
        'Customer.io': true
      }
    });
  }, 2000);
}

if (chrome.runtime.onInstalled) {
  chrome.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === 'install') {
      onInstall();
    } else if (details.reason === 'update') {
      onUpdate();
    }
  });
} else {
  chrome.storage.local.get('installId', ({installId}) => {
    if (chrome.runtime.lastError) { return; }
    if (!installId) {
      onInstall();
    } else {
      onUpdate();
    }
  });
}

setIds();
