if (!window.JST) {
  window.JST = {};
}
window.JST["wallet/dialogs/accountsettings"] = function (__obj) {
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
      __out.push('<section id="dialogs_accountsettings_dialog">\n  <header>\n    <h1>');
    
      __out.push(__sanitize(t('wallet.dialogs.accountsettings.account_settings')));
    
      __out.push('</h1>\n  </header>\n  <div class="large-table">\n    <div class="header top">\n      <div class="uppercase-section-column stretchable">');
    
      __out.push(__sanitize(t('wallet.dialogs.accountsettings.properties')));
    
      __out.push('</div>\n    </div>\n    <div class="row middle">\n      <div class="regular-text-small stretchable">');
    
      __out.push(__sanitize(t('wallet.dialogs.accountsettings.name')));
    
      __out.push('</div>\n      <input class="small-text-input" placeholder="');
    
      __out.push(__sanitize(t('wallet.dialogs.accountsettings.account_name')));
    
      __out.push('" value="" id="account_name_input" maxlength="30"  />\n    </div>\n    <div class="row bottom">\n      <div class="regular-text-small stretchable">');
    
      __out.push(__sanitize(t('wallet.dialogs.accountsettings.color')));
    
      __out.push('</div>\n      <div class="small-grey-select">\n        <select id="colors_select"></select>\n      </div>\n      <i class="fa fa-square medium-square" id="color_square"></i>\n    </div>\n  </div>\n  <div class="large-table">\n    <div class="header top">\n      <div class="uppercase-section-column stretchable">');
    
      __out.push(__sanitize(t('wallet.dialogs.accountsettings.advanced')));
    
      __out.push('</div>\n    </div>\n    <div class="row middle">\n      <div class="regular-text-small stretchable">');
    
      __out.push(__sanitize(t('wallet.dialogs.accountsettings.root_path')));
    
      __out.push('</div>\n      <div class="regular-grey-text-small selectable" id="root_path_label"></div>\n    </div>\n    <div class="row bottom">\n      <div class="regular-text-small stretchable">');
    
      __out.push(__sanitize(t('wallet.dialogs.accountsettings.extended_public_key')));
    
      __out.push('</div>\n      <a href="#exportXPub" class="small-action-rounded-button">');
    
      __out.push(__sanitize(t('common.export')));
    
      __out.push('</a>\n    </div>\n  </div>\n  <div id="error_container"></div>\n</section>\n<div class="dialog-actions-bar">\n  ');
    
      if (this._deleteMode === 'hide') {
        __out.push('\n    <a href="#hideAccount" class="uppercase-action">');
        __out.push(__sanitize(t('wallet.dialogs.accountsettings.hide_account')));
        __out.push('</a>\n  ');
      } else if (this._deleteMode === 'delete') {
        __out.push('\n    <a href="#hideAccount" class="uppercase-action">');
        __out.push(__sanitize(t('wallet.dialogs.accountsettings.delete_account')));
        __out.push('</a>\n  ');
      }
    
      __out.push('\n  <div class="left-spacer"></div>\n  <a href="#dismiss" class="cancel-rounded-button">');
    
      __out.push(__sanitize(t('common.cancel')));
    
      __out.push('</a>\n  <a href="#saveAccount" class="action-rounded-button">');
    
      __out.push(__sanitize(t('common.save')));
    
      __out.push('</a>\n</div>');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
};
