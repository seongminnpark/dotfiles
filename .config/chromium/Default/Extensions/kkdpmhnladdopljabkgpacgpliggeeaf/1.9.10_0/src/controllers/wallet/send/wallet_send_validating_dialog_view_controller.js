(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletSendValidatingDialogViewController = (function(_super) {
    __extends(WalletSendValidatingDialogViewController, _super);

    function WalletSendValidatingDialogViewController() {
      return WalletSendValidatingDialogViewController.__super__.constructor.apply(this, arguments);
    }

    WalletSendValidatingDialogViewController.prototype.view = {
      contentContainer: '#content_container',
      progressbarContainer: '#progressbar_container',
      progressLabel: "#progress_label"
    };

    WalletSendValidatingDialogViewController.prototype.initialize = function() {
      var promise;
      WalletSendValidatingDialogViewController.__super__.initialize.apply(this, arguments);
      promise = this.params.transaction.prepare((function(_this) {
        return function(transaction, error) {
          var reason;
          if (!_this.isShown()) {
            return;
          }
          if (error != null) {
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
          } else if (_this.params.validationMode === 'card') {
            return _this.getDialog().push(new WalletSendCardDialogViewController({
              transaction: transaction,
              options: _this.params.options
            }));
          } else {
            return _this.getDialog().push(new WalletSendMobileDialogViewController({
              transaction: transaction,
              secureScreens: _this.params.secureScreens
            }));
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

    WalletSendValidatingDialogViewController.prototype.cancel = function() {
      Api.callback_cancel('send_payment', t('wallet.send.errors.cancelled'));
      return this.dismiss();
    };

    WalletSendValidatingDialogViewController.prototype.onAfterRender = function() {
      WalletSendValidatingDialogViewController.__super__.onAfterRender.apply(this, arguments);
      return this.view.progressBar = new ledger.progressbars.ProgressBar(this.view.progressbarContainer);
    };

    return WalletSendValidatingDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
