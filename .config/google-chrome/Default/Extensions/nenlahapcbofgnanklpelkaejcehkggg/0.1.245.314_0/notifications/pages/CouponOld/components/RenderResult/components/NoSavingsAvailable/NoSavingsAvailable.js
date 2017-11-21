import React, {Component} from 'react';
import hasFeature from 'utility/hasFeature';
import {activateThroughPinnedTab} from 'actions/cashbackActions';

class NoSavingsAvailable extends Component {

  componentDidMount() {
    const {reward} = this.props;
    if (reward && reward.amount && (hasFeature('cp_credits_after_coupon_saver') || hasFeature('cp_credits_after_coupon_no_saver'))) {
      activateThroughPinnedTab();
    }
  }

  render() {
    const {runTimeSeconds, couponCount, roo, renderActivateCashbackCTA, reward, postCoupons} = this.props;
    return (
      <div>
        <div>
          <h2>
            {
              reward && reward.amount && (!postCoupons || !hasFeature('cp_credits_control')) ?
              <span><span className="palmetto">{reward.type === 'percentage' ? `${reward.amount/100}% back activated` : `$${reward.amount/100} credit activated`}</span></span> :
              <span>no savings available.</span>
            }
          </h2>
          <h4 className="bold">{couponCount} {couponCount === 1 ? ' code ' : ' best codes '} tested in {runTimeSeconds} sec.</h4>
        </div>
        {
          roo && !renderActivateCashbackCTA ?
          <div className="dismiss-no-savings-container">
            <button className="primary-btn-large" onClick={this.props.onClosePopup.bind(this)}>continue to checkout</button>
          </div> : null
        }
      </div>
    );
  }
}


export default NoSavingsAvailable;