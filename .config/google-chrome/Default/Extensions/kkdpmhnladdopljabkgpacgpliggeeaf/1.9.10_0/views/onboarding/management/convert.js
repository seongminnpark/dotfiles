if (!window.JST) {
  window.JST = {};
}
window.JST["onboarding/management/convert"] = function (__obj) {
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
    
      __out.push(__sanitize(t('onboarding.management.recover_my_wallet')));
    
      __out.push('</div>\n      <div class="page-subtitle">');
    
      __out.push(__sanitize(t('application.name')));
    
      __out.push('</div>\n    </div>\n  </div>\n  <div class="page-content-container compact">\n    <div class="text-container">\n      <div class="page-large-indication">');
    
      __out.push(__sanitize(t('onboarding.management.convert.need_to_convert')));
    
      __out.push('</div>\n      <div class="regular-text">');
    
      __out.push(__sanitize(t('onboarding.management.convert.before_starting')));
    
      __out.push('</div>\n      <div class="regular-grey-text-small">');
    
      __out.push(__sanitize(t('onboarding.management.convert.example_from_' + this.params.message_mode)));
    
      __out.push('</div>\n      <div class="grey-indication-strong">');
    
      __out.push(__sanitize(t('onboarding.management.convert.please_take_time')));
    
      __out.push('</div>\n    </div>\n    <div class="image-container">\n      <div class="container ');
    
      __out.push(__sanitize(this.params.message_mode));
    
      __out.push('">\n        <div class="sheet-title current">');
    
      __out.push(__sanitize(t('onboarding.management.convert.current_24_words')));
    
      __out.push('</div>\n        <div class="sheet-title new">');
    
      __out.push(__sanitize(t('onboarding.management.convert.new_recovery_sheet')));
    
      __out.push('</div>\n        <img src="../assets/images/onboarding/management/convert_from_');
    
      __out.push(__sanitize(this.params.message_mode));
    
      __out.push('.png" height="100%" />\n      </div>\n    </div>\n  </div>\n  <div class="navigation-container">\n    <a class="back" href="#navigateRoot" id="back_button"><i class="fa fa-angle-left"></i> ');
    
      __out.push(__sanitize(t('onboarding.management.cancel')));
    
      __out.push('</a>\n    <a class="continue" href="#navigateContinue" id="continue_button">');
    
      __out.push(__sanitize(t('onboarding.management.continue')));
    
      __out.push(' <i class="fa fa-angle-right"></i></a>\n  </div>\n</div>');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
};
