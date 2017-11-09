import React from 'react';
import './fewer-notifications-message.less';

function FewerNotificationsMessage() {
  return (
    <div className="fewer-notifications-message">
      <h2>ok. you'll see fewer notifications.</h2>
      <div className="message-text semi-bold">
        you can still activate at any time by clicking on the w button in your browser bar
      </div>
    </div>
  );
}

FewerNotificationsMessage.propTypes = {};

export default FewerNotificationsMessage;