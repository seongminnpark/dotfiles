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
// import PriceHistory from 'wikibuy-shared-product-price-history';
import Tooltip from 'components/Tooltip';
import Gear from 'components/Gear';
import './savings-annotation.less';

const PriceHistory = () => null;

class SavingsDealAnnotation extends Component {

  constructor(...args) {
    super(...args);
    this.state = {
      hideNotification: true,
      complete: false,
      savings: null,
      hasSavings: false,
      originResult: null,
      bestResult: null,
      productURL: null,
      favorite: false,
      hasRun: false,
      receivedAt: null,
      state: ''
    };
  }

  componentWillMount() {
    if (_.get(this.props, 'notification.run.status') === 'complete') {
      this.setState({
        complete: true
      });
    }
    if (_.get(this.props, 'communityDeal') || _.get(this.props, 'communityDealError')) {
      try {
        const id = this.props.communityDeal.id;
        const runId = this.props.communityDeal.runId;
        const asin = this.props.communityDeal.asin;
        actions.loadProduct({id, asin, runId});
      } catch (e) {}
      this.setState({hideNotification: false});
    }
    if (hasFeature('ext_instant_offers') && location.hostname.indexOf('amazon.com') > -1) {
      this.setState({hideNotification: false});
    }
    this.setComponentState(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (_.get(nextProps, 'notification.resetting')) {
      this.setState({
        originResult: null,
        bestResult: null,
        savings: 0,
        cart: null,
        favorite: null,
        hasSavings: false,
        hasRun: false,
        receivedAt: null,
        state: null
      });
      this.setComponentState(nextProps);
      return;
    }
    // When a run finishes and replaces a community offer
    if (
      _.get(nextProps, 'notification.run.status') === 'complete' &&
      _.get(this.props, 'notification.run.status') !== 'complete'
    ) {
      this.lastMissedProps = null;
      this.animating = true;
      const originResult = _.get(nextProps, 'notification.run.originResult');
      const results = _.get(nextProps, 'notification.run.results');
      let bestResult;
      let savings = this.state.savings;
      let hasSavings;

      if (results.length) {
        bestResult = results[0]; // removed sort sort((a, b) => b.savings - a.savings);
        const savingsAmount = bestResult.savings;
        savings = currency(savingsAmount);
        if (savingsAmount && savingsAmount > 100) {
          savings = savings.split('.')[0];
        }
        hasSavings = bestResult.savings > 0;
        if (savingsAmount <= 0) {
          savings = 0;
        }
      }
      this.setState({
        originResult,
        results,
        bestResult,
        savings,
        hasRun: true,
        hasSavings,
        hideResult: true,
        receivedAt: _.get(this.nextProps, 'notification.run.created_at')
      }, () => {
        setTimeout(() => {
          this.setComponentState(nextProps);
          this.animating = false;
          this.setState({hideResult: false});
        }, 300);
      });
    }
    // Reset Notification if the community deal changes or the customer run finishes and has a better price
    if (this.state.hideNotification && !this.animating && (!_.isEqual(_.get(this.props, 'communityDeal'), _.get(nextProps, 'communityDeal')) || !_.isEqual(_.get(this.props, 'communityDealError'), _.get(nextProps, 'communityDealError')))) {
      this.setState({hideNotification: false});
    } else if (_.get(this.props, 'communityDealError') && !_.get(nextProps, 'communityDealError')) {
      this.setState({hideNotification: false});
    }

    if (!_.get(this.props, 'communityDeal') && _.get(nextProps, 'communityDeal') && !this.state.hasRun) {
      const hasSavings = false;
      const favorite = nextProps.communityDeal.favorite;
      this.setState({
        favorite,
        hasSavings,
        receivedAt: nextProps.communityDeal.receivedAt,
        state: nextProps.communityDeal.state
      });
    }

    if (!_.isEqual(this.props, nextProps)) {
      if (nextProps.cart && !_.isEqual(this.props.cart, nextProps.cart) && !this.state.hasRun && (!hasFeature('ext_instant_offers') || location.hostname.indexOf('amazon.com') === -1)) {
        const savingsAmount = _.get(nextProps.cart, 'cartTotal.savings');
        let savings = currency(savingsAmount);
        if (savingsAmount && savingsAmount > 100) {
          savings = savings.split('.')[0];
        }
        if (savingsAmount <= 0) {
          savings = 0;
        }
        const originResult = _.get(nextProps.cart, 'items[0].originResult');
        const bestResult = _.get(nextProps.cart, 'items[0].results[0]');
        let hasSavings = _.get(nextProps.cart, 'cartTotal.savings') > 0;
        const favorite = !!_.get(nextProps.productData, 'favorite');
        if (hasFeature('ext_instant_offers') && !_.get(this.state, 'notification.run.results[0].savings')) {
          hasSavings = false;
          savings = 0;
        }
        this.setState({
          originResult,
          bestResult,
          savings,
          cart: nextProps.cart,
          favorite,
          hasSavings,
          hasRun: false,
          receivedAt: nextProps.communityDeal.receivedAt,
          state: nextProps.communityDeal.state
        });
      }
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
      complete: _.get(props, 'notification.run.status') === 'complete',
      hideNotification: !(props.communityDeal || props.communityDealError)
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
    const complete = this.state.complete;
    const currentSavings = this.state.savings;
    const hasSavings = this.state.hasSavings;
    const reward = _.get(this.state, 'bestResult.pricing.afterRewardTotal') < _.get(this.state, 'originResult.pricing.total') && _.get(this.state, 'bestResult.pricing.reward.amount');
    const tabClass = (hasSavings && currentSavings) || (complete && !hasSavings && reward) ? 'has-savings tab' : 'no-savings tab';
    const hoverInfo = this.renderHover();
    const savingsPercent = this.state.originResult ? (this.state.savings / this.state.originResult.pricing.total) : 0;

    const prefs = _.get(this.props, 'settings.notificationPreferences');

    if (prefs) {
      if (prefs.notificationFrequency === 'cheaper' && !hasSavings) {
        return null;
      } else if (prefs.notificationFrequency === 'great' && (savingsPercent < 0.1 || this.state.savingsAmount < 500)) {
        return null;
      }
    }

    // Ignore tooltip for now
    const showBetterOfferTooltip = false;
    if (this.props.ignoreRun) {
      hideNotification = true;
      return null;
    }

    return (
      <div
        className={hideNotification ? 'disabled wb-savings-annotation' : 'wb-savings-annotation'}>
        {
          showBetterOfferTooltip ?
          <Tooltip
            tip={true}
            message={"wikibuy found you a better offer. hover to see the details."}
            delay={300}
            style={{
              bottom: '15px',
              width: '491px',
              left: '330px'
            }}
            onDismissTooltip={this.onDismissTooltip.bind(this, false)}
          /> : null
        }
        <Motion
          style={{
            opacity: spring(hideNotification ? 0 : 1, {stiffness: 180, damping: 25}),
            textOpacity: spring(this.state.hideResult ? 0 : 1, {stiffness: 180, damping: 25})
          }}>
          {({opacity, y, textOpacity}) => {
            return (
              <span>
                <div
                  className={`${tabClass}`}
                  onMouseOver={this.onMouseOver.bind(this)}
                  style={{
                    opacity: `${opacity}`
                  }}>
                  <div className="w-icon-logo">{this.renderWIcon()}</div>
                  <div className="current-offer" style={{opacity: textOpacity}} onClick={this.onVisitMerchant.bind(this, this.state.bestResult)}>
                    <div className="offer-text">
                      {
                        !hasFeature('ext_instant_offers') ?
                          (
                            !(hasSavings || complete) ?
                            <h2>searching</h2> :
                            !hasSavings && !reward ?
                            <h2>current best price</h2> :
                            !hasSavings && reward ?
                            <h2>get {reward / 100}% back</h2> :
                            currentSavings ?
                            <h2>save {currentSavings}</h2> :
                            <h2>current best price</h2>
                          ) :
                          (
                            currentSavings ?
                            <h2>save {currentSavings}</h2> :
                            !complete ?
                            <h2>searching</h2> :
                            reward ?
                            <h2>get {reward / 100}% back</h2> :
                            <h2>current best price</h2>
                          )
                      }
                    </div>
                  </div>

                  {hoverInfo}
                </div>
              </span>
            ); }
          }
        </Motion>
      </div>
    );
  }

  renderHover() {
    if (!this.props.cart || hasFeature('ext_no_hover')) {
      return;
    }
    let priceHistory = _.get(this.props, 'priceHistory');
    if (priceHistory && priceHistory.items) {
      const points = _(priceHistory.items)
        .map('match_total_p50')
        .filter()
        .value();
      if (points && points.length < 3) {
        priceHistory = null;
      }
    } else {
      priceHistory = null;
    }

    if (!this.state.originResult || !this.state.savings) {
      return null;
    }
    const savings = this.state.savings;
    const originResult = this.state.originResult;
    const bestResult = this.state.bestResult;

    let originShipping = originResult.pricing.shipping ? currency(originResult.pricing.shipping) : 'Free';
    let originTax = originResult.pricing.tax ? currency(originResult.pricing.tax) : 'No Tax';

    let bestShipping = _.get(bestResult, 'pricing.shipping') ? currency(bestResult.pricing.shipping) : 'Free';
    let bestTax = _.get(bestResult, 'pricing.tax') ? currency(bestResult.pricing.tax) : 'No Tax';

    const vendor = 'Wikibuy';
    let foundText = (savings && savings > 0) ? 'found ' : 'checked ';
    if (_.get(this.props, 'notification.run')) {
      const receivedAt = _.get(this.nextProps, 'notification.run.created_at');
      foundText += `by you ${moment(receivedAt).fromNow()}`;
    } else {
      foundText += `${moment(this.state.receivedAt).fromNow()} in ${this.state.state}`;
    }

    return (
      <div className="hover-wrapper card">
        <div className="tick-wrapper">
          <div className="tick"></div>
        </div>
        <div className="card-header">
          <div/>
          <Gear
            onClick={this.onSettings}
            style={{top: '10px', left: '18px'}}/>
          <h4 className="right">{foundText}</h4>
        </div>
        {
          bestResult ?
            <div className="offer-wrapper">
              <div className="breakdown-wrapper">
                <div className="row merchant">
                  <h2 className="name">{`save ${savings}`}</h2>
                  <h5 className="merchant origin">Amazon</h5>
                  <h5 className="merchant match">{vendor}</h5>
                </div>
                <div className="row">
                  <h5 className="name">Price</h5>
                  <h5 className="origin">{currency(originResult.pricing.subtotal)}</h5>
                  <h5 className="match">{currency(bestResult.pricing.subtotal)}</h5>
                </div>
                <div className="row">
                  <h5 className="name">Shipping</h5>
                  <h5 className="origin">{originShipping}</h5>
                  <h5 className="match">{bestShipping}</h5>
                </div>
                <div className="row">
                  <h5 className="name">Tax</h5>
                  <h5 className="origin">{originTax}</h5>
                  <h5 className="match">{bestTax}</h5>
                </div>
                {
                  bestResult.pricing.discount ?
                    <div className="row">
                      <h5 className="name">Discount</h5>
                      <h5 className="origin">-</h5>
                      <h5 className="match">-{currency(bestResult.pricing.discount)}</h5>
                    </div> :
                    null
                }
                <div className="row total">
                  <h5 className="name">Estimated total</h5>
                  <h5 className="origin bold">{currency(originResult.pricing.total)}</h5>
                  <h5 className="match bold">{currency(bestResult.pricing.total)}</h5>
                </div>
                <div className="buttons-wrapper">
                  <div className="primary-btn-medium" onClick={this.onVisitMerchant.bind(this, bestResult)}>continue</div>
                </div>
              </div>
            </div> :
            null
        }
        {
          priceHistory && priceHistory.items && bestResult ?
            <div className="separator"></div> :
            null
        }
        {
          priceHistory && priceHistory.items && priceHistory.items.length > 2 ?
            <div className="price-history-wrapper">
              <h2 className="info">Price history for this product</h2>
              {
                this.state.hasEntered ?
                <PriceHistory data={priceHistory}/> : null
              }
            </div> :
            null
        }
        {
          priceHistory || !bestResult ?
            <div className="tertiary-btn-small" onClick={this.onMoreInfo.bind(this)}>view all offers and reviews</div> :
            null
        }
        <div className="footer">
          <h5>Wikibuy is not affiliated with Amazon.com</h5>
          <div className="wikibuy-logo"></div>
        </div>
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

  onDismissTooltip(affiliate) {
    actions.setSeenNotificationTooltip(affiliate);
  }

  onSettings() {
    const url = `${WIKIBUY_URL}/account-settings/notifications`;
    sendMetric('trackClick', 'showSettingAnnotation', 'x', {
      domain: location.hostname.replace(/^www\./, ''),
      pagePath: location.pathname
    });
    window.open(url, '_blank');
  }

  onToggleFavorite(active, e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      if (e.nativeEvent) {
        e.nativeEvent.stopImmediatePropagation();
      }
    }
    const id = _.get(this.props, 'communityDeal.id');
    const favorite = !this.state.favorite;
    actions.updateFavorite({id, favorite});
    this.setState({favorite});
  }

  onMouseOver(e) {
    if (this.state.hasEntered) {
      return;
    }
    if (!this.props.priceHistory) {
      const asin = _.get(this.props, 'communityDeal.asin');
      actions.loadPriceHistory(asin);
    }
    this.onDismissTooltip();
    this.setState({hasEntered: true});
    if (!hasFeature('ext_2column_pdm')) {
      if (!this.props.communityDeal) {
        return;
      }
      const deal = this.props.communityDeal;
      sendMetric('trackClick', 'annotationHover', '', {
        view: 'quoteAnnotation',
        domain: location.hostname.replace(/^www\./, ''),
        pagePath: location.pathname,
        savings: _.get(deal, 'savings'),
        pageLocation: 'annotation',
        productId: _.get(deal, 'id'),
        productUrl: _.get(deal, 'url')
      });
    } else {
      const run = _.get(this.props, 'notification.run');
      sendMetric('trackClick', 'annotationHover', '', {
        view: 'quoteAnnotation',
        domain: location.hostname.replace(/^www\./, ''),
        pagePath: location.pathname,
        savings: _.get(run, 'savings'),
        matchUrl: _.get(run, 'results[0].product.url'),
        matchDomain: _.get(run, 'results[0].product.vendor'),
        pageLocation: 'annotation',
        quoteId: _.get(run, 'runId'),
        matchId: _.get(run, 'results[0].id')
      });
    }
  }

  onVisitMerchant(result, e) {
    this.onShowModal(true, 'continue', e);
  }

  onMoreInfo(e) {
    this.onShowModal(false, 'more info', e);
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

  onShowModal(hasSavings, type, e) {
    if (!this.props.communityDeal && !_.get(this.props, 'notification.run.id')) {
      return;
    }
    const deal = this.props.communityDeal;
    sendMetric('trackClick', 'viewProductPage', '', {
      view: 'quoteCompleteNotification',
      domain: location.hostname.replace(/^www\./, ''),
      pagePath: location.pathname,
      savings: _.get(deal, 'savings'),
      pageLocation: 'annotation',
      type,
      productId: _.get(deal, 'id'),
      productUrl: _.get(deal, 'url')
    });
    if (_.get(this.props, 'notification.run.id')) {
      window.open(`${WIKIBUY_URL}${deal.url}?run=${_.get(this.props, 'notification.run.id')}`);
    } else {
      window.open(`${WIKIBUY_URL}${deal.url}?run=${_.get(deal, 'runId')}`);
    }
  }

}

export default branch({
  cart: ['ProductPage', 'cart'],
  settings: ['settings'],
  productData: ['ProductPage', 'productData'],
  feedback: ['ProductPage', 'feedback'],
  priceHistory: ['ProductPage', 'priceHistory'],
  bestAmazonResult: ['bestAmazonResult'],
  notification: ['notification'],
  ignoreRun: ['notification', 'ignoreRun'],
  communityDeal: ['notification', 'communityDeal', 'deal'],
  communityDealError: ['notification', 'communityDeal', 'error']
}, SavingsDealAnnotation);
