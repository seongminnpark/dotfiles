if (!window.JST) {
  window.JST = {};
}
window.JST["common/dialogs/message"] = function (__obj) {
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
      __out.push('<section id="dialogs_message_dialog">\n  <div class="spacer"></div>\n  <div class="content-container">\n    <img src="../assets/images/common/large_');
    
      __out.push(__sanitize(this.params.kind));
    
      __out.push('.png" width="50" height="50" />\n    <div class="uppercase-section-title">');
    
      __out.push(__sanitize(this.params.title));
    
      __out.push('</div>\n    <div class="regular-text-small">');
    
      __out.push(this.params.subtitle);
    
      __out.push('</div>\n    <a href="#dismiss" class="cancel-rounded-button">');
    
      __out.push(__sanitize(t("common.close")));
    
      __out.push('</a>\n  </div>\n  <div class="spacer"></div>\n</section>');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
};
