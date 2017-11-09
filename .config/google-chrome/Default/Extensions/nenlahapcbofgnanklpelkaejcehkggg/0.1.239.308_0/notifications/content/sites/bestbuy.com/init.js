import hasFeature from 'utility/hasFeature';

export default function checkURL(url) {
  if (!hasFeature('notif_deals_other_sites')) {
    return false;
  }
  if (url.match(/site\/.*\.p\?.*skuId=/i)) {
    return true;
  }
}