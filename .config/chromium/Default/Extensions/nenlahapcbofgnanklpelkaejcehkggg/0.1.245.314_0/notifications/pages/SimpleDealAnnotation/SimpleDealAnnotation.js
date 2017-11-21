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
import './savings-annotation.less';

class SimpleDealAnnotation extends Component {

  constructor(...args) {
    super(...args);
    this.state = {};
  }

  componentWillUnmount() {
    clearTimeout(this.hideTimeout);
  }

  render() {
    const hideNotification = false;
    const deal = this.props.deal;
    const savings = _.get(deal, 'savings') || 0;
    const complete = true;
    const currentSavings = currency(savings, savings > 100);
    const hasSavings = savings > 0;
    const tabClass = hasSavings ? 'has-savings tab' : 'no-savings tab';

    // Ignore tooltip for now
    return (
      <div
        className={hideNotification ? 'disabled wb-simple-annotation' : 'wb-simple-annotation'}>
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
                  onClick={this.onVisitMerchant.bind(this, this.state.bestResult)}
                  onMouseEnter={this.onMouseEnter.bind(this)}
                  style={{
                    opacity: `${opacity}`,
                    maxWidth: '0px',
                    height: '0px',
                    display: 'none'
                  }}>
                  <div className="w-icon-logo">{this.renderWIcon()}</div>
                  <div className="current-offer" style={{opacity: textOpacity}}>
                    <div className="offer-text">
                      {
                        (!hasSavings) ?
                        <h2>best price</h2> :
                        currentSavings ?
                        <h2>save {currentSavings}</h2> :
                        !complete ?
                        <h2>searching</h2> :
                        <h2>best price</h2>
                      }
                    </div>
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

  onDismissTooltip(affiliate) {
    actions.setSeenNotificationTooltip(affiliate);
  }

  onToggleFavorite(active, e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      if (e.nativeEvent) {
        e.nativeEvent.stopImmediatePropagation();
      }
    }
    const id = _.get(this.props, 'deal.id');
    const favorite = !this.state.favorite;
    actions.updateFavorite({id, favorite});
    this.setState({favorite});
  }

  onMouseEnter() {
    if (this.state.hasEntered) {
      return;
    }
    this.onDismissTooltip();
    this.setState({hasEntered: true});
    if (!hasFeature('ext_2column_pdm')) {
      if (!this.props.deal) {
        return;
      }
      const deal = this.props.deal;
      sendMetric('trackClick', 'simpleAnnotationHover', '', {
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
      sendMetric('trackClick', 'simpleAnnotationHover', '', {
        view: 'quoteAnnotation',
        domain: location.hostname.replace(/^www\./, ''),
        pagePath: location.pathname,
        savings: _.get(run, 'savings'),
        matchUrl: _.get(run, 'betterResults[0].product.url'),
        matchDomain: _.get(run, 'betterResults[0].product.vendor'),
        pageLocation: 'annotation',
        quoteId: _.get(run, 'runId'),
        matchId: _.get(run, 'betterResults[0].id')
      });
    }
  }

  onVisitMerchant(result, e) {
    this.onShowModal(true, 'continue', e);
  }

  onShowModal(hasSavings, type, e) {
    const deal = this.props.deal;
    sendMetric('trackClick', 'viewProductPage', '', {
      view: 'quoteCompleteNotification',
      domain: location.hostname.replace(/^www\./, ''),
      pagePath: location.pathname,
      savings: _.get(deal, 'savings'),
      pageLocation: 'simpleAnnotation',
      type,
      productId: _.get(deal, 'id'),
      productUrl: _.get(deal, 'url')
    });
    let url = `${WIKIBUY_URL}${deal.url}?run=${_.get(deal, 'runId')}`;
    if (deal.source) {
      url += `&utm_source=${deal.source}`;
    }
    window.open(url);
  }
}

export default branch({
}, SimpleDealAnnotation);
