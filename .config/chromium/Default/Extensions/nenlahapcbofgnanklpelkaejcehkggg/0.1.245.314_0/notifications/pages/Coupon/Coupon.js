import React, {Component} from 'react';
import {Motion, spring} from 'react-motion';
import {branch} from 'higher-order/baobab';
import _ from 'lodash';
import Bluebird from 'bluebird';

// Actions
import {tryCodes as tryTigger, throttleNotification, updateEmailSubscriptions} from 'actions/couponActions';
import {tryCodes as tryRoo, cancelRoo} from 'actions/rooActions';
import {setSeenNotificationTooltip, activateThroughPinnedTab} from 'actions/cashbackActions';

// Local Components
import CouponHeader from './components/CouponHeader';
import RenderResult from './components/RenderResult';
import NoScript from './components/NoScript';

// Components
import Tooltip from 'components/Tooltip';

// Utilities
import hasFeature from 'utility/hasFeature';
import sendMetric from 'utility/sendMetric';
import currentDomain from 'utility/currentDomain';

// LESS
import './coupon.less';
import './invite-friends.less';
import './review-wikibuy.less';

class Coupon extends Component {

  constructor(...args) {
    super(...args);
    this.state = {
      hideNotification: true,
      viewCodes: false,
      running: this.props.view.rooRunning,
      rooRunning: this.props.view.rooRunning,
      didTryCodes: this.props.view.rooRunning || this.props.view.pageWasReloaded || false,
      result: this.props.view.result,
      roo: this.props.view.roo,
      showThrottleToolTip: this.props.view.showThrottleToolTip,
      settings: this.props.settings,
      ctaLoading: false
    };
  }

  componentDidMount() {
    sendMetric('page', 'couponNotification', {
      view: 'couponNotification',
      type: 'notification',
      domain: currentDomain(),
      pagePath: location.pathname
    });
    setTimeout(() => {
      this.setState({hideNotification: false});
    }, 200);

    this.boundCloseModal = this.closeModalOnClickOutside.bind(this);
    window.addEventListener('click', this.boundCloseModal);
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.rooRunning && this.props.view.rooRunning && !nextProps.view.rooRunning) {
      this.setState({running: false});
      this.setState({rooRunning: false});
    }

    if (!this.state.didTryCodes && nextProps.view.shouldTryCoupons) {
      this.setState({hideNotification: false});
      this.onTryCodes();
    }

    if (nextProps.view.shouldDismissTooltip) {
      this.onDismissTooltip();
    }

    if (nextProps.view.result) {
      this.setState({result: nextProps.view.result});
    }

    if (nextProps.view.roo) {
      this.setState({roo: nextProps.view.roo});
    }

    if (_.has(nextProps, 'view.showThrottleToolTip')) {
      this.setState({showThrottleToolTip: nextProps.view.showThrottleToolTip});
    }

    if (_.has(nextProps, 'view.hideThrottleToolTip')) {
      this.setState({hideThrottleToolTip: nextProps.view.hideThrottleToolTip});
    }
  }

  render() {
    const {hideNotification, roo} = this.state;
    const showOnTop = true;
    const showOnRight = true;
    const noScript = this.props.view.noScript;
    const fullPageModal = this.shouldShowFullPage() ? `full-page ${!hasFeature('coupon_invite_friends') ? 'invite-friends-full' : ''}` : '';
    const hideRight = (currentDomain() === 'amazon.com' || currentDomain() === 'aliexpress.com') && (this.state.running || _.get(this.state.result, 'pageReload') || this.state.barComplete);
    const hideRightClass = hideRight ? 'hide-right' : '';
    return (
      this.state.showThrottleToolTip ?
        <div>
          <Motion
            style={{
              opacity: spring(this.state.hideThrottleToolTip ? 0 : 1, {stiffness: 180, damping: 20})
            }}>
            {({opacity}) =>
              <Tooltip
                tip={true}
                tipLabel={'wikibuy tip:'}
                message={<span>click the green "w." above if you want to try codes again.</span>}
                style={{
                  top: showOnTop ? '15px' : 'auto',
                  bottom: showOnTop ? 'auto' : '15px',
                  width: '461px',
                  left: showOnRight ? 'auto' : '15px',
                  right: showOnRight ? '15px' : 'auto'
                }}
                innerStyle={{opacity: `${opacity}`}}
                onDismissTooltip={this.onDismissTooltip.bind(this)}/>
              }
          </Motion>
        </div>
      :
        <div
          className={hideNotification ? `disabled coupon-page ${hideRightClass} ${this.state.resetNotification ? fullPageModal : ''}` : `coupon-page ${hideRightClass} ${fullPageModal}`}
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
                className="coupon-notification"
                style={{
                  transform: `translate3d(0,${y}%,0)`,
                  opacity: `${opacity}`
                }}>

                <CouponHeader
                  view={this.props.view}
                  running={this.state.running}
                  roo={roo}
                  fullPageModal={fullPageModal}
                  onClosePopup={this.onClosePopup.bind(this)}/>

                <section>
                {
                  noScript ?
                  <NoScript
                    view={this.props.view}
                    reward={_.get(this.props, 'cashbackView.reward')}
                    postCoupons={_.get(this.props, 'cashbackView.postCoupons')}/> :
                  <RenderResult
                    hideRight={hideRight}
                    googleData={this.props.googleData}
                    domain={currentDomain()}
                    reward={_.get(this.props, 'cashbackView.reward')}
                    postCoupons={_.get(this.props, 'cashbackView.postCoupons')}
                    fullPageModal={fullPageModal}
                    settings={this.state.settings}
                    shortCode={_.get(this.props, 'session.short_code')}
                    onTryCodes={this.onTryCodes.bind(this)}
                    onClosePopup={this.onClosePopup.bind(this)}
                    onToggleSubscribe={this.onToggleSubscribe.bind(this)}
                    getRunAnimation={this.getRunAnimation.bind(this)}
                    view={this.props.view}
                    running={this.state.running}
                    barComplete={this.state.barComplete}
                    ctaLoading={this.state.ctaLoading}/>
                }
                </section>
              </div>
            }
          </Motion>
        </div>
    );
  }

  shouldShowFullPage() {
    return (
      !this.state.barComplete &&
      !this.state.running &&
      _.get(this.state.result, 'savings', 0) > 0 &&
      (!this.state.qualified || (this.state.qualified && this.state.activated))
    ) ||
    (
      // this.state.roo && WE MAY ALWAYS WANT TO SHOW FULL
      (this.state.running || this.state.result)
    );
  }

  onDismissTooltip() {
    if (!this.state.tooltipDismissed) {
      // hideThrottleToolTip runs the fade animation
      this.setState({hideThrottleToolTip: true});
      this.setState({hideNotification: true});
      this.setState({tooltipDismissed: true});

      setSeenNotificationTooltip('hasSeenCouponsThrottleToolTip');

      setTimeout(() => {
        // wait a second for the fade animation, then remove the component altogether
        this.setState({showThrottleToolTip: false});
      }, 1000);
    }
  }

  onClosePopup(label) {
    this.setState({hideNotification: true, resetNotification: true}, () => {
      this.timeout = setTimeout(() => {
        this.setState({resetNotification: false});
      }, 1000);
    });
    if (this.state.rooRunning) {
      cancelRoo();
    }
    throttleNotification();
    if (!this.state.didTryCodes) {
      sendMetric('trackClick', 'dismissCouponNotification', label, {
        domain: currentDomain(),
        pagePath: location.pathname
      });
    }
  }

  async onToggleSubscribe() {
    const currentD = currentDomain();
    const subscriptions = this.state.settings.emailPreferences.coupons.domainSubscriptions;
    const subscribed = _.includes(subscriptions, currentD);
    let newSubscriptions;
    if (subscribed) {
      sendMetric('track', 'couponSubscribe', {
        domain: currentDomain(),
        pagePath: location.pathname,
        action: 'unsubscribed'
      });
      newSubscriptions = _.reject(subscriptions, d => d === currentD);
    } else {
      sendMetric('track', 'couponSubscribe', {
        domain: currentDomain(),
        pagePath: location.pathname,
        action: 'subscribed'
      });
      newSubscriptions = [...subscriptions, currentD];
    }
    this.setState({ctaLoading: true});
    const success = await updateEmailSubscriptions(newSubscriptions);
    this.setState({ctaLoading: false});
    if (success) {
      const newSettings = _.clone(this.state.settings);
      newSettings.emailPreferences.coupons.domainSubscriptions = newSubscriptions;
      this.setState({settings: newSettings});
    }
  }

  async onTryCodes() {
    this.setState({didTryCodes: true});
    let tryCodes;
    if (this.props.view.roo) {
      tryCodes = tryRoo;
    } else {
      tryCodes = tryTigger;
    }
    const runAnimation = this.getRunAnimation();
    sendMetric('trackClick', 'tryCodesButton', 'try codes', {
      domain: currentDomain(),
      pagePath: location.pathname
    });
    this.setState({running: true});
    this.setState({rooRunning: !!this.props.view.roo});
    const reward = _.get(this.props.cashbackView, 'reward');
    const postCoupons = _.get(this.props.cashbackView, 'postCoupons');
    let activateCredits = false;
    if (!!(reward && reward.amount) && (!postCoupons || hasFeature('cp_credits_with_coupon_saver') || hasFeature('cp_credits_with_coupon_no_saver'))) {
      activateCredits = true;
    }
    Bluebird.all([
      tryCodes({disableAffiliate: activateCredits || this.props.view.disableAffiliate}),
      (activateCredits ? activateThroughPinnedTab() : Bluebird.resolve()),
      Bluebird.resolve().delay(runAnimation.duration)
    ]).then(([codesResp, cashbackResp, animationResp]) => {
      if (cashbackResp) {
        sendMetric('track', 'activateCashbackRedirect', {
          domain: currentDomain(),
          pagePath: location.pathname,
          rewardAmount: reward.amount,
          rewardDisplay: reward.type
        });
      }
      this.setState({running: false, barComplete: true, rooRunning: false}, () => {
        setTimeout(() => this.setState({barComplete: false}), 300);
      });
    });
  }

  getRunAnimation() {
    const {estimatedRunTime, roo} = this.props.view;
    let runAnimation;

    if (roo) {
      runAnimation = {duration: 0, stagger: 0};
    } else {
      if (estimatedRunTime <= 5000) {
        runAnimation = {class: 'fast', stagger: 500, duration: 5500};
      } else if (estimatedRunTime <= 10000) {
        runAnimation = {class: 'medium', stagger: 1000, duration: 10500};
      } else if (estimatedRunTime <= 15000) {
        runAnimation = {class: 'slow', stagger: 1500, duration: 15500};
      } else if (estimatedRunTime <= 20000) {
        runAnimation = {class: 'extra-slow', stagger: 2000, duration: 20500};
      } else if (estimatedRunTime <= 25000) {
        runAnimation = {class: 'extra-extra-slow', stagger: 2500, duration: 25500};
      }
    }
    return runAnimation;
  }

  closeModalOnClickOutside(e) {
    if (e.isTrusted && !!this.state.result && this.shouldShowFullPage()) {
      if (!_.find(e.path, el => el.className === 'coupon-notification')) {
        this.onClosePopup();
      }
    }
  }

  componentWillUnmount() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    window.removeEventListener('click', this.boundCloseModal);
  }
}

export default branch({
  view: ['couponView'],
  cashbackView: ['cashbackView'],
  giftCardView: ['giftCardView'],
  session: ['session'],
  settings: ['settings'],
  googleData: ['googleData'],
}, Coupon);