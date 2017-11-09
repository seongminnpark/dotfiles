import React, {Component} from 'react';
import _ from 'lodash';
import sendMetric from 'utility/sendMetric';
import NoSavingsAvailable from './components/NoSavingsAvailable';
import ReviewWikibuy from './components/ReviewWikibuy';
import InviteFriends from './components/InviteFriends';
import InviteTest from './components/InviteFriends/InviteTest';
import CallToAction from './components/CallToAction';
import SavingsAvailable from './components/SavingsAvailable';
import CouponList from './components/CouponList';
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
    const renderPostResultCtaInUi = !barComplete && !running && savings;
    const inviteFriends = hasFeature('notif_invite_friends') || hasFeature('notif_invite_friends_link');
    const newInviteFriends = hasFeature('referral_get5') || hasFeature('referral_get5_go') || hasFeature('referral_get5_links')

    return (
      <div className={renderPostResultCtaInUi && newInviteFriends ? 'invite-test-layout' : ''}>
        {
          showProgressBar ?
            roo ?
            <RooProgressBar
              estimatedDuration={estimatedRunTime}
              complete={barComplete}
              currentCodeIndex={currentCodeIndex}
              coupons={coupons}
              runTimePerCoupon={runTimePerCoupon}/> :
            <ProgressBar estimatedDuration={estimatedRunTime} complete={barComplete}/> : null
        }

        <div className={`result-column ${_.get(this.props.googleData, 'contacts.length') ? 'has-contacts' : ''}`}>
          {
            (!running && !result) || running || pageReload || (result && result.requiresInput) || barComplete ?
            <div>
              {
                <div>
                  <h2>
                    <span>found {couponCount} {couponCount === 1 ? 'code' : 'codes'}</span>
                    {
                      reward && reward.amount && (!postCoupons || hasFeature('cp_credits_with_coupon_saver') || hasFeature('cp_credits_with_coupon_no_saver')) ?
                      <span> and <br/>get <span className="palmetto">{reward.type === 'percentage' ? `${reward.amount/100}% back` : `$${reward.amount/100} in credit`}</span></span> : null
                    }
                  </h2>
                  <h4 className="bold">wikibuy tests codes in seconds.</h4>
                </div>
              }
            </div> :
            noSavingsAvailable ?
            <NoSavingsAvailable {...{runTimeSeconds, couponCount, roo, reward, postCoupons}} onClosePopup={this.props.onClosePopup.bind(this)}/> :
            <SavingsAvailable {...{runTimeSeconds, couponCount, savings, reward, postCoupons}}/>
          }

          {
            renderPostResultCtaInUi && !inviteFriends && !newInviteFriends ?
            <ReviewWikibuy
              onClosePopup={this.props.onClosePopup.bind(this)}
              savings={_.get(this.props, 'view.savings', 0)}/> :
            (newInviteFriends) && renderPostResultCtaInUi ?
            <InviteTest
              googleContacts={this.props.googleData}
              firstname={_.get(this.props, 'settings.firstname', null)}
              lastname={_.get(this.props, 'settings.lastname', null)}
              shortCode={this.props.shortCode}
              onClosePopup={this.props.onClosePopup.bind(this)} /> :
            inviteFriends && renderPostResultCtaInUi ?
            <InviteFriends
              googleContacts={this.props.googleData}
              firstname={_.get(this.props, 'settings.firstname', null)}
              lastname={_.get(this.props, 'settings.lastname', null)}
              shortCode={this.props.shortCode}
              onClosePopup={this.props.onClosePopup.bind(this)}/> : null
          }
        </div>

        <div className="run-codes">
          <CouponList
            show={running || result}
            result={result}
            running={running}
            coupons={resultCoupons}
            stagger={pageWasReloaded ? 0 : runAnimation.stagger}
            collapsable={true}/>
        </div>
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
          running={this.props.running}
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


