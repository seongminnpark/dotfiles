(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletP2shIndexDialogViewController = (function(_super) {
    __extends(WalletP2shIndexDialogViewController, _super);

    function WalletP2shIndexDialogViewController() {
      return WalletP2shIndexDialogViewController.__super__.constructor.apply(this, arguments);
    }

    WalletP2shIndexDialogViewController.prototype.view = {
      confirmButton: '#confirm_button'
    };

    WalletP2shIndexDialogViewController.prototype.onAfterRender = function() {
      WalletP2shIndexDialogViewController.__super__.onAfterRender.apply(this, arguments);
      chrome.app.window.current().show();
      this.inputs = JSON.parse(this.params.inputs);
      this.scripts = JSON.parse(this.params.scripts);
      this.outputs_number = this.params.outputs_number;
      this.outputs_script = this.params.outputs_script;
      return this.paths = JSON.parse(this.params.paths);
    };

    WalletP2shIndexDialogViewController.prototype.cancel = function() {
      Api.callback_cancel('p2sh', t('wallet.p2sh.errors.cancelled'));
      return this.dismiss();
    };

    WalletP2shIndexDialogViewController.prototype.confirm = function() {
      var dialog;
      dialog = new WalletP2shSigningDialogViewController({
        inputs: this.inputs,
        scripts: this.scripts,
        outputs_number: this.outputs_number,
        outputs_script: this.outputs_script,
        paths: this.paths
      });
      return this.getDialog().push(dialog);
    };

    return WalletP2shIndexDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
