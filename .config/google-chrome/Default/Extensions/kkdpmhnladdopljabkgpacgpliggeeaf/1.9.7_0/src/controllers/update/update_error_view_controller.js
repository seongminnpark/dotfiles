(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.UpdateErrorViewController = (function(_super) {
    __extends(UpdateErrorViewController, _super);

    function UpdateErrorViewController() {
      return UpdateErrorViewController.__super__.constructor.apply(this, arguments);
    }

    UpdateErrorViewController.prototype.localizablePageSubtitle = "update.error.update_failed";

    return UpdateErrorViewController;

  })(this.UpdateViewController);

}).call(this);
