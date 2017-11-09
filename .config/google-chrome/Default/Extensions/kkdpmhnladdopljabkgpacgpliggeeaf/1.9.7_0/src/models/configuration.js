(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.Configuration = (function(_super) {
    __extends(Configuration, _super);

    function Configuration() {
      return Configuration.__super__.constructor.apply(this, arguments);
    }

    Configuration.init();

    Configuration._instance = void 0;

    Configuration.getInstance = function(context) {
      if (this._instance == null) {
        this._instance = this.findOrCreate({
          id: 1
        }, context);
      }
      return this._instance;
    };

    Configuration.prototype.setCurrentApplicationVersion = function(version) {
      return this.set('__app_version', version).save();
    };

    Configuration.prototype.getCurrentApplicationVersion = function() {
      return this.get('__app_version');
    };

    return Configuration;

  })(ledger.database.Model);

}).call(this);
