(function() {
  var __slice = [].slice;

  if (ledger.utils == null) {
    ledger.utils = {};
  }

  if (ledger.utils.promise == null) {
    ledger.utils.promise = {};
  }

  _.extend(ledger.utils.promise, {
    debounce: function(func, wait) {
      var args, deferred, onTimeoutExpired, timeout;
      deferred = null;
      timeout = null;
      args = void 0;
      onTimeoutExpired = function() {
        return deferred.resolve(func.apply(null, args));
      };
      return function() {
        var a;
        a = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        args = a;
        if ((deferred != null) && !deferred.promise.isFulfilled()) {
          clearTimeout(timeout);
        } else {
          deferred = ledger.defer();
        }
        timeout = setTimeout(onTimeoutExpired, wait);
        return deferred.promise;
      };
    }
  });

}).call(this);
