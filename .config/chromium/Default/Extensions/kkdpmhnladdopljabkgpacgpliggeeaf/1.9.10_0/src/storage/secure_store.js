(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.ledger.storage.SecureStore = (function(_super) {
    __extends(SecureStore, _super);

    function SecureStore(name, key) {
      SecureStore.__super__.constructor.call(this, name);
      this._aes = new ledger.crypto.AES(key);
      this._hasCalledKeys = false;
    }

    SecureStore.prototype.getCipher = function() {
      return this._aes;
    };

    SecureStore.prototype.keys = function(cb) {
      return SecureStore.__super__.keys.call(this, (function(_this) {
        return function(encrypted_keys) {
          var encrypted_key;
          return typeof cb === "function" ? cb(_.compact((function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = encrypted_keys.length; _i < _len; _i++) {
              encrypted_key = encrypted_keys[_i];
              _results.push(this.__decryptKey(encrypted_key));
            }
            return _results;
          }).call(_this))) : void 0;
        };
      })(this));
    };

    SecureStore.prototype._preprocessKey = function(key) {
      return SecureStore.__super__._preprocessKey.call(this, this._aes.encrypt(key));
    };

    SecureStore.prototype._deprocessKey = function(raw_key) {
      var key;
      key = this.__decryptKey(SecureStore.__super__._deprocessKey.call(this, raw_key));
      return key;
    };

    SecureStore.prototype._preprocessValue = function(value) {
      return Try((function(_this) {
        return function() {
          return _this._aes.encrypt(SecureStore.__super__._preprocessValue.call(_this, value));
        };
      })(this)).orNull();
    };

    SecureStore.prototype._deprocessValue = function(raw_value) {
      return Try((function(_this) {
        return function() {
          return SecureStore.__super__._deprocessValue.call(_this, _this._aes.decrypt(raw_value));
        };
      })(this)).orNull();
    };

    SecureStore.prototype.__decryptKey = function(value) {
      var _base;
      return (_base = (this._decryptCache || (this._decryptCache = {})))[value] || (_base[value] = Try((function(_this) {
        return function() {
          return _this._aes.decrypt(value);
        };
      })(this)).orNull());
    };

    return SecureStore;

  })(ledger.storage.ChromeStore);

}).call(this);
