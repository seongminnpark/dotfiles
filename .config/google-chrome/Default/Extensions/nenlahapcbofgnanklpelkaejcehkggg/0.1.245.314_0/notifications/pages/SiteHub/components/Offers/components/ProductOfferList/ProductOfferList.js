import React, {Component} from 'react';
import _ from 'lodash';
import GridProduct from 'wb-geordi-grid-product';
import {WIKIBUY_URL} from 'constants';

const MAX_DEALS = 10;

class ProductOfferList extends Component {

  render() {
    const {deals, title, onClickDeal} = this.props;
    const dealElements = _(deals)
      .map((deal, i) => {
        if (i > MAX_DEALS) {
          return null;
        }
        let image = _.get(deal, 'product.image');
        if (image) {
          if (image.indexOf('amazon.com') !== -1) {
            image = `https://imageproxy.ivaws.com/${image}`;
          } else {
            image = image.replace('http:', 'https:');
          }
        }
        return (
          <GridProduct
            key={deal.asin}
            id={deal.id}
            ignoreHeart={true}
            rating={deal.productRatingPercent ? (deal.productRatingPercent / 100) * 5 : null}
            ratingCount={deal.productRatingCount || null}
            delete={false}
            image={image}
            title={_.get(deal, 'product.title')}
            url={`${WIKIBUY_URL}${_.get(deal, 'url')}`}
            receivedAt={deal.receivedAt}
            product={deal.product}
            total={deal.matchPricing.total}
            originTotal={deal.originPricing.total}
            savings={deal.savings}
            state={deal.state}
            favorited={deal.favorite}
            onClickProduct={onClickDeal.bind(this, deal)}
            noLink={true}/>
        );
      })
      .value();
    return (
      <div className="deals-site-hub">
        <h2>
          {
            title ||
            dealElements.length === 1 ?
            '1 deal found' :
            dealElements.length ?
            `${dealElements.length} deals found` :
            ''
          }
        </h2>
        {dealElements}
      </div>
    );
  }

}

export default ProductOfferList;