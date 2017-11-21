(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ledger.tasks.AddressDerivationTask = (function(_super) {
    __extends(AddressDerivationTask, _super);

    function AddressDerivationTask() {
      AddressDerivationTask.__super__.constructor.call(this, 'global_address_derivation');
      this._readyPromise = ledger.defer();
    }

    AddressDerivationTask.instance = new AddressDerivationTask();

    AddressDerivationTask.prototype.onStart = function() {
      this._worker = new Worker('../src/wallet/derivation_worker.js');
      this._vents = new EventEmitter();
      this._worker.onmessage = (function(_this) {
        return function(event) {
          var command, error, parameters, queryId, result, _ref;
          _ref = event.data, queryId = _ref.queryId, command = _ref.command, result = _ref.result, parameters = _ref.parameters, error = _ref.error;
          _this._vents.emit("" + command + "::" + queryId, {
            result: result,
            error: error,
            parameters: parameters
          });
          return _this._vents.emit("" + command, {
            result: result,
            error: error,
            queryId: queryId,
            parameters: parameters
          });
        };
      })(this);
      this._worker.onerror = (function(_this) {
        return function(event) {
          e(event);
          _this._worker.postMessage({
            command: 'private:unlockQueue'
          });
          return event.preventDefault();
        };
      })(this);
      this._vents.on('private:getPublicAddress', (function(_this) {
        return function(ev, data) {
          return ledger.app.dongle.getPublicAddress(data['parameters'][0], function(result, error) {
            var command, queryId;
            command = data.command, queryId = data.queryId;
            if (result != null) {
              result.publicKey = result.publicKey.toString(HEX);
              result.bitcoinAddress = result.bitcoinAddress.toString(HEX);
              result.chainCode = result.chainCode.toString(HEX);
            }
            return _this._worker.postMessage({
              command: command,
              queryId: queryId,
              result: result,
              error: error != null ? error.message : void 0
            });
          });
        };
      })(this));
      this._vents.on('private:setCacheEntries', (function(_this) {
        return function(ev, data) {
          var command, parameters, queryId, _ref, _ref1;
          command = data.command, queryId = data.queryId, parameters = data.parameters;
          if ((_ref = ledger.wallet.Wallet.instance) != null) {
            if ((_ref1 = _ref.cache) != null) {
              _ref1.set(parameters[0]);
            }
          }
          return _this._worker.postMessage({
            command: command,
            queryId: queryId,
            result: 'success',
            error: void 0
          });
        };
      })(this));
      this._vents.on('private:getXpubFromCache', (function(_this) {
        return function(ev, data) {
          var command, parameters, queryId, xpub, _ref;
          command = data.command, queryId = data.queryId, parameters = data.parameters;
          xpub = (_ref = ledger.wallet.Wallet.instance) != null ? _ref.xpubCache.get(parameters[0]) : void 0;
          return _this._worker.postMessage({
            command: command,
            queryId: queryId,
            result: xpub,
            error: void 0
          });
        };
      })(this));
      this._vents.on('private:setXpubCacheEntries', (function(_this) {
        return function(ev, data) {
          var command, parameters, queryId, _ref;
          command = data.command, queryId = data.queryId, parameters = data.parameters;
          if ((_ref = ledger.wallet.Wallet.instance) != null) {
            _ref.xpubCache.set(parameters[0]);
          }
          return _this._worker.postMessage({
            command: command,
            queryId: queryId,
            result: 'success',
            error: void 0
          });
        };
      })(this));
      return this._readyPromise.resolve();
    };

    AddressDerivationTask.prototype.onStop = function() {
      return this._worker.terminate();
    };

    AddressDerivationTask.prototype.registerExtendedPublicKeyForPath = function(path, callback) {
      return this._postCommand('public:registerExtendedPublicKeyForPath', [path], (function(_this) {
        return function(data) {
          return typeof callback === "function" ? callback(data.result, data.error) : void 0;
        };
      })(this));
    };

    AddressDerivationTask.prototype.getPublicAddress = function(path, callback) {
      return this._postCommand('public:getPublicAddress', [path], (function(_this) {
        return function(data) {
          return typeof callback === "function" ? callback(data.result, data.error) : void 0;
        };
      })(this));
    };

    AddressDerivationTask.prototype.setNetwork = function(networkName) {
      return this._postCommand('public:setNetwork', [networkName], (function(_this) {
        return function(data) {
          return typeof callback === "function" ? callback(data.result, data.error) : void 0;
        };
      })(this));
    };

    AddressDerivationTask.prototype._postCommand = function(command, parameters, callback) {
      var queryId;
      queryId = _.uniqueId();
      this._ready().then((function(_this) {
        return function() {
          _this._vents.once("" + command + "::" + queryId, function(ev, data) {
            return typeof callback === "function" ? callback(data) : void 0;
          });
          return _this._worker.postMessage({
            command: command,
            parameters: parameters,
            queryId: queryId
          });
        };
      })(this));
      return queryId;
    };

    AddressDerivationTask.prototype._ready = function() {
      return this._readyPromise.promise;
    };

    AddressDerivationTask.reset = function() {
      return this.instance = new this();
    };

    return AddressDerivationTask;

  })(ledger.tasks.Task);

}).call(this);
