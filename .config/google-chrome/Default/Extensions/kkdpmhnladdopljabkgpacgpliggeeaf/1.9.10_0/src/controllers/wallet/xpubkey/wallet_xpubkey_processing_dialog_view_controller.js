(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletXpubkeyProcessingDialogViewController = (function(_super) {
    __extends(WalletXpubkeyProcessingDialogViewController, _super);

    function WalletXpubkeyProcessingDialogViewController() {
      return WalletXpubkeyProcessingDialogViewController.__super__.constructor.apply(this, arguments);
    }

    WalletXpubkeyProcessingDialogViewController.prototype.view = {
      contentContainer: '#content_container'
    };

    WalletXpubkeyProcessingDialogViewController.prototype.onAfterRender = function() {
      WalletXpubkeyProcessingDialogViewController.__super__.onAfterRender.apply(this, arguments);
      this.view.spinner = ledger.spinners.createLargeSpinner(this.view.contentContainer[0]);
      return ledger.app.dongle.getExtendedPublicKey(this.params.path, (function(_this) {
        return function(key, error) {
          var xpubkey;
          if (error != null) {
            Api.callback_cancel('get_xpubkey', t("wallet.xpubkey.errors.derivation_failed"));
            return _this.dismiss(function() {
              var dialog;
              dialog = new CommonDialogsMessageDialogViewController({
                kind: "error",
                title: t("wallet.xpubkey.errors.derivation_failed"),
                subtitle: error
              });
              return dialog.show();
            });
          } else {
            xpubkey = key._xpub58;
            Api.callback_success('get_xpubkey', {
              xpubkey: xpubkey
            });
            return _this.dismiss(function() {
              var dialog;
              dialog = new CommonDialogsMessageDialogViewController({
                kind: "success",
                title: t("wallet.xpubkey.errors.derivation_successfull")
              });
              return dialog.show();
            });
          }
        };
      })(this));
    };

    return WalletXpubkeyProcessingDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
