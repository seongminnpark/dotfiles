(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ledger.tasks.OperationsConsumptionTask = (function(_super) {
    __extends(OperationsConsumptionTask, _super);

    function OperationsConsumptionTask() {
      OperationsConsumptionTask.__super__.constructor.call(this, 'global_operations_consumer');
    }

    OperationsConsumptionTask.instance = new OperationsConsumptionTask();

    OperationsConsumptionTask.prototype.onStart = function() {
      var stream;
      clearTimeout(this._scheduledStart);
      this._retryNumber || (this._retryNumber = 0);
      stream = ledger.api.TransactionsRestClient.instance.createTransactionStreamForAllObservedPaths().stopOnError((function(_this) {
        return function(err) {
          _this.stopIfNeccessary();
          ledger.app.emit('wallet:operations:sync:failed', err);
          _this._retryNumber = Math.min(_this._retryNumber + 1, 12);
          return _this._scheduledStart = _.delay((function() {
            return _this.startIfNeccessary();
          }), ledger.math.fibonacci(_this._retryNumber) * 500);
        };
      })(this));
      ledger.tasks.TransactionConsumerTask.instance.pushTransactionsFromStream(stream);
      return stream.observe().done((function(_this) {
        return function() {
          _this.stopIfNeccessary();
          return _.defer(function() {
            return ledger.app.emit('wallet:operations:sync:done');
          });
        };
      })(this));
    };

    OperationsConsumptionTask.prototype.onStop = function() {
      return OperationsConsumptionTask.__super__.onStop.apply(this, arguments);
    };

    OperationsConsumptionTask.reset = function() {
      clearTimeout(this.instance._scheduledStart);
      return this.instance = new this;
    };

    return OperationsConsumptionTask;

  })(ledger.tasks.Task);

}).call(this);
