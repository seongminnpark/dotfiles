(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.OnboardingDeviceUnsupportedViewController = (function(_super) {
    __extends(OnboardingDeviceUnsupportedViewController, _super);

    function OnboardingDeviceUnsupportedViewController() {
      return OnboardingDeviceUnsupportedViewController.__super__.constructor.apply(this, arguments);
    }

    OnboardingDeviceUnsupportedViewController.prototype.updateNow = function() {
      ledger.app.setExecutionMode(ledger.app.Modes.FirmwareUpdate);
      return ledger.app.router.go('/');
    };

    return OnboardingDeviceUnsupportedViewController;

  })(this.OnboardingViewController);

}).call(this);
