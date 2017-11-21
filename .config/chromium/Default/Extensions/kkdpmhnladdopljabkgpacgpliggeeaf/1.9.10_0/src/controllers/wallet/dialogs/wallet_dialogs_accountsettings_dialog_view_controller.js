(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletDialogsAccountsettingsDialogViewController = (function(_super) {
    __extends(WalletDialogsAccountsettingsDialogViewController, _super);

    function WalletDialogsAccountsettingsDialogViewController() {
      return WalletDialogsAccountsettingsDialogViewController.__super__.constructor.apply(this, arguments);
    }

    WalletDialogsAccountsettingsDialogViewController.prototype.view = {
      colorsSelect: '#colors_select',
      colorSquare: '#color_square',
      errorContainer: '#error_container',
      accountNameInput: '#account_name_input',
      rootPathLabel: '#root_path_label'
    };

    WalletDialogsAccountsettingsDialogViewController.prototype.onBeforeRender = function() {
      WalletDialogsAccountsettingsDialogViewController.__super__.onBeforeRender.apply(this, arguments);
      if (Account.displayableAccounts().length > 1) {
        return this._deleteMode = this._getAccount().isDeletable() ? 'delete' : 'hide';
      } else {
        return this._deleteMode = 'none';
      }
    };

    WalletDialogsAccountsettingsDialogViewController.prototype.onAfterRender = function() {
      WalletDialogsAccountsettingsDialogViewController.__super__.onAfterRender.apply(this, arguments);
      ledger.preferences.defaults.Accounts.applyColorsToSelect(this.view.colorsSelect, (function(_this) {
        return function(option) {
          if (_this._getAccount().get('color') === option.val()) {
            return option.attr('selected', true);
          }
        };
      })(this));
      this.view.rootPathLabel.text(this._getAccount().getWalletAccount().getRootDerivationPath());
      this._updateAccountColorSquare();
      this._updateErrorContainerText();
      this._updateUIAccordingToAccount();
      return this._listenEvents();
    };

    WalletDialogsAccountsettingsDialogViewController.prototype.onShow = function() {
      WalletDialogsAccountsettingsDialogViewController.__super__.onShow.apply(this, arguments);
      return this.view.accountNameInput.focus();
    };

    WalletDialogsAccountsettingsDialogViewController.prototype.saveAccount = function() {
      if (this._checkCurrentFormError() === false) {
        this._getAccount().set('name', this._accountName()).set('color', this.view.colorsSelect.val()).save();
        return this.dismiss();
      }
    };

    WalletDialogsAccountsettingsDialogViewController.prototype.hideAccount = function() {
      var hide;
      hide = !this._getAccount().isDeletable();
      return new CommonDialogsConfirmationDialogViewController({
        message: hide ? 'wallet.dialogs.accountsettings.hide_confirmation' : 'wallet.dialogs.accountsettings.delete_confirmation'
      }).show().once('click:positive', (function(_this) {
        return function() {
          if (hide) {
            _this._getAccount().set('hidden', true).save();
          } else {
            l("Hide account");
            _this._getAccount()["delete"]();
          }
          _this.dismiss();
          return ledger.app.router.go('/wallet/accounts/index');
        };
      })(this));
    };

    WalletDialogsAccountsettingsDialogViewController.prototype.exportXPub = function() {
      return (new WalletDialogsXpubDialogViewController({
        account_id: this._getAccount().get('index')
      })).show();
    };

    WalletDialogsAccountsettingsDialogViewController.prototype._listenEvents = function() {
      return this.view.colorsSelect.on('change', this._updateAccountColorSquare);
    };

    WalletDialogsAccountsettingsDialogViewController.prototype._checkCurrentFormError = function() {
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

    WalletDialogsAccountsettingsDialogViewController.prototype._updateAccountColorSquare = function() {
      return this.view.colorSquare.css('color', this.view.colorsSelect.val());
    };

    WalletDialogsAccountsettingsDialogViewController.prototype._updateErrorContainerText = function(text) {
      if (text != null) {
        this.view.errorContainer.text(text);
        return this.view.errorContainer.show();
      } else {
        this.view.errorContainer.text('');
        return this.view.errorContainer.hide();
      }
    };

    WalletDialogsAccountsettingsDialogViewController.prototype._updateUIAccordingToAccount = function() {
      return this.view.accountNameInput.val(this._getAccount().get('name'));
    };

    WalletDialogsAccountsettingsDialogViewController.prototype._accountName = function() {
      return _.str.trim(this.view.accountNameInput.val());
    };

    WalletDialogsAccountsettingsDialogViewController.prototype._getAccount = function() {
      return this._account || (this._account = Account.find({
        index: this.params.account_id
      }).first());
    };

    return WalletDialogsAccountsettingsDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
