import React, {Component} from 'react';
import pacomo from 'higher-order/pacomo';
import './link.less';

class Link extends Component {

  render() {
    const {type, className, children, props} = this.props;
    return (
      <span className={`${type} ${className}`} {...props}>{children}</span>
    );
  }

}

export default pacomo(Link);