(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletSettingsIndexDialogViewController = (function(_super) {
    __extends(WalletSettingsIndexDialogViewController, _super);

    function WalletSettingsIndexDialogViewController() {
      return WalletSettingsIndexDialogViewController.__super__.constructor.apply(this, arguments);
    }

    WalletSettingsIndexDialogViewController.prototype.view = {
      chain: '#chain'
    };

    WalletSettingsIndexDialogViewController.prototype.onAfterRender = function() {
      WalletSettingsIndexDialogViewController.__super__.onAfterRender.apply(this, arguments);
      if (ledger.config.network.chain == null) {
        this.view.chain.css('opacity', '0.0');
        return this.view.chain.css('pointer-events', 'none');
      }
    };

    WalletSettingsIndexDialogViewController.prototype.openHardware = function() {
      return this.getDialog().push(new WalletSettingsHardwareSectionDialogViewController());
    };

    WalletSettingsIndexDialogViewController.prototype.openApps = function() {
      return this.getDialog().push(new WalletSettingsAppsSectionDialogViewController());
    };

    WalletSettingsIndexDialogViewController.prototype.openDisplay = function() {
      return this.getDialog().push(new WalletSettingsDisplaySectionDialogViewController());
    };

    WalletSettingsIndexDialogViewController.prototype.openBitcoin = function() {
      return this.getDialog().push(new WalletSettingsBitcoinSectionDialogViewController());
    };

    WalletSettingsIndexDialogViewController.prototype.openTools = function() {
      return this.getDialog().push(new WalletSettingsToolsSectionDialogViewController());
    };

    return WalletSettingsIndexDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
