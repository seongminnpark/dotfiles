import React from 'react';
import Follow from 'pages/Follow';
import {Route} from 'react-router';
import loadApp from 'utility/loadApp';

async function init() {
  loadApp({
    initialRoute: '/follow',
    cssUrl: 'GENERATED/follow.css',
    route: (
      <Route path="follow" component={Follow}/>
    )
  });
}

if (document.readyState !== 'loading') {
  init();
} else {
  document.addEventListener('DOMContentLoaded', init);
}