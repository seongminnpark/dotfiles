(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.UpdatePlugViewController = (function(_super) {
    __extends(UpdatePlugViewController, _super);

    function UpdatePlugViewController() {
      return UpdatePlugViewController.__super__.constructor.apply(this, arguments);
    }

    UpdatePlugViewController.prototype.localizablePageSubtitle = "update.plug.plug_your_wallet";

    return UpdatePlugViewController;

  })(this.UpdateViewController);

}).call(this);
