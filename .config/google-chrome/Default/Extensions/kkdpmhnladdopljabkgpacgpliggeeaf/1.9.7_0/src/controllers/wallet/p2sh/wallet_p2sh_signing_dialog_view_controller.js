(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletP2shSigningDialogViewController = (function(_super) {
    __extends(WalletP2shSigningDialogViewController, _super);

    function WalletP2shSigningDialogViewController() {
      return WalletP2shSigningDialogViewController.__super__.constructor.apply(this, arguments);
    }

    WalletP2shSigningDialogViewController.prototype.view = {
      contentContainer: '#content_container'
    };

    WalletP2shSigningDialogViewController.prototype.onAfterRender = function() {
      WalletP2shSigningDialogViewController.__super__.onAfterRender.apply(this, arguments);
      this.view.spinner = ledger.spinners.createLargeSpinner(this.view.contentContainer[0]);
      this.inputs = this.params.inputs;
      this.scripts = this.params.scripts;
      this.outputs_number = this.params.outputs_number;
      this.outputs_script = this.params.outputs_script;
      this.paths = this.params.paths;
      return ledger.app.dongle.signP2SHTransaction(this.inputs, this.scripts, this.outputs_number, this.outputs_script, this.paths).then((function(_this) {
        return function(signatures) {
          Api.callback_success('sign_p2sh', {
            signatures: signatures
          });
          return _this.dismiss(function() {
            var dialog;
            dialog = new CommonDialogsMessageDialogViewController({
              kind: "success",
              title: t("wallet.p2sh.errors.signature_successfull")
            });
            return dialog.show();
          });
        };
      })(this)).fail((function(_this) {
        return function(error) {
          Api.callback_cancel('sign_p2sh', t("wallet.p2sh.errors.signature_failed"));
          return _this.dismiss(function() {
            var dialog;
            dialog = new CommonDialogsMessageDialogViewController({
              kind: "error",
              title: t("wallet.p2sh.errors.signature_failed"),
              subtitle: error
            });
            return dialog.show();
          });
        };
      })(this));
    };

    return WalletP2shSigningDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
