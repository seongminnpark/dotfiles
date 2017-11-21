if (!window.JST) {
  window.JST = {};
}
window.JST["wallet/pairing/finalizing"] = function (__obj) {
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
      __out.push('<section id="pairing_finalizing_dialog">\n  <header>\n    <h1>');
    
      __out.push(__sanitize(t('wallet.pairing.common.pair_a_new_mobile')));
    
      __out.push('</h1>\n  </header>\n  <div id="content_container">\n    <img src="../assets/images/wallet/pairing_icon.png" width="108" height="60" />\n    <input id="phone_name_input" class="large-text-input" placeholder="');
    
      __out.push(__sanitize(t('wallet.pairing.finalizing.placeholder_name')));
    
      __out.push('"/>\n    <div class="regular-grey-text-small">');
    
      __out.push(__sanitize(t('wallet.pairing.finalizing.assign_a_name')));
    
      __out.push('</div>\n    <div id="error_label" class="bold-invalid-text"></div>\n  </div>\n</section>\n<div class="dialog-actions-bar">\n  <div class="left-spacer"></div>\n  <a class="action-rounded-button" href="#terminate">');
    
      __out.push(__sanitize(t('common.finish')));
    
      __out.push('</a>\n</div>');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
};
