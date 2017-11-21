import _ from 'lodash';
import $ from 'jquery';

export default (domain, clickId) => {
  if (/dell\.com\/en-us\/work\/cart/i.test(document.URL)) {
    return `http://www.dpbolvw.net/click-7882476-10600279?sid=${clickId}`;
  } else if (/dell\.com\/en-us\/cart/i.test(document.URL)) {
    return `http://www.jdoqocy.com/click-7882476-10495975?sid=${clickId}`;
  } else if (/cvs\.com\/photo/i.test(document.URL)) {
    return `http://www.kqzyfj.com/click-7882476-12850501?sid=${clickId}`;
  } else if (/ecomm\.dell\.com/i.test(document.URL) && _.get($('.mNav:contains(Outlet for Home)'), 'length') || _.get($('.mNav:contains(Outlet for Work)'), 'length')) {
    return `http://www.anrdoezrs.net/click-7882476-12923553?sid=${clickId}`;
  } else if (domain === 'att.com') {
    if ($('.text-legal p:first-child b:contains(Wireless)').length) {
      return `https://click.linksynergy.com/fs-bin/click?id=3*BIL10dmOI&offerid=493346.10001846&type=3&subid=0&u1=${clickId}`;
    } else {
      return `http://www.dpbolvw.net/click-7882476-12404612?sid=${clickId}`;
    }
  }
};