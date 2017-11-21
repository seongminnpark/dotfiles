(function() {
  var _base;

  this.ledger || (this.ledger = {});

  (_base = this.ledger).utils || (_base.utils = {});

  ledger.utils.PromiseMap = (function() {
    function PromiseMap() {
      this._map = {};
    }

    PromiseMap.prototype.set = function(key, value) {
      var _base1;
      return ((_base1 = this._map)[key] || (_base1[key] = ledger.defer())).resolve(value);
    };

    PromiseMap.prototype.get = function(key) {
      var _base1;
      return (_base1 = this._map)[key] || (_base1[key] = ledger.defer().promise);
    };

    PromiseMap.prototype.remove = function(key) {
      var _ref;
      if ((_ref = this._map[key]) != null) {
        _ref.reject(new Error("removed"));
      }
      return this._map = _.without(this._map, key);
    };

    return PromiseMap;

  })();

}).call(this);
