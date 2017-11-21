(function() {
  var __slice = [].slice;

  if (this.ledger == null) {
    this.ledger = {};
  }

  this.ledger.defer = function() {
    var arg, args, callback, defer, isCallback;
    arg = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    if (arg == null) {
      arg = void 0;
    }
    isCallback = typeof arg === 'function' && args.length === 0;
    if (isCallback) {
      callback = arg;
    }
    if (isCallback) {
      defer = Q.defer();
    } else {
      defer = Q.defer.apply(Q, [arg].concat(__slice.call(args)));
    }
    defer.rejectWithError = function() {
      var args, _ref;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.reject((_ref = ledger.errors)["new"].apply(_ref, args));
    };
    defer.oldResolve = defer.resolve;
    defer.oldReject = defer.reject;
    defer.resolve = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      this.oldResolve.apply(this, args);
      return this;
    };
    defer.reject = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      this.oldReject.apply(this, args);
      return this;
    };
    defer.promise.onFulfilled = function(callback) {
      return this.then(function(result) {
        _.defer(function() {
          return callback(result !== void 0 ? result : true);
        });
      })["catch"](function(reason) {
        _.defer(function() {
          return callback(false, reason);
        });
      }).done();
    };
    defer.complete = function(value, error) {
      if (error != null) {
        return this.reject(error);
      } else {
        return this.resolve(value);
      }
    };
    defer.promise.onComplete = defer.promise.onFulfilled;
    defer.onComplete = function() {
      var args, _ref;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return (_ref = this.promise).onComplete.apply(_ref, args);
    };
    if (isCallback) {
      defer.promise.onFulfilled(callback);
    }
    return defer;
  };

  this.ledger.delay = function(ms) {
    var deferred;
    deferred = ledger.defer();
    setTimeout(deferred.resolve.bind(deferred), ms);
    return deferred.promise;
  };

  _.mixin({
    smartTimeout: function(object, timeout, message) {
      var d, onTimeout, onWindowResize, scheduleTimeout, scheduled;
      if (message == null) {
        message = 'Timeout operation';
      }
      if (!_.isFunction(object != null ? object.then : void 0) && !_.isFunction(object != null ? object.fail : void 0)) {
        throw new Error("Smart timeout needs a promise");
      }
      scheduled = null;
      d = ledger.defer();
      onTimeout = function() {
        return d.reject(new Error(message));
      };
      scheduleTimeout = function() {
        if (scheduled != null) {
          clearTimeout(scheduled);
        }
        return scheduled = setTimeout(onTimeout, timeout);
      };
      onWindowResize = function() {
        return scheduleTimeout();
      };
      scheduleTimeout();
      window.addEventListener('resize', onWindowResize);
      object.then(function() {
        var results;
        results = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return d.resolve.apply(d, results);
      }).fail(function() {
        var errors;
        errors = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return d.reject.apply(d, errors);
      });
      d.promise.fin(function() {
        window.removeEventListener('resize', onWindowResize);
        if (scheduled != null) {
          return clearTimeout(scheduled);
        }
      });
      return d.promise;
    }
  });

}).call(this);
