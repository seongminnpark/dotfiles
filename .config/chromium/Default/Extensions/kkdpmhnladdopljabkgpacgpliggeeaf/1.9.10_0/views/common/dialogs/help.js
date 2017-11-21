if (!window.JST) {
  window.JST = {};
}
window.JST["common/dialogs/help"] = function (__obj) {
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
      __out.push('<section id="dialogs_help_dialog">\n  <header>\n    <h1>');
    
      __out.push(__sanitize(t('common.help.help')));
    
      __out.push('</h1>\n  </header>\n  <div class="sections-container">\n    <a class="panel" href="#browseKnowledge">\n      <div class="icon"><i class="fa fa-support"></i></div>\n      <div class="content">\n        <div class="uppercase-action">');
    
      __out.push(__sanitize(t('common.help.browse_knowledge_base')));
    
      __out.push('</div>\n        <div class="regular-soft-grey-text-small">');
    
      __out.push(__sanitize(t('common.help.self_help')));
    
      __out.push('</div>\n      </div>\n      <div class="arrow"><i class="fa fa-angle-right"></i></div>\n    </a>\n    <a class="panel" href="#contactSupport">\n      <div class="icon"><i class="fa fa-comments"></i></div>\n      <div class="content">\n        <div class="uppercase-action">');
    
      __out.push(__sanitize(t('common.help.contact_support_team')));
    
      __out.push('</div>\n        <div class="regular-soft-grey-text-small">');
    
      __out.push(__sanitize(t('common.help.dedicated_help')));
    
      __out.push('</div>\n      </div>\n      <div class="arrow"><i class="fa fa-angle-right"></i></div>\n    </a>\n  </div>\n</section>\n<div class="dialog-actions-bar">\n  <div class="left-spacer"></div>\n  <a href="#dismiss" class="cancel-rounded-button">');
    
      __out.push(__sanitize(t('common.close')));
    
      __out.push('</a>\n</div>');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
};
