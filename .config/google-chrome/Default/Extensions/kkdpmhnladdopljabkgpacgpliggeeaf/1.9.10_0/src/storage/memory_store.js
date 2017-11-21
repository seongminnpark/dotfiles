(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ledger.storage.MemoryStore = (function(_super) {
    __extends(MemoryStore, _super);

    function MemoryStore() {
      MemoryStore.__super__.constructor.apply(this, arguments);
      this._data = {};
    }

    MemoryStore.prototype._raw_get = function(keys, cb) {
      return _.defer((function(_this) {
        return function() {
          return typeof cb === "function" ? cb(_(_this._data).pick(keys)) : void 0;
        };
      })(this));
    };

    MemoryStore.prototype._raw_set = function(items, cb) {
      if (cb == null) {
        cb = function() {};
      }
      return _.defer((function(_this) {
        return function() {
          _.extend(_this._data, items);
          _this.emit('set', items);
          return typeof cb === "function" ? cb() : void 0;
        };
      })(this));
    };

    MemoryStore.prototype._raw_keys = function(cb) {
      return _.defer((function(_this) {
        return function() {
          return typeof cb === "function" ? cb(_(_this._data).keys()) : void 0;
        };
      })(this));
    };

    MemoryStore.prototype._raw_remove = function(keys, cb) {
      if (cb == null) {
        cb = function() {};
      }
      return _.defer((function(_this) {
        return function() {
          var deletedKeys;
          deletedKeys = _(_this._data).chain().keys().intersection(keys).value();
          _this._data = _(_this._data).omit(keys);
          if (deletedKeys.length > 0) {
            _this.emit('remove', deletedKeys);
          }
          return typeof cb === "function" ? cb() : void 0;
        };
      })(this));
    };

    MemoryStore.prototype.extend = function(data) {
      return _.extend(this._data, data);
    };

    return MemoryStore;

  })(ledger.storage.Store);

}).call(this);
