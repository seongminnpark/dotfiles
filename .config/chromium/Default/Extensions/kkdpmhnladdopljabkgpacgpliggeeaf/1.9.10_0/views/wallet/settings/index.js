if (!window.JST) {
  window.JST = {};
}
window.JST["wallet/settings/index"] = function (__obj) {
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
      __out.push('<section id="settings_index_dialog">\n  <header>\n    <h1>');
    
      __out.push(__sanitize(t('wallet.settings.common.settings')));
    
      __out.push('</h1>\n  </header>\n  <div class="sections-container">\n    <a class="panel" href="#openDisplay">\n      <i class="fa fa-desktop"></i>\n      <div class="uppercase-action">');
    
      __out.push(__sanitize(t('wallet.settings.common.display')));
    
      __out.push('</div>\n    </a>\n    <a class="panel" href="#openBitcoin">\n      <i class="fa fa-globe"></i>\n      <div class="uppercase-action">');
    
      __out.push(__sanitize(t('wallet.settings.common.coin')));
    
      __out.push('</div>\n    </a>\n    <a class="panel" href="#openHardware">\n      <i class="fa fa-rocket"></i>\n      <div class="uppercase-action">');
    
      __out.push(__sanitize(t('wallet.settings.common.hardware')));
    
      __out.push('</div>\n    </a>\n    <a class="panel" href="#openApps">\n      <i class="fa fa-th"></i>\n      <div class="uppercase-action">');
    
      __out.push(__sanitize(t('wallet.settings.common.apps')));
    
      __out.push('</div>\n    </a>\n    <a class="panel" href="#openTools">\n      <i class="fa fa-wrench"></i>\n      <div class="uppercase-action">');
    
      __out.push(__sanitize(t('wallet.settings.common.tools')));
    
      __out.push('</div>\n    </a>\n    <a id="chain" class="panel" href="/wallet/switch/chains">\n      <i class="fa fa-chain"></i>\n      <div class="uppercase-action">');
    
      __out.push(__sanitize(t('wallet.settings.common.forks')));
    
      __out.push('</div>\n    </a>\n  </div>\n</section>\n<div class="dialog-actions-bar">\n  <div class="uppercase-action">');
    
      __out.push(__sanitize(_.str.sprintf(t('wallet.settings.common.version'), ledger.managers.application.stringVersion())));
    
      __out.push('</div>\n  <div class="left-spacer"></div>\n  <a class="cancel-rounded-button" href="#dismiss">');
    
      __out.push(__sanitize(t('common.close')));
    
      __out.push('</a>\n</div>');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
};
