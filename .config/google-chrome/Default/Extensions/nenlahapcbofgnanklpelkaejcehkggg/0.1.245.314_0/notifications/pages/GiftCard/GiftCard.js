import React, {Component} from 'react';
import {Motion, spring} from 'react-motion';
import {branch} from 'higher-order/baobab';
import sendMetric from 'utility/sendMetric';
import _ from 'lodash';
import {v4} from 'node-uuid';
import {throttleNotification} from 'actions/giftCardActions';
import visitGiftCard from 'messenger/outbound/visitGiftCard';
import './giftcard.less';

class GiftCard extends Component {

  constructor(...args) {
    super(...args);
    this.state = {
      hideNotification: true
    };
  }

  componentDidMount() {
    sendMetric('page', 'giftCardNotification', {
      view: 'giftCardNotification',
      type: 'notification',
      domain: location.hostname.replace(/^www\./, ''),
      pagePath: location.pathname,
      offerSignUp: _.get(this.props.view, 'offerSignUp'),
      qualified: _.get(this.props.view, 'qualified', false),
      balance: _.get(this.props.view, 'balance', 0)
    });
    setTimeout(() => {
      this.setState({hideNotification: false});
    }, 1000);
  }

  render() {
    const {hideNotification} = this.state;
    let {url, percent} = _.get(this.props, 'view.giftcard', {});
    percent = `${(percent * 100).toFixed(1)}%`;
    const showOnTop = true;
    const showOnRight = true;
    return (
      <div
        className={hideNotification ? 'disabled giftcard-page' : 'giftcard-page'}
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
              className="giftcard-notification"
              style={{
                transform: `translate3d(0,${y}%,0)`,
                opacity: `${opacity}`
              }}>
              <header>
                <div className="w-icon-logo">{this.renderWIcon()}</div>
                <div className="close icon-x" onClick={this.onClosePopup.bind(this, 'x')}></div>
              </header>
              {
                <section>
                  <h2>Save an additional {percent} with a gift card.</h2>
                  <div className="button-wrapper">
                    <button className="primary-btn-large" onClick={this.onClickDeal.bind(this, url)}>
                      OK
                    </button>
                  </div>
                </section>
              }
            </div>
          }
        </Motion>
      </div>
    );
  }

  async onClickDeal(url) {
    const clickId = v4();
    sendMetric('trackClick', 'viewGiftCardNotification', 'view giftcard', {
      domain: location.hostname.replace(/^www\./, ''),
      pagePath: location.pathname,
      clickId
    });
    const redirect = `http://click.linksynergy.com/fs-bin/click?id=3*BIL10dmOI&subid=&offerid=368971.1&type=10&tmpid=12342&u1=${clickId}&afsrc=1&RD_PARM1=${url}`;
    visitGiftCard({redirect});
    throttleNotification();
    this.onClosePopup('auto');
  }

  onClosePopup(label) {
    this.setState({hideNotification: true});
    throttleNotification();
    sendMetric('trackClick', 'dismissGiftCardNotification', label, {
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
  view: ['giftCardView'],
  events: ['events'],
  session: ['session']
}, GiftCard);
