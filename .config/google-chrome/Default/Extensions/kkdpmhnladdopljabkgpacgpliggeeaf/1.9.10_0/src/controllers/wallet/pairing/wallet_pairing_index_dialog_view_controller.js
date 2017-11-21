(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletPairingIndexDialogViewController = (function(_super) {
    __extends(WalletPairingIndexDialogViewController, _super);

    function WalletPairingIndexDialogViewController() {
      return WalletPairingIndexDialogViewController.__super__.constructor.apply(this, arguments);
    }

    WalletPairingIndexDialogViewController.prototype.initialize = function() {
      WalletPairingIndexDialogViewController.__super__.initialize.apply(this, arguments);
      return this._request = ledger.m2fa.requestPairing();
    };

    WalletPairingIndexDialogViewController.prototype.onAfterRender = function() {
      WalletPairingIndexDialogViewController.__super__.onAfterRender.apply(this, arguments);
      this.view.qrcode = new QRCode("qrcode_frame", {
        text: this._request.pairingId,
        width: 196,
        height: 196,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
      });
      this._request.on('sendChallenge', this._onSendChallenge);
      return this._request.onComplete(this._onComplete);
    };

    WalletPairingIndexDialogViewController.prototype.onDetach = function() {
      var _ref;
      WalletPairingIndexDialogViewController.__super__.onDetach.apply(this, arguments);
      return (_ref = this._request) != null ? _ref.off('sendChallenge', this._onSendChallenge) : void 0;
    };

    WalletPairingIndexDialogViewController.prototype.onDismiss = function() {
      var _ref;
      WalletPairingIndexDialogViewController.__super__.onDismiss.apply(this, arguments);
      return (_ref = this._request) != null ? _ref.cancel() : void 0;
    };

    WalletPairingIndexDialogViewController.prototype.openSupport = function() {
      return window.open(t('application.support_url'));
    };

    WalletPairingIndexDialogViewController.prototype._onSendChallenge = function() {
      var request, _ref;
      request = this._request;
      if ((_ref = this._request) != null) {
        _ref.off('sendChallenge', this._onSendChallenge);
      }
      this._request = null;
      return this.getDialog().push(new WalletPairingProgressDialogViewController({
        request: request
      }));
    };

    WalletPairingIndexDialogViewController.prototype._onComplete = function(screen, error) {
      if (error == null) {
        return;
      }
      this._request = null;
      this.once('dismiss', (function(_this) {
        return function() {
          var dialog;
          dialog = new CommonDialogsMessageDialogViewController({
            kind: "error",
            title: t("wallet.pairing.errors.pairing_failed"),
            subtitle: t("wallet.pairing.errors." + error)
          });
          return dialog.show();
        };
      })(this));
      return this.dismiss();
    };

    return WalletPairingIndexDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
