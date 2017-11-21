(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletSettingsDisplaySectionDialogViewController = (function(_super) {
    __extends(WalletSettingsDisplaySectionDialogViewController, _super);

    function WalletSettingsDisplaySectionDialogViewController() {
      return WalletSettingsDisplaySectionDialogViewController.__super__.constructor.apply(this, arguments);
    }

    WalletSettingsDisplaySectionDialogViewController.prototype.settingViewControllersClasses = [WalletSettingsDisplayUnitsSettingViewController, WalletSettingsDisplayCurrencySettingViewController, WalletSettingsDisplayLanguageSettingViewController];

    return WalletSettingsDisplaySectionDialogViewController;

  })(WalletSettingsSectionDialogViewController);

}).call(this);
