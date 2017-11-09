(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletBitidFormDialogViewController = (function(_super) {
    __extends(WalletBitidFormDialogViewController, _super);

    function WalletBitidFormDialogViewController() {
      return WalletBitidFormDialogViewController.__super__.constructor.apply(this, arguments);
    }

    WalletBitidFormDialogViewController.prototype.view = {
      bitidUri: '#bitid_uri',
      errorContainer: '#error_container'
    };

    WalletBitidFormDialogViewController.prototype.onShow = function() {
      WalletBitidFormDialogViewController.__super__.onShow.apply(this, arguments);
      return this.view.bitidUri.focus();
    };

    WalletBitidFormDialogViewController.prototype.next = function() {
      var dialog, nextError;
      nextError = this._nextFormError();
      if (nextError != null) {
        this.view.errorContainer.show();
        return this.view.errorContainer.text(nextError);
      } else {
        this.view.errorContainer.hide();
        dialog = new WalletBitidIndexDialogViewController({
          uri: this._uri(),
          silent: true
        });
        return this.getDialog().push(dialog);
      }
    };

    WalletBitidFormDialogViewController.prototype._uri = function() {
      return _.str.trim(this.view.bitidUri.val());
    };

    WalletBitidFormDialogViewController.prototype._nextFormError = function() {
      if (!ledger.bitcoin.bitid.isValidUri(this._uri())) {
        return t('wallet.bitid.form.invalid_uri');
      }
      return void 0;
    };

    return WalletBitidFormDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
