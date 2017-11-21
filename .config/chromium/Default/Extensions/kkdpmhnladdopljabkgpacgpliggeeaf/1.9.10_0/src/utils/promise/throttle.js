(function() {
  var __slice = [].slice;

  if (ledger.utils == null) {
    ledger.utils = {};
  }

  if (ledger.utils.promise == null) {
    ledger.utils.promise = {};
  }

  _.extend(ledger.utils.promise, {
    throttle: function(func, wait, _arg) {
      var args, deferred, immediate;
      immediate = (_arg != null ? _arg : {}).immediate;
      deferred = null;
      args = void 0;
      if (immediate == null) {
        immediate = false;
      }
      return function() {
        var a;
        a = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        args = a;
        if ((deferred != null) && !deferred.promise.isFulfilled()) {
          return deferred.promise;
        }
        deferred = ledger.defer();
        if (immediate) {
          deferred.resolve(func.apply(null, args));
        }
        setTimeout(function() {
          if (!immediate) {
            deferred.resolve(func.apply(null, args));
          }
          return deferred = null;
        }, wait);
        return deferred.promise;
      };
    }
  });

}).call(this);
