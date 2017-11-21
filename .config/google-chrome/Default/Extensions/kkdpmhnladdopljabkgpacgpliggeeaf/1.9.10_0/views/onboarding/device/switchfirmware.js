if (!window.JST) {
  window.JST = {};
}
window.JST["onboarding/device/switchfirmware"] = function (__obj) {
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
      __out.push('<div id="content-container">\n  <div class="logo-container">\n    <img src="../../assets/images/onboarding/large_logo.png" width="191" height="96">\n  </div>\n  <div id="progress_container" class="greyed-container">\n    <div class="black-indication">');
    
      __out.push(__sanitize(this.params.mode === 'setup' ? t('onboarding.device.switchfirmware.preparing') : t('onboarding.device.switchfirmware.finalizing')));
    
      __out.push('</div>\n    <div class="progress-container">\n      <div id="bar_container"></div>\n      <div id="progress" class="percent page-indication">0%</div>\n    </div>\n    <p class="medium-indication">');
    
      __out.push(__sanitize(t('onboarding.device.switchfirmware.do_not_unplug')));
    
      __out.push('</p>\n  </div>\n  <div id="plug_container" class="greyed-container" style="display: none;">\n    <img src="../assets/images/common/plug_wallet.png" height="44" width="187"/>\n    <div class="black-indication">');
    
      __out.push(__sanitize(t('onboarding.device.switchfirmware.plug')));
    
      __out.push('</div>\n    <a href="#openSupport" class="medium-indication">');
    
      __out.push(__sanitize(t('onboarding.device.plug.is_not_recognized')));
    
      __out.push('</a>\n  </div>\n  <div id="unplug_container" class="greyed-container" style="display: none;">\n    <img src="../assets/images/common/unplug_wallet.png" height="44" width="187"/>\n    <div class="black-indication">');
    
      __out.push(__sanitize(t('onboarding.device.switchfirmware.unplug')));
    
      __out.push('</div>\n    <p class="medium-indication">');
    
      __out.push(__sanitize(t('onboarding.device.switchfirmware.unplug_information')));
    
      __out.push('</p>\n  </div>\n</div>\n');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
};
