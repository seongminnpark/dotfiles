(function() {
  _.mixin({
    lock: function(thisArg, functionNames) {
      var calls, func, functionName, functions, lock, unlock, _fn, _i, _len;
      calls = [];
      functions = {};
      lock = true;
      unlock = function() {
        var call, _i, _len;
        if (!lock) {
          return;
        }
        lock = false;
        for (_i = 0, _len = calls.length; _i < _len; _i++) {
          call = calls[_i];
          call.deferred.resolve(functions[call.functionName].apply(thisArg, call["arguments"]));
        }
      };
      _fn = function(func, functionName) {
        return thisArg[functionName] = function() {
          var deferred;
          if (lock) {
            deferred = ledger.defer();
            calls.push({
              functionName: functionName,
              "arguments": arguments,
              deferred: deferred
            });
            return deferred.promise;
          } else {
            return functions[functionName].apply(thisArg, arguments);
          }
        };
      };
      for (_i = 0, _len = functionNames.length; _i < _len; _i++) {
        functionName = functionNames[_i];
        func = thisArg[functionName];
        functions[functionName] = func;
        _fn(func, functionName);
      }
      return unlock;
    }
  });

}).call(this);
