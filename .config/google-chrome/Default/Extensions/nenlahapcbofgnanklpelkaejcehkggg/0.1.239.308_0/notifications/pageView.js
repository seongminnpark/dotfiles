chrome.runtime.sendMessage({
  type: 'pageView',
  url: window.location.href,
  referrer: document.referrer,
  title: document.title
}, (pageViewId) => {
  window.__wb_page_view_id = pageViewId;
});
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'isCommonLoaded') {
    sendResponse({loaded: !!window.webpackJsonp});
  }
});
document.addEventListener('DOMContentLoaded', () => {
  var link = document.querySelector('link[rel="chrome-webstore-item"]');
  if (link && link.href) {
    chrome.runtime.sendMessage({
      type: 'extLink',
      link: link.href,
      url: window.location.href,
      referrer: document.referrer,
      title: document.title
    });
  }
});