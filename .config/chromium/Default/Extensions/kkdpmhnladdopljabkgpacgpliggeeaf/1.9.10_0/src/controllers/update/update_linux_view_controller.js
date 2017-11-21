(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.UpdateLinuxViewController = (function(_super) {
    __extends(UpdateLinuxViewController, _super);

    function UpdateLinuxViewController() {
      return UpdateLinuxViewController.__super__.constructor.apply(this, arguments);
    }

    UpdateLinuxViewController.prototype.navigation = {
      nextRoute: "/update/loading"
    };

    UpdateLinuxViewController.prototype.localizablePageSubtitle = "update.linux.linux_users";

    UpdateLinuxViewController.prototype.navigateNext = function() {
      this.getRequest().approveCurrentState();
      return UpdateLinuxViewController.__super__.navigateNext.apply(this, arguments);
    };

    return UpdateLinuxViewController;

  })(this.UpdateViewController);

}).call(this);
