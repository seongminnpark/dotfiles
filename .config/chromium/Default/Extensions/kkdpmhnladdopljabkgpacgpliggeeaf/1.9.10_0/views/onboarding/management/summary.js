if (!window.JST) {
  window.JST = {};
}
window.JST["onboarding/management/summary"] = function (__obj) {
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
      __out.push('<div id="content-container">\n  <div class="title-container">\n    <div class="titles">\n      <div class="page-title">');
    
      __out.push(__sanitize(t('onboarding.management.' + this.params.wallet_mode + '_my_wallet')));
    
      __out.push('</div>\n      <div class="page-subtitle">');
    
      __out.push(__sanitize(t('application.name')));
    
      __out.push('</div>\n    </div>\n  </div>\n  <div class="greyed-container detailed">\n    <div class="index">\n      ');
    
      __out.push(__sanitize(this.params.step));
    
      __out.push('.\n    </div>\n    <div class="texts">\n      <span class="black-title">');
    
      __out.push(__sanitize(t('onboarding.management.summary.your_wallet_is')));
    
      __out.push('</span>\n      <span class="black-strong-title">');
    
      __out.push(__sanitize(t('onboarding.management.summary.almost_ready')));
    
      __out.push('</span>\n      <div class="black-indication">');
    
      __out.push(__sanitize(_.str.sprintf((this.params.wallet_mode === 'create' ? t('onboarding.management.summary.use_your_bitcoins_create') : t('onboarding.management.summary.use_your_bitcoins_other')), ledger.config.network.plural)));
    
      __out.push('</div>\n    </div>\n  </div>\n  <div class="page-content-container">\n    <img src="../assets/images/onboarding/management/ledger_wallet.png" width="322" height="70" />\n    <div class="black-indication">');
    
      __out.push(__sanitize(this.params.wallet_mode === 'create' ? t('onboarding.management.summary.by_clicking_finish_create') : t('onboarding.management.summary.by_clicking_finish_other')));
    
      __out.push('</div>\n    <div class="black-indication">');
    
      __out.push(__sanitize(t('onboarding.management.summary.your_wallet_mode_' + this.params.wallet_mode)));
    
      __out.push(' ');
    
      __out.push(__sanitize(t('onboarding.management.summary.during_the_operation')));
    
      __out.push('</div>\n  </div>\n  <div class="navigation-container">\n    <a class="back" href="#navigateRoot" id="back_button"><i class="fa fa-angle-left"></i> ');
    
      __out.push(__sanitize(t('onboarding.management.cancel')));
    
      __out.push('</a>\n    <a class="continue" href="#navigateContinue" id="continue_button">');
    
      __out.push(__sanitize(t('onboarding.management.finish')));
    
      __out.push(' <i class="fa fa-angle-right"></i></a>\n  </div>\n</div>');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
};
