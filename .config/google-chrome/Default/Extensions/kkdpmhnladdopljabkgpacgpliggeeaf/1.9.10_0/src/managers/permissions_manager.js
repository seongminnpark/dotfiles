(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (ledger.managers == null) {
    ledger.managers = {};
  }

  ledger.managers.Permissions = (function(_super) {
    __extends(Permissions, _super);

    function Permissions() {
      return Permissions.__super__.constructor.apply(this, arguments);
    }

    Permissions.prototype.request = function(permissions, callback) {
      if (permissions == null) {
        if (typeof callback === "function") {
          callback(false);
        }
      }
      if (_.isString(permissions)) {
        permissions = {
          permissions: [permissions]
        };
      }
      return chrome.permissions.request(permissions, (function(_this) {
        return function(granted) {
          return typeof callback === "function" ? callback(granted) : void 0;
        };
      })(this));
    };

    Permissions.prototype.getAll = function(callback) {
      return chrome.permissions.getAll((function(_this) {
        return function(permissions) {
          return typeof callback === "function" ? callback(permissions) : void 0;
        };
      })(this));
    };

    Permissions.prototype.has = function(permissions, callback) {
      if (permissions == null) {
        if (typeof callback === "function") {
          callback(false);
        }
      }
      if (_.isString(permissions)) {
        permissions = {
          permissions: [permissions]
        };
      }
      return chrome.permissions.contains(permissions, (function(_this) {
        return function(granted) {
          return typeof callback === "function" ? callback(granted) : void 0;
        };
      })(this));
    };

    Permissions.prototype.remove = function(permissions, callback) {
      if (permissions == null) {
        if (typeof callback === "function") {
          callback(false);
        }
      }
      if (_.isString(permissions)) {
        permissions = {
          permissions: [permissions]
        };
      }
      return chrome.permissions.remove(permissions, (function(_this) {
        return function(removed) {
          return typeof callback === "function" ? callback(removed) : void 0;
        };
      })(this));
    };

    return Permissions;

  })(EventEmitter);

  ledger.managers.permissions = new ledger.managers.Permissions();

}).call(this);
