import React, {Component} from 'react';
import currency from 'utility/currency';
import {findDOMNode} from 'react-dom';
import copyToClip from 'utility/copyToClip';
import hasFeature from 'utility/hasFeature';
import _ from 'lodash';
import sendMetric from 'utility/sendMetric';
import Loader from 'components/Loader';
import * as actions from 'actions/inviteFriendsActions';
import OptionSelectInput from '../components/OptionSelectInput';
import ContactsList from '../components/ContactsList';
import {WIKIBUY_URL} from 'constants';
import {getContactsFromBg} from 'actions/oauthActions';
import './invite-test.less';

const emailValidation = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

class InviteFriends extends Component {
  constructor(...args) {
    super(...args);
    this.winWidth = 520;
    this.winHeight = 400;
    this.state = {
      success: false,
      referral_emails: [],
      google_contacts_added: [],
      firstname: null,
      lastname: null
    };
  }

  componentWillMount() {
    getContactsFromBg({contacts: true});
  }

  componentDidMount() {
    sendMetric('track', 'referWikibuyVisible', {});
  }

  toggleContact(contact) {
    let contacts = _.clone(this.state.google_contacts_added);
    if (_.find(contacts, contact)) {
      contacts = _.pull(contacts, contact);
    } else {
      contacts.push(contact);
    }
    this.setState({google_contacts_added: contacts});
  }

  addAllContacts(contacts) {
    this.setState({google_contacts_added: contacts});
  }

  render() {
    const referralEmails = _.filter(this.state.referral_emails, {valid: true});
    let added = [].concat(this.state.google_contacts_added).concat(referralEmails);
    added = _.uniqBy(added, (c) => {
      const v = c.email || c.value || c.name;
      return v;
    });
    added = added.length;

    const className = added < 2 ? 'zero' : added >= 2 && added < 20 ? 'tens' : added >= 20 && added < 200 ? 'hundreds' : added >= 200 && added < 2000 ? 'thousands' : added >= 2000 && added < 20000 ? 'ten-thousand' : 'too-many';
    const url = this.props.shortCode ? `${WIKIBUY_URL}/referral-code/${this.props.shortCode}` : 'https://wikibuy.com/instant';
    const campaign = 'facebook_referral';
    return (
      !this.state.success && !this.state.addName ?
      <div className={`invite-wrapper`}>
        <h2>Invite friends. When they make their first qualifying purchase, you get $5 Wikibuy credit.</h2>
        <div className="invite-flex-wrapper">

          {
            (!hasFeature('referral_get5_go') && !hasFeature('referral_get5_links')) || (_.get(this.props.googleContacts, 'contacts.length')) ?
            <div className={`amount-wrapper ${className}`}>
              <h2 className={`amount ${added ? 'palmetto' : ''}`}>{added ? `${currency(added * 500, true)}` : '$0'}</h2>
            </div> : null
          }

          <div className="invite-friends">
            {
              _.get(this.props.googleContacts, 'contacts.length') ?
              <ContactsList
                inviteFriendsView={{}}
                hideFooter={true}
                googleContacts={this.props.googleContacts}
                onAddContact={(contact) => this.toggleContact(contact)}
                onAddAllContacts={(contacts) => this.addAllContacts(contacts)}
                addedToInvite={this.state.google_contacts_added}
                sendingInvite={false}
                allContactsInvited={false}
                query={null}/> : null
            }

            {
              !_.get(this.props.googleContacts, 'contacts.length') && hasFeature('referral_get5_go') ?
              <div className="share-flex">
                <div onClick={this.importGoogle.bind(this)} className="import-google-contacts referrer-button">
                  <span className="gmail-logo"></span>
                  <h4 className="bold">Import Google Contacts</h4>
               </div>
             </div> : null
           }

           {
              hasFeature('referral_get5_links') && !_.get(this.props.googleContacts, 'contacts.length') ?
              <div className="button-group">

                <div onClick={this.importGoogle.bind(this)} className="import-google-contacts referrer-button">
                  <span className="gmail-logo"></span>
                  <h4>Import Google Contacts</h4>
                </div>

                <div className="share-icons">
                  <a className="icon-facebook social" onClick={this.fbShare.bind(this, `${url}/?utm_campaign=${campaign}&utm_source=facebook.com`)}></a>
                </div>

              <div className="referral-input-wrapper">
                 <div className="input-wrapper">
                  <input ref={'referralInput'} onChange={() => {this.forceUpdate()}} onClick={this.select.bind(this)} value={url} />
                  <h5 onClick={this.copyReferral.bind(this, 'button')} className="copy">{this.state.copied ? 'copied!' :'copy'}</h5>
                </div>
              </div>

             </div>: null
           }

           {
            !hasFeature('referral_get5_go') && !hasFeature('referral_get5_links') ?
              <OptionSelectInput
                valid={this.state.valid}
                onValidEdit={this.onValidEdit.bind(this)}
                placeholder="enter recipient email addresses"
                inputItems={this.state.referral_emails}
                validation={this.emailValidation.bind(this)}
                onAddEmail={this.addEmails.bind(this)}
                page={'inviteFriendsPage'}
                autoCompleteData={[]}
                autoCompleteFilter={() => {}}/> : null
           }

           {
            !hasFeature('referral_get5_go') && !hasFeature('referral_get5_links') && !_.get(this.props.googleContacts, 'contacts.length') ?
             <div className="share-flex">
                <div onClick={this.fbShare.bind(this, `${url}/?utm_campaign=${campaign}&utm_source=facebook.com`)} className="share-facebook r-button"></div>

                <div onClick={this.copyReferral.bind(this, 'text')} className="share-link r-button">
                  {
                    this.state.copied ?
                    <h5 className="copy a">copied!</h5> : null
                  }
                </div>

                <div onClick={this.importGoogle.bind(this)} className="import-google-contacts">
                  <span className="gmail-logo"></span>
                  <h4 style={{color: '#d54b3d'}} className="bold">import Google contacts</h4>
               </div>
             </div> : null
           }


            {
              (!hasFeature('referral_get5_go') && !hasFeature('referral_get5_links')) || (_.get(this.props.googleContacts, 'contacts.length')) ?
               <button onClick={this.props.firstname || this.state.firstname ? this.inviteFriends.bind(this) : this.addName.bind(this)} className={`primary-btn-large`} disabled={(!this.state.valid && !this.state.google_contacts_added.length) || this.state.sendingInvites}>
                {
                  this.state.sendingInvites ?
                  <Loader color="#ccc" size={20} direction="left">sending</Loader> : 'invite'
                }
               </button> : null
            }

             {
              this.state.error === false ?
              <h4 className="bold note error">there was an error sending invites</h4> : null
             }
          </div>
        </div>
      </div> :

      this.state.addName ?
      <div className="invite-wrapper add-name">
        <div className="designed-form">
          <h2>Tell your friends who invited them to Wikibuy.</h2>
          <input placeholder="your name" ref={(r) => this.nameInput = findDOMNode(r)} type="input" value={this.state.firstname || ''} onChange={this.onChangeName.bind(this)} autoFocus={true}/>
          <button onClick={this.inviteFriends.bind(this)} className={`primary-btn-large`} disabled={!this.state.firstname || this.state.sendingInvites}>
            {
              this.state.sendingInvites ?
              <Loader color="#ccc" size={20} direction="left">Sending</Loader> : 'Invite'
            }
          </button>
        </div>

      </div> :

      this.state.success ?
      <div className="invite-wrapper success">

      </div> : null
    );
  }

  async importGoogle() {
    sendMetric('trackClick', 'importGoogleContacts', 'import Gmail contacts', {pageLocation: 'extension'});
    getContactsFromBg();
  }

  onChangeName(e) {
    const value = this.nameInput.value;
    this.setState({firstname: value});
  }

  copyReferral(type) {
    sendMetric('trackClick', 'copyReferralLink', type, {pageLocation: 'extension'});

    const link = `${WIKIBUY_URL}/referral-code/${this.props.shortCode}`;
    this.setState({copied: copyToClip(link)}, () => {
      this.timeoutId = setTimeout(() => {
        this.setState({copied: false});
      }, 1000);
    });
  }

  addName() {
    sendMetric('trackClick', 'addNameToInvite', 'invite', {pageLocation: 'extension'});
    this.setState({addName: true});
  }

  async inviteFriends() {
    const referalls = [].concat(this.state.referral_emails).concat(this.state.google_contacts_added);
    const emails = _.map(referalls, (email) => {
      return email.value || email.email;
    });

    if (this.state.validEdit) {
      emails.push(this.state.validEdit);
    }

    sendMetric('trackClick', 'submitInvite', 'invite', {
      numberOfInvites: _.get(emails, 'length'),
      pageLocation: 'extension'
    });


    this.setState({sendingInvites: true});
    const success = await actions.sendInvites({
      referral_emails: emails,
      first_name: this.props.firstname || this.state.firstname,
      last_name: this.props.lastname || this.state.lastname
    });

    if (success) {
      this.props.onClosePopup();
      // this.addEmails([]);
      return;
    }
    this.setState({sendingInvites: false, success, addName: false});
  }

  addEmails(emails) {
    if (emails && emails.length) {
      this.setState({referral_emails: emails, validEdit: false}, () => {
        this.validateEmails();
      });
    } else {
      this.setState({referral_emails: [], valid: false});
    }
  }

  onValidEdit(email) {
    const invalid = _.filter(this.state.referral_emails, (email) => {
      return !email.valid;
    });
    this.setState({valid: !invalid.length && email, validEdit: email});
  }

  emailValidation(value) {
    return emailValidation.test(value);
  }

  validateEmails() {
    const emails = this.state.referral_emails;
    const invalid = _.filter(emails, (email) => {
      return !email.valid;
    });
    this.setState({
      valid: !invalid.length && emails.length
    });
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  // FACEBOOK
  fbShare(url, e) {
    e.stopPropagation();
    sendMetric('trackClick', `shareFacebook`, 'Share on facebook', {pageLocation: 'extension'});
    const title = 'Wikibuy';
    const image = 'https://wikibuy.com/assets/images/wikibuy_logo.png';
    const message = 'Get $5 towards your first purchase on Wikibuy. Save time and money when you shop on Amazon.';
    this.createPopup('http://www.facebook.com/sharer.php?s=100&p[title]=' + title + '&p[summary]=' + message + '&p[url]=' + url + '&p[images][0]=' + image, 'Share');
  }

  createPopup(url, name) {
    const winTop = (screen.height / 2) - (this.winWidth / 2);
    const winLeft = (screen.width / 2) - (this.winWidth / 2);
    window.open(url, name, 'top=' + winTop + ',left=' + winLeft + ',toolbar=0,status=0,width=' + this.winWidth + ',height=' + this.winHeight);
  }

  select() {
    sendMetric('trackClick', 'selectReferralLink', 'invite friends', {pageLocation: 'extension'});
    this.refs.referralInput.select();
  }


}


export default InviteFriends;