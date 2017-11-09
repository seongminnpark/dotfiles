(function() {
  ledger.wallet.Wallet.Cache = (function() {
    function Cache(name, hdwallet) {
      this.hdwallet = hdwallet;
      this._name = name;
      this.save = _.debounce(this.save.bind(this), 200);
    }

    Cache.prototype.initialize = function(callback) {
      var cacheLimitSize;
      cacheLimitSize = 1 << 31 >>> 0;
      return ledger.storage.wallet.get([this._name], (function(_this) {
        return function(result) {
          if (result[_this._name] != null) {
            _this._cache = LRUCache.fromJson(result[_this._name], cacheLimitSize);
          } else {
            _this._cache = new LRUCache(cacheLimitSize);
          }
          return typeof callback === "function" ? callback() : void 0;
        };
      })(this));
    };

    Cache.prototype.get = function(path) {
      return this._cache.get(path);
    };

    Cache.prototype.hasPublicKey = function(publicKey) {
      if (this.getDerivationPath() != null) {
        return true;
      } else {
        return false;
      }
    };

    Cache.prototype.getDerivationPath = function(publicKey) {
      var _ref;
      return (_ref = _(this._cache.toJSON()).where({
        value: publicKey
      })[0]) != null ? _ref.key : void 0;
    };

    Cache.prototype.set = function(tuples, callback) {
      var key, tuple, value, _i, _len;
      if (callback == null) {
        callback = _.noop;
      }
      for (_i = 0, _len = tuples.length; _i < _len; _i++) {
        tuple = tuples[_i];
        key = tuple[0], value = tuple[1];
        this._cache.set(key, value);
      }
      _.defer(function() {
        return typeof callback === "function" ? callback() : void 0;
      });
      return this.save();
    };

    Cache.prototype.save = function(callback) {
      var data;
      if (callback == null) {
        callback = void 0;
      }
      data = {};
      data[this._name] = this._cache.toJSON();
      return ledger.storage.wallet.set(data, callback);
    };

    return Cache;

  })();

}).call(this);
