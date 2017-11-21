if (!window.JST) {
  window.JST = {};
}
window.JST["onboarding/management/pin"] = function (__obj) {
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
    
      __out.push(__sanitize(this.params.wallet_mode === 'create' ? t('onboarding.management.pin.choose_your') : t('onboarding.management.pin.choose_your_new')));
    
      __out.push('</span>\n      <span class="black-strong-title">');
    
      __out.push(__sanitize(t('onboarding.management.pin.pin_code')));
    
      __out.push('</span>\n      <div class="black-indication">');
    
      __out.push(__sanitize(t('onboarding.management.pin.to_protect_your_wallet')));
    
      __out.push('</div>\n    </div>\n  </div>\n  <div class="page-content-container">\n    <div class="choice" id="choice-auto">\n      <label>\n        <input type="radio" name="pin_kind" value="auto" id="auto_radio">\n        <span class="uppercase-title">');
    
      __out.push(__sanitize(t('onboarding.management.pin.auto')));
    
      __out.push('</span>\n      </label>\n      <a href="#randomizePinCode" class="uppercase-action" id="generate_link"><i class="fa fa-refresh"></i>');
    
      __out.push(__sanitize(t('onboarding.management.pin.new_pin_code')));
    
      __out.push('</a>\n    </div>\n    <div class="separator">\n      <div class="line"></div>\n      ');
    
      __out.push(__sanitize(t('onboarding.management.or')));
    
      __out.push('\n      <div class="line"></div>\n    </div>\n    <div class="choice" id="choice-manual">\n      <label>\n        <input type="radio" name="pin_kind" value="manual" id="manual_radio">\n        <span class="uppercase-title">');
    
      __out.push(__sanitize(t('onboarding.management.pin.manual')));
    
      __out.push('</span>\n      </label>\n      <span class="grey-indication" id="weak_pins">');
    
      __out.push(__sanitize(t('onboarding.management.pin.please_note')));
    
      __out.push(' ');
    
      __out.push(__sanitize(t('onboarding.management.pin.warning_weak_pin_codes')));
    
      __out.push('</span>\n    </div>\n  </div>\n  <div class="navigation-container">\n    <a class="back" href="#navigateRoot" id="back_button"><i class="fa fa-angle-left"></i> ');
    
      __out.push(__sanitize(t('onboarding.management.cancel')));
    
      __out.push('</a>\n    <a class="continue" href="#navigateContinue" id="continue_button">');
    
      __out.push(__sanitize(t('onboarding.management.continue')));
    
      __out.push(' <i class="fa fa-angle-right"></i></a>\n  </div>\n</div>');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
};
