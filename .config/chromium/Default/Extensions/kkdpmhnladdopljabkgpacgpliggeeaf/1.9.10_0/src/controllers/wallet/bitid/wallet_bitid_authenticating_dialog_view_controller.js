(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletBitidAuthenticatingDialogViewController = (function(_super) {
    __extends(WalletBitidAuthenticatingDialogViewController, _super);

    function WalletBitidAuthenticatingDialogViewController() {
      return WalletBitidAuthenticatingDialogViewController.__super__.constructor.apply(this, arguments);
    }

    WalletBitidAuthenticatingDialogViewController.prototype.view = {
      contentContainer: '#content_container'
    };

    WalletBitidAuthenticatingDialogViewController.prototype.onAfterRender = function() {
      WalletBitidAuthenticatingDialogViewController.__super__.onAfterRender.apply(this, arguments);
      this.view.spinner = ledger.spinners.createLargeSpinner(this.view.contentContainer[0]);
      return this._startAuthenticating();
    };

    WalletBitidAuthenticatingDialogViewController.prototype._startAuthenticating = function() {
      return ledger.bitcoin.bitid.callback(this.params.uri, this.params.address, this.params.signature).then((function(_this) {
        return function(result) {
          if (result.error != null) {
            return _this._error(result.error);
          } else {
            return _this._success();
          }
        };
      })(this), (function(_this) {
        return function(jqXHR, textStatus, errorThrown) {
          return _this._error(textStatus || t("errors.network_error"));
        };
      })(this));
    };

    WalletBitidAuthenticatingDialogViewController.prototype._success = function() {
      console.log("success");
      return this.dismiss(function() {
        var dialog;
        dialog = new CommonDialogsMessageDialogViewController({
          kind: "success",
          title: t("wallet.bitid.auth.succeeded"),
          subtitle: t("wallet.bitid.auth.completed")
        });
        return dialog.show();
      });
    };

    WalletBitidAuthenticatingDialogViewController.prototype._error = function(reason) {
      return this.dismiss(function() {
        var dialog;
        dialog = new CommonDialogsMessageDialogViewController({
          kind: "error",
          title: t("wallet.bitid.auth.failed"),
          subtitle: reason
        });
        return dialog.show();
      });
    };

    return WalletBitidAuthenticatingDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
