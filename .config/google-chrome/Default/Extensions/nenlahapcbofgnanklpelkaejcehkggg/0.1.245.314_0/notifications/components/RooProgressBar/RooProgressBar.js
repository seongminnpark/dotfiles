import React from 'react';
import './roo-progress-bar.less';

class ProgressBar extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      progress: 0,
      end: 0
    };
  }

  componentWillMount() {
    this.setState({progress: Math.round((this.props.currentCodeIndex === -1 ? 0 : this.props.currentCodeIndex / this.props.coupons.length) * 100)});
    this.setState({end: Math.round(((this.props.currentCodeIndex === -1 ? 1 : this.props.currentCodeIndex + 1) / this.props.coupons.length) * 100)});
    this.initInterval();
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.complete && nextProps && nextProps.complete) {
      clearInterval(this.intervalId);
      this.setState({progress: 100});
    } else if (!this.props.complete && nextProps && nextProps.currentCodeIndex) {
      clearInterval(this.intervalId);
      this.setState({progress: Math.round((nextProps.currentCodeIndex / this.props.coupons.length) * 100)});
      this.setState({end: Math.round(((nextProps.currentCodeIndex + 1) / this.props.coupons.length) * 100)});
      this.initInterval();
    }
  }

  initInterval() {
    this.intervalId = setInterval(() => {
      if (this.state.progress < this.state.end) {
        this.setState({progress: this.state.progress + 1});
      } else {
        clearInterval(this.intervalId);
      }
    }, Math.round((this.props.runTimePerCoupon * this.props.coupons.length) / 100));
  }

  render() {
    return (
      <div className={this.props.rounded ? 'rounded progress-bar' : 'progress-bar'}>
        <div className="progress" style={{width: `${this.state.progress}%`}}></div>
      </div>
    );
  }

}

ProgressBar.defaultProps = {
  estimatedDuration: 3000
};

export default ProgressBar;