import React, {Component} from 'react';
import './annotation-tooltip.less';

class AnnotationTooltip extends Component {

  render() {
    return (
      <div
        className={`annotation-tooltip-component ${this.props.className || ''}`}
        onClick={(e) => {
          e.stopPropagation();
        }}>
        <div className="annotation-tooltip-container">
          <div className="header">
            <div className="logo"></div>
            <div className="close icon-x" onClick={this.props.onCloseTooltip.bind(this, 'x')}></div>
          </div>
          {this.props.children}
        </div>
      </div>
    );
  }

}

export default AnnotationTooltip;