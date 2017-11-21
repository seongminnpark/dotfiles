(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletSettingsHardwareFirmwareSettingViewController = (function(_super) {
    __extends(WalletSettingsHardwareFirmwareSettingViewController, _super);

    function WalletSettingsHardwareFirmwareSettingViewController() {
      return WalletSettingsHardwareFirmwareSettingViewController.__super__.constructor.apply(this, arguments);
    }

    WalletSettingsHardwareFirmwareSettingViewController.prototype.renderSelector = "#firmware_table_container";

    WalletSettingsHardwareFirmwareSettingViewController.prototype.view = {
      currentVersionText: "#current_version_text",
      updateAvailabilityText: "#update_availability_text"
    };

    WalletSettingsHardwareFirmwareSettingViewController.prototype.onAfterRender = function() {
      WalletSettingsHardwareFirmwareSettingViewController.__super__.onAfterRender.apply(this, arguments);
      return this._refreshFirmwareStatus();
    };

    WalletSettingsHardwareFirmwareSettingViewController.prototype.flashFirmware = function() {
      var dialog;
      dialog = new CommonDialogsConfirmationDialogViewController();
      dialog.setMessageLocalizableKey('common.errors.going_to_firmware_update');
      dialog.positiveLocalizableKey = 'common.no';
      dialog.negativeLocalizableKey = 'common.yes';
      dialog.once('click:negative', (function(_this) {
        return function() {
          ledger.app.setExecutionMode(ledger.app.Modes.FirmwareUpdate);
          return ledger.app.router.go('/');
        };
      })(this));
      return dialog.show();
    };

    WalletSettingsHardwareFirmwareSettingViewController.prototype._refreshFirmwareStatus = function() {
      return ledger.fup.FirmwareUpdater.instance.getFirmwareUpdateAvailability(ledger.app.dongle, false, false, (function(_this) {
        return function(availability, error) {
          if (error != null) {
            return;
          }
          _this.view.updateAvailabilityText.text((function() {
            if (availability.available) {
              return _.str.sprintf(t('wallet.settings.hardware.update_available'), ledger.fup.utils.versionToString(availability.currentVersion));
            } else {
              return t('wallet.settings.hardware.no_update_available');
            }
          })());
          return _this.view.currentVersionText.text(ledger.fup.utils.versionToString(availability.dongleVersion));
        };
      })(this));
    };

    return WalletSettingsHardwareFirmwareSettingViewController;

  })(WalletSettingsSettingViewController);

}).call(this);
