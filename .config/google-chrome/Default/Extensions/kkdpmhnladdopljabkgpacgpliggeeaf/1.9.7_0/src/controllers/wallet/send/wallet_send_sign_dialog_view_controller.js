(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletSendSignDialogViewController = (function(_super) {
    __extends(WalletSendSignDialogViewController, _super);

    function WalletSendSignDialogViewController() {
      return WalletSendSignDialogViewController.__super__.constructor.apply(this, arguments);
    }

    WalletSendSignDialogViewController.prototype.view = {
      validatingContentContainer: '#validating',
      confirmContentContainer: '#confirm',
      processingContentContainer: '#processing',
      validatingProgressbarContainer: '#validating_progressbar_container',
      processingProgressbarContainer: '#processing_progressbar_container',
      validatingProgressLabel: "#validating_progress_label",
      processingProgressLabel: "#processing_progress_label"
    };

    WalletSendSignDialogViewController.prototype.cancellable = false;

    WalletSendSignDialogViewController.prototype.initialize = function() {
      WalletSendSignDialogViewController.__super__.initialize.apply(this, arguments);
      return this.params.transaction.sign().progress((function(_this) {
        return function(p) {
          if (!_this.isShown()) {
            return;
          }
          return _this._onSignatureProgress(p);
        };
      })(this)).then((function(_this) {
        return function(transaction) {
          if (!_this.isShown()) {
            return;
          }
          _this._postTransaction(transaction);
        };
      })(this)).fail((function(_this) {
        return function(error) {
          var reason;
          reason = (function() {
            switch (error.code) {
              case ledger.errors.SignatureError:
                return 'unable_to_validate';
              case ledger.errors.UnknownError:
                return 'unknown';
            }
          })();
          return _this.dismiss(function() {
            var dialog;
            Api.callback_cancel('send_payment', t("common.errors." + reason));
            dialog = new CommonDialogsMessageDialogViewController({
              kind: "error",
              title: t("wallet.send.errors.sending_failed"),
              subtitle: t("common.errors." + reason)
            });
            return dialog.show();
          });
        };
      })(this));
    };

    WalletSendSignDialogViewController.prototype._onSignatureProgress = function(progress) {
      var currentStep, percent, stepsCount;
      l(progress);
      if (progress.currentHashOutputBase58 === 1 && progress.currentUntrustedHash === 0) {
        return setTimeout(((function(_this) {
          return function() {
            return _this._invalidate('confirm');
          };
        })(this)), 1000);
      } else if (progress.currentHashOutputBase58 === 0) {
        currentStep = progress.currentTrustedInput + progress.currentPublicKey;
        stepsCount = 2 * progress.publicKeyCount;
        percent = Math.ceil(currentStep / stepsCount * 100);
        return this._invalidateProgressBar(percent);
      } else if (progress.currentHashOutputBase58 === 1 && progress.currentUntrustedHash === 1 && progress.publicKeyCount >= 4) {
        return this._invalidate('processing');
      } else {
        currentStep = progress.currentUntrustedHash + progress.currentSignTransaction;
        stepsCount = 2 * progress.publicKeyCount;
        percent = Math.ceil(currentStep / stepsCount * 100);
        return this._invalidateProgressBar(percent);
      }
    };

    WalletSendSignDialogViewController.prototype._invalidateProgressBar = function(percent) {
      if (this._currentMode === 'validating' || this._currentMode === 'processing') {
        this.view["" + this._currentMode + "ProgressBar"].setProgress(percent / 100);
        return this.view["" + this._currentMode + "ProgressLabel"].text(percent + '%');
      }
    };

    WalletSendSignDialogViewController.prototype._currentMode = 'validating';

    WalletSendSignDialogViewController.prototype._invalidate = function(mode) {
      var container, key, _ref, _results;
      if (mode == null) {
        mode = void 0;
      }
      if (mode != null) {
        this._currentMode = mode;
      }
      _ref = this.view;
      _results = [];
      for (key in _ref) {
        container = _ref[key];
        if (key.endsWith("ContentContainer")) {
          if (key.startsWith(this._currentMode)) {
            _results.push(container.show());
          } else {
            _results.push(container.hide());
          }
        }
      }
      return _results;
    };

    WalletSendSignDialogViewController.prototype._postTransaction = function(transaction) {
      return ledger.api.TransactionsRestClient.instance.postTransaction(transaction, (function(_this) {
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

    WalletSendSignDialogViewController.prototype.onAfterRender = function() {
      WalletSendSignDialogViewController.__super__.onAfterRender.apply(this, arguments);
      this._invalidate();
      this.view.validatingProgressBar = new ledger.progressbars.ProgressBar(this.view.validatingProgressbarContainer);
      return this.view.processingProgressBar = new ledger.progressbars.ProgressBar(this.view.processingProgressbarContainer);
    };

    return WalletSendSignDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
