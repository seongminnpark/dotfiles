(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletSettingsBitcoinSectionDialogViewController = (function(_super) {
    __extends(WalletSettingsBitcoinSectionDialogViewController, _super);

    function WalletSettingsBitcoinSectionDialogViewController() {
      return WalletSettingsBitcoinSectionDialogViewController.__super__.constructor.apply(this, arguments);
    }

    WalletSettingsBitcoinSectionDialogViewController.prototype.settingViewControllersClasses = [WalletSettingsBitcoinConfirmationsSettingViewController, WalletSettingsBitcoinFeesSettingViewController, WalletSettingsBitcoinBlockchainSettingViewController];

    return WalletSettingsBitcoinSectionDialogViewController;

  })(WalletSettingsSectionDialogViewController);

}).call(this);
