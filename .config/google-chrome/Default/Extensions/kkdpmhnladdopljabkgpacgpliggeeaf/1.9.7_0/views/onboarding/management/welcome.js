if (!window.JST) {
  window.JST = {};
}
window.JST["onboarding/management/welcome"] = function (__obj) {
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
    
      __out.push(__sanitize(t('onboarding.management.welcome.new_wallet')));
    
      __out.push('</div>\n      <div class="page-subtitle">');
    
      __out.push(__sanitize(t('application.name')));
    
      __out.push('</div>\n      <div class="page-strong-indication">');
    
      __out.push(__sanitize(t('onboarding.management.welcome.welcome_to_your_new_wallet')));
    
      __out.push('</div>\n      <div class="page-indication">');
    
      __out.push(__sanitize(t('onboarding.management.welcome.create_or_recover')));
    
      __out.push('</div>\n    </div>\n  </div>\n  <a class="greyed-container detailed" href="#createNewWallet">\n    <img class="index" src="../../assets/images/onboarding/management/wallet_icon.png" width="40" height="40"/>\n    <div class="texts">\n      <div class="black-title">');
    
      __out.push(__sanitize(t('onboarding.management.welcome.use_as_new')));
    
      __out.push('</div>\n      <div class="black-indication">');
    
      __out.push(__sanitize(t('onboarding.management.welcome.if_its_your_first_wallet')));
    
      __out.push('</div>\n    </div>\n    <img class="arrow" src="../assets/images/onboarding/large_right_arrow.png" width="16" height="30"/>\n  </a>\n  <a class="greyed-container detailed" href="#restoreWallet">\n    <img class="index" src="../../assets/images/onboarding/management/restore_icon.png" width="40" height="40"/>\n    <div class="texts">\n      <div class="black-title">');
    
      __out.push(__sanitize(t('onboarding.management.welcome.recover_wallet')));
    
      __out.push('</div>\n      <div class="black-indication">');
    
      __out.push(__sanitize(_.str.sprintf(t('onboarding.management.welcome.if_you_lost_your_wallet'), ledger.config.network.plural)));
    
      __out.push('</div>\n    </div>\n    <img class="arrow" src="../assets/images/onboarding/large_right_arrow.png" width="16" height="30"/>\n  </a>\n</div>');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
};
