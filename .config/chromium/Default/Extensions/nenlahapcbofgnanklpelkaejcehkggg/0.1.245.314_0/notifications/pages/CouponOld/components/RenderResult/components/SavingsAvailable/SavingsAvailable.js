import React, {Component} from 'react';
import hasFeature from 'utility/hasFeature';

class SavingsAvailable extends Component {
  render() {
    const {runTimeSeconds, couponCount, savings, reward, postCoupons} = this.props;
    return (
      <div>
        <h2 className={`coupon-count ${reward && reward.amount ? '' : 'no-reward'}`}>
          <span><span className="palmetto">{savings}</span> saved</span>
          {
            reward && reward.amount && (!postCoupons || hasFeature('cp_credits_with_coupon_saver') || hasFeature('cp_credits_with_coupon_no_saver')) ?
            <span> and <span className="palmetto">{reward.type === 'percentage' ? `${reward.amount/100}% back activated.` : `$${reward.amount/100} credit activated.`}</span></span> : <span>.</span>
          }
        </h2>
        <h4 className="bold coupon-count">{couponCount} {couponCount === 1 ? ' code ' : ' best codes '} tested in {runTimeSeconds} sec.</h4>
      </div>
    );
  }
}


export default SavingsAvailable;