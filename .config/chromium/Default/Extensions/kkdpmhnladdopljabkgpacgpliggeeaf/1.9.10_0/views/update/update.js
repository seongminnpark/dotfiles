if (!window.JST) {
  window.JST = {};
}
window.JST["update/update"] = function (__obj) {
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
      __out.push('<div id="content_container">\n  <div id="title_container">\n    <div class="page-title">');
    
      __out.push(__sanitize(t('update.common.firmware_update')));
    
      __out.push('</div>\n    <div id="page_subtitle" class="page-subtitle"></div>\n  </div>\n  <div id="dynamic_container">\n    <div id="left_navigation">\n      <a id="previous_button" class="back" href="#navigatePrevious" style="display: none;"></a>\n    </div>\n    <div id="navigation_controller_content"></div>\n    <div id="right_navigation">\n      <a id="next_button" class="continue" href="#navigateNext" style="display: none;"></a>\n    </div>\n  </div>\n  <div id="empty_container"></div>\n</div>');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
};
