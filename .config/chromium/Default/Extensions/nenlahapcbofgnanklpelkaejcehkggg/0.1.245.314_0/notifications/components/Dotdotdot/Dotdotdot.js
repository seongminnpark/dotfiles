import React, {Component} from 'react';
import Dotdotdot from 'react-dotdotdot';

class Ellipsis extends Component {

  render() {
    const {children, ...props} = this.props;
    return (
      navigator.userAgent.indexOf('Firefox') > -1 ?
      children :
      <Dotdotdot {...props}>
        {children}
      </Dotdotdot>
    );
  }

}

export default Ellipsis;