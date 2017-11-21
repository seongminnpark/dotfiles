if (!window.JST) {
  window.JST = {};
}
window.JST["common/dialogs/confirmation"] = function (__obj) {
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
      __out.push('<section id="dialogs_confirmation_dialog" ');
    
      if (this.restrainsDialogWidth === false) {
        __out.push('style="max-width: none"');
      }
    
      __out.push('>\n  <div class="spacer"></div>\n  <div class="content-container">\n    <img src="../assets/images/common/large_question.png" width="50" height="50" />\n    <div class="uppercase-section-title">');
    
      __out.push(__sanitize(t(this.titleLocalizableKey)));
    
      __out.push('</div>\n    <div class="regular-text-small">');
    
      __out.push(this.message != null ? this.message : t(this.messageLocalizableKey));
    
      __out.push('</div>\n    <div class="dialog-actions-bar">\n      <div class="left-spacer"></div>\n      ');
    
      if (this.showsCancelButton === true) {
        __out.push('\n        <a href="#clickCancel" class="cancel-rounded-button">');
        __out.push(__sanitize(t(this.cancelLocalizableKey)));
        __out.push('</a>\n      ');
      }
    
      __out.push('\n      <a href="#clickNegative" class="cancel-rounded-button">');
    
      __out.push(this.negativeText != null ? this.negativeText : t(this.negativeLocalizableKey));
    
      __out.push('</a>\n      <a href="#clickPositive" class="action-rounded-button">');
    
      __out.push(this.positiveText != null ? this.positiveText : t(this.positiveLocalizableKey));
    
      __out.push('</a>\n      <div class="right-spacer"></div>\n    </div>\n  </div>\n  <div class="spacer"></div>\n</section>');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
};
