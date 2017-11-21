import React, {Component} from 'react';
import currency from 'utility/currency';
import {Motion, spring} from 'react-motion';
import _ from 'lodash';
import sendMetric from 'utility/sendMetric';
import {branch} from 'higher-order/baobab';
import * as actions from 'actions/notificationActions';
import hasFeature from 'utility/hasFeature';
import moment from 'moment';
import {WIKIBUY_URL} from 'constants';
import './savings-notification.less';

class SavingsDealNotification extends Component {

  constructor(...args) {
    super(...args);
    this.state = {
      hideNotification: true,
      complete: false
    };
  }

  componentWillMount() {
    if (_.get(this.props, 'notification.run.status') === 'complete') {
      this.setState({
        complete: true
      });
    }

    if (_.get(this.props, 'communityDeal') || _.get(this.props, 'communityDealError')) {
      this.setState({hideNotification: false});
    }
    if (hasFeature('ext_instant_offers') && location.hostname.indexOf('amazon.com') > -1) {
      this.setState({hideNotification: false});
    }
    this.setComponentState(this.props);
  }

  componentWillReceiveProps(nextProps) {
    // When a run finishes and replaces a community offer
    if (
      _.get(nextProps, 'notification.run.status') === 'complete' &&
      (_.get(this.props, 'notification.run.status') !== 'complete' || _.get(nextProps, 'notification.run.id') !== _.get(this.props, 'notification.run.id'))
    ) {
      this.lastMissedProps = null;
      this.animating = true;
      this.setState({hideResult: true}, () => {
        setTimeout(() => {
          this.setComponentState(nextProps);
          this.animating = false;
          this.setState({hideResult: false});
        }, 300);
      });
    }
    // Reset Notification if the community deal changes or the customer run finishes and has a better price
    if (_.get(this.props, 'communityDeal') && !_.get(nextProps, 'communityDeal')) {
      this.lastMissedProps = null;
      this.animating = true;
      this.setState({hideNotification: true}, () => {
        setTimeout(() => {
          this.setComponentState(nextProps);
          this.animating = false;
          this.setState({hideNotification: false});
        }, 500);
      });
    } else if (this.state.hideNotification && !this.animating && (!_.isEqual(_.get(this.props, 'communityDeal'), _.get(nextProps, 'communityDeal')) || !_.isEqual(_.get(this.props, 'communityDealError'), _.get(nextProps, 'communityDealError')))) {
      this.setState({hideNotification: false});
    } else if (_.get(this.props, 'communityDealError') && !_.get(nextProps, 'communityDealError')) {
      this.setState({hideNotification: false});
    }

    if (!this.animating && !_.isEqual(this.props, nextProps)) {
      this.setComponentState(nextProps);
    } else if (!_.isEqual(this.props, nextProps)) {
      this.lastMissedProps = nextProps;
    }
  }

  setComponentState(props) {
    if (this.lastMissedProps) {
      props = _.clone(this.lastMissedProps);
    }
    this.setState({
      bestAmazonResult: props.bestAmazonResult,
      notification: props.notification,
      communityDeal: props.communityDeal,
      communityDealError: props.communityDealError,
      complete: _.get(props, 'notification.run.status') === 'complete'
    });
    this.lastMissedProps = null;
  }

  componentWillUnmount() {
    clearTimeout(this.hideTimeout);
  }

  minMaxRange(minSavings, maxSavings) {
    return Math.abs(minSavings - maxSavings) < 100 ? currency(minSavings, minSavings > 100) : `${currency(minSavings, minSavings > 100)} - ${currency(maxSavings, maxSavings > 100)}`;
  }

  render() {
    let {hideNotification} = this.state;
    const showOnTop = false;
    const showOnRight = false;
    const runSavings = _.get(this.state, 'notification.cartPricing.savings', 0) > 0 ? _.get(this.state, 'notification.cartPricing.savings', 0) : 0;
    const otherOfferSavings = _.get(this.state, 'notification.run.results[1].savings') || 0;
    const numberOfBetterOffers = _.get(this.state, 'notification.run.results.length', 0);
    const showCommunityResult = false && _.get(this.state.communityDeal, 'savings') > 0 && (!hasFeature('ext_instant_offers') || location.hostname.indexOf('amazon.com') === -1);
    const complete = this.state.complete;
    const reward = _.get(this.state, 'notification.run.results[0].pricing.afterRewardTotal') < _.get(this.state, 'notification.run.originResult.pricing.total') && _.get(this.state, 'notification.run.results[0].pricing.reward.amount');
    let currentSavings;
    let savingsAmount = 0;
    let originTotal = 0;
    if (showCommunityResult && !(complete && runSavings)) {
      savingsAmount = this.state.communityDeal.savings;
      originTotal = this.state.communityDeal.originPricing.total;
      currentSavings = currency(this.state.communityDeal.savings, this.state.communityDeal.savings > 100);
    } else {
      const maxSavings = _.max([runSavings, otherOfferSavings]);
      savingsAmount = maxSavings;
      originTotal = _.get(this.state, 'notification.run.originResult.pricing.total');
      currentSavings = maxSavings ? `up to ${currency(maxSavings, maxSavings > 100)}` : false;
    }
    const savingsPercent = originTotal ? (currentSavings / originTotal) : 0;
    const hasSavings = ((currentSavings || numberOfBetterOffers) && complete) || showCommunityResult;
    const tabClass = hasSavings || (complete && !hasSavings && reward) ? 'has-savings tab' : !currentSavings && !numberOfBetterOffers && complete ? 'no-savings tab' : 'tab';
    if (this.props.ignoreRun) {
      hideNotification = true;
    }
    let offer;
    if ((this.state.communityDealError || _.get(this.state.communityDeal, 'savings') === 0) && !(complete && runSavings)) {
      offer = (<h2>current best price</h2>);
    } else if (currentSavings) {
      offer = (<h2>save {currentSavings}</h2>);
    } else if (!complete) {
      offer = (<h2>searching</h2>);
    } else if (reward) {
      offer = (<h2>get {reward / 100}% back</h2>);
    } else {
      offer = (<h2>current best price</h2>);
    }

    const prefs = _.get(this.props, 'settings.notificationPreferences');
    if (prefs) {
      if (prefs.notificationFrequency === 'cheaper' && !hasSavings) {
        return null;
      } else if (prefs.notificationFrequency === 'great' && (savingsPercent < 0.1 || savingsAmount < 500)) {
        return null;
      }
    }

    return (
      <div
        className={hideNotification ? 'disabled wb-savings-notification' : 'wb-savings-notification'}
        style={{
          top: showOnTop ? '0' : 'auto',
          bottom: showOnTop ? 'auto' : '0',
          left: showOnRight ? 'auto' : '0',
          right: showOnRight ? '0' : 'auto'
        }}>
        <Motion
          style={{
            opacity: spring(hideNotification ? 0 : 1, {stiffness: 180, damping: 25}),
            textOpacity: spring(this.state.hideResult ? 0 : 1, {stiffness: 180, damping: 25})
          }}>
          {({opacity, y, textOpacity}) => {
            return (
              <span>
                <div
                  className={tabClass}
                  onClick={this.onShowModal.bind(this, hasSavings)}
                  style={{
                    opacity: `${opacity}`
                  }}>
                    <div className="close" onClick={this.onClosePopup.bind(this, 'x')}>{this.renderXIcon()}</div>
                    <div className="current-offer" style={{opacity: textOpacity}}>
                      <div className="offer-text">
                        {offer}
                        {
                          complete && runSavings ?
                          <h4>{runSavings ? 'found' : 'checked'} by you {moment(this.state.notification.run.created_at).fromNow()}</h4> :
                          _.get(this.state.communityDeal, 'receivedAt') && showCommunityResult ?
                          <h4>{_.get(this.state.communityDeal, 'savings') ? 'found' : 'checked'} {moment(this.state.communityDeal.receivedAt).fromNow()} in {this.state.communityDeal.state}</h4> :
                          null
                        }
                      </div>
                      <div className="w-icon-logo">{this.renderWIcon()}</div>
                    </div>
                </div>
              </span>
            ); }
          }
        </Motion>
      </div>
    );
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

  renderXIcon() {
    return (
      <svg x="0px" y="0px" viewBox="0 0 60 60">
        <g>
          <path d="M34.5,29.5l23.8,23.8L53.8,58L30,34L6.2,58l-4.6-4.7l23.8-23.8L1.6,5.7L6.2,1L30,24.9L53.8,1l4.6,4.7L34.5,29.5z"/>
        </g>
      </svg>
    );
  }

  onClosePopup(label, e) {
    if (e) {
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
    this.setState({hideNotification: true});
    sendMetric('trackClick', 'dismissSavingsNotification', label, {
      domain: location.hostname.replace(/^www\./, ''),
      pagePath: location.pathname,
      cashback: !!_.get(this.props, 'cashbackView.reward')
    });
  }

  onShowModal(hasSavings, e) {
    if (e.isPropagationStopped || !this.props.communityDeal) {
      return;
    }
    const deal = this.props.communityDeal;
    sendMetric('trackClick', 'viewProductPage', '', {
      view: 'quoteCompleteNotification',
      domain: location.hostname.replace(/^www\./, ''),
      pagePath: location.pathname,
      savings: _.get(deal, 'savings'),
      pageLocation: 'notification',
      productId: _.get(deal, 'id'),
      productUrl: _.get(deal, 'url')
    });
    if (this.state.complete && _.get(this.props, 'notification.cartPricing.savings', 0)) {
      window.open(`${WIKIBUY_URL}${deal.url}?run=${_.get(this.props, 'notification.run.id')}`);
    } else {
      if (_.get(deal, 'sourceVendor.length') && _.get(deal, 'sourceVendor') !== 'amazon.com') {
        const additionalParams = `&originVendor=${encodeURIComponent(_.get(deal, 'sourceVendor'))}&originTotal=${_.get(deal, 'originPricing.total')}`;
        window.open(`${WIKIBUY_URL}${deal.url}?run=${_.get(deal, 'runId')}${additionalParams}`);
      } else {
        window.open(`${WIKIBUY_URL}${deal.url}?run=${_.get(deal, 'runId')}`);
      }
    }
  }

}

export default branch({
  bestAmazonResult: ['bestAmazonResult'],
  notification: ['notification'],
  settings: ['settings'],
  ignoreRun: ['notification', 'ignoreRun'],
  communityDeal: ['notification', 'communityDeal', 'deal'],
  communityDealError: ['notification', 'communityDeal', 'error']
}, SavingsDealNotification);
