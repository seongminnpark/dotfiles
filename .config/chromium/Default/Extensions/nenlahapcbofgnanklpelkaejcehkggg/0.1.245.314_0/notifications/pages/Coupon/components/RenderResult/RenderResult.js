import React, {Component} from 'react';
import _ from 'lodash';
import sendMetric from 'utility/sendMetric';
import NoSavingsAvailable from './components/NoSavingsAvailable';
import ReviewWikibuy from './components/ReviewWikibuy';
import InviteFriends from './components/InviteFriends';
import InviteTest from './components/InviteFriends/InviteTest';
import CallToAction from './components/CallToAction';
import SavingsAvailable from './components/SavingsAvailable';
import CouponListForRunning from './components/CouponList/CouponListForRunning';
import currency from 'utility/currency';
import ProgressBar from 'components/ProgressBar';
import RooProgressBar from 'components/RooProgressBar';
import hasFeature from 'utility/hasFeature';
import {viewAllCodes} from 'actions/couponActions';

class RenderResult extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      viewCodes: false
    };
  }

  render() {
    const {coupons, result, couponCount, pageWasReloaded, estimatedRunTime, currentCouponCode, runTimePerCoupon, roo} = this.props.view;
    const {running, barComplete, reward, postCoupons} = this.props;
    const pageReload = _.get(result, 'pageReload');
    const originalTotal = _.get(result, 'originalTotal');
    const workingCoupons = _.filter(_.get(result, 'coupons'), c => c.savings > 0);
    const savings = result && result.savings && result.savings > 0 ? currency(result.savings) : 0;
    const bestCode = _.get(result, 'bestCoupon.code');
    const runTimeSeconds = (_.get(result, 'runTime', 0) / 1000).toFixed(2);
    let resultCoupons = _(coupons)
      .take(couponCount)
      .map((coupon, i) => {
        coupon.success = true;
        return coupon;
      })
      .value();

    let currentCodeIndex;
    if (roo && !result) {
      currentCodeIndex = _.findIndex(resultCoupons, coupon => coupon.code === currentCouponCode);
      resultCoupons = _.map(resultCoupons, (coupon, i) => {
        if (i < currentCodeIndex) {
          coupon.success = true;
        } else {
          coupon.success = false;
        }
        return coupon;
      });
    }

    const runAnimation = this.props.getRunAnimation();
    const showProgressBar = running || pageReload || barComplete;
    const noSavingsAvailable = result && (!bestCode || !savings) && !running;
    const renderPostResultCtaInUi = !barComplete && !running && result; // && savings;
    const inviteFriends = hasFeature('notif_invite_friends') || hasFeature('notif_invite_friends_link');
    const newInviteFriends = hasFeature('referral_get5') || hasFeature('referral_get5_go') || hasFeature('referral_get5_links');
    const requiresInput = result && result.requiresInput;
    const hideRight = this.props.hideRight;
    return (
      <div className={`render-result-layout invite-test-layout`}>
        <div className="left">
          <div className={`result-column ${_.get(this.props.googleData, 'contacts.length') ? 'has-contacts' : ''}`}>
            {
              showProgressBar ?
              <div className="try-codes-wrapper">
                <div>
                  <h2>Trying Coupon Codes</h2>
                  <h5 className="silver">Wikibuy automatically tries the best coupon codes to save you money.</h5>
                  <div className="progress-bar">
                    {
                      roo ?
                      <RooProgressBar
                        estimatedDuration={estimatedRunTime}
                        complete={barComplete}
                        currentCodeIndex={currentCodeIndex}
                        coupons={coupons}
                        runTimePerCoupon={runTimePerCoupon}/> :
                      <ProgressBar estimatedDuration={estimatedRunTime} complete={barComplete}/>
                    }
                  </div>
                  {
                    currentCodeIndex > -1 ?
                    <h5 style={{textAlign: 'center', marginTop: 15}} className="bold">Trying {currentCodeIndex + 1} of {couponCount} Codes</h5> : <h5 style={{height: '20px'}}></h5>
                  }
                </div>
              </div> :
              (!running && !result) || running || pageReload || barComplete ?
              <div>
                <div>
                  <h2>
                    <span>Found {couponCount} {couponCount === 1 ? 'code' : 'codes'}</span>
                    {
                      reward && reward.amount && (!postCoupons || hasFeature('cp_credits_with_coupon_saver') || hasFeature('cp_credits_with_coupon_no_saver')) ?
                      <span> and <br/>get <span className="palmetto">{reward.type === 'percentage' ? `${reward.amount/100}% back` : `$${reward.amount/100} in credit`}</span></span> : null
                    }
                  </h2>
                  <h4 className="bold">Wikibuy tests codes in seconds.</h4>
                </div>
              </div> :
              noSavingsAvailable ?
              <NoSavingsAvailable {...{runTimeSeconds, couponCount, roo, reward, postCoupons, requiresInput}} codes={_.get(result, 'coupons')} onClosePopup={this.props.onClosePopup.bind(this)}/> :
              <SavingsAvailable {...{runTimeSeconds, couponCount, savings, reward, postCoupons, originalTotal, workingCoupons, requiresInput}} onClosePopup={this.props.onClosePopup.bind(this)}/>
            }

            <CallToAction
              domain={this.props.domain}
              onTryCodes={this.props.onTryCodes.bind(this)}
              onClosePopup={this.props.onClosePopup.bind(this)}
              onToggleSubscribe={this.props.onToggleSubscribe.bind(this)}
              renderViewCodes={this.renderViewCodes.bind(this)}
              renderPostResultCtaInUi={renderPostResultCtaInUi}
              loading={this.props.ctaLoading}
              settings={this.props.settings}
              roo={roo}
              {...{running, result, couponCount, pageReload, savings}}/>

          </div>
        </div>
        {
          !hideRight ?
          <div className="right">
            {
              showProgressBar ?
              <div className="run-codes">
                <CouponListForRunning
                  runTimePerCoupon={runTimePerCoupon}
                  currentCodeIndex={currentCodeIndex}
                  estimatedRunTime={estimatedRunTime}
                  disableChecks={true}
                  show={running || result}
                  result={result}
                  running={running}
                  coupons={resultCoupons}
                  stagger={pageWasReloaded ? 0 : runAnimation.stagger}
                  collapsable={true}/>
                </div> : null
            }
            {
              renderPostResultCtaInUi && !inviteFriends ?
              <ReviewWikibuy
                onClosePopup={this.props.onClosePopup.bind(this)}
                savings={_.get(this.props, 'view.savings', 0)}/> :
              renderPostResultCtaInUi ?
              <InviteTest
                googleContacts={this.props.googleData}
                firstname={_.get(this.props, 'settings.firstname', null)}
                lastname={_.get(this.props, 'settings.lastname', null)}
                shortCode={this.props.shortCode}
                onClosePopup={this.props.onClosePopup.bind(this)} /> : null
            }
          </div> : null
        }

      </div>
    );
  }

  onTryCodes(skippedSignup) {
    this.setState({viewCodes: false});
    this.props.onTryCodes(skippedSignup);
  }

  renderViewCodes() {
    const {coupons, result, couponCount} = this.props.view;
    const resultCoupons = result ? coupons.slice(couponCount, coupons.length) : coupons;
    return (
      resultCoupons && resultCoupons.length > 0 ?
      <div>
        <h4 className="bold" style={{marginBottom: '8px', marginTop: '8px', textAlign: 'center'}}><span className="tertiary-link" onClick={this.onClickViewCode.bind(this)}>{!this.state.viewCodes ? 'view codes' : 'hide codes'}</span></h4>
        <CouponList
          running={running}
          show={!!this.state.viewCodes}
          coupons={resultCoupons}
          collapsable={true}
          result={result}
          disableChecks={true}/>
      </div> : null
    );
  }

  onClickViewCode() {
    sendMetric('trackClick', 'toggleCodes', !this.state.viewCodes ? 'view codes' : 'hide codes', {
      domain: this.props.domain,
      pagePath: location.pathname
    });
    if (!this.state.viewCodes) {
      viewAllCodes();
    }
    this.setState({viewCodes: !this.state.viewCodes});
  }
}


export default RenderResult;


