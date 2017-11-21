import React from 'react';
import SiteHub from 'pages/SiteHub';
import Offers from 'pages/SiteHub/components/Offers';
import {Route} from 'react-router';
import loadApp from 'utility/loadApp';
import tree from 'state';

tree.set(['siteHubView', 'visible'], true);
tree.set(['siteHubView', 'shown'], true);
tree.set(['siteHubScriptLoaded'], true);

loadApp({
  initialRoute: '/sitehub/offers',
  cssUrl: 'GENERATED/sitehub.css',
  disableDelay: true,
  route: (
    <Route path="sitehub" component={SiteHub}>
      <Route path="offers" component={Offers}/>
    </Route>
  )
});