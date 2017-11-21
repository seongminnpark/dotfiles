(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.OnboardingManagementConvertViewController = (function(_super) {
    __extends(OnboardingManagementConvertViewController, _super);

    function OnboardingManagementConvertViewController() {
      return OnboardingManagementConvertViewController.__super__.constructor.apply(this, arguments);
    }

    OnboardingManagementConvertViewController.prototype.navigation = {
      continueUrl: '/onboarding/management/pin'
    };

    OnboardingManagementConvertViewController.prototype.bumpsStepCount = false;

    return OnboardingManagementConvertViewController;

  })(this.OnboardingViewController);

}).call(this);
