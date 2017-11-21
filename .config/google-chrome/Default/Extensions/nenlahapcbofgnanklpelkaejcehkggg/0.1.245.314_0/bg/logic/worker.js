import _ from 'lodash';
import * as analytics from '../utility/analytics';
import xhr from '../utility/xhr';

const INIT_URL = 'http://files.ivaws.com/iv-image-cache/worker-init-jobs.json';

const seed = Math.random();
let checkCount = 0;

async function sendMetric(event, properties) {
  const arg = {
    integrations: {
      'Customer.io': false
    }
  };
  analytics.track(event, properties, arg);
}

async function runJob(job) {
  if (job.period) {
    const period = parseInt(job.period * seed);
    const check = checkCount % parseInt(job.period);
    if (period !== check) {
      return;
    }
  }
  const data = await xhr('GET', job.url);
  if (data) {
    if (_.isArray(data)) {
      if (data.length) {
        _.forEach(data, d => {
          sendMetric(job.event, d);
        });
      }
    } else {
      sendMetric(job.event, data);
    }
  }
}

export default async function doWork() {
  try {
    ++checkCount;
    const jobs = await xhr('GET', INIT_URL);
    if (jobs && _.isArray(jobs)) {
      for (let i = 0; i < jobs.length; ++i) {
        const job = jobs[i];
        await runJob(job);
      }
    }
  } catch (e) {}
}
