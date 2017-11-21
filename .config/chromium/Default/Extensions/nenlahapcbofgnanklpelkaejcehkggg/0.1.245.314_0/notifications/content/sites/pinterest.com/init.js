import hasFeature from 'utility/hasFeature';

export default function checkURL(url) {
  if (!hasFeature('notif_deals_other_sites')) {
    return false;
  }
  if (url.match(/\/pin\//i)) {
    return true;
  }
}