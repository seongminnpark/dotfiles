(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletSettingsAppsListSettingViewController = (function(_super) {
    __extends(WalletSettingsAppsListSettingViewController, _super);

    function WalletSettingsAppsListSettingViewController() {
      return WalletSettingsAppsListSettingViewController.__super__.constructor.apply(this, arguments);
    }

    WalletSettingsAppsListSettingViewController.prototype.renderSelector = "#list_table_container";

    WalletSettingsAppsListSettingViewController.prototype.openCoinkite = function() {
      ledger.app.router.go("/apps/coinkite/dashboard/index");
      return this.parentViewController.dismiss();
    };

    WalletSettingsAppsListSettingViewController.prototype.openBitID = function() {
      ledger.app.router.go("/wallet/bitid/form");
      return this.parentViewController.dismiss();
    };

    return WalletSettingsAppsListSettingViewController;

  })(WalletSettingsSettingViewController);

}).call(this);
