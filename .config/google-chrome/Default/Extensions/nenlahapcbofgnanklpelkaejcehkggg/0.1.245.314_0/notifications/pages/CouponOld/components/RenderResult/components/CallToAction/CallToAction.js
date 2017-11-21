import React, {Component} from 'react';
import _ from 'lodash';
// import NewLoader from 'components/NewLoader';
import './call-to-action.less';
import hasFeature from 'utility/hasFeature';
import sendMetric from 'utility/sendMetric';
import currentDomain from 'utility/currentDomain';
import isFullAccount from 'utility/isFullAccount';

let logged = false;

class CallToAction extends Component {
  render() {
    let {domain, running, result, couponCount, pageReload, savings, renderPostResultCtaInUi, settings, loading, roo} = this.props;
    const showSubscribe = hasFeature('coupon_email_subscription') && isFullAccount() && !roo;
    // loading = true;
            // <NewLoader light={false} right="true" size={20}/>

    return (
      <div className={`button-wrapper coupons-cta ${showSubscribe ? 'subscribe' : ''}`}>
        {
          loading ?
          <div className="loader-container">
            <span><h3>Loading...</h3></span>
          </div> :
          !running && !result ?
          <button className="primary-btn-large" disabled={running} onClick={this.props.onTryCodes.bind(this, false)}>
            try {couponCount === 1 ? 'code' : 'codes'}
          </button> :
          result && result.requiresInput ?
          <button className="primary-btn-large" disabled={true}><span className="icon icon-circle-check"></span> code entered</button> :
          running || pageReload || (!renderPostResultCtaInUi && savings) ?
          <button className="secondary-btn-large" disabled={true}>
            trying {couponCount === 1 ? 'code' : 'codes'}
          </button> :
            showSubscribe ? this.bigSubBtnTest(this.props) :
            !savings ?
          <button className="tertiary-btn-large round icon-x icon" onClick={this.props.onClosePopup.bind(this, 'close')}></button> : null
        }
        {
          !running && result && !savings ?
          this.props.renderViewCodes() : null
        }

      </div>
    );
  }

  bigSubBtnTest(props) {
    !logged && sendMetric('track', 'showCouponSubscribe', {
      domain: currentDomain(),
      pagePath: location.pathname
    });
    logged = true;
    return (
      _.includes(props.settings.emailPreferences.coupons.domainSubscriptions, props.domain) ?
        <h4 className="bold">You are subscribed to receive emails when new working codes become available on this site.<a href="#" onClick={this.props.onToggleSubscribe.bind(this)}> Unsubscribe </a></h4>
      :
      <div>
        <h4 className="bold not-subscribed-description">Subscribe to receive emails when new working codes become available on this site.</h4>
        <button className="primary-btn-large" disabled={false} onClick={this.props.onToggleSubscribe.bind(this)}>Subscribe</button>
      </div>
    );
  }

  checkboxTest(props) {
    return (
      _.includes(props.settings.emailPreferences.coupons.domainSubscriptions, props.domain) ?
        <h4 className="bold">You are subscribed to receive emails when new working codes become available on this site.<a href="#" onClick={this.props.onToggleSubscribe.bind(this)}> Unsubscribe </a></h4>
      :
      <div>
        <h4 className="bold not-subscribed-description">Subscribe to receive emails when new working codes become available.</h4>
        <button className="wb-Checkbox-primary" disabled={false} onClick={this.props.onToggleSubscribe.bind(this)}></button>
      </div>
    );
  }

}


export default CallToAction;