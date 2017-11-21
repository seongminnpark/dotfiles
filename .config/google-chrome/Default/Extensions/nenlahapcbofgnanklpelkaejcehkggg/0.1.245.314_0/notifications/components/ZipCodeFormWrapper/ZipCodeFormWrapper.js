import React from 'react';
import getZipcode from 'messenger/outbound/getZipcode';
import './zip-code-form-wrapper.less';
import calculateSize from 'calculate-size'
const zipCodeEscapedPattern = '^[0-9]{5}(?:-[0-9]{4})?$';

class ZipCodeFormWrapper extends React.Component {
  constructor(...args) {
    super(...args);
    this.lastZip = null;
    this.state = {
      location: null,
      zipcode: null,
      zipcodeError: false,
      focus: true
    }
  }

  success(location) {
    if (location && location.city && location.state) {
      this.setState({
        zipcode: this.lastZip,
        location: {city: location.city, stateShort: location.stateShort, state: location.state},
        zipcodeError: false
      });
      this.props.onValidZipCode(this.lastZip);
    } else {
      this.removeLocationinfo(true);
    }
  }

// <h6 className="label">zip code</h6>

  render() {
    const city = this.state.zipcodeError ? `— invalid zip code` : this.state.location ? `—${this.state.location.city}, ${this.state.location.stateShort || this.state.location.state}` : '';
    let {width} = calculateSize(city, {
      font: 'Helvetica',
      fontSize: '25px',
      fontWeight: 'bold'
    });

    return (
     <div className={`designed-form input-wrapper ${city ? 'animate-indent' : ''} ${this.state.zipcodeError ? 'error' : ''}`}>
        <input
          tabIndex={this.props.tabIndex}
          onBlur={this.toggleLocation.bind(this, false)}
          onFocus={this.toggleLocation.bind(this, true)}
          maxLength={5}
          style={city ? {textIndent: `-${width + 10}px`} : {}}
          onChange={this.onChangeZipcode.bind(this)}
          placeholder="shipping zip code" autoFocus={true} />
          <span style={city ? {textIndent: `${(75)}px`} : {}} className="inner-input-text">{city}</span>
          {
            this.state.zipcodeValue ?
            <div className="form-label">
              <h4>shipping zip code</h4>
            </div> : null
          }
      </div>
    );
  }

  toggleLocation(value) {
    this.setState({focus: value});
  }

  onChangeZipcode(e) {
    const target = e.path && e.path.length ? e.path[0] : e.currentTarget;
    const zipcode = target.value;
    this.setState({zipcodeValue: zipcode});
    if (zipcode) {
      this.zipcodeChanged(zipcode.substr(0,5));
    } else if (!zipcode && this.state.location) {
      this.removeLocationinfo();
    }
  }

  async zipcodeChanged(zipcode) {
    if (zipcode && zipcode.match(new RegExp(zipCodeEscapedPattern))) {
      this.lastZip = zipcode;
      await getZipcode({zipcode}).then((result) => {
        this.success(result);
      });
    } else {
      this.removeLocationinfo();
    }
  }

  removeLocationinfo(error) {
    this.setState({zipcode: null, location: null, zipcodeError: error});
    this.props.onInvalidZipCode(false);
  }

}

export default ZipCodeFormWrapper;