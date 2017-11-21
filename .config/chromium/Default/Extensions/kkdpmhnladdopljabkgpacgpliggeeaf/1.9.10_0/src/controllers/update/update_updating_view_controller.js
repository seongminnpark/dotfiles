(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.UpdateUpdatingViewController = (function(_super) {
    __extends(UpdateUpdatingViewController, _super);

    function UpdateUpdatingViewController() {
      return UpdateUpdatingViewController.__super__.constructor.apply(this, arguments);
    }

    UpdateUpdatingViewController.prototype.navigation = {
      nextRoute: ""
    };

    UpdateUpdatingViewController.prototype.view = {
      keycardErasureSection: '#keycard-erasure-section'
    };

    UpdateUpdatingViewController.prototype.localizablePageSubtitle = "update.updating.update_confirmation";

    UpdateUpdatingViewController.prototype.localizableNextButton = "common.update";

    UpdateUpdatingViewController.prototype.navigateNext = function() {
      if (ledger.managers.system.isLinux() || ledger.managers.system.isUnknown()) {
        this.navigation.nextRoute = "/update/linux";
      } else {
        this.getRequest().approveCurrentState();
        this.navigation.nextRoute = "/update/loading";
      }
      return UpdateUpdatingViewController.__super__.navigateNext.apply(this, arguments);
    };

    UpdateUpdatingViewController.prototype.onBeforeRender = function() {
      UpdateUpdatingViewController.__super__.onBeforeRender.apply(this, arguments);
      this.dongleVersion = this.getRequest().getDongleVersion();
      return this.targetVersion = this.getRequest().getTargetVersion();
    };

    UpdateUpdatingViewController.prototype.onAfterRender = function() {
      var _ref;
      UpdateUpdatingViewController.__super__.onAfterRender.apply(this, arguments);
      if (((_ref = this.params) != null ? _ref.no_erase_keycard_seed : void 0) === true) {
        return this.view.keycardErasureSection.remove();
      }
    };

    return UpdateUpdatingViewController;

  })(UpdateViewController);

}).call(this);
