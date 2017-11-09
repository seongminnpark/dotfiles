import invoke from 'messenger';
import sendMetric from 'utility/sendMetric';

export default (data) => {
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