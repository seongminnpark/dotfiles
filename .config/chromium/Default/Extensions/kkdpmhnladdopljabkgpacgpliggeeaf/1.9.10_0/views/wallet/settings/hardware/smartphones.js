if (!window.JST) {
  window.JST = {};
}
window.JST["wallet/settings/hardware/smartphones"] = function (__obj) {
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
      var i, smartphonesGroup, _i, _len, _ref;
    
      __out.push('<div class="large-table">\n  <div class="header ');
    
      if (this._smartphonesGroups.length > 0) {
        __out.push(__sanitize("top"));
      }
    
      __out.push('">\n    <div class="uppercase-section-column stretchable">');
    
      __out.push(__sanitize(t('wallet.settings.hardware.paired_smartphones')));
    
      __out.push('</div>\n    <a class="uppercase-action" href="#pairSmartphone"><i class="fa fa-plus"></i>');
    
      __out.push(__sanitize(t('wallet.settings.hardware.pair_a_smartphone')));
    
      __out.push('</a>\n  </div>\n  ');
    
      _ref = this._smartphonesGroups;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        smartphonesGroup = _ref[i];
        __out.push('\n  <div class="row ');
        if (i === this._smartphonesGroups.length - 1) {
          __out.push(__sanitize("bottom"));
        } else {
          __out.push(__sanitize("middle"));
        }
        __out.push('">\n    <div class="light-grey-icon-large"><i class="fa fa-mobile"></i></div>\n    <div class="regular-text-small stretchable">');
        __out.push(__sanitize(smartphonesGroup[0].name));
        __out.push('</div>\n    <div class="regular-grey-text-small">\n      ');
        if (smartphonesGroup.length > 1) {
          __out.push('\n          ');
          __out.push(__sanitize(_.str.sprintf(t('wallet.settings.hardware.multiple_paired_devices'), smartphonesGroup.length)));
          __out.push('\n      ');
        } else {
          __out.push('\n          ');
          __out.push(__sanitize(_.str.sprintf(t('wallet.settings.hardware.single_paired_device'), smartphonesGroup.length)));
          __out.push('\n      ');
        }
        __out.push('\n    </div>\n    <a class="light-grey-icon-medium" href="#removeSmartphoneGroup(index=');
        __out.push(__sanitize(i));
        __out.push(')"><i class="fa fa-trash"></i></a>\n  </div>\n  ');
      }
    
      __out.push('\n</div>');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
};
