(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.OnboardingManagementRecoverymodeViewController = (function(_super) {
    __extends(OnboardingManagementRecoverymodeViewController, _super);

    function OnboardingManagementRecoverymodeViewController() {
      return OnboardingManagementRecoverymodeViewController.__super__.constructor.apply(this, arguments);
    }

    OnboardingManagementRecoverymodeViewController.prototype.bumpsStepCount = false;

    OnboardingManagementRecoverymodeViewController.prototype.navigateConvert = function() {
      return this.navigateContinue('/onboarding/management/convert', {
        message_mode: 'old'
      });
    };

    OnboardingManagementRecoverymodeViewController.prototype.navigateRecoveryDevice = function() {
      return this.navigateContinue('/onboarding/management/recovery_device');
    };

    return OnboardingManagementRecoverymodeViewController;

  })(this.OnboardingViewController);

}).call(this);
