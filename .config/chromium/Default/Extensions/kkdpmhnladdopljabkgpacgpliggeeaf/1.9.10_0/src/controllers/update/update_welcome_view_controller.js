(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.UpdateWelcomeViewController = (function(_super) {
    __extends(UpdateWelcomeViewController, _super);

    function UpdateWelcomeViewController() {
      return UpdateWelcomeViewController.__super__.constructor.apply(this, arguments);
    }

    UpdateWelcomeViewController.prototype.localizablePageSubtitle = "update.welcome.ledger_wallet";

    UpdateWelcomeViewController.prototype.navigation = {
      nextRoute: "",
      previousRoute: "/onboarding/device/plug",
      previousParams: {
        animateIntro: false
      }
    };

    UpdateWelcomeViewController.prototype.navigatePrevious = function() {
      ledger.app.setExecutionMode(ledger.app.Modes.Wallet);
      return UpdateWelcomeViewController.__super__.navigatePrevious.apply(this, arguments);
    };

    UpdateWelcomeViewController.prototype.navigateNext = function() {
      return this.getRequest().startUpdate();
    };

    return UpdateWelcomeViewController;

  })(UpdateViewController);

}).call(this);
