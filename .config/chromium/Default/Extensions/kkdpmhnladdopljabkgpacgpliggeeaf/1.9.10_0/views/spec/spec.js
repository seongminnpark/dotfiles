if (!window.JST) {
  window.JST = {};
}
window.JST["spec/spec"] = function (__obj) {
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
      __out.push('<div class="main-container">\n  <div id="wallet_top_menu" class="top-main-menu">\n    <ul class="left">\n      <li id="index-item" class="menu-item selected">\n        <div>\n          <a href="/specs/index">\n            <img src="../assets/images/wallet/dashboard_icon.png" />\n            <span>Index</span>\n          </a>\n          <div class="spacer" />\n          <div class="selector" />\n        </div>\n      </li>\n      <li id="result-item" class="menu-item">\n        <div>\n          <a href="/specs/result">\n            <img src="../assets/images/wallet/receive_icon.png" />\n            <span>Result</span>\n          </a>\n          <div class="spacer" />\n          <div class="selector" />\n        </div>\n      </li>\n    </ul>\n    <div class="right">\n      <a class="reload-icon" id="reload_icon">\n        <img src="../assets/images/wallet/reload_icon.png" />\n      </a>\n    </div>\n  </div>\n  <div id="navigation_controller_content"></div>\n</div>');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
};
