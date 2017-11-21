(function() {
  var _base,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  if (this.ledger == null) {
    this.ledger = {};
  }

  if ((_base = this.ledger).utils == null) {
    _base.utils = {};
  }


  /*
  @exemple Usage
  text = ""
  queue = new ledger.utils.PromiseQueue()
  
  queue.enqueue ->
    d = Q.defer()
    setTimeout ->
      text += "Hello"
      d.resolve()
    , 5000
    d.promise
  
  queue.enqueue ->
    d = Q.defer()
    setTimeout ->
      text += " world"
      d.resolve()
    , 1000
    d.promise
  
  queue.enqueue ->
    d = Q.defer()
    setTimeout ->
      text += " !"
      d.resolve()
    , 3000
    d.promise
  
  queue.enqueue ->
    console.log(text) # => "Hello world !"
    Q()
   */

  this.ledger.utils.PromiseQueue = (function(_super) {
    var PromiseQueue;

    __extends(PromiseQueue, _super);

    PromiseQueue = PromiseQueue;

    PromiseQueue.TIMOUT_DELAY = 60 * 1000;

    function PromiseQueue(name) {
      this.name = name;
      if (this.name) {
        this.brakName = "[" + this.name + "]";
      }
      this._taskRunning = false;
      this._queue = [];
    }

    PromiseQueue.prototype.isRunning = function() {
      return this._taskRunning;
    };

    PromiseQueue.prototype.length = function() {
      return this._queue.length;
    };


    /*
    @overload enqueue: (task) ->
      @param [Function] task
      @return [Q.Promise]
    
    @overload enqueue: (taskId, task) ->
      @param [Number, String] taskId
      @param [Function] task
      @return [Q.Promise]
     */

    PromiseQueue.prototype.enqueue = function(taskId, task, delay) {
      var defer, taskWrapper, _ref;
      if (delay == null) {
        delay = PromiseQueue.TIMOUT_DELAY;
      }
      if (!task && typeof taskId === 'function') {
        _ref = [Math.round(Math.random() * 1000), taskId], taskId = _ref[0], task = _ref[1];
      }
      defer = ledger.defer();
      taskWrapper = (function(_this) {
        return function() {
          var err, timer;
          _this.emit('task:starting', taskId);
          try {
            timer = _this._setTimeout(taskId, defer, delay);
            return task()["finally"](function() {
              clearTimeout(timer);
              _this.emit('task:done', taskId);
              _this._taskDone();
            }).then(function() {
              var args;
              args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
              defer.resolve.apply(defer, args);
            }).progress(function() {
              var args;
              args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
              clearTimeout(timer);
              timer = _this._setTimeout(taskId, defer, delay);
              defer.notify.apply(defer, args);
            })["catch"](function() {
              var args;
              args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
              defer.reject.apply(defer, args);
            }).done();
          } catch (_error) {
            err = _error;
            console.error("PromiseQueue" + _this.brakName + " Fail to exec task " + taskId + " :", err);
            return defer.reject(err);
          }
        };
      })(this);
      if (this._taskRunning) {
        this._queue.push([taskId, taskWrapper]);
        this.emit('queue:pushed', taskId);
      } else {
        this._taskRunning = true;
        _.defer(function() {
          return taskWrapper();
        });
      }
      return defer.promise;
    };

    PromiseQueue.prototype._taskDone = function() {
      var task, taskId, _ref;
      if (this._queue.length > 0) {
        _ref = this._queue.shift(), taskId = _ref[0], task = _ref[1];
        this.emit('queue:shifted', taskId);
        return task();
      } else {
        this._taskRunning = false;
        return this.emit('queue:empty');
      }
    };

    PromiseQueue.prototype._setTimeout = function(taskId, defer, delay) {
      return setTimeout(((function(_this) {
        return function() {
          return _this._timeout(taskId, defer, delay);
        };
      })(this)), delay);
    };

    PromiseQueue.prototype._timeout = function(taskId, defer, delay) {
      var msg;
      if (defer.promise.isFulfilled()) {
        return;
      }
      if (this._queue.length > 0) {
        console.warn("PromiseQueue" + this.brakName + " Timeout for task " + taskId + ". Call next task.");
        setTimeout(((function(_this) {
          return function() {
            return _this._timeout(taskId, defer, delay);
          };
        })(this)), delay);
        return this._taskDone();
      } else {
        msg = "PromiseQueue" + this.brakName + " Timeout for task " + taskId + ". No task to call.";
        console.error(msg);
        return defer.rejectWithError(ledger.errors.TimeoutError, msg);
      }
    };

    return PromiseQueue;

  })(this.EventEmitter);

}).call(this);
