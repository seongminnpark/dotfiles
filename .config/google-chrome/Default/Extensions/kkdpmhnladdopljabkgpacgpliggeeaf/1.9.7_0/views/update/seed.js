if (!window.JST) {
  window.JST = {};
}
window.JST["update/seed"] = function (__obj) {
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
      __out.push('<div id="view_controller_content">\n  <div class="page-large-indication">');
    
      __out.push(t('update.seed.enter_characters'));
    
      __out.push('</div>\n  <div class="page-indication">');
    
      __out.push(t('update.seed.on_the_left'));
    
      __out.push('</div>\n  <div class="seed_container">\n    <div class="spacer left">\n      <a id="open_scanner_button" class="cancel-rounded-button"><i class="fa fa-camera"></i></a>\n    </div>\n    <div class="seed"></div>\n    <textarea id="seed_input" spellcheck="false" maxlength="80"></textarea>\n    <div class="spacer right">\n      <img id="valid_check" src="../assets/images/common/large_check.png" width="30" height="30" />\n    </div>\n  </div>\n</div>');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
};
