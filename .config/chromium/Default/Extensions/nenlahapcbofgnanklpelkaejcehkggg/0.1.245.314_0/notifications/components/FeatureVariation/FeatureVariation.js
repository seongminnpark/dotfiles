import React, {Component} from 'react';
import hasFeature from 'utility/hasFeature';
import _ from 'lodash';

class FeatureVariation extends Component {

  render() {
    const {className, ...features} = this.props;
    const currentVariation = _.find(_.keys(features), (variation) => hasFeature(_.snakeCase(variation)));
    return (
      <span className={className}>
        {
          currentVariation ?
          this.props[currentVariation] :
          this.props.control
        }
      </span>
    );
  }

}

FeatureVariation.defaultProps = {
  control: null
};

export default FeatureVariation;