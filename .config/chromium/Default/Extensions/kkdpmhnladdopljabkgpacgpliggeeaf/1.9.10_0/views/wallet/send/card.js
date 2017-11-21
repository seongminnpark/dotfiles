if (!window.JST) {
  window.JST = {};
}
window.JST["wallet/send/card"] = function (__obj) {
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
      __out.push('<section id="send_card_dialog">\n  <header>\n    <h1>');
    
      __out.push(__sanitize(_.str.sprintf(t('wallet.send.common.send_bitcoins'), ledger.config.network.plural)));
    
      __out.push('</h1>\n  </header>\n  <div class="regular-text">');
    
      __out.push(t('wallet.send.card.grab_your_card'));
    
      __out.push('</div>\n  <div id="validation_container">\n    <div id="validation_texts">\n      <div id="validation_indication"></div>\n      <div id="validation_subtitle" class="regular-grey-text-small"></div>\n    </div>\n    <div id="validation_code"></div>\n  </div>\n  <div id="card_container"></div>\n</section>\n<div class="dialog-actions-bar">\n  <a id="other_validation_methods" class="uppercase-action" href="#otherValidationMethods">');
    
      __out.push(__sanitize(t('wallet.send.common.other_validation_methods')));
    
      __out.push('</a>\n  <div class="left-spacer"></div>\n  <a class="cancel-rounded-button" href="#cancel">');
    
      __out.push(__sanitize(t('common.cancel')));
    
      __out.push('</a>\n</div>');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
};
