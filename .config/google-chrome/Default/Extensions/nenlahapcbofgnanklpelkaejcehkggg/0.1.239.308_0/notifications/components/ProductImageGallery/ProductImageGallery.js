import React from 'react';
import './product-image-gallery.less';
import ProductImage from '../ProductImage';
import sendMetric from 'utility/sendMetric';

class ProductImageGallery extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {
      imageIndex: 0
    };
  }

  shouldComponentUpdate(nextProps) {
    if (!nextProps.images && this.props.images) {
      return false;
    } else {
      return true;
    }
  }

  componentWillReceiveProps(nextProps) {
    if (_.get(nextProps, 'images[0]', null) !== _.get(this.props, 'images[0]', null)) {
      this.setState({imageIndex: 0});
    }
  }

  render() {
    const images = this.props.images || [];
    const gallery = this.renderImages(_.take(images, 6));
    return (
      <div className="product-image-gallery">
        {gallery}
      </div>
    );
  }

  renderImages(imageSet) {
    let activeImage = imageSet[this.state.imageIndex];
    if (activeImage) {
      activeImage = activeImage.replace('200x200', '700x700');
      const thumbnails = _.map(imageSet, (img, i) => {
        const className = 'thumbnail' + (i === this.state.imageIndex ? ' selected' : '');
        return (
          <div className={className} key={i} onClick={(e) => {e.stopPropagation(); this.onImageClicked(i, img);}}>
            <ProductImage cursor="pointer" image={img} />
          </div>
        );
      });

      return (
        <div className='gallery-wrapper'>
          <ProductImage image={activeImage} cursor="pointer" />
          <div className='thumbnails'>
            {thumbnails}
          </div>
        </div>
      );
    } else {
      return (
        <div className='gallery-wrapper' style={{height: '340px'}}>
          <ProductImage image={false} />
        </div>
      );
    }
  }

  onImageClicked(imageIndex, url) {
    this.setState({imageIndex})
    sendMetric('trackClick', 'viewImage', url, {
      view: 'productDetailModal',
      domain: location.hostname.replace(/^www\./, ''),
      pagePath: location.pathname,
      pageLocation: 'modal',
      matchDomain: this.props.details.vendor,
      matchUrl: this.props.details.product.url,
      quoteId: this.props.run.runId,
      matchId: this.props.details.id,
      order: imageIndex+1
    })
  }
}

export default ProductImageGallery;