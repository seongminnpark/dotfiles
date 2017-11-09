if (!window.JST) {
  window.JST = {};
}
window.JST["wallet/accounts/_operations_table"] = function (__obj) {
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
      var operation, _i, _len, _ref;
    
      if (this.operations.length > 0) {
        __out.push('\n<thead>\n<tr>\n    <td class="fit-content">');
        __out.push(__sanitize(t('wallet.defaults.operations.time')));
        __out.push('</td>\n    ');
        if (this.showAccounts === true) {
          __out.push('\n      <td class="fit-content">');
          __out.push(__sanitize(t('wallet.defaults.operations.account')));
          __out.push('</td>\n    ');
        }
        __out.push('\n    <td class="fit-content align-right padding-right-very-small"></td>\n    <td class="stretch-content">');
        __out.push(__sanitize(_.str.sprintf(t('wallet.defaults.operations.bitcoin_address'), _.str.capitalize(ledger.config.network.display_name))));
        __out.push('</td>\n    <td></td>\n  ');
        if (ledger.preferences.instance.isCurrencyActive()) {
          __out.push('\n      <td class="fit-content align-right padding-right-medium">');
          __out.push(__sanitize(t('wallet.defaults.operations.countervalue')));
          __out.push('</td>\n  ');
        }
        __out.push('\n  <td class="fit-content align-right">');
        __out.push(__sanitize(t('wallet.defaults.operations.amount')));
        __out.push('</td>\n</tr>\n</thead>\n<tbody>\n');
        _ref = this.operations;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          operation = _ref[_i];
          __out.push('\n<tr class="');
          __out.push(__sanitize(this.operations[this.operations.length - 1] === operation ? 'no-border' : void 0));
          __out.push('"\n    data-href="#showOperation(operationId=');
          __out.push(__sanitize(operation.getId()));
          __out.push(')">\n    <td class="fit-content regular-grey-text">');
          __out.push(__sanitize(ledger.i18n.formatDateTime(new Date(operation.get('time')))));
          __out.push('</td>\n    ');
          if (this.showAccounts === true) {
            __out.push('\n      <td class="fit-content regular-text">\n        <i class="fa fa-circle small-dot" style="color: ');
            __out.push(__sanitize(operation.get('account').get('color')));
            __out.push('"></i>\n        <span>');
            __out.push(__sanitize(operation.get('account').get('name')));
            __out.push('</span>\n      </td>\n    ');
          }
          __out.push('\n    <td class="fit-content align-right padding-right-very-small regular-grey-text-small">');
          __out.push(__sanitize(operation.get('type') === 'reception' ? t('wallet.defaults.operations.sender') : t('wallet.defaults.operations.receiver')));
          __out.push('</td>\n    <td class="stretch-content regular-text-small selectable">\n        ');
          __out.push(__sanitize(operation.get('type') === 'reception' ? operation.get('senders')[0] || 'coinbase' : operation.get('recipients')[0] || 'coinbase'));
          __out.push('\n    </td>\n    <td class="fit-content regular-grey-text-small">');
          __out.push(__sanitize(!ledger.preferences.instance.isConfirmationCountReached(operation.get('confirmations')) ? t('wallet.defaults.operations.unconfirmed').toLowerCase() : void 0));
          __out.push('</td>\n    ');
          if (ledger.preferences.instance.isCurrencyActive()) {
            __out.push('\n      <td class="fit-content align-right padding-right-medium regular-grey-text" data-countervalue="');
            __out.push(__sanitize(operation.get('type') === 'reception' ? '+' : '-'));
            __out.push(__sanitize(operation.get('total_value')));
            __out.push('"></td>\n    ');
          }
          __out.push('\n    ');
          if (operation.get('type') === 'reception') {
            __out.push('\n      <td class="fit-content align-right regular-valid-text">\n        ');
            __out.push(__sanitize(ledger.formatters.symbolIsFirst() ? ledger.formatters.getUnitSymbol() + ' ' : void 0));
            __out.push('+');
            __out.push(__sanitize(ledger.formatters.fromValue(operation.get('total_value'))));
            __out.push(__sanitize(!ledger.formatters.symbolIsFirst() ? ' ' + ledger.formatters.getUnitSymbol() : void 0));
            __out.push('\n      </td>\n    ');
          } else {
            __out.push('\n      <td class="fit-content align-right regular-invalid-text">\n        ');
            __out.push(__sanitize(ledger.formatters.symbolIsFirst() ? ledger.formatters.getUnitSymbol() + ' ' : void 0));
            __out.push('-');
            __out.push(__sanitize(ledger.formatters.fromValue(operation.get('total_value'))));
            __out.push(__sanitize(!ledger.formatters.symbolIsFirst() ? ' ' + ledger.formatters.getUnitSymbol() : void 0));
            __out.push('\n      </td>\n    ');
          }
          __out.push('\n</tr>\n');
        }
        __out.push('\n</tbody>\n');
      }
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
};
