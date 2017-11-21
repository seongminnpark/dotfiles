import React, {Component} from 'react';
import _ from 'lodash';
import sendMetric from 'utility/sendMetric';
import CashBackSimpleVariant from './components/CashBackSimpleVariant';
import {saveNotificationSettings} from 'actions/cashbackActions';
import './cash-back-resolve.less';


class CashBackResolve extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shouldShowSettings: false,
      shouldShowFewerNotificationsMessage: false,
      shouldShowMoreInfo: false,
      mousedOver: false
    };
    this.showSettings = this.showSettings.bind(this);
    this.toggleMoreInfo = this.toggleMoreInfo.bind(this);
    this.saveNotificationSettings = this.saveNotificationSettings.bind(this);
  }
  showSettings() {
    this.setState({shouldShowSettings: true});
    sendMetric('trackClick', 'viewCashBackNotificationSettings');
  }

  toggleMoreInfo() {
    this.setState({shouldShowMoreInfo: !this.state.shouldShowMoreInfo});
    if (this.state.shouldShowMoreInfo) {
      sendMetric('trackClick', 'viewCashBackMoreInfo');
    }
  }

  async saveNotificationSettings(notificationSetting) {
    const isNotAlways = notificationSetting !== 'ALL';
    this.setState({
      shouldShowSettings: false,
      shouldShowFewerNotificationsMessage: isNotAlways,
    });
    if (isNotAlways) {
      setTimeout(() => {
        this.props.dismissNotification();
      }, 3000);
    }
    const notificationSettings = {notificationSetting};
    if (!_.get(this.props.view, 'user.notifications.firstTimeSeenDate')) {
      notificationSettings.firstTimeSeenDate = (new Date()).toISOString();
    }
    await saveNotificationSettings(notificationSettings);
    sendMetric('track', 'saveCashBackNotificationSettings', {
      setting: notificationSetting
    });
  }
  render() {
    const props = {
      ...this.props,
      ...this.state,
      showSettings: this.showSettings,
      toggleMoreInfo: this.toggleMoreInfo,
      saveNotificationSettings: this.saveNotificationSettings,
      userCBNotificationSetting: _.get(this.props.view, 'user.notifications.notificationSetting'),
      isFirstTimeOpeningSettings: !_.get(this.props.view, 'user.notifications.firstTimeSeenDate')
    };
    return (
      <div className="cash-back-resolve">
        <CashBackSimpleVariant {...props}/>
      </div>
    );
  }
}

export default CashBackResolve;