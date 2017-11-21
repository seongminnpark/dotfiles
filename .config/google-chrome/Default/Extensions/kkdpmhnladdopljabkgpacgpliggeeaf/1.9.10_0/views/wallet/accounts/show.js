if (!window.JST) {
  window.JST = {};
}
window.JST["wallet/accounts/show"] = function (__obj) {
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
      __out.push('<section id="account">\n  <header>\n    <i class="fa fa-circle small-dot" id="color_circle"></i>\n    <h1 id="account_name"></h1>\n  </header>\n  <table>\n    <thead>\n      <tr>\n        <td class="fit-content" id="confirmed_balance_subtitle">');
    
      __out.push(__sanitize(t('wallet.defaults.operations.balance')));
    
      __out.push('</td>\n        <td class="fit-content countervalue-balance" id="countervalue_balance_subtitle">');
    
      __out.push(__sanitize(t('wallet.defaults.operations.countervalue')));
    
      __out.push('</td>\n        <td class="align-right">');
    
      __out.push(__sanitize(t('wallet.accounts.show.actions')));
    
      __out.push('</td>\n      </tr>\n    </thead>\n    <tbody>\n      <tr class="no-border">\n        <td class="fit-content" id="confirmed_balance_container"><span class="price" id="confirmed_balance">0</span><span class="btc-acronyme"> ');
    
      __out.push(__sanitize(ledger.formatters.getUnitSymbol()));
    
      __out.push('</span></td>\n        <td class="fit-content countervalue-balance" id="countervalue_balance_container"><span id="countervalue_balance">0</span></td>\n        <td class="align-right">\n          <div class="action-bar">\n            <div class="left-spacer"></div>\n            <a class="action-rounded-button" href="/wallet/send/index?account_id=');
    
      __out.push(__sanitize(this._getAccount().get('index')));
    
      __out.push('">');
    
      __out.push(__sanitize(t('common.send')));
    
      __out.push('</a>\n            <a class="action-rounded-button" href="/wallet/receive/index?account_id=');
    
      __out.push(__sanitize(this._getAccount().get('index')));
    
      __out.push('">');
    
      __out.push(__sanitize(t('common.receive')));
    
      __out.push('</a>\n          </div>\n        </td>\n      </tr>\n    </tbody>\n  </table>\n</section>\n<section id="operations">\n  <header>\n    <h1>');
    
      __out.push(__sanitize(t('wallet.accounts.show.last_operations')));
    
      __out.push('</h1>\n  </header>\n  <div class="empty-container" id="empty_container">');
    
      __out.push(__sanitize(t('wallet.defaults.operations.no_operations')));
    
      __out.push('</div>\n  <table id="operations_list"></table>\n</section>');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
};
