import React, {Component} from 'react';
import {Motion, spring} from 'react-motion';
import {branch} from 'higher-order/baobab';
import sendMetric from 'utility/sendMetric';
import {dismiss, setSeenNotificationTooltip, activateThroughPinnedTab} from 'actions/cashbackActions';
import _ from 'lodash';
import setSeenCashbackNotification from 'messenger/outbound/setSeenCashbackNotification';
import TooltipResolve from './components/TooltipResolve';
import CashBackResolve from './components/CashBackResolve';
import './cashback.less';

class CashBack extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      hideNotification: true,
    };
  }
  componentWillReceiveProps(nextProps) {
    if (this.props && nextProps && !this.props.warnAboutStandDown && nextProps.warnAboutStandDown && this.state.activated) {
      this.setState({
        hideNotification: false,
        activated: false,
        activating: false,
        hasActivated: true
      });
    }
  }
  componentDidMount() {
    sendMetric('page', 'cashbackNotification', {
      view: 'cashbackNotification',
      type: 'notification',
      domain: location.hostname.replace(/^www\./, ''),
      pagePath: location.pathname,
      offerSignUp: _.get(this.props.view, 'offerSignUp'),
      qualified: _.get(this.props.view, 'qualified', false),
      balance: _.get(this.props.view, 'balance', 0)
    });
    setTimeout(() => {
      this.setState({hideNotification: false});
      setSeenCashbackNotification();
    }, 1000);
  }
  render() {
    const {hideNotification} = this.state;
    const offerSignUp = _.get(this.props.view, 'offerSignUp');
    const storeName = _.get(this.props.view, 'vendor');
    const showOnTop = true;
    const showOnRight = true;
    return (
      <div
        className={hideNotification ? 'disabled cashback-page' : 'cashback-page'}
        style={{
          top: showOnTop ? '0' : 'auto',
          bottom: showOnTop ? 'auto' : '0',
          left: showOnRight ? 'auto' : '0',
          right: showOnRight ? '0' : 'auto'
        }}>
        <Motion
          style={{
            opacity: spring(hideNotification ? 0 : 1, {stiffness: 180, damping: 20}),
            y: spring(hideNotification ? (showOnTop ? -100 : 100) : 0, {stiffness: 180, damping: 20})
          }}>
          {({opacity, y}) =>
            <div
              className="cashback-notification"
              style={{
                transform: `translate3d(0,${y}%,0)`,
                opacity: `${opacity}`
              }}>
              <header>
                <div className="w-icon-logo">{this.renderWIcon()}</div>
              </header>
              <CashBackResolve
                view={this.props.view}
                hasActivated={this.state.hasActivated}
                warnAboutStandDown={this.props.warnAboutStandDown}
                reward={_.get(this.props, 'view.reward')}
                activated={this.state.activated}
                activating={this.state.activating}
                onActivateWarn={this.onActivateWarn.bind(this)}
                session={this.props.session}
                showInitialSignup={this.state.showInitialSignup}
                activate={this.state.activate}
                onActivate={this.onActivate.bind(this)}
                dismissNotification={() => this.setState({hideNotification: true})}
                cta="ok"
                onUserClosePopup={this.onUserClosePopup.bind(this)}
                deweyResult={_.get(this.props.view, 'deweyResult')}/>
            </div>
          }
        </Motion>
        <TooltipResolve
          showOnTop={showOnTop}
          showOnRight={showOnRight}
          offerSignUp={offerSignUp}
          storeName={storeName}
          hideNotification={hideNotification}
          onDismissTooltip={this.onDismissTooltip.bind(this)}
          hasSeenCashbackSignupTip={_.get(this.props, 'events.hasSeenCashbackSignupTip')}
          hasSeenCashbackActivateTip={_.get(this.props, 'events.hasSeenCashbackActivateTip')}/>
      </div>
    );
  }
  onDismissTooltip(type) {
    if (!_.get(this.props, `events.${type}`)) {
      setSeenNotificationTooltip(type);
    }
  }
  async onActivateWarn() {
    const reward = _.get(this.props.view, 'reward', {});
    sendMetric('trackClick', 'activateCashback', 'reactivate', {
      domain: location.hostname.replace(/^www\./, ''),
      pagePath: location.pathname,
      rewardAmount: reward.amount,
      rewardDisplay: reward.type,
      reactivate: true
    });
    this.setState({activating: true});
    const resp = await activateThroughPinnedTab();
    this.setState({activated: true});
    setTimeout(() => {
      this.setState({hideNotification: true});
    }, 500);
    sendMetric('track', 'activateCashbackRedirect', _.assign({
      domain: location.hostname.replace(/^www\./, ''),
      pagePath: location.pathname,
      rewardAmount: reward.amount,
      rewardDisplay: reward.type,
      reactivate: true
    }, resp));
  }
  async onActivate(options = {}) {
    const reward = _.get(this.props.view, 'reward', {});
    this.setState({activating: true});
    this.onDismissTooltip('hasSeenCashbackActivateTip');
    sendMetric('trackClick', 'activateCashback', 'activate', {
      domain: location.hostname.replace(/^www\./, ''),
      pagePath: location.pathname,
      rewardAmount: reward.amount,
      rewardDisplay: reward.type
    });
    const resp = await activateThroughPinnedTab();
    this.setState({activated: true});
    if (!options.preventHide) {
      setTimeout(() => {
        this.setState({hideNotification: true});
      }, 500);
    }
    sendMetric('track', 'activateCashbackRedirect', _.assign({
      domain: location.hostname.replace(/^www\./, ''),
      pagePath: location.pathname,
      rewardAmount: reward.amount,
      rewardDisplay: reward.type
    }, resp));
  }
  onUserClosePopup(label) {
    // Dimiss notifcation if done on a matched route
    if (_.get(this.props.view, 'user.hasSeenFirst') || _.get(this.props.view, 'isCashbackURLMatch')) {
      dismiss();
    }
    this.setState({hideNotification: true});
    if (_.get(this.props.view, 'offerSignUp')) {
      this.onDismissTooltip('hasSeenCashbackSignupTip');
    } else {
      this.onDismissTooltip('hasSeenCashbackActivateTip');
    }
    sendMetric('trackClick', 'dismissCashbackNotification', label, {
      domain: location.hostname.replace(/^www\./, ''),
      pagePath: location.pathname
    });
  }
  renderWIcon() {
    return (
      <svg id="Layer_1" x="0px" y="0px" viewBox="0 0 60 45">
        <g>
          <path d="M39.4,35.9h-9L25,19.1h-0.1l-5.2,16.8h-9L1.3,8.8h9.6L15.7,26h0.1l4.9-17.2h8.9l5,17.2h0.1l4.8-17.2h9.3
          L39.4,35.9z M57.7,31.6c0,0.7-0.1,1.4-0.4,2c-0.2,0.6-0.6,1.1-1,1.6c-0.4,0.4-1,0.8-1.7,1s-1.3,0.3-2,0.3c-1.5,0-2.7-0.5-3.7-1.4
          c-1-0.9-1.4-2-1.4-3.5c0-0.7,0.1-1.3,0.4-1.8c0.2-0.7,0.6-1.3,1-1.6c0.8-0.7,1.4-1,1.7-1.1c0.9-0.3,1.6-0.4,2-0.4
          c0.7,0,1.4,0.1,2,0.4c0.7,0.2,1.2,0.6,1.7,1c0.3,0.3,0.7,0.8,1.1,1.6C57.6,30.2,57.7,30.8,57.7,31.6z"/>
        </g>
      </svg>
    );
  }
}

export default branch({
  view: ['cashbackView'],
  events: ['events'],
  session: ['session'],
  warnAboutStandDown: ['warnAboutStandDown']
}, CashBack);