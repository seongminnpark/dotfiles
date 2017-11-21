(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.OnboardingDeviceChainsRecoverDialogViewController = (function(_super) {
    __extends(OnboardingDeviceChainsRecoverDialogViewController, _super);

    function OnboardingDeviceChainsRecoverDialogViewController() {
      return OnboardingDeviceChainsRecoverDialogViewController.__super__.constructor.apply(this, arguments);
    }

    OnboardingDeviceChainsRecoverDialogViewController.prototype.view = {
      recover: ".recover"
    };

    OnboardingDeviceChainsRecoverDialogViewController.prototype.show = function() {
      return OnboardingDeviceChainsRecoverDialogViewController.__super__.show.apply(this, arguments);
    };

    OnboardingDeviceChainsRecoverDialogViewController.prototype.onAfterRender = function() {
      OnboardingDeviceChainsRecoverDialogViewController.__super__.onAfterRender.apply(this, arguments);
      return this.view.recover.on("click", this.recover);
    };

    OnboardingDeviceChainsRecoverDialogViewController.prototype.onDismiss = function() {
      return OnboardingDeviceChainsRecoverDialogViewController.__super__.onDismiss.apply(this, arguments);
    };

    OnboardingDeviceChainsRecoverDialogViewController.prototype.recover = function(e) {
      this.emit('click:recover');
      return this.dismiss();
    };

    return OnboardingDeviceChainsRecoverDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
