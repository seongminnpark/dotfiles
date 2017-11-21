if (!window.JST) {
  window.JST = {};
}
window.JST["onboarding/management/seed"] = function (__obj) {
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
    
      __out.push('</div>\n    </div>\n    <div id="actions_container" class="actions no-print">\n      <a class="action" href="#print"><i class="fa fa-print"></i><br />');
    
      __out.push(__sanitize(t('common.print')));
    
      __out.push('</a>\n      <div class="separator"></div>\n      <a class="action" href="#copy"><i class="fa fa-paste"></i><br />');
    
      __out.push(__sanitize(t('common.copy')));
    
      __out.push('</a>\n    </div>\n  </div>\n  <div class="greyed-container detailed">\n    <div class="index">\n      ');
    
      __out.push(__sanitize(this.params.step));
    
      __out.push('.\n    </div>\n    <div class="texts">\n      <span class="black-title">');
    
      __out.push(this.params.wallet_mode === 'create' ? t('onboarding.management.seed.write_down_your') : t('onboarding.management.seed.enter_your'));
    
      __out.push('</span>\n      <div class="black-indication">');
    
      __out.push(__sanitize(this.params.wallet_mode === 'create' ? t('onboarding.management.seed.usecase_word_group') : t('onboarding.management.seed.given_word_group')));
    
      __out.push('</div>\n    </div>\n  </div>\n  <div class="page-content-container">\n    <div id="seed_container"></div>\n    <div id="invalid_label"><span class="invalid-indication">');
    
      __out.push(__sanitize(t('onboarding.management.seed.invalid_recovery_phrase')));
    
      __out.push('</span></div>\n    <div id="indication_label"><span class="black-indication-strong">');
    
      __out.push(__sanitize(t('onboarding.management.seed.it_wont_be_displayed_again')));
    
      __out.push('</span> <span class="black-indication">');
    
      __out.push(__sanitize(_.str.sprintf(t('onboarding.management.seed.without_it'), ledger.config.network.plural)));
    
      __out.push('</span></div>\n  </div>\n  <div class="navigation-container">\n    <a class="back" href="#navigateRoot" id="back_button"><i class="fa fa-angle-left"></i> ');
    
      __out.push(__sanitize(t('onboarding.management.cancel')));
    
      __out.push('</a>\n    <a class="continue" href="#navigateContinue" id="continue_button">');
    
      __out.push(__sanitize(t('onboarding.management.continue')));
    
      __out.push(' <i class="fa fa-angle-right"></i></a>\n  </div>\n</div>');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
};
