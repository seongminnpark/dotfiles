(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletDialogsAddaccountDialogViewController = (function(_super) {
    __extends(WalletDialogsAddaccountDialogViewController, _super);

    function WalletDialogsAddaccountDialogViewController() {
      return WalletDialogsAddaccountDialogViewController.__super__.constructor.apply(this, arguments);
    }

    WalletDialogsAddaccountDialogViewController.prototype.view = {
      colorsSelect: '#colors_select',
      colorSquare: '#color_square',
      errorContainer: '#error_container',
      accountNameInput: '#account_name_input'
    };

    WalletDialogsAddaccountDialogViewController.prototype.onBeforeRender = function() {
      WalletDialogsAddaccountDialogViewController.__super__.onBeforeRender.apply(this, arguments);
      return this.hiddenAccounts = Account.hiddenAccounts();
    };

    WalletDialogsAddaccountDialogViewController.prototype.onAfterRender = function() {
      WalletDialogsAddaccountDialogViewController.__super__.onAfterRender.apply(this, arguments);
      ledger.preferences.defaults.Accounts.applyColorsToSelect(this.view.colorsSelect);
      this._updateAccountColorSquare();
      this._updateErrorContainerText();
      return this._listenEvents();
    };

    WalletDialogsAddaccountDialogViewController.prototype.onShow = function() {
      WalletDialogsAddaccountDialogViewController.__super__.onShow.apply(this, arguments);
      return this.view.accountNameInput.focus();
    };

    WalletDialogsAddaccountDialogViewController.prototype.addAccount = function() {
      var account;
      if (this._checkCurrentFormError() === false) {
        account = Account.create({
          index: ledger.wallet.Wallet.instance.getNextAccountIndex(),
          name: this._accountName(),
          color: this.view.colorsSelect.val(),
          hidden: false
        }).save();
        Wallet.instance.add('accounts', account).save();
        return this.dismiss();
      }
    };

    WalletDialogsAddaccountDialogViewController.prototype.showAccount = function(params) {
      Account.findById(+params["id"]).set('hidden', false).save();
      return this.dismiss();
    };

    WalletDialogsAddaccountDialogViewController.prototype._listenEvents = function() {
      return this.view.colorsSelect.on('change', this._updateAccountColorSquare);
    };

    WalletDialogsAddaccountDialogViewController.prototype._checkCurrentFormError = function() {
      var accountName;
      accountName = this._accountName();
      if (accountName.length === 0) {
        this._updateErrorContainerText(t('common.errors.fill_all_fields'));
        return true;
      } else {
        this._updateErrorContainerText();
        return false;
      }
    };

    WalletDialogsAddaccountDialogViewController.prototype._updateAccountColorSquare = function() {
      return this.view.colorSquare.css('color', this.view.colorsSelect.val());
    };

    WalletDialogsAddaccountDialogViewController.prototype._updateErrorContainerText = function(text) {
      if (text != null) {
        this.view.errorContainer.text(text);
        return this.view.errorContainer.show();
      } else {
        this.view.errorContainer.text('');
        return this.view.errorContainer.hide();
      }
    };

    WalletDialogsAddaccountDialogViewController.prototype._accountName = function() {
      return _.str.trim(this.view.accountNameInput.val());
    };

    return WalletDialogsAddaccountDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
