(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletSettingsHardwareSectionDialogViewController = (function(_super) {
    __extends(WalletSettingsHardwareSectionDialogViewController, _super);

    function WalletSettingsHardwareSectionDialogViewController() {
      return WalletSettingsHardwareSectionDialogViewController.__super__.constructor.apply(this, arguments);
    }

    WalletSettingsHardwareSectionDialogViewController.prototype.settingViewControllersClasses = [WalletSettingsHardwareFirmwareSettingViewController, WalletSettingsHardwareSmartphonesSettingViewController];

    WalletSettingsHardwareSectionDialogViewController.prototype.onAfterRender = function() {
      WalletSettingsHardwareSectionDialogViewController.__super__.onAfterRender.apply(this, arguments);
      if (ledger.app.dongle.getFirmwareInformation().hasScreenAndButton()) {
        $('a[href$="#flashFirmware"]').hide();
        return $('#smartphones_table_container').hide();
      }
    };

    return WalletSettingsHardwareSectionDialogViewController;

  })(WalletSettingsSectionDialogViewController);

}).call(this);
