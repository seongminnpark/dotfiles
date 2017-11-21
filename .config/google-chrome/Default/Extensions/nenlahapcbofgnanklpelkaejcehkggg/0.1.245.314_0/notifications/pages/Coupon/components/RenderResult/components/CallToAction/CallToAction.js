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
    const {running, result, couponCount, pageReload, savings, renderPostResultCtaInUi, loading, roo} = this.props;
    const showSubscribe = hasFeature('coupon_email_subscription') && isFullAccount() && !roo;

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

}


export default CallToAction;