import React, {Component} from 'react';
import _ from 'lodash';
import './notification-settings.less';

const OPTIONS_ENUM = {
  ALL: 'always show cashback',
  MIN_NOTIFICATIONS: 'only tell me at checkout',
  NONE: 'don\'t show cash back'
};


class NotificationSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {selectedOption: props.userCBNotificationSetting || 'ALL'};
  }
  render() {
    const {
      saveNotificationSettings,
      isFirstTimeOpeningSettings = false,
    } = this.props;
    const {
      selectedOption
    } = this.state;
    return (
      <div className="cashback-notification-settings">
        <h2 className={isFirstTimeOpeningSettings ? 'first-time' : ''}>
          {
            isFirstTimeOpeningSettings ?
              'thanks. did you know you can change your cash back settings?' :
              'cash back settings'
          }
        </h2>
        <div className="settings-options">
          {
            _.map(OPTIONS_ENUM, (value, key) => {
              return (
                <div className="settings-option semi-bold" onClick={() => this.setState({selectedOption: key})}>
                  <input type="checkbox" value={key} checked={selectedOption === key}/>
                  <label>{value}</label>
                </div>
              );
            })
          }
        </div>
        <div className="save-btn button-wrapper">
          <button className="primary-btn-large" onClick={() => saveNotificationSettings(selectedOption)}>
            save settings
          </button>
        </div>
      </div>
    );
  }
}

export default NotificationSettings;
