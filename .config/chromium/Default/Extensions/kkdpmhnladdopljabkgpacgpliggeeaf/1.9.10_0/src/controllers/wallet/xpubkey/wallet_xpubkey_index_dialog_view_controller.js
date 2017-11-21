(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletXpubkeyIndexDialogViewController = (function(_super) {
    __extends(WalletXpubkeyIndexDialogViewController, _super);

    function WalletXpubkeyIndexDialogViewController() {
      return WalletXpubkeyIndexDialogViewController.__super__.constructor.apply(this, arguments);
    }

    WalletXpubkeyIndexDialogViewController.prototype.view = {
      derivationPath: '#derivation_path',
      confirmButton: '#confirm_button'
    };

    WalletXpubkeyIndexDialogViewController.prototype.onAfterRender = function() {
      WalletXpubkeyIndexDialogViewController.__super__.onAfterRender.apply(this, arguments);
      chrome.app.window.current().show();
      this.path = Api.cleanPath(this.params.path);
      return this.view.derivationPath.text("m/" + this.path);
    };

    WalletXpubkeyIndexDialogViewController.prototype.cancel = function() {
      Api.callback_cancel('get_xpubkey', t('wallet.xpubkey.errors.cancelled'));
      return this.dismiss();
    };

    WalletXpubkeyIndexDialogViewController.prototype.confirm = function() {
      var dialog;
      dialog = new WalletXpubkeyProcessingDialogViewController({
        path: this.path
      });
      return this.getDialog().push(dialog);
    };

    return WalletXpubkeyIndexDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
