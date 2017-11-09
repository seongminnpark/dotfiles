(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.UpdateDoneViewController = (function(_super) {
    __extends(UpdateDoneViewController, _super);

    function UpdateDoneViewController() {
      return UpdateDoneViewController.__super__.constructor.apply(this, arguments);
    }

    UpdateDoneViewController.prototype.localizablePageSubtitle = "update.done.update_succeeded";

    UpdateDoneViewController.prototype.localizableNextButton = "common.restore";

    UpdateDoneViewController.prototype.navigation = {
      nextRoute: "/onboarding/device/connecting"
    };

    UpdateDoneViewController.prototype.initialize = function() {
      UpdateDoneViewController.__super__.initialize.apply(this, arguments);
      if (this.params.provisioned) {
        return this.localizableNextButton = "common.continue";
      }
    };

    UpdateDoneViewController.prototype.navigateNext = function() {
      this.getRequest().cancel();
      return ledger.app.reconnectDongleAndEnterWalletMode().then((function(_this) {
        return function() {
          return UpdateDoneViewController.__super__.navigateNext.apply(_this, arguments);
        };
      })(this));
    };

    return UpdateDoneViewController;

  })(this.UpdateViewController);

}).call(this);
