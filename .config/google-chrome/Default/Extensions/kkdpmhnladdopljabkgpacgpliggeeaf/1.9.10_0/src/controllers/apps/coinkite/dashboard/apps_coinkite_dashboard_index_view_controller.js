(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.AppsCoinkiteDashboardIndexViewController = (function(_super) {
    __extends(AppsCoinkiteDashboardIndexViewController, _super);

    function AppsCoinkiteDashboardIndexViewController() {
      return AppsCoinkiteDashboardIndexViewController.__super__.constructor.apply(this, arguments);
    }

    AppsCoinkiteDashboardIndexViewController.prototype.openCoinkite = function() {
      return window.open('https://coinkite.com/');
    };

    return AppsCoinkiteDashboardIndexViewController;

  })(ledger.common.ViewController);

}).call(this);
