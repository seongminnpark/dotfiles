import React from 'react';
import SimpleDealAnnotation from 'pages/SimpleDealAnnotation';
import loadApp from 'utility/loadApp';
import {Route} from 'react-router';

function wrappedComponent(deal) {
  class Annotation extends React.Component {
    render() {
      return <SimpleDealAnnotation deal={deal} asin={deal.asin}/>;
    }
  }
  return Annotation;
}

export default function loadAnnotation(deal, selectors, element) {
  return new Promise(resolve => {
    loadApp({
      initialRoute: '/offers',
      cssUrl: 'GENERATED/offers.css',
      route: (
        <Route path="offers" component={wrappedComponent(deal)}/>
      ),
      additionalClass: `a${deal.asin}`, // HACK to get around ASINs that are all numbers
      disableDelay: true,
      setupInPageComponent: true,
      insertAfter: selectors,
      insertAfterElement: element
    }, () => {
      resolve(true);
    });
  });
}