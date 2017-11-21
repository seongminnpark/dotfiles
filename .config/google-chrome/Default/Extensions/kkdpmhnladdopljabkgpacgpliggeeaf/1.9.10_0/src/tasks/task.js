(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (ledger.tasks == null) {
    ledger.tasks = {};
  }

  ledger.tasks.Task = (function(_super) {
    __extends(Task, _super);

    Task.RUNNING_TASKS = {};

    function Task(taskId) {
      this.taskId = taskId;
    }

    Task.prototype.start = function(safe) {
      if (safe == null) {
        safe = false;
      }
      _.defer((function(_this) {
        return function() {
          if (_this.isRunning() && !safe) {
            throw "A task with id '" + _this.taskId + "' is already started";
          }
          if (_this.isRunning() && safe) {
            return;
          }
          ledger.tasks.Task.RUNNING_TASKS[_this.taskId] = _this;
          _this.emit('start', _this);
          _this.logger().info("Starting task " + _this.taskId);
          return _this.onStart();
        };
      })(this));
      return this;
    };

    Task.prototype.startIfNeccessary = function() {
      if (!this.isRunning()) {
        this.start(true);
      }
      return this;
    };

    Task.prototype.stop = function(safe) {
      if (safe == null) {
        safe = false;
      }
      if (!this.isRunning() && !safe) {
        throw "The task '" + this.taskId + "' is not running";
      }
      if (!this.isRunning()) {
        return;
      }
      ledger.tasks.Task.RUNNING_TASKS = _.omit(ledger.tasks.Task.RUNNING_TASKS, this.taskId);
      this.logger().info("Stopping task " + this.taskId);
      this.onStop();
      this.emit('stop', this);
      return this;
    };

    Task.prototype.logger = function() {
      return this._logger || (this._logger = ledger.utils.Logger.getLoggerByTag(this.constructor.name));
    };

    Task.prototype.stopIfNeccessary = function() {
      if (this.isRunning()) {
        return this.stop(true);
      }
    };

    Task.prototype.isRunning = function() {
      if (ledger.tasks.Task.RUNNING_TASKS[this.taskId] != null) {
        return true;
      } else {
        return false;
      }
    };

    Task.prototype.onStart = function() {};

    Task.prototype.onStop = function() {};

    Task.getTask = function(taskId) {
      return ledger.tasks.Task.RUNNING_TASKS[taskId];
    };

    Task.stopAllRunningTasks = function() {
      var task, tasks, _i, _len, _results;
      tasks = _.values(ledger.tasks.Task.RUNNING_TASKS);
      ledger.utils.Logger.getLoggerByTag('Tasks').info("Stopping all", ledger.tasks.Task.RUNNING_TASKS);
      _results = [];
      for (_i = 0, _len = tasks.length; _i < _len; _i++) {
        task = tasks[_i];
        _results.push(task.stopIfNeccessary());
      }
      return _results;
    };

    Task.resetAllSingletonTasks = function() {
      var name, task, _ref, _results;
      _ref = ledger.tasks;
      _results = [];
      for (name in _ref) {
        task = _ref[name];
        if (((task != null ? task.reset : void 0) != null) && _.isFunction(task.reset)) {
          _results.push(task.reset());
        }
      }
      return _results;
    };

    return Task;

  })(EventEmitter);

}).call(this);
