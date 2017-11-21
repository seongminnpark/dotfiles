if (!window.JST) {
  window.JST = {};
}
window.JST["wallet/dialogs/addaccount"] = function (__obj) {
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
      var account, index, _i, _len, _ref;
    
      __out.push('<section id="dialogs_addaccount_dialog">\n  <header>\n    <h1>');
    
      __out.push(__sanitize(t('wallet.dialogs.addaccount.add_an_account')));
    
      __out.push('</h1>\n  </header>\n  ');
    
      if (Account.isAbleToCreateAccount()) {
        __out.push('\n  <div class="large-table">\n    <div class="header top">\n      <div class="uppercase-section-column stretchable">');
        __out.push(__sanitize(t('wallet.dialogs.addaccount.new_account')));
        __out.push('</div>\n    </div>\n    <div class="row middle">\n      <div class="regular-text-small stretchable">');
        __out.push(__sanitize(t('wallet.dialogs.addaccount.name')));
        __out.push('</div>\n      <input class="small-text-input" placeholder="');
        __out.push(__sanitize(t('wallet.dialogs.addaccount.account_name')));
        __out.push('" value="" id="account_name_input" maxlength="30" />\n    </div>\n    <div class="row bottom">\n      <div class="regular-text-small stretchable">');
        __out.push(__sanitize(t('wallet.dialogs.addaccount.color')));
        __out.push('</div>\n      <div class="small-grey-select">\n        <select id="colors_select"></select>\n      </div>\n      <i class="fa fa-square medium-square" id="color_square"></i>\n    </div>\n  </div>\n  ');
      }
    
      __out.push('\n  ');
    
      if (this.hiddenAccounts.length > 0) {
        __out.push('\n    <div class="large-table" id="hidden_accounts_table">\n      <div class="header top">\n        <div class="uppercase-section-column stretchable">');
        __out.push(__sanitize(t('wallet.dialogs.addaccount.hidden_accounts')));
        __out.push('</div>\n      </div>\n      ');
        _ref = this.hiddenAccounts;
        for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
          account = _ref[index];
          __out.push('\n        <div class="row ');
          if (index + 1 < this.hiddenAccounts.length) {
            __out.push('bottom');
          } else {
            __out.push('middle');
          }
          __out.push('">\n          <i class="fa fa-circle small-dot" style="color: ');
          __out.push(__sanitize(account.color));
          __out.push('"></i>\n          <div class="regular-text-small stretchable">');
          __out.push(__sanitize(account.name));
          __out.push('</div>\n          <div class="regular-grey-text-small">');
          __out.push(__sanitize(ledger.formatters.symbolIsFirst() ? ledger.formatters.getUnitSymbol() : void 0));
          __out.push(' ');
          __out.push(__sanitize(ledger.formatters.fromValue(account.balance)));
          __out.push(__sanitize(!ledger.formatters.symbolIsFirst() ? ' ' + ledger.formatters.getUnitSymbol() : void 0));
          __out.push('</div>\n          <a href="#showAccount(id=');
          __out.push(__sanitize(account.index));
          __out.push(')" class="small-action-rounded-button">');
          __out.push(__sanitize(t('common.show')));
          __out.push('</a>\n        </div>\n      ');
        }
        __out.push('\n    </div>\n  ');
      }
    
      __out.push('\n  <div id="error_container"></div>\n</section>\n<div class="dialog-actions-bar">\n  <div class="left-spacer"></div>\n  <a href="#dismiss" class="cancel-rounded-button">');
    
      __out.push(__sanitize(t('common.cancel')));
    
      __out.push('</a>\n  <a href="#addAccount" class="action-rounded-button">');
    
      __out.push(__sanitize(t('common.add')));
    
      __out.push('</a>\n</div>');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
};
