import React from 'react';
import {WIKIBUY_URL} from 'constants';
import RewardsActivation from '../shared/RewardsActivation';
import Gear from 'components/Gear';
import sendMetric from 'utility/sendMetric';

function CashBackSimpleVariant(props) {
  const {onUserClosePopup} = props;
  function onShowSettings() {
    const url = `${WIKIBUY_URL}/account-settings/notifications?section=cashback`;
    sendMetric('trackClick', 'showSettingSiteHub', 'x', {
      domain: location.hostname.replace(/^www\./, ''),
      pagePath: location.pathname
    });
    window.open(url, '_blank');
  }
  return (
    <div>
      <Gear onClick={onShowSettings} style={{position: 'fixed'}}/>
      <RewardsActivation {...props}/>
      <h4 className="bold activate-later tertiary-link" onClick={onUserClosePopup.bind(null, 'activate later')}>
        activate later
      </h4>
    </div>
  );
}

export default CashBackSimpleVariant;