if (!window.JST) {
  window.JST = {};
}
window.JST["wallet/dialogs/operationdetail"] = function (__obj) {
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
      var input, output, _i, _j, _len, _len1, _ref, _ref1;
    
      __out.push('<section id="operation_detail_dialog">\n  <header>\n    <h1>');
    
      __out.push(__sanitize(t('wallet.dialogs.operationdetail.operation_detail')));
    
      __out.push('</h1>\n  </header>\n  <table class="no-table-head">\n    <tbody>\n      <tr>\n        <td class="row-title">');
    
      __out.push(__sanitize(t('wallet.defaults.operations.amount')));
    
      __out.push('</td>\n        ');
    
      if (this.operation.get('type') === 'reception') {
        __out.push('\n          <td class="align-right">\n            <span class="regular-valid-text">');
        __out.push(__sanitize(ledger.formatters.symbolIsFirst() ? ledger.formatters.getUnitSymbol() + ' ' : void 0));
        __out.push('+');
        __out.push(__sanitize(ledger.formatters.fromValue(this.operation.get('total_value'))));
        __out.push(__sanitize(!ledger.formatters.symbolIsFirst() ? ' ' + ledger.formatters.getUnitSymbol() : void 0));
        __out.push('</span>\n          </td>\n          ');
      } else {
        __out.push('\n          <td class="align-right">\n            <span class="regular-invalid-text">');
        __out.push(__sanitize(ledger.formatters.symbolIsFirst() ? ledger.formatters.getUnitSymbol() + ' ' : void 0));
        __out.push('-');
        __out.push(__sanitize(ledger.formatters.fromValue(this.operation.get('total_value'))));
        __out.push(__sanitize(!ledger.formatters.symbolIsFirst() ? ' ' + ledger.formatters.getUnitSymbol() : void 0));
        __out.push('</span>\n            <span class="regular-grey-text-small">');
        __out.push(__sanitize(_.str.sprintf(t('wallet.dialogs.operationdetail.transaction_fees_text'), ledger.formatters.formatValue(this.operation.get('fees')))));
        __out.push('</span>\n          </td>\n        ');
      }
    
      __out.push('\n      </tr>\n      ');
    
      if (ledger.preferences.instance.isCurrencyActive()) {
        __out.push('\n      <tr>\n        <td class="row-title">');
        __out.push(__sanitize(t('wallet.defaults.operations.countervalue')));
        __out.push('</td>\n        ');
        if (this.operation.get('type') === 'reception') {
          __out.push('\n          <td class="align-right">\n            <span class="regular-grey-text" data-countervalue="+');
          __out.push(__sanitize(this.operation.get('total_value')));
          __out.push('"></span>\n          </td>\n          ');
        } else {
          __out.push('\n          <td class="align-right">\n            <span class="regular-grey-text" data-countervalue="-');
          __out.push(__sanitize(this.operation.get('total_value')));
          __out.push('"></span>\n            <span class="regular-grey-text-small">');
          __out.push(__sanitize(_.str.sprintf(t('wallet.dialogs.operationdetail.transaction_fees_text'), ledger.converters.satoshiToCurrencyFormatted(this.operation.get('fees')))));
          __out.push('</span>\n          </td>\n        ');
        }
        __out.push('\n      </tr>\n      ');
      }
    
      __out.push('\n      <tr>\n        <td class="row-title">');
    
      __out.push(__sanitize(t('wallet.defaults.operations.account')));
    
      __out.push('</td>\n        <td class="align-right">\n          <i class="fa fa-circle small-dot" id="color_circle" style="color: ');
    
      __out.push(this.operation.get('account').get('color'));
    
      __out.push('"></i>');
    
      __out.push(this.operation.get('account').get('name'));
    
      __out.push('\n        </td>\n      </tr>\n      <tr>\n        <td class="row-title">');
    
      __out.push(__sanitize(t('wallet.defaults.operations.time')));
    
      __out.push('</td>\n        <td class="align-right">');
    
      __out.push(__sanitize(ledger.i18n.formatDateTime(new Date(this.operation.get('time')))));
    
      __out.push('</td>\n      </tr>\n      <tr>\n        <td class="row-title">');
    
      __out.push(__sanitize(t('wallet.defaults.operations.status')));
    
      __out.push('</td>\n        ');
    
      if (!ledger.preferences.instance.isConfirmationCountReached(this.operation.get('confirmations'))) {
        __out.push('\n          <td class="align-right regular-grey-text">\n            ');
        __out.push(__sanitize(t('wallet.defaults.operations.unconfirmed')));
        __out.push('\n            <span class="regular-grey-text-small">(');
        __out.push(__sanitize(this.operation.get('confirmations')));
        __out.push(')</span>\n          </td>\n        ');
      } else {
        __out.push('\n          <td class="align-right regular-valid-text">\n            ');
        __out.push(__sanitize(t('wallet.defaults.operations.confirmed')));
        __out.push('\n            <span class="regular-grey-text-small">(');
        __out.push(__sanitize(this.operation.get('confirmations')));
        __out.push(')</span>\n          </td>\n        ');
      }
    
      __out.push('\n      </tr>\n      <tr>\n        <td class="row-title top-aligned">');
    
      __out.push(__sanitize(t('wallet.defaults.operations.sender')));
    
      __out.push('</td>\n        <td class="align-right" id="operation_inputs">\n          ');
    
      _ref = this.operation.get('senders');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        input = _ref[_i];
        __out.push('\n          ');
        __out.push(__sanitize(input));
        __out.push('<br />\n          ');
      }
    
      __out.push('\n          ');
    
      if (this.operation.get('senders').length === 0) {
        __out.push('\n           coinbase\n          ');
      }
    
      __out.push('\n        </td>\n      </tr>\n      <tr>\n        <td class="row-title top-aligned">');
    
      __out.push(__sanitize(t('wallet.defaults.operations.receiver')));
    
      __out.push('</td>\n        <td class="align-right" id="operation_outputs">\n          ');
    
      _ref1 = this.operation.get('recipients');
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        output = _ref1[_j];
        __out.push('\n          ');
        __out.push(__sanitize(output));
        __out.push('<br />\n          ');
      }
    
      __out.push('\n        </td>\n      </tr>\n      <tr class="no-border">\n        <td class="row-title optional">');
    
      __out.push(__sanitize(t('wallet.defaults.operations.identifier')));
    
      __out.push('</td>\n        <td class="align-right regular-grey-text-small" id="operation_identifier">');
    
      __out.push(__sanitize(this.operation.get('hash')));
    
      __out.push('</td>\n      </tr>\n    </tbody>\n  </table>\n</section>\n<div class="dialog-actions-bar">\n  <a class="action-rounded-button" href="#openBlockchain"><i class="fa fa-search"></i></a>\n  <div class="left-spacer"></div>\n  <a class="cancel-rounded-button" href="#dismiss">');
    
      __out.push(__sanitize(t('common.close')));
    
      __out.push('</a>\n</div>\n');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
};
