if (!window.JST) {
  window.JST = {};
}
window.JST["wallet/send/preparing"] = function (__obj) {
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
      __out.push('<section id="send_preparing_dialog">\n  <header>\n    <h1>');
    
      __out.push(__sanitize(_.str.sprintf(t('wallet.send.common.send_bitcoins'), ledger.config.network.plural)));
    
      __out.push('</h1>\n  </header>\n  <div id="content_container">\n    <div class="regular-text">');
    
      __out.push(__sanitize(t('wallet.send.preparing.preparing_transaction')));
    
      __out.push('</div>\n    <div class="regular-grey-text-small">');
    
      __out.push(__sanitize(t('common.may_take_a_while')));
    
      __out.push('</div>\n  </div>\n</section>\n<div class="dialog-actions-bar">\n  <div class="left-spacer"></div>\n  <a class="cancel-rounded-button" href="#cancel">');
    
      __out.push(__sanitize(t('common.cancel')));
    
      __out.push('</a>\n</div>');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
};
