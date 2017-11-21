(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletSettingsAppsSectionDialogViewController = (function(_super) {
    __extends(WalletSettingsAppsSectionDialogViewController, _super);

    function WalletSettingsAppsSectionDialogViewController() {
      return WalletSettingsAppsSectionDialogViewController.__super__.constructor.apply(this, arguments);
    }

    WalletSettingsAppsSectionDialogViewController.prototype.settingViewControllersClasses = [WalletSettingsAppsListSettingViewController];

    return WalletSettingsAppsSectionDialogViewController;

  })(WalletSettingsSectionDialogViewController);

}).call(this);
