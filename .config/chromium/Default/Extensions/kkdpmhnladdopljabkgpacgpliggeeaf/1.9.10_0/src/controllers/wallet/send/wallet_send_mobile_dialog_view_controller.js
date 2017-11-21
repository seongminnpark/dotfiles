(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletSendMobileDialogViewController = (function(_super) {
    __extends(WalletSendMobileDialogViewController, _super);

    function WalletSendMobileDialogViewController() {
      return WalletSendMobileDialogViewController.__super__.constructor.apply(this, arguments);
    }

    WalletSendMobileDialogViewController.prototype.view = {
      mobileName: "#mobile_name"
    };

    WalletSendMobileDialogViewController.prototype.cancel = function() {
      Api.callback_cancel('send_payment', t('wallet.send.errors.cancelled'));
      return this.dismiss();
    };

    WalletSendMobileDialogViewController.prototype.initialize = function() {
      WalletSendMobileDialogViewController.__super__.initialize.apply(this, arguments);
      return this._request = ledger.m2fa.requestValidation(this.params.transaction, this.params.secureScreens);
    };

    WalletSendMobileDialogViewController.prototype.onAfterRender = function() {
      WalletSendMobileDialogViewController.__super__.onAfterRender.apply(this, arguments);
      this._request.onComplete(this._onComplete);
      return this.view.mobileName.text(_.str.sprintf(t('wallet.send.mobile.sending_transaction'), this.params.secureScreens[0].name));
    };

    WalletSendMobileDialogViewController.prototype.onDetach = function() {
      var _ref;
      WalletSendMobileDialogViewController.__super__.onDetach.apply(this, arguments);
      return (_ref = this._request) != null ? _ref.cancel() : void 0;
    };

    WalletSendMobileDialogViewController.prototype.onDismiss = function() {
      var _ref;
      WalletSendMobileDialogViewController.__super__.onDismiss.apply(this, arguments);
      return (_ref = this._request) != null ? _ref.cancel() : void 0;
    };

    WalletSendMobileDialogViewController.prototype.otherValidationMethods = function() {
      var dialog;
      dialog = new WalletSendMethodDialogViewController({
        transaction: this.params.transaction
      });
      return this.getDialog().push(dialog);
    };

    WalletSendMobileDialogViewController.prototype._onComplete = function(pincode, error) {
      var dialog;
      if (error != null) {
        this._request = null;
        return this.dismiss((function(_this) {
          return function() {
            var dialog;
            Api.callback_cancel('send_payment', t("common.errors." + error));
            dialog = new CommonDialogsMessageDialogViewController({
              kind: "error",
              title: t("wallet.send.errors.sending_failed"),
              subtitle: t("common.errors." + error)
            });
            return dialog.show();
          };
        })(this));
      } else {
        dialog = new WalletSendProcessingDialogViewController({
          transaction: this.params.transaction,
          pincode: pincode
        });
        return this.getDialog().push(dialog);
      }
    };

    return WalletSendMobileDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
