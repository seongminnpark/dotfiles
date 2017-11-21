let currentDomain;

export default () => {
  return currentDomain;
};

export function setDomain(domain) {
  currentDomain = domain;
}