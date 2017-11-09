(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletMessageIndexDialogViewController = (function(_super) {
    __extends(WalletMessageIndexDialogViewController, _super);

    function WalletMessageIndexDialogViewController() {
      return WalletMessageIndexDialogViewController.__super__.constructor.apply(this, arguments);
    }

    WalletMessageIndexDialogViewController.prototype.view = {
      derivationPath: '#derivation_path',
      addressSelect: '#address',
      message: '#message',
      confirmButton: '#confirm_button',
      error: "#error_container"
    };

    WalletMessageIndexDialogViewController.prototype.onAfterRender = function() {
      var pair, _i, _len, _ref;
      WalletMessageIndexDialogViewController.__super__.onAfterRender.apply(this, arguments);
      this._isEditable = this.params.editable || false;
      chrome.app.window.current().show();
      this.view.derivationPath.val("m/" + Api.cleanPath(this.params.path));
      this.view.message.val(this.params.message);
      if (!this._isEditable) {
        this.view.message.attr("readonly", true);
        this.view.derivationPath.attr("readonly", true);
        return this.view.addressSelect.hide();
      } else {
        this.view.derivationPath.hide();
        this.view.addressSelect.show();
        _ref = ledger.wallet.Wallet.instance.getAllAddresses();
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          pair = _ref[_i];
          this.view.addressSelect.append("<option value=\"" + pair.key + "\">" + pair.value + "</option>");
        }
        this.view.addressSelect.chosen();
        return $('.chosen-container').css({
          width: '100%'
        });
      }
    };

    WalletMessageIndexDialogViewController.prototype.cancel = function() {
      if (!this._isEditable) {
        Api.callback_cancel('sign_message', t('wallet.message.errors.cancelled'));
      }
      return this.dismiss();
    };

    WalletMessageIndexDialogViewController.prototype.confirm = function() {
      var dialog, message, path;
      path = Api.cleanPath(this.view.derivationPath.val());
      if (this._isEditable) {
        path = Api.cleanPath(this.view.addressSelect.val());
      }
      message = this.view.message.val();
      if (!ledger.app.dongle.getFirmwareInformation().hasScreenAndButton() && !path.startsWith(ledger.bitcoin.bitid.ROOT_PATH)) {
        this.view.error.text(t("wallet.message.index.unsupported_path"));
        return;
      }
      if (_.isEmpty(path) || (path.match(/[^0-9\/'xa-f]/ig) != null)) {
        this.view.error.text(t("wallet.message.index.invalid_path"));
        return;
      }
      if (_.isEmpty(message)) {
        this.view.error.text(t("wallet.message.index.invalid_message"));
        return;
      }
      dialog = new WalletMessageProcessingDialogViewController({
        path: path,
        message: message,
        editable: this._isEditable
      });
      return this.getDialog().push(dialog);
    };

    return WalletMessageIndexDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
