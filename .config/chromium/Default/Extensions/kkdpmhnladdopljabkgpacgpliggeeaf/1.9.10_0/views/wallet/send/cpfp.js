if (!window.JST) {
  window.JST = {};
}
window.JST["wallet/send/cpfp"] = function (__obj) {
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
      __out.push('<section id="send_cpfp_dialog">\n  <header>\n    <h1>');
    
      __out.push(__sanitize(t('wallet.cpfp.title')));
    
      __out.push('</h1>\n  </header>\n  <div id="message"></div>\n  <table class="no-table-head">\n    <tbody>\n      <tr id="amount_row">\n        <td class="row-title">');
    
      __out.push(__sanitize(t('wallet.defaults.operations.amount')));
    
      __out.push('</td>\n        <td class="align-right">\n          <input id="amount_input" class="large-text-input" disabled value="');
    
      __out.push(__sanitize(this.amount));
    
      __out.push('"/>\n        </td>\n      </tr>\n      <tr>\n        <td class="row-title">');
    
      __out.push(__sanitize(_.str.sprintf(t('wallet.send.index.receiver_address'), _.str.capitalize(ledger.config.network.display_name))));
    
      __out.push('</td>\n        <td class="align-right">\n          <input class="text-input" id="receiver_input" disabled value="');
    
      __out.push(__sanitize(this.account.getWalletAccount().getCurrentPublicAddress()));
    
      __out.push('"/>\n        </td>\n      </tr>\n      <tr id="custom_fees_row">\n        <td class="row-title">');
    
      __out.push(__sanitize(t('wallet.send.index.custom_fees')));
    
      __out.push('</td>\n        <td class="align-right">\n          <input id="fees_per_byte" class="text-input" value="');
    
      __out.push(__sanitize(this.feesPerByte));
    
      __out.push('"/>\n          <label class="text-input">');
    
      __out.push(__sanitize(t('wallet.send.index.satoshi_per_byte')));
    
      __out.push('</label>\n          </br>\n          <div id="fees_validation" class="regular-grey-text-small">\n        </td>\n      </tr>\n      <tr class="no-border">\n        <td class="row-title optional">');
    
      __out.push(__sanitize(t('wallet.send.index.total_spent')));
    
      __out.push('</td>\n        <td class="align-right regular-grey-text-small">\n          <p id="total_label"></p>\n          <p id="countervalue_total_label" style="margin-top: 10px;"></p>\n        </td>\n      </tr>\n    </tbody>\n  </table>\n  <div id="check"></div>\n  \n</section>\n<div id="error_container"></div>\n<div class="dialog-actions-bar">\n  <div class="left-spacer"></div>\n  <a class="cancel-rounded-button" href="#cancel">');
    
      __out.push(__sanitize(t('common.cancel')));
    
      __out.push('</a>\n  <a class="action-rounded-button" href="#send" id="send_button">');
    
      __out.push(__sanitize(t('common.send')));
    
      __out.push('</a>\n</div>\n');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
};
