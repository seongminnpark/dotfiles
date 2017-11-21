(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.OnboardingManagementRecoverydeviceViewController = (function(_super) {
    __extends(OnboardingManagementRecoverydeviceViewController, _super);

    function OnboardingManagementRecoverydeviceViewController() {
      return OnboardingManagementRecoverydeviceViewController.__super__.constructor.apply(this, arguments);
    }

    OnboardingManagementRecoverydeviceViewController.prototype.bumpsStepCount = false;

    OnboardingManagementRecoverydeviceViewController.prototype.navigateConvert = function() {
      return this.navigateContinue('/onboarding/management/convert', {
        message_mode: 'new'
      });
    };

    OnboardingManagementRecoverydeviceViewController.prototype.navigatePin = function() {
      return this.navigateContinue('/onboarding/management/pin');
    };

    return OnboardingManagementRecoverydeviceViewController;

  })(this.OnboardingViewController);

}).call(this);
