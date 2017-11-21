import invoke from 'messenger';
import sendMetric from 'utility/sendMetric';
import currentDomain from 'utility/currentDomain';

export default (data) => {
  data.domain = data.domain || currentDomain();
  return invoke('activatePinnedTab', data).then((res) => {
    if (res && !res.error) {
      window.location.href = `${window.location.protocol}//${window.location.hostname}?afsrc=1&ha=1`;
      sendMetric('track', 'markAfsrc', {
        domain: res.domain
      });
    }
    return res;
  });
}