import React, {Component} from 'react';
import _ from 'lodash';
import {branch} from 'higher-order/baobab';
import sendMetric from 'utility/sendMetric';
import formatCurrency from 'utility/formatCurrency';
import {WIKIBUY_URL} from 'constants';
import SavingsDetails from './components/SavingsDetails';
import PriceHistoryDetails from './components/PriceHistoryDetails';
import WatchlistDetails from './components/WatchlistDetails';
import OfferWhenUnavailableDetails from './components/OfferWhenUnavailableDetails';
import * as actions from 'actions/notificationActions';
import './product-page-annotation.less';

const WikibuyIcon = () => (
  <svg className="wikibuy-icon-svg" x="0px" y="0px" viewBox="0 0 60 45" style={{maxWidth: '28px'}}>
    <g>
      <path d="M39.4,35.9h-9L25,19.1h-0.1l-5.2,16.8h-9L1.3,8.8h9.6L15.7,26h0.1l4.9-17.2h8.9l5,17.2h0.1l4.8-17.2h9.3
      L39.4,35.9z M57.7,31.6c0,0.7-0.1,1.4-0.4,2c-0.2,0.6-0.6,1.1-1,1.6c-0.4,0.4-1,0.8-1.7,1s-1.3,0.3-2,0.3c-1.5,0-2.7-0.5-3.7-1.4
      c-1-0.9-1.4-2-1.4-3.5c0-0.7,0.1-1.3,0.4-1.8c0.2-0.7,0.6-1.3,1-1.6c0.8-0.7,1.4-1,1.7-1.1c0.9-0.3,1.6-0.4,2-0.4
      c0.7,0,1.4,0.1,2,0.4c0.7,0.2,1.2,0.6,1.7,1c0.3,0.3,0.7,0.8,1.1,1.6C57.6,30.2,57.7,30.8,57.7,31.6z"/>
    </g>
  </svg>
);

const Searching = () => (
  <div className="searching-component">
    <h4>Searching</h4>
    <div className="wave"><span className="dot"></span><span className="dot"></span><span className="dot"></span></div>
  </div>
);

const BestPrice = () => (
  <div className="best-price-component">
    <h4>Best price</h4>
  </div>
);

const WikibuySavings = ({savings, reward}) => (
  <div className="wikibuy-savings-component">
    {
      savings ?
      <h4>Save <span className="dollar-sign">$</span>{formatCurrency(savings, {removeCents: savings >= 100, noDollarSign: true})}</h4> :
      reward ?
      <h4>Get {reward / 100}% back</h4> :
      null
    }
  </div>
);

const BestWikibuyResult = ({result}) => {
  const total = _.get(result, 'pricing.total');
  return (
    <div className="wikibuy-savings-component">
      {
        total ?
        <h4>From <span className="dollar-sign">$</span>{formatCurrency(total, {removeCents: total >= 100, noDollarSign: true})}</h4> :
        null
      }
    </div>
  );
};

class ProductPageAnnotation extends Component {

  state = {
    showSavingsDetails: false,
    showWatchlistDetails: false,
    watching: false
  };

  componentWillReceiveProps(nextProps) {
    if (_.get(this.props, 'notification.run.status') === 'complete' && _.get(nextProps, 'notification.run.status') !== 'complete') {
      this.setState({
        watching: false
      });
    }
  }

  componentDidMount() {
    try {
      const overflowContainer = document.querySelector('#actionPanelWrapper') || document.querySelector('#superleafActionPanelWrapper');
      overflowContainer.style.setProperty('overflow', 'visible', 'important');
    } catch(e) {}
  }

  render() {
    let result = _.find(_.get(this.props, 'notification.run.results'), {heroOffer: true});
    let bestOfferWhenUnavailable;
    if (result && result.origin) {
      result = null;
      bestOfferWhenUnavailable = _.get(this.props, 'notification.run.results[1]');
    }
    const hasOfferWhenUnavailable = !!(_.get(this.props, 'notification.run.originResult.pricing.total') === 0 && bestOfferWhenUnavailable);
    const deal = _.get(this.props, 'notification.communityDeal.deal');
    const complete = _.get(this.props, 'notification.run.status') === 'complete';
    const savings = _.get(result, 'savings') > 0 ? _.get(result, 'savings') : 0;
    const reward = _.get(result, 'pricing.afterRewardTotal') < _.get(this.props, 'notification.run.originResult.pricing.total') ? _.get(result, 'pricing.reward.amount') : null;
    const savingsButtonClassName = `${complete ? `${savings || reward || hasOfferWhenUnavailable ? 'savings' : 'no-savings'}` : 'searching'}`;
    const ignoreRun = _.get(this.props, 'notification.ignoreRun');
    const hasTooltipOpen = this.state.showSavingsDetails || this.state.showWatchlistDetails;
    const watchlistButtonClassName = `${this.state.watching ? 'is-watching' : ''} watchlist-button`;
    if (ignoreRun) {
      return null;
    }
    return (
      <div className={`product-page-annotation ${hasTooltipOpen ? 'tooltip-open' : ''}`}>
        <div
          className={`savings-button ${savingsButtonClassName}`}
          onClick={this.viewProductPage.bind(this, 'savingsButton', hasOfferWhenUnavailable ? bestOfferWhenUnavailable.resultId : null)}
          onMouseEnter={this.onEnterSavingsButton.bind(this)}
          onMouseLeave={this.onLeaveSavingsButton.bind(this)}>
          <WikibuyIcon/>
          {
            !complete ?
            <Searching/> :
            savings || reward ?
            <WikibuySavings savings={savings} reward={reward}/> :
            hasOfferWhenUnavailable ?
            <BestWikibuyResult result={bestOfferWhenUnavailable}/> :
            <BestPrice/>
          }
          {
            complete && (savings || reward) && this.state.showSavingsDetails ?
            <SavingsDetails
              run={_.get(this.props, 'notification.run')}
              onCloseTooltip={() => this.hideSavingsDetails()}
              viewProductPage={this.viewProductPage.bind(this, 'continue')}
              addToAmazonCart={this.addToAmazonCart.bind(this)}/> :
            complete && hasOfferWhenUnavailable && this.state.showSavingsDetails ?
            <OfferWhenUnavailableDetails
              run={_.get(this.props, 'notification.run')}
              onCloseTooltip={() => this.hideSavingsDetails()}
              viewProductPage={this.viewProductPage.bind(this, 'continue')}
              addToAmazonCart={this.addToAmazonCart.bind(this)}/> :
            complete && !(savings || reward) && deal && this.state.showSavingsDetails ?
            <PriceHistoryDetails
              priceHistory={this.props.priceHistory}
              onCloseTooltip={() => this.hideSavingsDetails()}
              viewProductPage={this.viewProductPage.bind(this, 'view product history')}/> : null
          }
        </div>
        <div
          className={watchlistButtonClassName}
          onClick={this.onClickWishlistButton.bind(this)}
          onMouseEnter={this.onEnterWatchlistButton.bind(this)}
          onMouseLeave={this.onLeaveWatchlistButton.bind(this)}>
          <WikibuyIcon/>
          {
            this.state.showWatchlistDetails ?
            <WatchlistDetails
              watching={this.state.watching}
              onCloseTooltip={() => this.hideWatchlistDetails()}
              viewWatchlist={this.viewWatchlist.bind(this)}
              addToWatchlist={this.addToWatchlist.bind(this)}/> : null
          }
        </div>
      </div>
    );
  }

  onEnterSavingsButton() {
    if (this.savingsDetailsLeaveTimeout) {
      clearTimeout(this.savingsDetailsLeaveTimeout);
    }
    if (!this.props.priceHistory) {
      const asin = _.get(this.props, 'notification.inputData.asin');
      actions.loadPriceHistory(asin);
    }
    this.showSavingsDetails();
  }

  onLeaveSavingsButton() {
    this.savingsDetailsLeaveTimeout = setTimeout(() => {
      this.hideSavingsDetails();
    }, 500);
  }

  hideSavingsDetails() {
    this.setState({showSavingsDetails: false});
  }

  showSavingsDetails() {
    this.setState({
      showSavingsDetails: true,
      showWatchlistDetails: false
    });
  }

  onEnterWatchlistButton() {
    if (this.watchlistDetailsLeaveTimeout) {
      clearTimeout(this.watchlistDetailsLeaveTimeout);
    }
    this.showWatchlistDetails();
  }

  onLeaveWatchlistButton() {
    this.watchlistDetailsLeaveTimeout = setTimeout(() => {
      this.hideWatchlistDetails();
    }, 500);
  }

  hideWatchlistDetails() {
    this.setState({showWatchlistDetails: false});
  }

  showWatchlistDetails() {
    this.setState({
      showSavingsDetails: false,
      showWatchlistDetails: true
    });
  }

  onClickWishlistButton() {
    if (this.state.watching) {
      this.viewWatchlist('watchlistButton');
    } else {
      this.addToWatchlist('watchlistButton');
    }
  }

  viewProductPage(label, resultId) {
    const result = _.find(_.get(this.props, 'notification.run.results'), {heroOffer: true});
    const deal = _.get(this.props, 'notification.communityDeal.deal');
    const productPath = _.get(deal, 'url');
    sendMetric('trackClick', 'viewProductPage', '', {
      view: 'quoteCompleteNotification',
      domain: location.hostname.replace(/^www\./, ''),
      pagePath: location.pathname,
      savings: _.get(result, 'savings'),
      pageLocation: 'annotation',
      productId: _.get(deal, 'id'),
      productUrl: productPath,
      label: String(label)
    });
    const runId = _.get(this.props, 'notification.run.id') || _.get(deal, 'runId');
    if (productPath && runId) {
      window.open(`${WIKIBUY_URL}${productPath}${runId ? `?run=${runId}${resultId ? `&offerId=${resultId}` : ''}` : ''}`);
    }
  }

  viewWatchlist(label) {
    sendMetric('trackClick', 'viewWatchlist', '', {
      view: 'quoteCompleteNotification',
      domain: location.hostname.replace(/^www\./, ''),
      pagePath: location.pathname,
      pageLocation: 'annotation',
      label
    });
    window.open(`${WIKIBUY_URL}/watching/deals`);
  }

  async addToWatchlist(label) {
    const deal = _.get(this.props, 'notification.communityDeal.deal');
    sendMetric('trackClick', 'addToWatchlist', '', {
      view: 'quoteCompleteNotification',
      domain: location.hostname.replace(/^www\./, ''),
      pagePath: location.pathname,
      pageLocation: 'annotation',
      label
    });
    try {
      await actions.updateFavorite({id: deal.id});
    } catch(e) {}
    this.setState({watching: true});
  }

  async addToAmazonCart(result) {
    try {
      await actions.addToAmazonCart(result);
    } catch(e) {}
  }

  componentWillUnmount() {
    if (this.savingsDetailsLeaveTimeout) {
      clearTimeout(this.savingsDetailsLeaveTimeout);
    }
    if (this.watchlistDetailsLeaveTimeout) {
      clearTimeout(this.watchlistDetailsLeaveTimeout);
    }
  }

}

export default branch({
  notification: ['notification'],
  priceHistory: ['ProductPage', 'priceHistory']
}, ProductPageAnnotation);