(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.UpdateIndexViewController = (function(_super) {
    __extends(UpdateIndexViewController, _super);

    function UpdateIndexViewController() {
      return UpdateIndexViewController.__super__.constructor.apply(this, arguments);
    }

    UpdateIndexViewController.prototype.navigation = {
      nextRoute: "",
      previousRoute: "/onboarding/device/plug",
      previousParams: {
        animateIntro: false
      }
    };

    UpdateIndexViewController.prototype.localizablePageSubtitle = "update.index.important_notice";

    UpdateIndexViewController.prototype.navigatePrevious = function() {
      ledger.app.setExecutionMode(ledger.app.Modes.Wallet);
      return UpdateIndexViewController.__super__.navigatePrevious.apply(this, arguments);
    };

    UpdateIndexViewController.prototype.navigateNext = function() {
      return this.getRequest().startUpdate();
    };

    return UpdateIndexViewController;

  })(this.UpdateViewController);

}).call(this);
