(function() {
  var MockLocalStorage, mock, _base;

  MockLocalStorage = (function() {
    MockLocalStorage.prototype.originalChromeStore = void 0;

    function MockLocalStorage() {
      this._store = {};
    }

    MockLocalStorage.prototype.clear = function() {
      return this._store = {};
    };

    MockLocalStorage.prototype.get = function(keys, callback) {
      if (_(keys).isString()) {
        keys = [keys];
      }
      if (_(keys).isArray()) {
        return typeof callback === "function" ? callback(_.pick(this._store, keys)) : void 0;
      } else if (_(keys).isObject()) {
        return typeof callback === "function" ? callback(_.defaults(_.pick(_.keys(keys)), keys)) : void 0;
      } else {
        return typeof callback === "function" ? callback(_.clone(this._store)) : void 0;
      }
    };

    MockLocalStorage.prototype.getBytesInUse = function(keys, callback) {
      var check, determine, key, size, _i, _len;
      size = 0;
      keys = [keys];
      check = function(valToCheck) {
        var key, _results;
        if (typeof valToCheck !== 'object') {
          return determine(null, valToCheck);
        } else {
          _results = [];
          for (key in valToCheck) {
            _results.push(determine(null, valToCheck[key]));
          }
          return _results;
        }
      };
      determine = (function(_this) {
        return function(key, val) {
          var i, k, value, _results;
          value = val != null ? val : _this._store[key];
          switch (typeof value) {
            case 'boolean':
              return size += 4;
            case 'number':
              return size += 8;
            case 'string':
              return size += 2 * value.length;
            case 'object':
              _results = [];
              for (k in value) {
                i = value[k];
                _results.push(check(_this._store[keys][k]));
              }
              return _results;
          }
        };
      })(this);
      for (_i = 0, _len = keys.length; _i < _len; _i++) {
        key = keys[_i];
        determine(key);
      }
      if (typeof callback === "function") {
        callback();
      }
      return size;
    };

    MockLocalStorage.prototype.set = function(obj, callback) {
      _.extend(this._store, obj);
      return typeof callback === "function" ? callback() : void 0;
    };

    MockLocalStorage.prototype.remove = function(key, callback) {
      this._store = _(this._store).omit(key);
      return typeof callback === "function" ? callback() : void 0;
    };

    return MockLocalStorage;

  })();

  mock = null;

  if ((_base = ledger.specs).storage == null) {
    _base.storage = {};
  }

  ledger.specs.storage.inject = function(callback) {
    mock = new MockLocalStorage();
    mock.originalChromeStore = chrome.storage.local;
    chrome.storage.local = mock;
    return typeof callback === "function" ? callback() : void 0;
  };

  ledger.specs.storage.restore = function(callback) {
    chrome.storage.local = mock.originalChromeStore;
    return typeof callback === "function" ? callback() : void 0;
  };

}).call(this);
