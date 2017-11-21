if (!window.JST) {
  window.JST = {};
}
window.JST["onboarding/management/done"] = function (__obj) {
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
      __out.push('<div id="content-container">\n  <div class="logo-container">\n    <img src="../../assets/images/onboarding/large_logo.png" width="280" height="125">\n  </div>\n  <div class="greyed-container">\n    <img src="../../assets/images/common/large_');
    
      __out.push(__sanitize(this.params.error != null ? 'error' : 'check'));
    
      __out.push('.png" width="50" height="50" />\n    <div class="black-indication">');
    
      __out.push(__sanitize(this.params.error != null ? t('onboarding.management.done.configuration_failed_' + this.params.wallet_mode) : t('onboarding.management.done.configuration_is_complete_' + this.params.wallet_mode)));
    
      __out.push('</div>\n    ');
    
      if (this.params.error == null) {
        __out.push('\n    <div class="medium-indication">');
        __out.push(__sanitize(_.str.sprintf(t('onboarding.management.done.unplug_plug'), ledger.config.network.plural)));
        __out.push('</div>\n    ');
      } else {
        __out.push('\n    <a href="#openSupport" class="action-rounded-button">');
        __out.push(__sanitize(t('onboarding.management.done.contact_support')));
        __out.push('</a>\n    ');
      }
    
      __out.push('\n  </div>\n</div>');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
};
