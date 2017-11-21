import regex from 'utility/regex';
import Promise from 'bluebird';

let observer;
let latLongEl;

function getLatLong() {
  try {
    const latLong = regex(/@([-0-9.]+,[-0-9.]+)/, latLongEl.href);
    if (latLong && latLong.length) {
      const components = latLong.split(',');
      const latitude = components[0];
      const longitude = components[1];
      const title = document.querySelector('#rhs_block [role="heading"] > div').innerText.replace(/Saved to your Map View on Map/i, '').trim();
      const website = document.querySelector('#rhs_block [role="heading"] .ab_button').href;
      const address = document.querySelector('#rhs_block [data-md="1002"] ._eFb ._Xbe').innerText.trim();
      const phone = document.querySelector('#rhs_block [data-md="1006"] ._eFb ._Xbe').innerText.trim();
      return {
        latitude,
        longitude,
        title,
        website,
        address,
        phone
      };
    }
  } catch (e) {}
}

function checkForLatLong() {
  if (latLongEl) {
    observer.disconnect();
    return;
  }
  latLongEl = document.querySelector('#rhs_block .kp-header .kno-fb-ctx div > a[tabindex]');
  if (latLongEl) {
    return getLatLong();
  }
}

export default async () => {
  // Confirm we are on google search
  if (window.location.hostname !== 'www.google.com') {
    return;
  }
  const data = checkForLatLong();
  if (data) {
    return data;
  }
  const target = document.getElementById('main');
  if (target) {
    return new Promise((resolve) => {
      observer = new MutationObserver((mutations) => {
        const data = checkForLatLong();
        if (data) {
          resolve(data);
        }
      });
      // pass in the target node, as well as the observer options
      observer.observe(target, {attributes: true, childList: true, characterData: true, subtree: true});
    });
  }
};