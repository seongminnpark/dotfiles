if (!window.JST) {
  window.JST = {};
}
window.JST["wallet/send/index"] = function (__obj) {
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
      __out.push('<section id="send_index_dialog">\n  <header>\n    <h1>');
    
      __out.push(__sanitize(_.str.sprintf(t('wallet.send.common.send_bitcoins'), ledger.config.network.plural)));
    
      __out.push('</h1>\n  </header>\n  <table class="no-table-head">\n    <tbody>\n      <tr id="amount_row">\n        <td class="row-title">');
    
      __out.push(__sanitize(t('wallet.defaults.operations.amount')));
    
      __out.push('</td>\n        <td class="align-right">\n          <input id="amount_input" class="large-text-input" placeholder="');
    
      __out.push(__sanitize(t('wallet.defaults.operations.amount')));
    
      __out.push('" value=""/>\n          <label class="large-text-input">');
    
      __out.push(__sanitize(ledger.formatters.getUnitSymbol()));
    
      __out.push('</label>\n          <a id="max_button" tabindex="-1" class="medium-grey-rounded-button" href="#max">');
    
      __out.push(__sanitize(t('MAX')));
    
      __out.push('</a>\n          <div class="align-right regular-grey-text-small">\n            <p class="balance-label" id="currency_container">&nbsp;</p>\n          </div>\n        </td>\n      </tr>\n      <tr>\n        <td class="row-title">');
    
      __out.push(__sanitize(_.str.sprintf(t('wallet.send.index.receiver_address'), _.str.capitalize(ledger.config.network.display_name))));
    
      __out.push('</td>\n        <td class="align-right">\n          <input class="text-input" placeholder="');
    
      __out.push(__sanitize(_.str.sprintf(t('wallet.defaults.operations.bitcoin_address'), _.str.capitalize(ledger.config.network.display_name))));
    
      __out.push('" id="receiver_input" value=""/>\n        </td>\n      </tr>\n      <tr id="data_row">\n        <td class="row-title">');
    
      __out.push(__sanitize(t('wallet.defaults.operations.data')));
    
      __out.push('</td>\n        <td class="align-right">\n          <input class="text-input" id="data_input" value=""/>\n        </td>\n      </tr>\n      <tr>\n        <td class="row-title">');
    
      __out.push(__sanitize(t('wallet.send.index.account_to_debit')));
    
      __out.push('</td>\n        <td class="align-right">\n          <div class="regular-select">\n            <select id="accounts_select"></select>\n          </div>\n          <i class="fa fa-circle small-dot" id="color_square"></i>\n        </td>\n      </tr>\n      <tr>\n        <td class="row-title">');
    
      __out.push(__sanitize(t('wallet.defaults.operations.transaction_fees')));
    
      __out.push('</td>\n        <td class="align-right">\n          <div class="small-grey-select">\n            <select id="fees_select">\n            </select>\n          </div>\n        </td>\n      </tr>\n      <tr id="custom_fees_row">\n        <td class="row-title">');
    
      __out.push(__sanitize(t('wallet.send.index.custom_fees')));
    
      __out.push('</td>\n        <td class="align-right">\n          <input id="amount_input" class="text-input" placeholder="');
    
      __out.push(__sanitize(t('wallet.defaults.operations.amount')));
    
      __out.push('" value=""/>\n          <label class="text-input">');
    
      __out.push(__sanitize(t('wallet.send.index.satoshi_per_byte')));
    
      __out.push('</label>\n        </td>\n      </tr>\n      <tr class="no-border">\n        <td class="row-title optional">');
    
      __out.push(__sanitize(t('wallet.send.index.total_spent')));
    
      __out.push('</td>\n        <td class="align-right regular-grey-text-small">\n          <p id="total_label"></p>\n          <p id="countervalue_total_label" style="margin-top: 10px;"></p>\n        </td>\n      </tr>\n    </tbody>\n  </table>\n  <span id="warning" style="visibility: hidden;"></span><a href="#openLink" id="link" style="visibility: hidden; margin-left: 5px;" >Learn more.</a>\n</section>\n<div id="error_container"></div>\n<div class="dialog-actions-bar">\n  <a id="open_scanner_button" class="cancel-rounded-button"><i class="fa fa-camera"></i></a>\n  <div class="left-spacer"></div>\n  <a class="cancel-rounded-button" href="#cancel">');
    
      __out.push(__sanitize(t('common.cancel')));
    
      __out.push('</a>\n  <a class="action-rounded-button" href="#send" id="send_button">');
    
      __out.push(__sanitize(t('common.send')));
    
      __out.push('</a>\n</div>\n');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
};
