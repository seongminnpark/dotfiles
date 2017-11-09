(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletBitidIndexDialogViewController = (function(_super) {
    __extends(WalletBitidIndexDialogViewController, _super);

    function WalletBitidIndexDialogViewController() {
      return WalletBitidIndexDialogViewController.__super__.constructor.apply(this, arguments);
    }

    WalletBitidIndexDialogViewController.prototype.view = {
      confirmButton: '#confirm_button',
      errorContainer: '#error_container',
      bitidDomain: '#bitid_domain',
      bitidAddress: '#bitid_address'
    };

    WalletBitidIndexDialogViewController.prototype.onAfterRender = function() {
      WalletBitidIndexDialogViewController.__super__.onAfterRender.apply(this, arguments);
      this.view.confirmButton.addClass("disabled");
      this.uri = this.params.uri;
      this.doNotBroadcast = this.params.silent;
      this.view.bitidDomain.text(ledger.bitcoin.bitid.uriToDerivationUrl(this.uri));
      return ledger.bitcoin.bitid.getAddress({
        uri: this.uri
      }).then((function(_this) {
        return function(data) {
          _this.address = data.bitcoinAddress.value;
          _this.view.bitidAddress.text(_this.address);
          return ledger.bitcoin.bitid.signMessage(_this.uri, {
            uri: _this.uri
          });
        };
      })(this)).then((function(_this) {
        return function(sig) {
          _this.signature = sig;
          _this.view.confirmButton.removeClass("disabled");
          if (typeof _this.signature !== "string" || _this.signature.length === 0) {
            _this.view.errorContainer.text(t('wallet.bitid.errors.signature_failed'));
            return _this.view.confirmButton.text(t('common.close'));
          } else {
            return _this.view.confirmButton.text(t('common.confirm'));
          }
        };
      })(this))["catch"]((function(_this) {
        return function(error) {
          console.error(error);
          _this.view.errorContainer.text(t("wallet.bitid.errors.signature_failed"));
          return _this.view.confirmButton.text(t('common.close'));
        };
      })(this)).done();
    };

    WalletBitidIndexDialogViewController.prototype.cancel = function() {
      Api.callback_cancel('bitid', t('wallet.bitid.errors.cancelled'));
      return this.dismiss();
    };

    WalletBitidIndexDialogViewController.prototype.confirm = function() {
      var dialog;
      Api.callback_success('bitid', {
        address: this.address,
        signature: this.signature,
        uri: this.uri
      });
      if (typeof this.signature !== "string" || this.signature.length === 0 || this.doNotBroadcast === "true") {
        return this.dismiss();
      } else {
        dialog = new WalletBitidAuthenticatingDialogViewController({
          uri: this.uri,
          address: this.address,
          signature: this.signature
        });
        return this.getDialog().push(dialog);
      }
    };

    return WalletBitidIndexDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
