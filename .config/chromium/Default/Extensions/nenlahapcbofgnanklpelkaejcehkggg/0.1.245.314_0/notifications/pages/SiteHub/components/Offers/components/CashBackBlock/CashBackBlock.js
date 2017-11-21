import React, {Component} from 'react';
import _ from 'lodash';
import sendMetric from 'utility/sendMetric';
import {saveNotificationSettings} from 'actions/offersActions';
import RewardsText from './components/RewardsText';
import ActivateButton from './components/ActivateButton';
import isFullAccount from 'utility/isFullAccount';
import {WIKIBUY_URL} from 'constants';
import './cash-back-block.less';

class CashBackBlock extends Component {
  constructor(props) {
    super(props);
    this.toggleSettingsVisible = this.toggleSettingsVisible.bind(this);
    this.handleSaveNotificationSettings = this.handleSaveNotificationSettings.bind(this);
    this.state = {
      settingsVisible: false,
      notificationSetting: _.get(props.cashback, 'user.notifications.notificationSetting'),
      isFullAccount: isFullAccount()
    };
  }
  toggleSettingsVisible() {
    const settingsVisible = this.state.settingsVisible;
    if (!settingsVisible) {
      sendMetric('trackClick', 'viewCashBackNotificationSettings');
    }
    this.setState({settingsVisible: !settingsVisible});
  }
  async handleSaveNotificationSettings(notificationSetting) {
    this.setState({notificationSetting});
    await saveNotificationSettings({notificationSetting});
    this.toggleSettingsVisible();
    sendMetric('track', 'saveCashBackNotificationSettings', {
      setting: notificationSetting
    });
  }
  render() {
    const {
      storeName,
      reward,
    } = this.props;
    return (
      <div className="wb-cash-back-block-section">
        <RewardsText storeName={storeName} reward={reward}/>
        <ActivateButton {...this.props} isFullAccount={this.state.isFullAccount} onSignIn={this.onSignIn.bind(this)}/>
      </div>
    );
  }

  onSignIn() {
    const storeName = _.get(this.props, 'storeName');
    if (storeName !== 'eBay') {
      this.props.onActivate();
    }
    window.open(`${WIKIBUY_URL}/sign-in`);
    this.setState({isFullAccount: true});
  }
}

export default CashBackBlock;
