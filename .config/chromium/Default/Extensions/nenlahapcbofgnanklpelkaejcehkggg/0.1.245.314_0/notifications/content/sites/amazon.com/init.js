import hasFeature from 'utility/hasFeature';

export default function checkURL(url) {
  if (url.match(/(dp|gp|d).*[0-9A-Z]{10}/)) {
    return true;
  }
  if (url.match(/(dp|gp)\/cart\/view\.html/)) {
    return true;
  }
  if (url.match(/amazon.com\/s\//) && hasFeature('amazon_search_annotation')) {
    return true;
  }
  if (url.match(/(dp|gp)\/buy\/.*\/handlers\/display\.html/)) {
    return true;
  }
  if (url.match(/(dp|gp)\/huc\/view\.html/) || url.match(/(dp|gp)\/(product|prime)\/handle-buy-box/)) {
    return true;
  }
}