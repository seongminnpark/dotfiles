if (!window.JST) {
  window.JST = {};
}
window.JST["update/updating"] = function (__obj) {
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
      __out.push('<div id="view_controller_content">\n  <img src="../assets/images/update/skyrocket.png" width="50" height="50" />\n  <div class="page-large-indication">');
    
      __out.push(t('update.updating.wallet_is_ready'));
    
      __out.push('</div>\n  <div class="page-indication">');
    
      __out.push(__sanitize(_.str.sprintf(t('update.updating.clicking_continue'), this.dongleVersion, this.targetVersion)));
    
      __out.push('</div>\n  <div id="keycard-erasure-section" class="regular-grey-text-small"><a href="/update/seed?redirect_to_updating=true">');
    
      __out.push(__sanitize(t('update.updating.change_security_card')));
    
      __out.push('</a></div>\n</div>');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
};
