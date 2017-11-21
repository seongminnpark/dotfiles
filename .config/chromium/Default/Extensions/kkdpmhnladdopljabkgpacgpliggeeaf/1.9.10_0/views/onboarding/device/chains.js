if (!window.JST) {
  window.JST = {};
}
window.JST["onboarding/device/chains"] = function (__obj) {
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
      var chain, i, _i, _len, _ref;
    
      __out.push('<div id="content-container">\n  <div class="logo-container">\n    <img src="../../assets/images/onboarding/large_logo.png" width="191" height="96">\n  </div>\n  <div class="greyed-container">\n    <div class="black-indication">');
    
      __out.push(__sanitize(t('onboarding.device.chains.title')));
    
      __out.push('</div>\n    <p class="medium-indication">');
    
      __out.push(t('onboarding.device.chains.message1'));
    
      __out.push('<p>\n    <p class="medium-indication">');
    
      __out.push(t('onboarding.device.chains.message2'));
    
      __out.push('<p>\n    <p class="medium-indication">');
    
      __out.push(t('onboarding.device.chains.message3'));
    
      __out.push('<p>\n    <p class="medium-indication"><b>');
    
      __out.push(t('onboarding.device.chains.message4'));
    
      __out.push('</b><p>\n    <div class="chain-selector">\n      ');
    
      _ref = this.networks;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        chain = _ref[i];
        __out.push('\n        ');
        if (chain.name !== "bitcoin_cash_split" && chain.name !== "bitcoin_recover" && chain.name !== "bitcoin_segwit") {
          __out.push('\n          <a id="');
          __out.push(__sanitize(chain.ticker));
          __out.push('"\n            class="choice ');
          if (chain.greyed === true) {
            __out.push('\n              cancel-rounded-button\n            ');
          } else {
            __out.push('\n              action-rounded-button\n            ');
          }
          __out.push('"\n            value=');
          __out.push(__sanitize(i));
          __out.push('>\n            ');
          if (chain.ticker === "abc") {
            __out.push('\n              bitcoin cash\n            ');
          } else {
            __out.push('\n              ');
            __out.push(__sanitize(chain.chain));
            __out.push('\n            ');
          }
          __out.push('\n          </a>\n        ');
        }
        __out.push('\n      ');
      }
    
      __out.push('\n    </div>\n    <label><input type="checkbox" id="remember" value="True" name=""> Remember my choice </input></label>\n  </div>\n  <div class="actions-container">\n    <a id="help" href="#openHelpCenter" class="greyed-action medium-indication">');
    
      __out.push(__sanitize(t('onboading.common.help')));
    
      __out.push('</a>\n  </div>\n</div>\n');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
};
