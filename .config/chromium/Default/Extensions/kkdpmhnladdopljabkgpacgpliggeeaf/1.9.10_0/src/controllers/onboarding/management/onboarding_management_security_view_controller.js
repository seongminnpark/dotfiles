(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.OnboardingManagementSecurityViewController = (function(_super) {
    __extends(OnboardingManagementSecurityViewController, _super);

    function OnboardingManagementSecurityViewController() {
      return OnboardingManagementSecurityViewController.__super__.constructor.apply(this, arguments);
    }

    OnboardingManagementSecurityViewController.prototype.navigation = {
      continueUrl: '/onboarding/management/pin'
    };

    OnboardingManagementSecurityViewController.prototype.onAfterRender = function() {
      var firmware;
      OnboardingManagementSecurityViewController.__super__.onAfterRender.apply(this, arguments);
      firmware = ledger.app.dongle.getFirmwareInformation();
      if (firmware.hasSubFirmwareSupport() && !firmware.hasSetupFirmwareSupport()) {
        return ledger.app.router.go('/onboarding/device/switch_firmware', _.extend(_.clone(this.params), {
          mode: 'setup',
          on_done: '/onboarding/management/security'
        }));
      }
    };

    return OnboardingManagementSecurityViewController;

  })(this.OnboardingViewController);

}).call(this);
