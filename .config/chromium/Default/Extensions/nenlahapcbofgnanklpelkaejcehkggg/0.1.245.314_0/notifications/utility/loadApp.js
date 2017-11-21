import React from 'react';
import {render} from 'react-dom';
import Root from 'components/Root';
import retargetEvents from 'utility/retargetEvents';
import style from 'utility/mountStyle';
import _ from 'lodash';
import tree from 'state';
import delay from 'utility/delay';
import {Router, Route, createMemoryHistory} from 'react-router';

function setupWebComponent(options) {
  const template = document.createElement('template');
  template.innerHTML = `
    <style>
      @import "${chrome.runtime.getURL(options.cssUrl)}";
      ${
        options.loadCommon ?
        `@import "${chrome.runtime.getURL(options.commonCSS)}";` :
        ''
      }
    </style>
    <div class="__wb_container"><div class="__wikibuy __onTop"></div></div>
  `;
  const mountPoint = document.createElement('div');
  mountPoint.style.all = 'initial';
  // @font-face in shadow dom work around
  mountPoint.innerHTML = style;
  const shadowRoot = mountPoint.createShadowRoot();
  shadowRoot.appendChild(document.importNode(template.content, true));
  if (options && options.insertAfter) {
    const referenceNode = document.querySelector(options.insertAfter);
    referenceNode.parentNode.insertBefore(mountPoint, referenceNode.nextSibling);
  } else {
    document.body.appendChild(mountPoint);
  }
  return {
    entry: shadowRoot.querySelector('.__wikibuy'),
    shadowRoot
  }
}

function setupNonWebComponent(options) {
  const container = document.createElement('div');
  container.setAttribute('class', '__wb_container');
  container.style.all = 'initial';
  container.innerHTML = `
    <style>
      @import "${chrome.runtime.getURL(options.cssUrl)}";
      ${
        options.loadCommon ?
        `@import "${chrome.runtime.getURL(options.commonCSS)}";` :
        ''
      }
    </style>
    <div class="__wikibuy __onTop"></div>
  `;
  if (options && options.insertAfter) {
    const referenceNode = document.querySelector(options.insertAfter);
    referenceNode.parentNode.insertBefore(container, referenceNode.nextSibling);
  } else {
    document.body.appendChild(container);
  }
  return container.querySelector('.__wikibuy');
}

function findElements(selectors) {
  return !!_.find(selectors, selector => document.querySelector(selector));
}

async function setupInPageComponent(options) {
  const container = document.createElement('div');
  container.setAttribute('class', '__wb_container');
  container.style.all = 'initial';
  const className = `__wikibuy __annotation ${options.additionalClass || ''}`;
  const loadCSS = !document.getElementById('__wikibuy_css');
  container.innerHTML = `
    <style id="__wikibuy_css">
      ${
        loadCSS ?
        `@import "${chrome.runtime.getURL(options.cssUrl)}";` :
        ''
      }
      ${
        options.loadCommon ?
        `@import "${chrome.runtime.getURL(options.commonCSS)}";` :
        ''
      }
    </style>
    <div class="${className}"></div>
  `;

  if (options.waitForElement) {
    let attempts = 0;
    while (!findElements(options.insertAfter)) {
      await delay(100);
      ++attempts;
      if (options.maxWaitAttemps && attempts >= options.maxWaitAttemps) {
        break;
      }
    }
  }

  if (options && options.insertAfter && options.insertAfter.length) {
    let referenceNode;
    _.forEach(options.insertAfter, selector => {
      if (referenceNode) {
        return;
      }
      referenceNode = document.querySelector(selector);
    });
    if (referenceNode) {
      referenceNode.parentNode.insertBefore(container, referenceNode.nextSibling);
    }
  } else if (options && options.insertAfterElement) {
    const referenceNode = options.insertAfterElement;
    referenceNode.parentNode.insertBefore(container, referenceNode.nextSibling);
  } else {
    document.body.appendChild(container);
  }
  return document.querySelector(`.__wikibuy.__annotation${options.additionalClass ? `.${options.additionalClass}` : ''}`);
}

export default async function loadApp(options, cb) {
  options = _.assign({
    initialRoute: '/notification',
    cssUrl: 'GENERATED/notifications.css',
    commonCSS: 'GENERATED/commons.css'
  }, options);
  const disableCommon = false;
  if ((!options.setupInPageComponent || !tree.get('commonCSSLoaded')) && !disableCommon) {
    if (options.setupInPageComponent) {
      tree.set('commonCSSLoaded', true);
    }
    options.loadCommon = true;
  }
  if (options.deal) {
    tree.set(['notification', 'communityDeal', 'deal'], options.deal);
    tree.set(['notification', 'style'], 'notification');
  }
  const useWebComponent = !!document.head.createShadowRoot && !options.setupInPageComponent;
  const history = createMemoryHistory();
  history.push({pathname: options.initialRoute});
  const routes = (
    <Router history={history}>
      <Route path="/" component={Root}>
        {options.route}
      </Route>
    </Router>
  );
  let entry;
  let shadowRoot;
  if (options.setupInPageComponent) {
    entry = await setupInPageComponent(options);
  } else if (useWebComponent) {
    const refs = setupWebComponent(options);
    entry = refs.entry;
    shadowRoot = refs.shadowRoot;
  } else {
    entry = setupNonWebComponent(options);
  }
  // Delay rendering app to hopefully let our styles load and page to settle
  setTimeout(() => {
    if (routes && entry) {
      render(routes, entry);
      if (useWebComponent) {
        retargetEvents(shadowRoot);
      }
    }
    if (cb) {
      cb();
    }
  }, options.disableDelay ? 100 : 1000);
}