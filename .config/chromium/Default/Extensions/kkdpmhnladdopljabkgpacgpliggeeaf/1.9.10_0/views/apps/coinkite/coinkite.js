if (!window.JST) {
  window.JST = {};
}
window.JST["apps/coinkite/coinkite"] = function (__obj) {
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
      __out.push('<div class="main-container">\n  <div id="coinkite_top_menu" class="top-main-menu">\n    <ul class="left">\n      <li id="dashboard-item" class="menu-item selected">\n        <div>\n          <a href="/apps/coinkite/dashboard/index">\n            <img src="../assets/images/apps/coinkite/coinkite_icon.png" />\n            <span>');
    
      __out.push(__sanitize(t('apps.coinkite.top_menu.items.coinkite')));
    
      __out.push('</span>\n          </a>\n          <div class="spacer" />\n          <div class="selector" />\n        </div>\n      </li>\n      <li id="key-item" class="menu-item">\n        <div>\n          <a href="/apps/coinkite/keygen/processing">\n            <img src="../assets/images/apps/coinkite/key_icon.png" />\n            <span>');
    
      __out.push(__sanitize(t('apps.coinkite.top_menu.items.key')));
    
      __out.push('</span>\n          </a>\n          <div class="spacer" />\n          <div class="selector" />\n        </div>\n      </li>\n      <li id="cosign-item" class="menu-item">\n        <div>\n          <a href="/apps/coinkite/cosign/index">\n            <img src="../assets/images/apps/coinkite/cosign_icon.png" />\n            <span>');
    
      __out.push(__sanitize(t('apps.coinkite.top_menu.items.cosign')));
    
      __out.push('</span>\n          </a>\n          <div class="spacer" />\n          <div class="selector" />\n        </div>\n      </li>\n      <li id="help-item" class="menu-item">\n        <div>\n          <a href="/apps/coinkite/help/index">\n            <img src="../assets/images/apps/coinkite/help_icon.png" />\n            <span>');
    
      __out.push(__sanitize(t('wallet.top_menu.items.help')));
    
      __out.push('</span>\n          </a>\n          <div class="spacer" />\n          <div class="selector" />\n        </div>\n      </li>\n      <li id="settings-item" class="menu-item">\n        <div>\n          <a href="/apps/coinkite/settings/index">\n            <img src="../assets/images/apps/coinkite/settings_icon.png" />\n            <span>');
    
      __out.push(__sanitize(t('apps.coinkite.top_menu.items.settings')));
    
      __out.push('</span>\n          </a>\n          <div class="spacer" />\n          <div class="selector" />\n        </div>\n      </li>\n    </ul>\n    <div class="right">\n      <li id="wallet-item" class="menu-item">\n        <div>\n          <a href="/wallet/accounts/0/show">\n            <img src="../assets/images/apps/coinkite/wallet_icon.png" />\n            <span>');
    
      __out.push(__sanitize(t('apps.coinkite.top_menu.items.wallet')));
    
      __out.push('</span>\n          </a>\n        </div>\n      </li>\n    </div>\n  </div>\n  <div id="navigation_controller_content" >\n\n  </div>\n</div>');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
};
