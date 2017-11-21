
/*
  Virtual {ledger.storage.Store} using its parent store to persist data.
 */

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ledger.storage.SubStore = (function(_super) {
    __extends(SubStore, _super);


    /*
      @param [ledger.storage.Store] parentStore The store used to persist data
      @param [String] name
     */

    function SubStore(parentStore, name) {
      SubStore.__super__.constructor.call(this, "__" + name, '_');
      this._parentStore = parentStore;
    }

    SubStore.prototype._raw_get = function(keys, cb) {
      var e;
      try {
        return this._parentStore.get(keys, cb);
      } catch (_error) {
        e = _error;
        return console.error("chrome.storage.local.get :", e);
      }
    };

    SubStore.prototype._raw_set = function(items, cb) {
      var e;
      if (cb == null) {
        cb = function() {};
      }
      try {
        return this._parentStore.set(items, cb);
      } catch (_error) {
        e = _error;
        return console.error("chrome.storage.local.set :", e);
      }
    };

    SubStore.prototype._raw_keys = function(cb) {
      return this._parentStore.keys((function(_this) {
        return function(keys) {
          var key;
          return cb(_.compact((function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = keys.length; _i < _len; _i++) {
              key = keys[_i];
              if (key != null ? key.match(this._nameRegex) : void 0) {
                _results.push(key);
              }
            }
            return _results;
          }).call(_this)));
        };
      })(this));
    };

    SubStore.prototype._raw_remove = function(keys, cb) {
      var e;
      if (cb == null) {
        cb = function() {};
      }
      try {
        return this._parentStore.remove(keys, cb);
      } catch (_error) {
        e = _error;
        return console.error("chrome.storage.local.remove :", e);
      }
    };

    SubStore.prototype._deprocessValue = function(raw_value) {
      return raw_value;
    };

    SubStore.prototype._preprocessValue = function(value) {
      return value;
    };

    return SubStore;

  })(ledger.storage.Store);

}).call(this);
