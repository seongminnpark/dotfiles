(function() {
  var clone;

  ledger.database || (ledger.database = {});

  clone = function(obj) {
    var item, key, out, value, _i, _len, _results;
    if (_.isFunction(obj)) {
      return {};
    } else if (_.isArray(obj)) {
      _results = [];
      for (_i = 0, _len = obj.length; _i < _len; _i++) {
        item = obj[_i];
        _results.push(clone(item));
      }
      return _results;
    } else if (_.isObject(obj)) {
      out = {};
      for (key in obj) {
        value = obj[key];
        out[key] = clone(value);
      }
      return out;
    } else {
      return obj;
    }
  };

  ledger.database.DatabasePersistenceAdapter = (function() {
    function DatabasePersistenceAdapter(dbName, password) {
      this._dbName = dbName;
      this._password = password;
      this._pendingCommands = {};
      this._worker = new Worker('../src/database/database_persistence_worker.js');
      this._worker.onmessage = (function(_this) {
        return function(message) {
          var deferred, error, queryId, result, _ref;
          _ref = message.data, queryId = _ref.queryId, result = _ref.result, error = _ref.error;
          deferred = _this._pendingCommands[queryId];
          _this._pendingCommands = _(_this._pendingCommands).omit(queryId);
          if (error != null) {
            return deferred.reject(error);
          } else {
            return deferred.resolve(result);
          }
        };
      })(this);
      this._worker.onerror = (function(_this) {
        return function(error) {
          e(error);
          return error.preventDefault();
        };
      })(this);
      this._ready = false;
      this._prepare();
    }

    DatabasePersistenceAdapter.prototype.declare = function(collection) {
      return this._postCommand({
        command: 'declare',
        collection: clone(collection)
      });
    };

    DatabasePersistenceAdapter.prototype["delete"] = function() {
      return this._postCommand({
        command: 'delete'
      });
    };

    DatabasePersistenceAdapter.prototype.saveChanges = function(changes) {
      return this._postCommand({
        command: 'changes',
        changes: changes
      });
    };

    DatabasePersistenceAdapter.prototype.serialize = function() {
      return this._postCommand({
        command: 'serialize'
      });
    };

    DatabasePersistenceAdapter.prototype.stop = function() {
      return this._worker.terminate();
    };

    DatabasePersistenceAdapter.prototype._postCommand = function(command) {
      return this._prepare().then((function(_this) {
        return function() {
          return _this._postCommandToWorker(command);
        };
      })(this)).fail((function(_this) {
        return function(er) {
          return e(er);
        };
      })(this));
    };

    DatabasePersistenceAdapter.prototype._postCommandToWorker = function(command) {
      var defer, queryId;
      queryId = _.uniqueId();
      command['queryId'] = queryId;
      defer = ledger.defer();
      this._pendingCommands[queryId] = defer;
      this._worker.postMessage(command);
      return defer.promise;
    };

    DatabasePersistenceAdapter.prototype._prepare = function() {
      if (this._deferredPreparation == null) {
        this._deferredPreparation = ledger.defer();
        this._deferredPreparation.resolve(this._postCommandToWorker({
          command: 'prepare',
          dbName: this._dbName,
          password: this._password
        }));
      }
      return this._deferredPreparation.promise;
    };

    return DatabasePersistenceAdapter;

  })();

}).call(this);
