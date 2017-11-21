(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletPairingFinalizingDialogViewController = (function(_super) {
    __extends(WalletPairingFinalizingDialogViewController, _super);

    function WalletPairingFinalizingDialogViewController() {
      return WalletPairingFinalizingDialogViewController.__super__.constructor.apply(this, arguments);
    }

    WalletPairingFinalizingDialogViewController.prototype.cancellable = false;

    WalletPairingFinalizingDialogViewController.prototype.view = {
      phoneNameInput: '#phone_name_input',
      errorLabel: "#error_label"
    };

    WalletPairingFinalizingDialogViewController.prototype.onAfterRender = function() {
      var suggestedName, _ref, _ref1;
      WalletPairingFinalizingDialogViewController.__super__.onAfterRender.apply(this, arguments);
      this._request = this.params.request;
      if ((_ref = this._request) != null) {
        _ref.onComplete(this._onComplete);
      }
      this.view.errorLabel.hide();
      suggestedName = ((_ref1 = this._request.getSuggestedDeviceName()) != null ? _ref1.length : void 0) === 0 ? t('wallet.pairing.finalizing.default_name') : this._request.getSuggestedDeviceName();
      this.view.phoneNameInput.val(suggestedName);
      return _.defer((function(_this) {
        return function() {
          _this.view.phoneNameInput.focus();
          return _this.view.phoneNameInput.on('blur', function() {
            return _this.view.phoneNameInput.focus();
          });
        };
      })(this));
    };

    WalletPairingFinalizingDialogViewController.prototype.terminate = function() {
      return this._verifyEnteredName().then((function(_this) {
        return function() {
          var _ref;
          return (_ref = _this._request) != null ? _ref.setSecureScreenName(_this._enteredName()) : void 0;
        };
      })(this));
    };

    WalletPairingFinalizingDialogViewController.prototype.onDismiss = function() {
      var _ref;
      WalletPairingFinalizingDialogViewController.__super__.onDismiss.apply(this, arguments);
      return (_ref = this._request) != null ? _ref.cancel() : void 0;
    };

    WalletPairingFinalizingDialogViewController.prototype.onDetach = function() {
      WalletPairingFinalizingDialogViewController.__super__.onDetach.apply(this, arguments);
      return this.view.phoneNameInput.off('blur');
    };

    WalletPairingFinalizingDialogViewController.prototype._enteredName = function() {
      return _.str.trim(this.view.phoneNameInput.val());
    };

    WalletPairingFinalizingDialogViewController.prototype._onComplete = function(screen, error) {
      l(screen, error);
      this._request = null;
      return this.dismiss((function(_this) {
        return function() {
          var dialog;
          if (screen != null) {
            dialog = new CommonDialogsMessageDialogViewController({
              kind: "success",
              title: t("wallet.pairing.errors.pairing_succeeded"),
              subtitle: _.str.sprintf(t("wallet.pairing.errors.dongle_is_now_paired"), screen.name)
            });
          } else {
            dialog = new CommonDialogsMessageDialogViewController({
              kind: "error",
              title: t("wallet.pairing.errors.pairing_failed"),
              subtitle: t("wallet.pairing.errors." + error)
            });
          }
          return dialog.show();
        };
      })(this));
    };

    WalletPairingFinalizingDialogViewController.prototype._verifyEnteredName = function() {
      var d, name, resultBlock;
      d = ledger.defer();
      resultBlock = (function(_this) {
        return function(message) {
          if (message != null) {
            _this.view.errorLabel.text(message);
            _this.view.errorLabel.show();
            return d.reject(message);
          } else {
            _this.view.errorLabel.text("");
            _this.view.errorLabel.hide();
            return d.resolve();
          }
        };
      })(this);
      name = this._enteredName();
      if (name.length === 0) {
        resultBlock(t('wallet.pairing.finalizing.please_enter_a_name'));
      } else {
        ledger.m2fa.PairedSecureScreen.getByNameFromSyncedStore(name, (function(_this) {
          return function(screen) {
            return resultBlock(screen != null ? t('wallet.pairing.finalizing.name_already_used_by_paired_device') : null);
          };
        })(this));
      }
      return d.promise;
    };

    return WalletPairingFinalizingDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
