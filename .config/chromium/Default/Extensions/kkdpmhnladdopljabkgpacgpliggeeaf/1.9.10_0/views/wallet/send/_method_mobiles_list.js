if (!window.JST) {
  window.JST = {};
}
window.JST["wallet/send/_method_mobiles_list"] = function (__obj) {
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
      var i, mobilesGroup, _i, _len, _ref;
    
      __out.push('<div id="mobile_table" class="large-table">\n  <div class="header ');
    
      if (this.mobilesGroups.length > 0) {
        __out.push(__sanitize("top"));
      }
    
      __out.push('">\n    <div class="uppercase-section-column stretchable">');
    
      __out.push(__sanitize(t('wallet.send.method.mobile_phone')));
    
      __out.push('</div>\n    <a class="uppercase-action" href="#pairMobilePhone"><i class="fa fa-plus"></i>');
    
      __out.push(__sanitize(t('wallet.send.method.pair_a_mobile_phone')));
    
      __out.push('</a>\n  </div>\n  ');
    
      _ref = this.mobilesGroups;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        mobilesGroup = _ref[i];
        __out.push('\n  <a class="row ');
        if (i === this.mobilesGroups.length - 1) {
          __out.push(__sanitize("bottom"));
        } else {
          __out.push(__sanitize("middle"));
        }
        __out.push('" href="#selectMobileGroup(index=');
        __out.push(__sanitize(i));
        __out.push(')">\n    <div class="light-grey-icon-large"><i class="fa fa-mobile"></i></div>\n    <div class="regular-text-small stretchable">');
        __out.push(__sanitize(mobilesGroup[0].name));
        __out.push('</div>\n    <div class="regular-grey-text-small">\n      ');
        if (mobilesGroup.length > 1) {
          __out.push('\n      ');
          __out.push(__sanitize(_.str.sprintf(t('wallet.send.method.multiple_paired_devices'), mobilesGroup.length)));
          __out.push('\n      ');
        } else {
          __out.push('\n      ');
          __out.push(__sanitize(_.str.sprintf(t('wallet.send.method.single_paired_device'), mobilesGroup.length)));
          __out.push('\n      ');
        }
        __out.push('\n    </div>\n    <div class="regular-grey-text"><i class="fa fa-angle-right"></i></div>\n  </a>\n  ');
      }
    
      __out.push('\n</div>');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
};
