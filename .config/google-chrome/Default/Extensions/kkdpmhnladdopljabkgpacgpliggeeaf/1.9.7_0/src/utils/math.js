(function() {
  var fibonacciCache;

  ledger.math || (ledger.math = {});

  fibonacciCache = [0, 1];

  _.extend(ledger.math, {
    fibonacci: function(n) {
      var pos, _i, _ref;
      if (n < 0) {
        return 0;
      }
      if (n < fibonacciCache.length) {
        return fibonacciCache[n];
      }
      for (pos = _i = _ref = fibonacciCache.length - 1; _ref <= n ? _i < n : _i > n; pos = _ref <= n ? ++_i : --_i) {
        fibonacciCache.push(fibonacciCache[pos - 1] + fibonacciCache[pos]);
      }
      return fibonacciCache[n];
    }
  });

}).call(this);
