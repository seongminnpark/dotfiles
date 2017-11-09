// Utility (mainly for Dewey) that keeps track of which apps are loading and loaded
import fetchLoadingApps from 'messenger/outbound/fetchLoadingApps';
import delay from 'utility/delay';
import Promise from 'bluebird';

let fetched = false;
let loadingApps = new Set([]);

export async function getLoadingApps() {
  if (!fetched) {
    loadingApps = new Set(await fetchLoadingApps());
    fetched = true;
  }
  return loadingApps;
}

export async function appLoaded(app) {
  loadingApps.delete(app);
}

export async function waitForApps(apps) {
  await Promise.map(apps, async app => {
    let loadingApps = await getLoadingApps();
    while (loadingApps.has(app)) {
      await delay(50);
      loadingApps = await getLoadingApps();
    }
  });
}