if (!window.JST) {
  window.JST = {};
}
window.JST["wallet/settings/bitcoin"] = function (__obj) {
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
      __out.push('<section id="settings_bitcoin_dialog">\n  <header>\n    <h1>');
    
      __out.push(__sanitize(t('wallet.settings.common.coin')));
    
      __out.push('</h1>\n  </header>\n  <div id="confirmations_table_container"></div>\n  <div id="fees_table_container"></div>\n  <div id="blockchain_table_container"></div>\n</section>\n<div class="dialog-actions-bar">\n  <a class="uppercase-action" href="#openOtherSettings">');
    
      __out.push(__sanitize(t('wallet.settings.common.other_settings')));
    
      __out.push('</a>\n  <div class="left-spacer"></div>\n  <a class="cancel-rounded-button" href="#dismiss">');
    
      __out.push(__sanitize(t('common.close')));
    
      __out.push('</a>\n</div>');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
};
