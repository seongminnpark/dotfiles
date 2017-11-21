(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.ledger.storage = {};

  this.ledger.storage.Store = (function(_super) {
    __extends(Store, _super);

    function Store(name, keySeparator) {
      var regexSeparator;
      if (keySeparator == null) {
        keySeparator = '.';
      }
      this.name = name;
      this._name = name;
      this._keySeparator = keySeparator;
      regexSeparator = keySeparator.match(/\./) ? "\\" + keySeparator : keySeparator;
      this._nameRegex = new RegExp("^" + this._name + regexSeparator);
      this._substores = {};
      this.__isClosed = false;
    }

    Store.prototype.get = function(keys, cb) {
      if (!_(keys).isArray()) {
        keys = [keys];
      }
      return this._raw_get(this._preprocessKeys(keys), (function(_this) {
        return function(raw_items) {
          return cb(_this._deprocessItems(raw_items));
        };
      })(this));
    };

    Store.prototype.getAll = function(cb) {
      return this.keys((function(_this) {
        return function(keys) {
          return _this.get(keys, cb);
        };
      })(this));
    };

    Store.prototype.set = function(items, cb) {
      return this._raw_set(this._preprocessItems(items), cb);
    };

    Store.prototype.keys = function(cb) {
      return this._raw_keys((function(_this) {
        return function(raw_keys) {
          return cb(_this._from_ns_keys(raw_keys));
        };
      })(this));
    };

    Store.prototype.remove = function(keys, cb) {
      return this._raw_remove(this._preprocessKeys(keys), (function(_this) {
        return function(raw_items) {
          return typeof cb === "function" ? cb(_this._deprocessItems(raw_items)) : void 0;
        };
      })(this));
    };

    Store.prototype.substore = function(name) {
      var _base;
      return (_base = this._substores)[name] || (_base[name] = new ledger.storage.SubStore(this, name));
    };

    Store.prototype.clear = function(cb) {
      return this.keys((function(_this) {
        return function(keys) {
          return _this.remove(keys, cb);
        };
      })(this));
    };

    Store.prototype.close = function() {
      this.__isClosed = true;
      return this;
    };

    Store.prototype.isClosed = function() {
      return this.__isClosed;
    };

    Store.prototype._raw_get = function(raw_keys, cb) {
      throw "Abstract method";
    };

    Store.prototype._raw_set = function(raw_items, cb) {
      throw "Abstract method";
    };

    Store.prototype._raw_keys = function(cb) {
      throw "Abstract method";
    };

    Store.prototype._raw_remove = function(raw_keys, cb) {
      throw "Abstract method";
    };

    Store.prototype._preprocessKey = function(key) {
      return this._to_ns_key(key);
    };

    Store.prototype._preprocessKeys = function(keys) {
      return _.flatten([keys]).map((function(_this) {
        return function(key) {
          return _this._preprocessKey(key);
        };
      })(this));
    };

    Store.prototype._preprocessValue = function(value) {
      if ((value != null ? value.toJson : void 0) != null) {
        return value.toJson();
      } else {
        return JSON.stringify(value);
      }
    };

    Store.prototype._preprocessItems = function(items) {
      var hash, key, value, _ref;
      hash = {};
      _ref = this._hashize(items);
      for (key in _ref) {
        value = _ref[key];
        hash[this._preprocessKey(key)] = this._preprocessValue(value);
      }
      return hash;
    };

    Store.prototype._hashize = function(items) {
      var hash, key, value;
      hash = {};
      for (key in items) {
        value = items[key];
        if (!key || key === "null" || key === "undefined" || _.isFunction(value)) {
          continue;
        }
        hash[key] = value;
      }
      return hash;
    };

    Store.prototype._deprocessKey = function(raw_key) {
      return this._from_ns_key(raw_key);
    };

    Store.prototype._deprocessKeys = function(raw_keys) {
      return _.chain([raw_keys]).flatten().map((function(_this) {
        return function(raw_key) {
          var e;
          try {
            return _this._deprocessKey(raw_key);
          } catch (_error) {
            e = _error;
            return void 0;
          }
        };
      })(this)).compact().value();
    };

    Store.prototype._deprocessValue = function(raw_value) {
      return JSON.parse(raw_value);
    };

    Store.prototype._deprocessItems = function(raw_items) {
      var hash, key, raw_key, raw_value;
      hash = {};
      for (raw_key in raw_items) {
        raw_value = raw_items[raw_key];
        key = this._deprocessKey(raw_key);
        if (key != null) {
          hash[key] = this._deprocessValue(raw_value);
        }
      }
      return hash;
    };

    Store.prototype._to_ns_key = function(key) {
      return this._name + this._keySeparator + key;
    };

    Store.prototype._to_ns_keys = function(keys) {
      var key, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = keys.length; _i < _len; _i++) {
        key = keys[_i];
        _results.push(this._to_ns_key(key));
      }
      return _results;
    };

    Store.prototype._from_ns_key = function(ns_key) {
      return ns_key.replace(this._nameRegex, '');
    };

    Store.prototype._from_ns_keys = function(ns_keys) {
      var ns_key;
      return _.compact((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = ns_keys.length; _i < _len; _i++) {
          ns_key = ns_keys[_i];
          if (ns_key.match(this._nameRegex)) {
            _results.push(this._from_ns_key(ns_key));
          }
        }
        return _results;
      }).call(this));
    };

    return Store;

  })(EventEmitter);

}).call(this);
