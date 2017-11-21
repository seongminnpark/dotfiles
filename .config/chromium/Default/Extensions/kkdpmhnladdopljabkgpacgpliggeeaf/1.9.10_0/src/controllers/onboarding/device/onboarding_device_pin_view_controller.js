(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.OnboardingDevicePinViewController = (function(_super) {
    __extends(OnboardingDevicePinViewController, _super);

    function OnboardingDevicePinViewController() {
      return OnboardingDevicePinViewController.__super__.constructor.apply(this, arguments);
    }

    OnboardingDevicePinViewController.prototype.onAfterRender = function() {
      OnboardingDevicePinViewController.__super__.onAfterRender.apply(this, arguments);
      return this._insertPinCode();
    };

    OnboardingDevicePinViewController.prototype._insertPinCode = function() {
      this.view.pinCode = new ledger.pin_codes.PinCode();
      this.view.pinCode.insertIn(this.select('div#pin_container')[0]);
      this.view.pinCode.setStealsFocus(true);
      return this.view.pinCode.once('complete', (function(_this) {
        return function(event, value) {
          return ledger.app.dongle.unlockWithPinCode(value, function(success, error) {
            var firmware;
            if (error != null) {
              l(error);
            }
            if (success) {
              firmware = ledger.app.dongle.getFirmwareInformation();
              if (firmware.hasSubFirmwareSupport() && firmware.hasSetupFirmwareSupport()) {
                return ledger.app.router.go('/onboarding/device/switch_firmware', {
                  pin: value,
                  mode: 'operation_and_open'
                });
              } else {
                ledger.app.notifyDongleIsUnlocked();
                return ledger.utils.Logger.setPrivateModeEnabled(true);
              }
            } else if (error.code === ledger.errors.WrongPinCode && error['retryCount'] > 0) {
              return ledger.app.router.go('/onboarding/device/wrongpin', {
                tries_left: error['retryCount']
              });
            } else if (error.code === ledger.errors.NotSupportedDongle) {
              return ledger.app.router.go('/onboarding/device/unsupported');
            } else {
              return ledger.app.router.go('/onboarding/device/frozen');
            }
          });
        };
      })(this));
    };

    OnboardingDevicePinViewController.prototype.openSupport = function() {
      return window.open(t('application.support_url'));
    };

    return OnboardingDevicePinViewController;

  })(this.OnboardingViewController);

}).call(this);
