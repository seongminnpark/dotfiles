(function() {
  var __slice = [].slice;

  if (ledger.utils == null) {
    ledger.utils = {};
  }


  /*
    A helper class for defining a callback. A completion closure is a callback holder that can be either successful
    or failed. If a result is set and no function is defined, the CompletionClosure will keep the result until a callback function
    is submitted.
  
    CompletionClosure can also create a copy of themselves (with {CompletionClosure#readonly}) which cannot complete the closure.
    This is handy if you need to return the closure and still want to be the only to have control over the completion.
  
    It can also be chained with Q.Promise or jQuery.Promise.
  
    @example Simple case
      completion = new CompletionClosure()
      completion.success("A value")
      completion.onComplete (result, err) ->
        console.log(result)
  
    @example With Promises
      completion = new CompletionClosure()
      completion.success("A value")
      completion.then (result) ->
        console.log(result)
  
    @example Create a function that is compatible with both promise and callback
  
      asyncFunc = (param, callback = null) ->
        completion = new CompletionClosure(callback)
        doSomethingAsync ->
          completion.success("A value")
        completion.readonly()
  
       * asyncFunc can be used either like this...
      asyncFunc "a param", (result, error) ->
        ... Do something ...
  
       * or like this
      asyncFunc "a param"
        .then (result) ->
          ... Do something ...
        .fail (error) ->
          ... Do something ...
        .done()
   */

  ledger.utils.CompletionClosure = (function() {

    /*
      Wraps a node-like asynchronous method in a {CompletionClosure}. This method is useful if you need promise chaining.
    
      @example Case without {CompletionClosure.call}
        asyncFunc = (arg1, callback) ->
          ... do something ...
    
        asyncFunc 'oiseau', (result, error) ->
          ... do something ...
    
      @example Case with {CompletionClosure.call}
        asyncFunc = (arg1, callback) ->
          ... do something ...
    
        CompletionClosure.call(asyncFunc, null, 'oiseau').promise()
          .then (result) ->
            ... do something ...
          .fail () ->
            ... do something ...
    
      @param [Function] func The function to call
      @param [Object] self The calling this object
      @param [Object*] args Method args
      @return [CompletionClosure] The closure
     */
    CompletionClosure.defer = function() {
      var args, closure, func, onComplete, self;
      func = arguments[0], self = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
      closure = new this;
      onComplete = function(result, error) {
        return closure.complete(result, error);
      };
      args.push(onComplete);
      func.apply(self, args);
      return closure;
    };

    function CompletionClosure(callback) {
      if (callback == null) {
        callback = null;
      }
      this._isSuccessful = false;
      this._isFailed = false;
      this._isJqFulfilled = false;
      this._isQFulfilled = false;
      this._complete = [null, null];
      if (callback != null) {
        this.onComplete(callback);
      }
    }


    /*
      Completes the closure with success. This method will call the onComplete function if possible or keep the result until
      a callback is submitted.
    
      @param [Any] value A value to complete the closure
      @return [CompletionClosure] self
      @throw If the closure is already completed
     */

    CompletionClosure.prototype.success = function(value) {
      if (this.isCompleted()) {
        throw 'CompletionClosure already completed';
      }
      this._isSuccessful = true;
      this._complete = [value, null];
      this._tryNotify();
      this._tryFulfill();
    };


    /*
      Completes the closure with an error. This method will call the onComplete function if possible or keep the error until
      a callback is submitted.
    
      @param [Any] error An error to failed the closure
      @return [CompletionClosure] self
      @throw If the closure is already completed
     */

    CompletionClosure.prototype.failure = function(error) {
      if (this.isCompleted()) {
        throw 'CompletionClosure already completed';
      }
      this._isFailed = true;
      this._complete = [null, error];
      this._tryNotify();
      this._tryFulfill();
    };


    /*
      Completes the closure with a standard error. This method will call the onComplete function if possible or keep the error until
      a callback is submitted.
    
      @param [Any] error An error to failed the closure
      @return [CompletionClosure] self
      @throw If the closure is already completed
     */

    CompletionClosure.prototype.failWithStandardError = function(errorCode) {
      return this.failure(new ledger.StandardError(errorCode));
    };


    /*
      Completes the closure either by a success or an error. If both error and result are null, the closure will be failed
      with an 'Unknown Error'.
    
      @param [Any] value A value to complete the closure (may be null)
      @param [Any] error An error to failed the closure (may be null)
      @return [CompletionClosure] self
      @throw If the closure is already completed
     */

    CompletionClosure.prototype.complete = function(value, error) {
      if (error == null) {
        return this.success(value);
      } else {
        return this.fail(error);
      }
    };


    /*
      Sets the callback closure. If the CompletionClosure is already completed and no callback has been submitted yet,
      the method will directly call the function.
    
      @example Function prototype
        (result, err) ->
    
      @param [Function] func A function declared as follow '(result, err) ->'
      @return [CompletionClosure] self
     */

    CompletionClosure.prototype.onComplete = function(func) {
      this._func = func;
      this._tryNotify();
      return this._tryFulfill();
    };


    /*
      @overload
        @param [CompletionClosure] defer
        @return [CompletionClosure] self
    
      @overload
        @param [Q.defer] defer
        @return [CompletionClosure] self
     */

    CompletionClosure.prototype.thenForward = function(defer) {
      var deferType;
      deferType = typeof defer;
      if (deferType === 'object' && defer instanceof CompletionClosure) {
        return this.then(((function(_this) {
          return function() {
            return defer.success.apply(defer, arguments);
          };
        })(this)), ((function(_this) {
          return function() {
            return defer.failure.apply(defer, arguments);
          };
        })(this)));
      } else if (deferType === 'object' && defer instanceof Q.defer) {
        return this.then(((function(_this) {
          return function() {
            return defer.resolve.apply(defer, arguments);
          };
        })(this)), ((function(_this) {
          return function() {
            return defer.reject.apply(defer, arguments);
          };
        })(this)));
      } else {
        throw new ArgumentError(promiseType === 'object' ? promise.constructor.name : promiseType);
      }
    };


    /*
      Returns 'yes' if completed else 'no'
      @return [Boolean]
     */

    CompletionClosure.prototype.isCompleted = function() {
      return !(!this._isSuccessful && !this._isFailed);
    };

    CompletionClosure.prototype.isSuccessful = function() {
      return this._isSuccessful;
    };

    CompletionClosure.prototype.isFailed = function() {
      return this._isFailed;
    };

    CompletionClosure.prototype._tryNotify = function() {
      var error, result, _ref;
      if (!this.isCompleted()) {
        return;
      }
      _ref = this._complete, result = _ref[0], error = _ref[1];
      if (this._func != null) {
        this._complete = [];
        return this._func(result, error);
      }
    };

    CompletionClosure.prototype._tryFulfill = function() {
      var error, result, _ref, _ref1;
      if (!this.isCompleted()) {
        return;
      }
      _ref = this._complete, result = _ref[0], error = _ref[1];
      if (!this._isQFulfilled && (this._qDeferredObject != null)) {
        if (this.isSuccessful()) {
          this._qDeferredObject.resolve(result);
        }
        if (this.isFailed()) {
          if ((_ref1 = this._qDeferredObject) != null) {
            _ref1.reject(error);
          }
        }
        this._isQFulfilled = true;
      }
      if (!this._isJqFulfilled && (this._jqDeferredObject != null)) {
        if (this.isSuccessful()) {
          this._jqDeferredObject.resolve(result);
        }
        if (this.isFailed()) {
          this._jqDeferredObject.reject(error);
        }
        return this._isJqFulfilled = true;
      }
    };

    CompletionClosure.prototype._qDeffered = function() {
      if (this._qDeferredObject == null) {
        this._qDeferredObject = Q.defer();
        this._tryFulfill();
      }
      return this._qDeferredObject;
    };

    CompletionClosure.prototype._jqDeffered = function() {
      if (this._jqDeferredObject == null) {
        this._jqDeferredObject = jQuery.Deferred();
        this._tryFulfill();
      }
      return this._jqDeferredObject;
    };


    /*
      Returns a readonly version of the closure
    
      @return [Object] A readonly version of the closure
     */

    CompletionClosure.prototype.readonly = function() {
      var c, key, value;
      c = new CompletionClosure();
      delete c.success;
      delete c.failure;
      delete c.complete;
      for (key in c) {
        value = c[key];
        if (_(value).isFunction()) {
          c[key] = this[key].bind(this);
        }
      }
      return c;
    };


    /*
      Returns a Q promise
    
      @return [Q.Promise] A Q promise
     */

    CompletionClosure.prototype.q = function() {
      return this._qDeffered().promise;
    };


    /*
      Alias for q method
    
      @see CompletionClosure#q
     */

    CompletionClosure.prototype.promise = function() {
      return this.q();
    };


    /*
      Returns jQuery promise
      @return [jQuery.Promise] A jQuery promise
     */

    CompletionClosure.prototype.jq = function() {
      return this._jqDeffered().promise();
    };


    /*
      Alias for jq method
    
      @see CompletionClosure#jq
     */

    CompletionClosure.prototype.jpromise = function() {
      return this.jq();
    };


    /*
      Shorthand for completionClosure.q().then()
    
      @return [Q.Promise]
     */

    CompletionClosure.prototype.then = function(fulfilled, rejected, progressed) {
      if (rejected == null) {
        rejected = void 0;
      }
      if (progressed == null) {
        progressed = void 0;
      }
      return this.q().then(fulfilled, rejected, progressed);
    };


    /*
      Shorthand for completionClosure.q().fail()
    
      @return [Q.Promise]
     */

    CompletionClosure.prototype.fail = function(rejected) {
      return this.q().fail(rejected);
    };


    /*
      Shorthand for completionClosure.q().progress()
    
      @return [Q.Promise]
     */

    CompletionClosure.prototype.progress = function(progressed) {
      return this.q().progress(progressed);
    };

    return CompletionClosure;

  })();

}).call(this);
