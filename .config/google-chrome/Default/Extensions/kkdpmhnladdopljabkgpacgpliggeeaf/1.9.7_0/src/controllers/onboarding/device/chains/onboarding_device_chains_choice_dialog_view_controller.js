(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.OnboardingDeviceChainsChoiceDialogViewController = (function(_super) {
    __extends(OnboardingDeviceChainsChoiceDialogViewController, _super);

    OnboardingDeviceChainsChoiceDialogViewController.prototype.view = {
      first: ".first",
      second: ".second",
      link: '#link',
      cancel: ".cancel"
    };

    function OnboardingDeviceChainsChoiceDialogViewController(_arg) {
      this.title = _arg.title, this.text = _arg.text, this.firstChoice = _arg.firstChoice, this.secondChoice = _arg.secondChoice, this.cancel = _arg.cancel;
      OnboardingDeviceChainsChoiceDialogViewController.__super__.constructor.apply(this, arguments);
    }

    OnboardingDeviceChainsChoiceDialogViewController.prototype.show = function() {
      return OnboardingDeviceChainsChoiceDialogViewController.__super__.show.apply(this, arguments);
    };

    OnboardingDeviceChainsChoiceDialogViewController.prototype.onAfterRender = function() {
      OnboardingDeviceChainsChoiceDialogViewController.__super__.onAfterRender.apply(this, arguments);
      this.view.first.on("click", this.first);
      this.view.second.on("click", this.second);
      return this.view.cancel.on("click", this.first);
    };

    OnboardingDeviceChainsChoiceDialogViewController.prototype.onDismiss = function() {
      return OnboardingDeviceChainsChoiceDialogViewController.__super__.onDismiss.apply(this, arguments);
    };

    OnboardingDeviceChainsChoiceDialogViewController.prototype.openLink = function() {
      return open("https://bitcoincore.org/en/2016/01/26/segwit-benefits/");
    };

    OnboardingDeviceChainsChoiceDialogViewController.prototype.first = function(e) {
      this.emit('click:first');
      return this.dismiss();
    };

    OnboardingDeviceChainsChoiceDialogViewController.prototype.second = function(e) {
      this.emit('click:second');
      return this.dismiss();
    };

    return OnboardingDeviceChainsChoiceDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
