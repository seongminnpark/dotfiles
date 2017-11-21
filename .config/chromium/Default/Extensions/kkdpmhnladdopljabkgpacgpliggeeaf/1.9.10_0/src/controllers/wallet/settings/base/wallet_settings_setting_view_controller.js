(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletSettingsSettingViewController = (function(_super) {
    __extends(WalletSettingsSettingViewController, _super);

    function WalletSettingsSettingViewController() {
      return WalletSettingsSettingViewController.__super__.constructor.apply(this, arguments);
    }

    WalletSettingsSettingViewController.prototype.renderSelector = null;

    WalletSettingsSettingViewController.prototype.identifier = function() {
      return this.className().replace('SettingViewController', '');
    };

    WalletSettingsSettingViewController.prototype.stylesheetIdentifier = function() {
      return null;
    };

    return WalletSettingsSettingViewController;

  })(ledger.common.ViewController);

}).call(this);
