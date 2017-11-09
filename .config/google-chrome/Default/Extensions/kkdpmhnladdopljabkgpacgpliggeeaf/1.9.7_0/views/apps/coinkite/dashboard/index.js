if (!window.JST) {
  window.JST = {};
}
window.JST["apps/coinkite/dashboard/index"] = function (__obj) {
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
      __out.push('<table>\n<tr><td>\n\n<section id="coinkite">\n\n  <header>\n    <h1>COINKITE MULTISIGNATURE ACCOUNT MANAGEMENT [BETA]</h1>\n  </header>\n\n<p>Coinkite manage and secure "shared" accounts using bitcoin\'s multi-signature (multisig) and P2SH technology.</p>\n<p>There can be up to 15 signers, who each hold a unique key (a BIP32 extended key).\nWhen the account is created, you choose how many of those signatures are required to\napprove a withdrawal. All combinations are supported:</p>\n<ul>\n<li><em>2-of-3</em>: Two people must approve, and one extra backup key in cases of accidents.</li>\n<li><em>3-of-3</em>: Really lock up your funds with three hard to steal keys.</li>\n<li>... and so on, up to ...</li>\n<li><em>1-of-15</em>: Anyone on the committee of 15 can spend the funds.</li>\n<li><em>15-of-15</em>: Funds can only be removed with all 15 signatures!</li>\n</ul>\n<p>Coinkite supports a number of options for how and where to store each private key involved\nin the shared account:</p>\n<ul>\n<li>Securely in Coinkite\'s HSM, linked to your Coinkite account password.</li>\n<li>Encrypted but in Coinkite\'s HSM. A unique password protects your key.</li>\n<li>Securely managed by your <strong>Ledger Nano</strong>.</li>\n</ul>\n<p>To get the benefits of using a multisignature account, you must sign-up on Coinkite</p>\n<p>\n<a class="action-rounded-button" href="#openCoinkite">GO TO COINKITE</a>\n\n</section>\n\n</td><td>\n\n<section id="test">\n\n');
    
      __out.push(__sanitize(t('apps.coinkite.dashboard.compatibility.check')));
    
      __out.push('\n<p>\n<a class="action-rounded-button" href="/apps/coinkite/dashboard/compatibility">');
    
      __out.push(__sanitize(t('apps.coinkite.dashboard.compatibility.check_button')));
    
      __out.push('</a>\n<p>\n<b>');
    
      __out.push(__sanitize(t('apps.coinkite.dashboard.compatibility.warning')));
    
      __out.push('</b>\n</section>\n\n</td></tr></table>');
    
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
};
