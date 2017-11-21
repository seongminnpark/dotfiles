(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletSettingsHardwareSmartphonesSettingViewController = (function(_super) {
    __extends(WalletSettingsHardwareSmartphonesSettingViewController, _super);

    function WalletSettingsHardwareSmartphonesSettingViewController() {
      return WalletSettingsHardwareSmartphonesSettingViewController.__super__.constructor.apply(this, arguments);
    }

    WalletSettingsHardwareSmartphonesSettingViewController.prototype.renderSelector = "#smartphones_table_container";

    WalletSettingsHardwareSmartphonesSettingViewController.prototype.initialize = function() {
      WalletSettingsHardwareSmartphonesSettingViewController.__super__.initialize.apply(this, arguments);
      return this._smartphonesGroups = [];
    };

    WalletSettingsHardwareSmartphonesSettingViewController.prototype.pairSmartphone = function() {
      var dialog;
      dialog = new WalletPairingIndexDialogViewController();
      dialog.show();
      return dialog.getDialog().once('dismiss', (function(_this) {
        return function() {
          return _this.rerender();
        };
      })(this));
    };

    WalletSettingsHardwareSmartphonesSettingViewController.prototype.removeSmartphoneGroup = function(params) {
      var dialog, secureScreens;
      secureScreens = this._smartphonesGroups[params.index];
      dialog = new CommonDialogsConfirmationDialogViewController();
      dialog.setMessageLocalizableKey('common.errors.deleting_this_paired_smartphone');
      dialog.positiveLocalizableKey = 'common.no';
      dialog.negativeLocalizableKey = 'common.yes';
      dialog.once('click:negative', (function(_this) {
        return function() {
          return ledger.m2fa.PairedSecureScreen.removePairedSecureScreensFromSyncedStore(secureScreens, function() {
            return _this.rerender();
          });
        };
      })(this));
      return dialog.show();
    };

    WalletSettingsHardwareSmartphonesSettingViewController.prototype.render = function(selector) {
      if (ledger.app.dongle == null) {
        return;
      }
      if (!ledger.app.dongle.getFirmwareInformation().hasSecureScreen2FASupport()) {
        _.defer((function(_this) {
          return function() {
            return _this.emit('afterRender');
          };
        })(this));
        return;
      }
      return ledger.m2fa.PairedSecureScreen.getAllGroupedByUuidFromSyncedStore((function(_this) {
        return function(smartphonesGroups, error) {
          if ((error != null) || (smartphonesGroups == null)) {
            return;
          }
          _this._smartphonesGroups = _.sortBy(_.values(_.omit(smartphonesGroups, void 0)), function(item) {
            var _ref;
            return (_ref = item[0]) != null ? _ref.name : void 0;
          });
          return WalletSettingsHardwareSmartphonesSettingViewController.__super__.render.call(_this, selector);
        };
      })(this));
    };

    return WalletSettingsHardwareSmartphonesSettingViewController;

  })(WalletSettingsSettingViewController);

}).call(this);
