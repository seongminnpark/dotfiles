if (!window.JST) {
  window.JST = {};
}
window.JST["wallet/send/sign"] = function (__obj) {
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
      __out.push('<section id="send_validating_dialog">\n  <header>\n    <h1>');
    
      __out.push(__sanitize(_.str.sprintf(t('wallet.send.common.send_bitcoins'), ledger.config.network.plural)));
    
      __out.push('</h1>\n  </header>\n  <div id="validating" class="content-container">\n    <div class="regular-text">');
    
      __out.push(__sanitize(t('wallet.send.validating.validating_transaction')));
    
      __out.push('</div>\n    <div class="progress_container">\n      <div id="validating_progressbar_container" class="progressbar-container"></div>\n      <div class="regular-grey-text-small" id="validating_progress_label">0%</div>\n    </div>\n    <div class="regular-grey-text-small">');
    
      __out.push(__sanitize(t('common.may_take_a_while')));
    
      __out.push('</div>\n  </div>\n  <div id="confirm" class="content-container">\n    <img src="../assets/images/wallet/send/ic_exchange.png" width="50" height="50" />\n    <div class="regular-text">');
    
      __out.push(t('wallet.send.sign.confirm'));
    
      __out.push('</div>\n    <div class="regular-grey-text-small">');
    
      __out.push(t('wallet.send.sign.confirm_check_1'));
    
      __out.push('</div>\n    <div class="regular-grey-text-small second-line">');
    
      __out.push(t('wallet.send.sign.confirm_check_2'));
    
      __out.push('</div>\n  </div>\n  <div id="processing" class="content-container">\n    <div class="regular-text">');
    
      __out.push(__sanitize(t('wallet.send.processing.finalizing_transaction')));
    
      __out.push('</div>\n    <div class="progress_container">\n      <div id="processing_progressbar_container" class="progressbar-container"></div>\n      <div class="regular-grey-text-small" id="processing_progress_label">0%</div>\n    </div>\n    <div class="regular-grey-text-small">');
    
      __out.push(__sanitize(t('common.may_take_a_while')));
    
      __out.push('</div>\n  </div>\n</section>');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
};
