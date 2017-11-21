import React from 'react';
import moment from 'moment';
import './progress-bar.less';

class ProgressBar extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      progress: 0
    };
  }

  componentWillMount() {
    this.startTime = moment();
    this.intervalId = setInterval(() => {
      if (this.state.progress < 95) {
        this.setState({progress: this.state.progress + 1});
      } else {
        clearInterval(this.intervalId);
      }
    }, Math.round(this.props.estimatedDuration / 100));
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.complete && nextProps && nextProps.complete) {
      clearInterval(this.intervalId);
      this.setState({progress: 100});
    }
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