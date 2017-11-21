
/*
  The TryResult type represents a computation that may either result in an exception, or return a successfully computed value.
 */

(function() {
  var TryResult;

  TryResult = (function() {
    function TryResult(func) {
      var er;
      this._deffered = Q.defer();
      try {
        this._value = func();
        this._deffered.resolve(this._value);
      } catch (_error) {
        er = _error;
        if (er instanceof Error) {
          this._error = er;
        } else {
          this._error = new Error(er);
        }
        this._deffered.reject(er);
      }
    }

    TryResult.prototype.getError = function() {
      return this._error;
    };

    TryResult.prototype.getValue = function() {
      return this._value;
    };

    TryResult.prototype.getOrElse = function(value) {
      if (this.isFailure()) {
        return value;
      } else {
        return this.getValue();
      }
    };

    TryResult.prototype.orNull = function() {
      return this.getOrElse(null);
    };

    TryResult.prototype.isFailure = function() {
      if (this._error != null) {
        return true;
      } else {
        return false;
      }
    };

    TryResult.prototype.isSuccess = function() {
      return !this.isFailure();
    };

    TryResult.prototype.then = function(func) {
      return this.promise().then(func);
    };

    TryResult.prototype.fail = function(func) {
      return this.promise().fail(func);
    };

    TryResult.prototype.promise = function() {
      return this._deffered.promise;
    };

    TryResult.prototype.printError = function() {
      return this.fail((function(_this) {
        return function() {
          return e(_this._error);
        };
      })(this));
    };

    return TryResult;

  })();


  /*
    Executes the function passed in parameter. Try returns a {TryResult} which represents the computation of the function that
    may either result in an exception or return a value. This allows to handle errors in a functional manner.
  
    @param [Function] func A function that may failed
    @return [TryResult] The wrapped computed value or error
   */

  this.Try = function(func) {
    return new TryResult(func);
  };

}).call(this);
