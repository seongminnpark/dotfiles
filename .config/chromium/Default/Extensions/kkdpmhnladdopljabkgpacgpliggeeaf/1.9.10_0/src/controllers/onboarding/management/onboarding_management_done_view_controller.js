(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.OnboardingManagementDoneViewController = (function(_super) {
    __extends(OnboardingManagementDoneViewController, _super);

    function OnboardingManagementDoneViewController() {
      return OnboardingManagementDoneViewController.__super__.constructor.apply(this, arguments);
    }

    OnboardingManagementDoneViewController.prototype.bumpsStepCount = false;

    OnboardingManagementDoneViewController.prototype.openSupport = function() {
      return window.open(t('application.support_url'));
    };

    return OnboardingManagementDoneViewController;

  })(this.OnboardingViewController);

}).call(this);
