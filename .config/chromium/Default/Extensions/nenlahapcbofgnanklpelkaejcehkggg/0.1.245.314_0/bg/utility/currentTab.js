const promisifyChromeFunctions = require('./promisifyChromeFunctions');
promisifyChromeFunctions(chrome.tabs);

module.exports = function currentTab() {
  return chrome.tabs.queryAsync({active: true, currentWindow: true}).then(tabs => {
    const tab = tabs && tabs.length? tabs[0] : {};
    return tab;
  });
};