(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletMessageProcessingDialogViewController = (function(_super) {
    __extends(WalletMessageProcessingDialogViewController, _super);

    function WalletMessageProcessingDialogViewController() {
      return WalletMessageProcessingDialogViewController.__super__.constructor.apply(this, arguments);
    }

    WalletMessageProcessingDialogViewController.prototype.view = {
      contentContainer: '#content_container',
      hash: "#message_hash"
    };

    WalletMessageProcessingDialogViewController.prototype.onAfterRender = function() {
      var error, hash;
      WalletMessageProcessingDialogViewController.__super__.onAfterRender.apply(this, arguments);
      hash = ledger.crypto.SHA256.hashString(this.params.message).toUpperCase();
      this.view.hash.text(hash.substr(0, 4) + "..." + hash.substr(-4));
      try {
        return ledger.bitcoin.bitid.getAddress({
          path: this.params.path
        }).then((function(_this) {
          return function(result) {
            var address;
            address = result.bitcoinAddress.value;
            return ledger.bitcoin.bitid.signMessage(_this.params.message, {
              path: _this.params.path
            }).then(function(result) {
              Api.callback_success('sign_message', {
                signature: result,
                address: address
              });
              _this.dismiss(function() {
                var dialog;
                if (_this.params.editable) {
                  dialog = new WalletMessageResultDialogViewController({
                    signature: result,
                    address: address,
                    message: _this.params.message
                  });
                } else {
                  dialog = new CommonDialogsMessageDialogViewController({
                    kind: "success",
                    title: t("wallet.message.errors.sign_message_successfull")
                  });
                }
                return dialog.show();
              });
            }).fail(function(error) {
              Api.callback_cancel('sign_message', JSON.stringify(error));
              _this.dismiss(function() {
                var dialog;
                dialog = new CommonDialogsMessageDialogViewController({
                  kind: "error",
                  title: t("wallet.message.errors.sign_message_failed"),
                  subtitle: error
                });
                return dialog.show();
              });
            });
          };
        })(this)).fail((function(_this) {
          return function(error) {
            Api.callback_cancel('sign_message', JSON.stringify(error));
            _this.dismiss(function() {
              var dialog;
              dialog = new CommonDialogsMessageDialogViewController({
                kind: "error",
                title: t("wallet.message.errors.derivation_failed"),
                subtitle: error
              });
              return dialog.show();
            });
          };
        })(this));
      } catch (_error) {
        error = _error;
        Api.callback_cancel('sign_message', JSON.stringify(error));
        return this.dismiss((function(_this) {
          return function() {
            var dialog;
            dialog = new CommonDialogsMessageDialogViewController({
              kind: "error",
              title: t("wallet.message.errors.sign_message_failed"),
              subtitle: error
            });
            return dialog.show();
          };
        })(this));
      }
    };

    return WalletMessageProcessingDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
