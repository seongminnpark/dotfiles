
/*
  Base view controller for all update view controllers. This class holds methods which are common to all update view controllers.
 */

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.UpdateViewController = (function(_super) {
    __extends(UpdateViewController, _super);

    function UpdateViewController() {
      return UpdateViewController.__super__.constructor.apply(this, arguments);
    }

    UpdateViewController.prototype.navigation = {
      nextRoute: void 0,
      previousRoute: void 0,
      nextParams: void 0,
      previousParams: void 0
    };

    UpdateViewController.prototype.localizablePageSubtitle = void 0;

    UpdateViewController.prototype.localizableNextButton = "common.continue";

    UpdateViewController.prototype.localizablePreviousButton = "common.cancel";

    UpdateViewController.prototype.navigateNext = function() {
      var _ref;
      if (((_ref = this.navigation) != null ? _ref.nextRoute : void 0) != null) {
        return ledger.app.router.go(this.navigation.nextRoute, this.navigation.nextParams);
      }
    };

    UpdateViewController.prototype.navigatePrevious = function() {
      var _ref;
      if (((_ref = this.navigation) != null ? _ref.previousRoute : void 0) != null) {
        return ledger.app.router.go(this.navigation.previousRoute, this.navigation.previousParams);
      }
    };

    UpdateViewController.prototype.shouldShowPreviousButton = function() {
      var _ref;
      if (this.params.hidePreviousButton === true) {
        return false;
      }
      return ((_ref = this.navigation) != null ? _ref.previousRoute : void 0) != null;
    };

    UpdateViewController.prototype.shouldShowNextButton = function() {
      var _ref;
      if (this.params.hideNextButton === true) {
        return false;
      }
      return ((_ref = this.navigation) != null ? _ref.nextRoute : void 0) != null;
    };

    UpdateViewController.prototype.shouldEnablePreviousButton = function() {
      return true;
    };

    UpdateViewController.prototype.shouldEnableNextButton = function() {
      return true;
    };

    UpdateViewController.prototype.getRequest = function() {
      return this.parentViewController._request;
    };


    /*
      Called once the controller is displayed and the Firmware update request needs a user approval
     */

    UpdateViewController.prototype.onNeedsUserApproval = function() {};


    /*
      Called once the controller is displayed and the Firmware update request is notifying a progress
     */

    UpdateViewController.prototype.onProgress = function(state, current, total) {};

    return UpdateViewController;

  })(ledger.common.ViewController);

}).call(this);
