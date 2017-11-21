import React, {Component} from 'react';
import _ from 'lodash';
import hasFeature from 'utility/hasFeature';
import isFullAccount from 'utility/isFullAccount';
import {WIKIBUY_URL} from 'constants';
import './cashback-section-simple.less';

class CashbackSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: isFullAccount()
    };
  }
  render() {
    const reward = _.get(this.props.view, 'reward');
    const storeName = _.get(this.props.view, 'vendor');
    const deweyResult = _.get(this.props.view, 'deweyResult');
    const showRewardInNotification = _.get(this.props.view, 'showRewardInNotification');

    const cartTotal = hasFeature('cb_notification_dollar_amt') && _.get(deweyResult, 'pageData.order.total');
    let cbDollarAmt;
    if (cartTotal && reward.type === 'percentage') {
      if (reward.amount) {
        cbDollarAmt = _.round((cartTotal / 100) * (reward.amount / 100), 2);
      }
    } else if (reward.type !== 'percentage') {
      if (reward.amount) {
        cbDollarAmt = reward.amount / 100;
      }
    }
    const showOffer = this.props.activating || this.props.activated;
    return (
      <div className="simple-section">
        {
          !showOffer ?
          <h2>Found 1 offer</h2> :
          cbDollarAmt ?
          <h2>Activating <span className="green">${cbDollarAmt}</span> in credit</h2> :
          <h2>Activating <span className="green">{reward.amount / 100}%</span> back</h2>
        }
        {
          !showOffer && showRewardInNotification ?
          (
            cbDollarAmt ?
            <h4><span>${cbDollarAmt}</span> in credit.</h4> :
            <h4><span>{reward.amount / 100}%</span> back.</h4>
          ) :
          <h4 className="bold">on {storeName}.</h4>
        }
        {
          this.state.isLoggedIn ?
          <div className="button-wrapper">
            {
              this.props.activated ?
              <button className="primary-btn-large" disabled={true}>
                activated
              </button> :
              this.props.activating ?
              <button className="primary-btn-large" disabled={true}>
                activating
              </button> :
              <button className="primary-btn-large" onClick={this.props.onActivate}>
                {this.props.cta}
              </button>
            }
          </div> :
          <div className="button-wrapper">
            <button className="primary-btn-large" onClick={this.onClickSignIn.bind(this)}>{this.props.cta}</button>
          </div>
        }
      </div>
    );
  }
  onClickSignIn() {
    const storeName = _.get(this.props.view, 'vendor');
    if (storeName !== 'eBay') {
      this.props.onActivate({preventHide: !this.state.hasClickedToLogin});
    }
    window.open(`${WIKIBUY_URL}/sign-in`);
    this.setState({hasClickedToLogin: true});
  }
}

export default CashbackSection;