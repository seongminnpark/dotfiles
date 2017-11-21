if (!window.JST) {
  window.JST = {};
}
window.JST["wallet/accounts/_accounts_list"] = function (__obj) {
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
      var account, _i, _len, _ref;
    
      _ref = this.accounts;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        account = _ref[_i];
        __out.push('\n  <a href="/wallet/accounts/');
        __out.push(__sanitize(account.index));
        __out.push('/show" class="panel freeform">\n    <i class="fa fa-circle small-dot" style="color: ');
        __out.push(__sanitize(account.color));
        __out.push('"></i>\n    <div class="regular-text name">');
        __out.push(__sanitize(account.name));
        __out.push('</div>\n    <div class="balance">\n      ');
        if (ledger.formatters.symbolIsFirst()) {
          __out.push('\n      <div class="regular-text">');
          __out.push(__sanitize(ledger.formatters.getUnitSymbol()));
          __out.push('&nbsp;</div>\n      <div class="bold-regular-text">');
          __out.push(__sanitize(ledger.formatters.fromValue(account.balance)));
          __out.push('</div>\n      ');
        } else {
          __out.push('\n      <div class="bold-regular-text">');
          __out.push(__sanitize(ledger.formatters.fromValue(account.balance)));
          __out.push('</div>\n      <div class="regular-text">&nbsp;');
          __out.push(__sanitize(ledger.formatters.getUnitSymbol()));
          __out.push('</div>\n      ');
        }
        __out.push('\n    </div>\n    ');
        if (ledger.preferences.instance.isCurrencyActive()) {
          __out.push('\n    <div class="regular-grey-text countervalue" data-countervalue="');
          __out.push(__sanitize(account.balance));
          __out.push('"></div>\n    ');
        }
        __out.push('\n    <i class="fa fa-angle-right regular-grey-text arrow"></i>\n  </a>\n');
      }
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
};
