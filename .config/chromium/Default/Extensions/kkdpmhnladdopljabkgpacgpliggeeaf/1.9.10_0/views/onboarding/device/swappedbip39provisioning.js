if (!window.JST) {
  window.JST = {};
}
window.JST["onboarding/device/swappedbip39provisioning"] = function (__obj) {
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
      __out.push('<div id="content-container">\n<div class="logo-container">\n  <img src="../../assets/images/onboarding/large_logo.png" width="191" height="96">\n</div>\n<div class="greyed-container">\n  <div id="circle_progress_bar"></div>\n  <div class="text-container">\n    <p class="black-indication">');
    
      __out.push(__sanitize(t('onboarding.device.swappedbip39provisioning.in_progress')));
    
      __out.push('</p>\n    <p class="medium-indication almost-small-top-margin">');
    
      __out.push(__sanitize(t('common.may_take_a_while')));
    
      __out.push('</p>\n  </div>\n</div>\n<div class="actions-container">\n  <div class="carousel">\n  </div>\n</div>\n</div>');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
};
