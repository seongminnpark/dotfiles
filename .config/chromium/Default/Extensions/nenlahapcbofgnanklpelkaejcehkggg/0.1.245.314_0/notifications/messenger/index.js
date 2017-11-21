import RemoteContextMessenger from 'iv-remote-context-messenger';

const CONTENT_INSTANT_SOURCE = '__wikibuy_instant_content';
const BG_INSTANT_SOURCE = '__wikibuy_instant_bg';
const BG_SCRIPT_SOURCE = '__wikibuy_bg';
const INSTANT_MESSAGING_PORT_NAME = '__wikibuy_instant_external_messages';

function getMethod(methodName) {
  return require(`messenger/inbound/${methodName}`).default;
}

let messenger = window.messenger;
if (!messenger) {
  const port = chrome.runtime.connect(chrome.runtime.id, {name: INSTANT_MESSAGING_PORT_NAME});

  messenger = window.messenger = RemoteContextMessenger(getMethod, (msg) => {
    chrome.runtime.sendMessage({src: CONTENT_INSTANT_SOURCE, data: msg});
  });

  chrome.runtime.onMessage.addListener((request) => {
    if (request.src === BG_INSTANT_SOURCE) {
      messenger.handleMessage(request.data);
    }
  });
}

export default function invoke(type, data={}) {
  return messenger.invoke(type, [data]);
}

export function invokeLocal(type, data = {}) {
  if (window.handleMessage) {
    window.handleMessage({type, ...data});
  }
}