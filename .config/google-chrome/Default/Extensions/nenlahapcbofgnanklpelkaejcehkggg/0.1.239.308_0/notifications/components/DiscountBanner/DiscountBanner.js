import React, {Component} from 'react';
import currency from 'utility/currency';
import './discount-banner.less';

class DiscountBanner extends Component {

  render() {
    const totalRestriction = _.get(_.find(this.props.restrictions, {type: 'total'}), 'amount', 1500);
    return (
      <div className="discount-banner-component">
        <svg id="Layer_1" x="0px" y="0px" viewBox="0 0 16 16">
          <g>
            <path style={{fill: '#01c049'}} d="M14.2,11.5l-3.3-6C10.7,5.2,10.4,5,10,5H6C5.6,5,5.3,5.2,5.1,5.5l-3.3,6c-0.5,0.9-0.5,2.1,0,3
              C2.4,15.4,3.3,16,4.4,16h7.2c1.1,0,2-0.6,2.6-1.5C14.7,13.6,14.7,12.5,14.2,11.5z"/>
            <path style={{fill: '#01c049'}} d="M5.3,2.7C5.5,2.9,5.7,3,6,3h4c0.3,0,0.5-0.1,0.7-0.3l1-1C12.2,1.1,12,0,11,0H5C4,0,3.7,1.1,4.3,1.7L5.3,2.7z"
              />
          </g>
        </svg>
        <h4>{currency(this.props.additionalDiscount, true)} off your first order of {currency(totalRestriction, true)} or more</h4>
      </div>
    );
  }

}

export default DiscountBanner;