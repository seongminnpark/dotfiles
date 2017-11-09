(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.OnboardingDeviceFailedViewController = (function(_super) {
    __extends(OnboardingDeviceFailedViewController, _super);

    function OnboardingDeviceFailedViewController() {
      return OnboardingDeviceFailedViewController.__super__.constructor.apply(this, arguments);
    }

    OnboardingDeviceFailedViewController.prototype.updateNow = function() {
      ledger.app.setExecutionMode(ledger.app.Modes.FirmwareUpdate);
      return ledger.app.router.go('/');
    };

    return OnboardingDeviceFailedViewController;

  })(this.OnboardingViewController);

}).call(this);
