if (!window.JST) {
  window.JST = {};
}
window.JST["wallet/pairing/index"] = function (__obj) {
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
      __out.push('<section id="pairing_index_dialog">\n  <header>\n    <h1>');
    
      __out.push(__sanitize(t('wallet.pairing.common.pair_a_new_mobile')));
    
      __out.push('</h1>\n  </header>\n  <div class="step-container">\n    <div class="step-number">1.</div>\n    <div class="step-content">\n      <div class="step-indication">');
    
      __out.push(t('wallet.pairing.index.download_the_app'));
    
      __out.push('</div>\n      <div class="step-explanation"><a href="#openSupport">');
    
      __out.push(t('wallet.pairing.index.compatibility_details_available'));
    
      __out.push('</a></div>\n    </div>\n  </div>\n  <div class="step-container">\n    <div class="step-number">2.</div>\n    <div class="step-content">\n      <div class="step-indication">');
    
      __out.push(t('wallet.pairing.index.open_the_app'));
    
      __out.push('</div>\n      <div class="step-explanation">');
    
      __out.push(t('wallet.pairing.index.tap_pair'));
    
      __out.push('</div>\n    </div>\n  </div>\n  <div id="qrcode_container">\n    <div id="qrcode_frame"></div>\n    <div class="qrcode-indication">');
    
      __out.push(t('wallet.pairing.index.scan_this_qrcode'));
    
      __out.push('</div>\n  </div>\n</section>\n<div class="dialog-actions-bar">\n  <div class="left-spacer"></div>\n  <a class="cancel-rounded-button" href="#dismiss">');
    
      __out.push(__sanitize(t('common.cancel')));
    
      __out.push('</a>\n</div>');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
};
