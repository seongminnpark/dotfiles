import React from 'react';
import _ from 'lodash';
import './email-predictions.less';
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

class EmailPredictions extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {
      active: -1
    };
    this.domains = [
      'gmail.com',
      'yahoo.com',
      'hotmail.com',
      'aol.com',
      'comcast.net',
      'live.com',
      'outlook.com',
      'msn.com',
      'sbcglobal.net',
      'att.net',
      'ymail.com',
      'verizon.net',
      'me.com',
      'icloud.com',
      'cox.net',
      'bellsouth.net',
      'charter.net',
      'rocketmail.com',
      'aim.com',
      'mac.com',
      'yahoo.co.in',
      'juno.com',
      'roadrunner.com',
      'optonline.net',
      'mail.com',
      'frontier.com',
      'earthlink.net',
      'windstream.net',
      'utexas.edu',
      'umich.edu'
    ]
  }


  componentWillReceiveProps(nextProps) {
    if (nextProps.value) {
      const valid = emailRegex.test(nextProps.value);
      if (!valid) {
        this.newValue(nextProps.value)
      } else {
        this.setState({active: -1})
        this.setState({predictions: []})
      }
    } else {
      this.setState({active: -1})
      this.setState({predictions: []})
    }
  }

  componentDidMount() {
    this.bindedKeyDown = this.onKeyDown.bind(this);
    document.addEventListener('keydown', this.bindedKeyDown);  
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.bindedKeyDown);
  }

  onKeyDown(e) {
    if (e.which === 38 && this.state.active > 0) { // up arrow
      e.preventDefault();
      this.setState({active: this.state.active - 1})
      this.scrollToActive(-1);
    } else if (e.which === 40 && this.state.active < this.state.predictions.length-1) { // down arrow
      e.preventDefault();
      this.setState({active: this.state.active + 1})
      this.scrollToActive(1);
    } else if (e.which === 13 && this.state.active > -1) {
      e.stopPropagation();
      e.preventDefault();
      const data = this.state.predictions[this.state.active];
      this.onClickPrediction(data, e);
    } else if (e.which === 38 || e.which === 40) {
      e.preventDefault();
    }
  }

  scrollToActive(direction) {
    const pos = this.refs.activeItem.offsetTop;
    this.refs.scrollList.scrollTop = pos;
  }

  render() {
    return (
      this.state.predictions ?
      <div ref={'scrollList'} className="predictions-wrapper">
        {
          _.map(this.state.predictions, (prediction, i) => {
            const active = this.state.active === i;
            return (
              <div
                onClick={this.onClickPrediction.bind(this, prediction)}
                ref={active ? 'activeItem' : null}
                onMouseOver={this.setActive.bind(this, i)} 
                key={'prediction-'+i} 
                className={`${active ? 'active' : ''}  prediction`}>
                <div className="predictions-content">
                  <h3 className="bold">{prediction}</h3>
                </div>
              </div>
            )
          })
        }
      </div> : null
    )
  }

  onClickPrediction(prediction) {
    this.props.onClickPrediction(prediction);
    this.setState({predictions: []});
  }

  setActive(index) {
    this.setState({active: index});
  }

  newValue(value) {
    const exactMatches = [];
    const errorMatches = [];
    const domains = this.domains;
    
    // get substring to try appending with autocomplete email
    const emailsDirty = value.split('@');
    if (emailsDirty.length < 2 || emailsDirty[0] == '') {
      return;
    }
    const emailDomain = emailsDirty[1]; // get the text after @

    if (emailDomain.length === 0) {
      exactMatches.push(emailsDirty[0]+'@'+domains[0], emailsDirty[0]+'@'+domains[1], emailsDirty[0]+'@'+domains[2], emailsDirty[0]+'@'+domains[3], emailsDirty[0]+'@'+domains[4]);
    } else {
      let i;
      for (i = 0; i < domains.length; i++) {
        const testString = domains[i].substr(0, emailDomain.length);
        if (emailDomain === testString) {
          exactMatches.push(emailsDirty[0]+'@'+domains[i]);
        } else  if (getEditDistance(emailDomain,testString) < 2 && emailDomain.length > 1) {
          errorMatches.push(emailsDirty[0]+'@'+domains[i]);
        }
      }
    }

    this.setState({predictions: exactMatches})
  }


}



// Compute the edit distance between the two given strings
function getEditDistance(a, b) {
  if(a.length === 0) return b.length; 
  if(b.length === 0) return a.length; 
 
  const matrix = [];
 
  // increment along the first column of each row
  let i;
  for(i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
 
  // increment each column in the first row
  let j;
  for(j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
 
  // Fill in the rest of the matrix
  for(i = 1; i <= b.length; i++) {
    for(j = 1; j <= a.length; j++) {
      if(b.charAt(i-1) == a.charAt(j-1)) {
        matrix[i][j] = matrix[i-1][j-1];
      } else {
        matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                      Math.min(matrix[i][j-1] + 1, // insertion
                      matrix[i-1][j] + 1)); // deletion
      }
    }
  }
 
  return matrix[b.length][a.length];
};



export default EmailPredictions;
