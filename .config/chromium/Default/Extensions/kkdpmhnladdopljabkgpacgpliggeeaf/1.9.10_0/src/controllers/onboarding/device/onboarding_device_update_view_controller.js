(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.OnboardingDeviceUpdateViewController = (function(_super) {
    __extends(OnboardingDeviceUpdateViewController, _super);

    function OnboardingDeviceUpdateViewController() {
      return OnboardingDeviceUpdateViewController.__super__.constructor.apply(this, arguments);
    }

    OnboardingDeviceUpdateViewController.prototype.view = {
      notNowButton: "#not_now_button"
    };

    OnboardingDeviceUpdateViewController.prototype.updateNow = function() {
      ledger.app.setExecutionMode(ledger.app.Modes.FirmwareUpdate);
      return ledger.app.router.go('/');
    };

    OnboardingDeviceUpdateViewController.prototype.notNow = function() {
      return ledger.app.dongle.getState((function(_this) {
        return function(state) {
          if (state === ledger.dongle.States.LOCKED) {
            return ledger.app.router.go('/onboarding/device/pin');
          } else {
            return ledger.app.router.go('/onboarding/management/welcome');
          }
        };
      })(this));
    };

    OnboardingDeviceUpdateViewController.prototype.onAfterRender = function() {
      OnboardingDeviceUpdateViewController.__super__.onAfterRender.apply(this, arguments);
      if (ledger.app.dongle.getStringFirmwareVersion() === "1.0.0") {
        return this.view.notNowButton.hide();
      }
    };

    return OnboardingDeviceUpdateViewController;

  })(this.OnboardingViewController);

}).call(this);
