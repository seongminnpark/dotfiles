(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletSettingsToolsUtilitiesSettingViewController = (function(_super) {
    __extends(WalletSettingsToolsUtilitiesSettingViewController, _super);

    function WalletSettingsToolsUtilitiesSettingViewController() {
      return WalletSettingsToolsUtilitiesSettingViewController.__super__.constructor.apply(this, arguments);
    }

    WalletSettingsToolsUtilitiesSettingViewController.prototype.renderSelector = "#protocols_table_container";

    WalletSettingsToolsUtilitiesSettingViewController.prototype.openRegistration = function() {
      window.open("https://www.ledgerwallet.com/wallet/register");
      return this.parentViewController.dismiss();
    };

    WalletSettingsToolsUtilitiesSettingViewController.prototype.resetApplicationData = function() {
      var dialog;
      dialog = new CommonDialogsConfirmationDialogViewController();
      dialog.setMessageLocalizableKey('wallet.settings.tools.resetting_application_data');
      dialog.positiveLocalizableKey = 'common.no';
      dialog.negativeLocalizableKey = 'common.yes';
      dialog.once('click:negative', (function(_this) {
        return function() {
          return ledger.database.main["delete"](function() {
            chrome.storage.local.clear();
            return chrome.runtime.reload();
          });
        };
      })(this));
      return dialog.show();
    };

    WalletSettingsToolsUtilitiesSettingViewController.prototype.signMessage = function() {
      var dialog;
      dialog = new WalletMessageIndexDialogViewController({
        path: "44'/" + ledger.config.network.bip44_coin_type + "'/0/0",
        message: "",
        editable: true
      });
      dialog.show();
      return this.parentViewController.dismiss();
    };

    return WalletSettingsToolsUtilitiesSettingViewController;

  })(WalletSettingsSettingViewController);

}).call(this);
