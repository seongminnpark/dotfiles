if (!window.JST) {
  window.JST = {};
}
window.JST["common/dialogs/ticket"] = function (__obj) {
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
      __out.push('<section id="dialogs_ticket_dialog">\n  <header>\n    <h1>');
    
      __out.push(__sanitize(t('common.help.contact_support_team')));
    
      __out.push('</h1>\n  </header>\n  <table class="no-table-head" >\n    <tbody>\n      <tr>\n        <td class="row-title">');
    
      __out.push(__sanitize(t('common.name')));
    
      __out.push('</td>\n        <td class="align-right">\n          <input class="text-input" placeholder="');
    
      __out.push(__sanitize(t('common.name')));
    
      __out.push('" id="name_input" />\n        </td>\n      </tr>\n      <tr>\n        <td class="row-title">');
    
      __out.push(__sanitize(t('common.email_address')));
    
      __out.push('</td>\n        <td class="align-right">\n          <input class="text-input" placeholder="');
    
      __out.push(__sanitize(t('common.email_address')));
    
      __out.push('" id="email_address_input"  />\n        </td>\n      </tr>\n      <tr>\n        <td class="row-title">');
    
      __out.push(__sanitize(t('common.tag')));
    
      __out.push('</td>\n        <td class="align-right">\n          <div id="tags_segmented_control_container"></div>\n        </td>\n      </tr>\n      <tr class="no-border">\n        <td class="row-title">');
    
      __out.push(__sanitize(t('common.subject')));
    
      __out.push('</td>\n        <td class="align-right">\n          <input class="text-input" placeholder="');
    
      __out.push(__sanitize(t('common.subject')));
    
      __out.push('" id="subject_input" />\n        </td>\n      </tr>\n    </tbody>\n  </table>\n  <textarea class="rounded-text-area" placeholder="');
    
      __out.push(__sanitize(t('common.message')));
    
      __out.push('" id="message_text_area" ></textarea>\n  <div id="error_container"></div>\n</section>\n<div class="dialog-actions-bar">\n  <div id="logs_container">\n    <div class="uppercase-action">');
    
      __out.push(__sanitize(t('common.help.attach_debug_logs')));
    
      __out.push('</div>\n    <div id="logs_switch_container"></div>\n  </div>\n  <div class="left-spacer"></div>\n  <a href="#dismiss" class="cancel-rounded-button">');
    
      __out.push(__sanitize(t('common.cancel')));
    
      __out.push('</a>\n  <a href="#sendTicket" class="action-rounded-button" id="send_button">');
    
      __out.push(__sanitize(t('common.send')));
    
      __out.push('</a>\n</div>\n');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
};
