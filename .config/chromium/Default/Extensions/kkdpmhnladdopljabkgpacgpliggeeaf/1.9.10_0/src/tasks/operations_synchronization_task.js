(function() {
  var $error, $info, $warn, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = ledger.utils.Logger.getLazyLoggerByTag("OperationsSynchronizationTask"), $info = _ref.$info, $error = _ref.$error, $warn = _ref.$warn;

  ledger.tasks.OperationsSynchronizationTask = (function(_super) {
    __extends(OperationsSynchronizationTask, _super);

    function OperationsSynchronizationTask() {
      OperationsSynchronizationTask.__super__.constructor.call(this, 'global_operations_synchronizer');
    }

    OperationsSynchronizationTask.instance = new OperationsSynchronizationTask();

    OperationsSynchronizationTask.prototype.onStart = function() {
      return this._retryNumber = 0;
    };

    OperationsSynchronizationTask.prototype.synchronizeConfirmationNumbers = function(operations, callback) {
      var ops, synchronize;
      if (operations == null) {
        operations = null;
      }
      if (callback == null) {
        callback = _.noop;
      }
      ops = operations;
      if (operations == null) {
        operations = Operation.find({
          confirmations: {
            $lt: 1
          }
        }).data();
      }
      if (operations.length === 0) {
        return this.stopIfNeccessary();
      }
      synchronize = function(index, operations, updatedOperations, failedOperations) {
        var d;
        if (index >= operations.length) {
          return ledger.defer().resolve([updatedOperations, failedOperations]).promise;
        }
        d = ledger.defer();
        ledger.api.TransactionsRestClient.instance.refreshTransaction([operations[index]], (function(_this) {
          return function(operation, error) {
            if (error != null) {
              failedOperations = failedOperations.concat(operations[index]);
            } else {
              updatedOperations = updatedOperations.concat(operation[0]);
              ledger.tasks.TransactionConsumerTask.instance.pushTransaction(operation[0]);
            }
            return d.resolve(synchronize(index + 1, operations, updatedOperations, failedOperations));
          };
        })(this));
        return d.promise;
      };
      return synchronize(0, operations, [], []).then((function(_this) {
        return function(_arg) {
          var failedOperations, updatedOperations;
          updatedOperations = _arg[0], failedOperations = _arg[1];
          if (failedOperations.length > 0) {
            throw {
              failedOperations: failedOperations
            };
          }
          _this._retryNumber = 0;
          _this.stopIfNeccessary();
          return callback();
        };
      })(this)).fail((function(_this) {
        return function(er) {
          if (er.failedOperations == null) {
            return $error("An unexpected error occurred during operation synchronization ");
          }
          return _.defer(function() {
            var op;
            ops = (function() {
              var _i, _len, _ref1, _results;
              _ref1 = ops || operations;
              _results = [];
              for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                op = _ref1[_i];
                if (this.checkForDoubleSpent(op) === false) {
                  _results.push(op);
                }
              }
              return _results;
            }).call(_this);
            _this._retryNumber = Math.min(_this._retryNumber + 1, 12);
            return _.delay((function() {
              return _this.synchronizeConfirmationNumbers(ops, callback);
            }), ledger.math.fibonacci(_this._retryNumber) * 500);
          });
        };
      })(this)).done();
    };

    OperationsSynchronizationTask.reset = function() {
      return this.instance = new this;
    };

    OperationsSynchronizationTask.prototype.checkForDoubleSpent = function(operation) {
      var confirmedIndex, er, index, input_hash, input_index, op, query, suspiciousOperations, _i, _j, _k, _len, _len1, _len2, _ref1;
      if (operation.get('confirmations') > 0 || true) {
        return false;
      }
      try {
        _ref1 = operation.get('inputs_hash');
        for (index = _i = 0, _len = _ref1.length; _i < _len; index = ++_i) {
          input_hash = _ref1[index];
          l("Check for double spent on " + input_hash);
          input_index = operation.get('inputs_index')[index];
          query = {
            $and: [
              {
                inputs_hash: {
                  $contains: input_hash
                }
              }, {
                $and: [
                  {
                    inputs_index: {
                      $contains: input_index
                    }
                  }, {
                    type: operation.get('type')
                  }
                ]
              }
            ]
          };
          suspiciousOperations = Operation.find(query).data();
          suspiciousOperations = (function() {
            var _j, _len1, _results;
            _results = [];
            for (_j = 0, _len1 = suspiciousOperations.length; _j < _len1; _j++) {
              op = suspiciousOperations[_j];
              if (op.get('inputs_index')[_(op.get('inputs_hash').indexOf(input_hash))] === input_index) {
                _results.push(op);
              }
            }
            return _results;
          })();
          if (suspiciousOperations.length === 1) {
            return;
          }
          confirmedIndex = _(suspiciousOperations).findIndex(function(i) {
            return i.get('confirmations') > 0;
          });
          if (confirmedIndex !== -1) {
            for (index = _j = 0, _len1 = suspiciousOperations.length; _j < _len1; index = ++_j) {
              op = suspiciousOperations[index];
              l("Deleting ", index === confirmedIndex, suspiciousOperations[index], suspiciousOperations[confirmedIndex], suspiciousOperations, index, confirmedIndex, input_hash, input_index);
              if (index !== confirmedIndex) {
                op["delete"]();
              }
            }
            return true;
          }
          suspiciousOperations.sort(function(a, b) {
            if (a.get('fees') > b.get('fees')) {
              return -1;
            } else if (a.get('fees') < b.get('fees')) {
              return 1;
            } else if (a.get('time') < b.get('time')) {
              return -1;
            } else if (a.get('time') < b.get('time')) {
              return 1;
            } else {
              return 0;
            }
          });
          for (index = _k = 0, _len2 = suspiciousOperations.length; _k < _len2; index = ++_k) {
            op = suspiciousOperations[index];
            op.set('double_spent_priority', index).save();
          }
          return false;
        }
      } catch (_error) {
        er = _error;
        return e(er);
      }
    };

    return OperationsSynchronizationTask;

  })(ledger.tasks.Task);

}).call(this);
