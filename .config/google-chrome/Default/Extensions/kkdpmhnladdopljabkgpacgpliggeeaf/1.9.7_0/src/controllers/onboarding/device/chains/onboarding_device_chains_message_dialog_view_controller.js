(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.OnboardingDeviceChainsMessageDialogViewController = (function(_super) {
    __extends(OnboardingDeviceChainsMessageDialogViewController, _super);

    function OnboardingDeviceChainsMessageDialogViewController() {
      return OnboardingDeviceChainsMessageDialogViewController.__super__.constructor.apply(this, arguments);
    }

    OnboardingDeviceChainsMessageDialogViewController.prototype.view = {
      split: ".split",
      un_split: ".un_split"
    };

    OnboardingDeviceChainsMessageDialogViewController.prototype.show = function() {
      return OnboardingDeviceChainsMessageDialogViewController.__super__.show.apply(this, arguments);
    };

    OnboardingDeviceChainsMessageDialogViewController.prototype.onAfterRender = function() {
      OnboardingDeviceChainsMessageDialogViewController.__super__.onAfterRender.apply(this, arguments);
      this.view.split.on("click", this.split);
      return this.view.un_split.on("click", this.un_split);
    };

    OnboardingDeviceChainsMessageDialogViewController.prototype.onDismiss = function() {
      OnboardingDeviceChainsMessageDialogViewController.__super__.onDismiss.apply(this, arguments);
      return l("On dismiss");
    };

    OnboardingDeviceChainsMessageDialogViewController.prototype.split = function(e) {
      this.emit('click:split');
      return this.dismiss();
    };

    OnboardingDeviceChainsMessageDialogViewController.prototype.un_split = function(e) {
      this.emit('click:un_split');
      return this.dismiss();
    };

    return OnboardingDeviceChainsMessageDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
