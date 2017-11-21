(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletSendProcessingDialogViewController = (function(_super) {
    __extends(WalletSendProcessingDialogViewController, _super);

    function WalletSendProcessingDialogViewController() {
      return WalletSendProcessingDialogViewController.__super__.constructor.apply(this, arguments);
    }

    WalletSendProcessingDialogViewController.prototype.view = {
      contentContainer: '#content_container',
      progressbarContainer: '#progressbar_container',
      progressLabel: "#progress_label"
    };

    WalletSendProcessingDialogViewController.prototype.initialize = function() {
      WalletSendProcessingDialogViewController.__super__.initialize.apply(this, arguments);
      return this._startSignature();
    };

    WalletSendProcessingDialogViewController.prototype.onAfterRender = function() {
      WalletSendProcessingDialogViewController.__super__.onAfterRender.apply(this, arguments);
      return this.view.progressBar = new ledger.progressbars.ProgressBar(this.view.progressbarContainer);
    };

    WalletSendProcessingDialogViewController.prototype._startSignature = function() {
      var promise;
      promise = this.params.keycode != null ? this.params.transaction.validateWithKeycard(this.params.keycode) : this.params.transaction.validateWithPinCode(this.params.pincode);
      promise.onComplete((function(_this) {
        return function(transaction, error) {
          if (!_this.isShown()) {
            return;
          }
          if (error != null) {
            return _this.dismiss(function() {
              var dialog, reason;
              reason = (function() {
                switch (error.code) {
                  case ledger.errors.SignatureError:
                    return 'wrong_keycode';
                  case ledger.errors.UnknownError:
                    return 'unknown';
                  case ledger.errors.ChangeDerivationError:
                    return 'change_derivation_error';
                }
              })();
              Api.callback_cancel('send_payment', t("common.errors." + reason));
              dialog = new CommonDialogsMessageDialogViewController({
                kind: "error",
                title: t("wallet.send.errors.sending_failed"),
                subtitle: t("common.errors." + reason)
              });
              return dialog.show();
            });
          } else {
            return _this._startSending();
          }
        };
      })(this));
      return promise.progress((function(_this) {
        return function(_arg) {
          var percent;
          percent = _arg.percent;
          _this.view.progressBar.setProgress(percent / 100);
          return _this.view.progressLabel.text(percent + '%');
        };
      })(this));
    };

    WalletSendProcessingDialogViewController.prototype._startSending = function() {
      return ledger.api.TransactionsRestClient.instance.postTransaction(this.params.transaction, (function(_this) {
        return function(transaction, error) {
          if (!_this.isShown()) {
            return;
          }
          return _this.dismiss(function() {
            var dialog;
            dialog = (error != null ? error.isDueToNoInternetConnectivity() : void 0) ? (Api.callback_cancel('send_payment', t("common.errors.network_no_response")), new CommonDialogsMessageDialogViewController({
              kind: "error",
              title: t("wallet.send.errors.sending_failed"),
              subtitle: t("common.errors.network_no_response")
            })) : error != null ? (Api.callback_cancel('send_payment', t("common.errors.push_transaction_failed")), new CommonDialogsMessageDialogViewController({
              kind: "error",
              title: t("wallet.send.errors.sending_failed"),
              subtitle: t("common.errors.error_occurred")
            })) : (Api.callback_success('send_payment', {
              transaction: transaction.serialize()
            }), new CommonDialogsMessageDialogViewController({
              kind: "success",
              title: t("wallet.send.errors.sending_succeeded"),
              subtitle: t("wallet.send.errors.transaction_completed")
            }));
            return dialog.show();
          });
        };
      })(this));
    };

    return WalletSendProcessingDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
