(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletSettingsToolsSectionDialogViewController = (function(_super) {
    __extends(WalletSettingsToolsSectionDialogViewController, _super);

    function WalletSettingsToolsSectionDialogViewController() {
      return WalletSettingsToolsSectionDialogViewController.__super__.constructor.apply(this, arguments);
    }

    WalletSettingsToolsSectionDialogViewController.prototype.settingViewControllersClasses = [WalletSettingsToolsLogsSettingViewController, WalletSettingsToolsUtilitiesSettingViewController];

    return WalletSettingsToolsSectionDialogViewController;

  })(WalletSettingsSectionDialogViewController);

}).call(this);
