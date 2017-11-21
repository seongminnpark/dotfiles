import tree from 'state';
import React, {Component} from 'react';

// import {trackClick} from 'utility/analytics';
import hasFeature from 'utility/hasFeature';
import './invite-friends-banner.less';

class InviteFriendsBanner extends Component {
  render() {
    const hasOrdered = tree.get(['events', 'hasOrdered']);
    let message;
    if (hasFeature('referral_inc_g5')) {
      message = 'invite a friend. give them $5.';
    } else if (hasFeature('referral_inc_gg5')) {
      message = 'invite a friend. give $5 and get $5.';
    } else if (hasFeature('referral_inc_control')) {
      message = 'help your friends save money by sharing Wikibuy with them.';
    }

    return (
      message && hasOrdered ?
       <div className="invite-friends-banner-component">
        <div onClick={this.props.inviteFrinds.bind(this, 'banner')} className="message">
          <div className="plane-icon icon"></div>
          <h5 className="bold">{message}</h5>
        </div>
      </div> : null
    );
  }
}

export default InviteFriendsBanner;