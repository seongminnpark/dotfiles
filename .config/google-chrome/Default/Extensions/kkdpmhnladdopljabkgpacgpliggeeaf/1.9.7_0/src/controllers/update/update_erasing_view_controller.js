(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.UpdateErasingViewController = (function(_super) {
    __extends(UpdateErasingViewController, _super);

    function UpdateErasingViewController() {
      return UpdateErasingViewController.__super__.constructor.apply(this, arguments);
    }

    UpdateErasingViewController.prototype.localizableNextButton = "common.reset";

    UpdateErasingViewController.prototype.localizablePageSubtitle = "update.erasing.erasure_confirmation";

    UpdateErasingViewController.prototype.navigation = {
      nextRoute: "",
      previousRoute: "/update/seed",
      previousParams: {
        animateIntro: false
      }
    };

    UpdateErasingViewController.prototype.render = function() {
      UpdateErasingViewController.__super__.render.apply(this, arguments);
      if (this.getRequest().getDongleFirmware().hasSubFirmwareSupport()) {
        return this.navigation.previousRoute = "/update/unlocking";
      }
    };

    UpdateErasingViewController.prototype.navigateNext = function() {
      this.getRequest().forceDongleErasure();
      return this.getRequest().approveDongleErasure();
    };

    return UpdateErasingViewController;

  })(UpdateViewController);

}).call(this);
