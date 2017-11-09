if (!window.JST) {
  window.JST = {};
}
window.JST["spec/_suite_node"] = function (__obj) {
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
      __out.push('<div ');
    
      if (this.isSuite) {
        __out.push('style="margin-top: 5px"');
      }
    
      __out.push('>\n  <span style="display: inline-block;width: ');
    
      __out.push(__sanitize(this.depth * 20));
    
      __out.push('px;height: 20px"></span>\n  <input type="checkbox" ');
    
      if (this.isSelected) {
        __out.push('checked');
      }
    
      __out.push(' data-href="#toggleSpec(id=');
    
      __out.push(__sanitize(this.id));
    
      __out.push(')" />\n  <a href="#runSpec(id=');
    
      __out.push(__sanitize(this.id));
    
      __out.push(')" class="action-link">');
    
      __out.push(__sanitize(this.name));
    
      __out.push('</a>\n</div>');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
};
