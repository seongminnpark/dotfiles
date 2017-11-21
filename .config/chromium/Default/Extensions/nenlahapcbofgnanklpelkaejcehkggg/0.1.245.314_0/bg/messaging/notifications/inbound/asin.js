import tree from 'state';
import showOnboarding from '../outbound/showOnboarding';
import {startRun} from 'logic/instant';
import hasFeature from 'utility/hasFeature';

const postOnboardingRunCursor = tree.select(['postOnboardingRun']);
const settingsCursor = tree.select('settings');

export default (request, tab) => {
  const data = {
    asin: request.asin,
    gtins: request.gtins,
    price: request.price,
    shipping: request.shipping,
    seller: request.seller,
    product: request.product,
    meta: {
      tab, // TODO
      atcData: request.atcData,
      feedback: request.feedback,
      dealId: request.dealId
    }
  };
  if (!hasFeature('ob_disable_show') && settingsCursor.get('showOnboarding') && !settingsCursor.get('hasAccount')) {
    showOnboarding(tab.id, {hasAccount: settingsCursor.get('hasAccount')});
    postOnboardingRunCursor.set(data);
  } else {
    return startRun(data).then(({runId}) => {
      return {runId};
    });
  }
}