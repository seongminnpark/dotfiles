(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ledger.specs.ViewController = (function(_super) {
    __extends(ViewController, _super);

    function ViewController() {
      return ViewController.__super__.constructor.apply(this, arguments);
    }

    return ViewController;

  })(ledger.common.ViewController);

}).call(this);
