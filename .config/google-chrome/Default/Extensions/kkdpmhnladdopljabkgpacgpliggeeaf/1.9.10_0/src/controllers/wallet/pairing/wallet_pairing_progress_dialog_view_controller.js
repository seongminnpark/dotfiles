(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletPairingProgressDialogViewController = (function(_super) {
    __extends(WalletPairingProgressDialogViewController, _super);

    function WalletPairingProgressDialogViewController() {
      return WalletPairingProgressDialogViewController.__super__.constructor.apply(this, arguments);
    }

    WalletPairingProgressDialogViewController.prototype.view = {
      contentContainer: "#content_container"
    };

    WalletPairingProgressDialogViewController.prototype.onAfterRender = function() {
      var _ref, _ref1;
      WalletPairingProgressDialogViewController.__super__.onAfterRender.apply(this, arguments);
      this.view.spinner = ledger.spinners.createLargeSpinner(this.view.contentContainer[0]);
      this._request = this.params.request;
      if ((_ref = this._request) != null) {
        _ref.onComplete(this._onComplete);
      }
      return (_ref1 = this._request) != null ? _ref1.on('finalizing', this._onFinalizing) : void 0;
    };

    WalletPairingProgressDialogViewController.prototype.onDetach = function() {
      var _ref;
      WalletPairingProgressDialogViewController.__super__.onDetach.apply(this, arguments);
      return (_ref = this._request) != null ? _ref.off('finalizing', this._onFinalizing) : void 0;
    };

    WalletPairingProgressDialogViewController.prototype.onDismiss = function() {
      var _ref;
      WalletPairingProgressDialogViewController.__super__.onDismiss.apply(this, arguments);
      return (_ref = this._request) != null ? _ref.cancel() : void 0;
    };

    WalletPairingProgressDialogViewController.prototype._onFinalizing = function() {
      return ledger.m2fa.PairedSecureScreen.getScreensByUuidFromSyncedStore(this._request.getDeviceUuid(), (function(_this) {
        return function(screens, error) {
          if ((screens != null ? screens.length : void 0) === 0) {
            return _this.getDialog().push(new WalletPairingFinalizingDialogViewController({
              request: _this._request
            }));
          } else {
            return _this._request.setSecureScreenName(screens[0].name);
          }
        };
      })(this));
    };

    WalletPairingProgressDialogViewController.prototype._onComplete = function(screen, error) {
      this._request = null;
      return this.dismiss((function(_this) {
        return function() {
          var dialog;
          if (error != null) {
            dialog = new CommonDialogsMessageDialogViewController({
              kind: "error",
              title: t("wallet.pairing.errors.pairing_failed"),
              subtitle: t("wallet.pairing.errors." + error)
            });
          } else {
            dialog = new CommonDialogsMessageDialogViewController({
              kind: "success",
              title: t("wallet.pairing.errors.pairing_succeeded"),
              subtitle: _.str.sprintf(t("wallet.pairing.errors.dongle_is_now_paired"), screen.name)
            });
          }
          return dialog.show();
        };
      })(this));
    };

    return WalletPairingProgressDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
