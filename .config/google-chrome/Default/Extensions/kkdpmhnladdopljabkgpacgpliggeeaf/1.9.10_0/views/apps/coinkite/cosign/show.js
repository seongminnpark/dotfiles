if (!window.JST) {
  window.JST = {};
}
window.JST["apps/coinkite/cosign/show"] = function (__obj) {
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
      __out.push('<section id="coinkite_cosign_show_dialog">\n  <header>\n    <h1>');
    
      __out.push(__sanitize(t('apps.coinkite.cosign.show.title')));
    
      __out.push('</h1>\n  </header>\n  <table class="no-table-head">\n    <tbody>\n      <tr>\n        <td class="row-title">');
    
      __out.push(__sanitize(t('wallet.defaults.operations.amount')));
    
      __out.push('</td>\n        <td class="align-right" id="operation_amount">\n          <span class="regular-text">');
    
      __out.push(__sanitize(ledger.formatters.formatValue(this.amount)));
    
      __out.push('</span>\n        </td>\n      </tr>\n      <tr>\n        <td class="row-title top-aligned">');
    
      __out.push(__sanitize(t('wallet.defaults.operations.receiver')));
    
      __out.push('</td>\n        <td class="align-right">');
    
      __out.push(__sanitize(this.address));
    
      __out.push('</td>\n      </tr>\n      <tr id="change_amount" style="display: none">\n        <td class="row-title">');
    
      __out.push(__sanitize(t('wallet.defaults.operations.amount')));
    
      __out.push('</td>\n        <td class="align-right">\n          <span class="regular-text">');
    
      __out.push(__sanitize(ledger.formatters.formatValue(this.amount2)));
    
      __out.push('</span>\n        </td>\n      </tr>\n      <tr id="change_address" style="display: none">\n        <td class="row-title top-aligned">');
    
      __out.push(__sanitize(t('wallet.defaults.operations.receiver')));
    
      __out.push('</td>\n        <td class="align-right">');
    
      __out.push(__sanitize(this.address2));
    
      __out.push('</td>\n      </tr>\n      <tr class="no-border spacer50">\n        <td colspan="2" class="regular-text">');
    
      __out.push(t('apps.coinkite.cosign.show.note'));
    
      __out.push('</td>\n      </tr>\n    </tbody>\n  </table>\n</section>\n<div class="dialog-actions-bar">\n  <div class="left-spacer"></div>\n  <a class="cancel-rounded-button" href="#cancel">');
    
      __out.push(__sanitize(t('common.cancel')));
    
      __out.push('</a>\n  <a class="action-rounded-button" href="#confirm">');
    
      __out.push(__sanitize(t('apps.coinkite.cosign.show.confirm_signature')));
    
      __out.push('</a>\n</div>');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
};
