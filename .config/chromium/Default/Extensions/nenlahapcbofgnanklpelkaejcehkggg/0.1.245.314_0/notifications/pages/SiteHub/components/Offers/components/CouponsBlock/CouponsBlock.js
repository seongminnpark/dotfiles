import React, {Component} from 'react';
import _ from 'lodash';
import Collapse from 'react-collapse';
import CouponListItem from '../CouponListItem';

class CouponsBlock extends Component {

  state = {
    showCoupons: true
  }

  componentWillMount() {
    if (this.props.couponsType === 'eeyore') {
      this.setState({showCoupons: true});
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      showCoupons: (!_.get(nextProps, 'couponsThrottled') || this.props.couponsType === 'eeyore')
    });
  }

  render() {
    const {coupons, couponsThrottled, storeName, onTryCodes} = this.props;
    if (!coupons || !coupons.length || window.location.hostname === 'www.amazon.com' || window.location.hostname === 'www.aliexpress.com') {
      return null;
    }
    return (
      <div className="section">
        <h2>Found {coupons.length} {`${coupons.length === 1 ? 'code' : 'codes'} ${storeName ? `for ${storeName}.` : ''}`}</h2>
        {
          couponsThrottled && this.props.couponsType !== 'eeyore' ?
            <div className="button-wrapper">
              <button className="primary-btn-large full-button-coupons" onClick={onTryCodes.bind(this)}>try codes</button>
            </div> : null
        }
        <Collapse isOpened={this.state.showCoupons} className="collapse">
          <h4 className="bold">click a coupon code to copy.</h4>
          <div className="codes">
            {
              _.map(coupons, (coupon, i) => {
                if (coupon.restrictions) {
                  try {
                    coupon.restrictions = JSON.parse(coupon.restrictions).str;
                  } catch (e) {}
                }

                return (
                  <CouponListItem key={i} coupon={coupon}/>
                );
              })
            }
          </div>
        </Collapse>
        <h4 className="wb-show-hide-btn" onClick={() => this.setState({showCoupons: !this.state.showCoupons})}>{`${!this.state.showCoupons ? 'show codes' : 'hide codes'}`}</h4>
      </div>
    );
  }
}

export default CouponsBlock;