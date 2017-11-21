const domainTimers = {};

const TEN_MINUTES = 1000 * 60 * 10;

export default async (data, tab) => {
  const {
    domain,
    message
  } = data;

  if (message === 'isThrottled') {
    if (domainTimers[domain]) {
      if (domainTimers[domain] + TEN_MINUTES > new Date().getTime()) {
        return true;
      } else {
        delete domainTimers[domain];
      }
    }
    return false;
  } else if (message === 'throttle') {
    domainTimers[domain] = new Date().getTime();
  } else if (message === 'endThrottle') {
    delete domainTimers[domain];
  }
};