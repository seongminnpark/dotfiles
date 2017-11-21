if (!window.JST) {
  window.JST = {};
}
window.JST["wallet/wallet"] = function (__obj) {
  if (!__obj) __obj = {};
  var __out = [], __capture = function(callback) {
    var out = __out, result;
    __out = [];
    callback.call(this);
    result = __out.join('');
    __out = out;
    return __safe(result);
  }, __sanitize = function(value) {
    if (value && value.ecoSafe) {
      return value;
    } else if (typeof value !== 'undefined' && value != null) {
      return __escape(value);
    } else {
      return '';
    }
  }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
  __safe = __obj.safe = function(value) {
    if (value && value.ecoSafe) {
      return value;
    } else {
      if (!(typeof value !== 'undefined' && value != null)) value = '';
      var result = new String(value);
      result.ecoSafe = true;
      return result;
    }
  };
  if (!__escape) {
    __escape = __obj.escape = function(value) {
      return ('' + value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    };
  }
  (function() {
    (function() {
      __out.push('<div class="main-container">\n  <div id="wallet_top_menu" class="top-main-menu">\n    <ul class="left">\n      <li id="accounts-item" class="menu-item">\n        <div>\n          <a href="/wallet/accounts/index">\n            <img src="../assets/images/wallet/accounts_icon.png" />\n            <span>');
    
      __out.push(__sanitize(t('wallet.top_menu.items.accounts')));
    
      __out.push('</span>\n          </a>\n          <div class="spacer" />\n          <div class="selector" />\n        </div>\n      </li>\n      <li id="send-item" class="menu-item">\n        <div>\n          <a href="/wallet/send/index">\n            <img src="../assets/images/wallet/send_icon.png" />\n            <span>');
    
      __out.push(__sanitize(t('wallet.top_menu.items.send')));
    
      __out.push('</span>\n          </a>\n          <div class="spacer" />\n          <div class="selector" />\n        </div>\n      </li>\n      <li id="receive-item" class="menu-item">\n        <div>\n          <a href="/wallet/receive/index">\n            <img src="../assets/images/wallet/receive_icon.png" />\n            <span>');
    
      __out.push(__sanitize(t('wallet.top_menu.items.receive')));
    
      __out.push('</span>\n          </a>\n          <div class="spacer" />\n          <div class="selector" />\n        </div>\n      </li>\n      <li id="settings-item" class="menu-item">\n        <div>\n          <a href="/wallet/settings/index">\n            <img src="../assets/images/wallet/settings_icon.png" />\n            <span>');
    
      __out.push(__sanitize(t('wallet.top_menu.items.settings')));
    
      __out.push('</span>\n          </a>\n          <div class="spacer" />\n          <div class="selector" />\n        </div>\n      </li>\n      <li id="chains-item" class="menu-item">\n        <div>\n          <div id="chains-title">');
    
      __out.push(__sanitize(t('wallet.top_menu.items.chains')));
    
      __out.push('</div>\n          <div id="chains-id">');
    
      __out.push(__sanitize(ledger.config.network.chain));
    
      __out.push('</div>\n          \n        </div>\n      </li>\n      <li id="help-item" class="menu-item">\n        <div>\n          <a href="/wallet/help/index">\n            <img src="../assets/images/wallet/help_icon.png" />\n            <span>');
    
      __out.push(__sanitize(t('wallet.top_menu.items.help')));
    
      __out.push('</span>\n          </a>\n          <div class="spacer" />\n          <div class="selector" />\n        </div>\n      </li>\n    </ul>\n    <div class="right">\n      <div>\n        <p class="balance-label" id="currency_container"></p>\n        <p class="balance-value ');
    
      __out.push(__sanitize(ledger.formatters.symbolIsFirst() ? 'inverted' : void 0));
    
      __out.push('">\n          <span id="balance_value">0</span>\n          <sup>');
    
      __out.push(__sanitize(ledger.formatters.getUnitSymbol()));
    
      __out.push('</sup>\n        </p>\n      </div>\n      <a class="reload-icon" id="reload_icon">\n        <img src="../assets/images/wallet/reload_icon.png" />\n      </a>\n    </div>\n  </div>\n  <div class="flash-container">\n    <p class="flash-text"></p>\n    <a class="flash-link" href="#openFlashUrl"></a>\n  </div>\n  <div class="action-bar-holder">\n    <div class="breadcrumb-holder"></div>\n    <div class="actions-holder"></div>\n  </div>\n  <div id="navigation_controller_content"></div>\n</div>\n');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
};
