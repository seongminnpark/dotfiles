if (!window.JST) {
  window.JST = {};
}
window.JST["update/cardcheck"] = function (__obj) {
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
    
      __out.push(t('update.cardcheck.make_sure'));
    
      __out.push('</div>\n  <div class="page-indication">');
    
      __out.push(t('update.cardcheck.four_characters'));
    
      __out.push('</div>\n  <div class="security-container">\n    <div class="labels">\n      <div class="label very-light">1</div>\n      <div class="label light">2</div>\n      <div class="label">3</div>\n      <div class="label">4</div>\n      <div class="label">5</div>\n      <div class="label">6</div>\n      <div class="label light">7</div>\n      <div class="label very-light">8</div>\n    </div>\n    <div class="values">\n      <div class="value very-light"></div>\n      <div class="value light"></div>\n      <div id="value1" class="value"></div>\n      <div id="value2" class="value"></div>\n      <div id="value3" class="value"></div>\n      <div id="value4" class="value"></div>\n      <div class="value light"></div>\n      <div class="value very-light"></div>\n    </div>\n  </div>\n</div>');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
};
