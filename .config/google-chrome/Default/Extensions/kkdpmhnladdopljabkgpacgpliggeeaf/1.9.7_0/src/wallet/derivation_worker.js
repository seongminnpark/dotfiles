(function() {
  var CurrentCommand, ExtendedPublicKeys, LastQueryId, LockQueue, QueryHandlers, Queue, WorkerCache, WorkerWallet, dequeue, enqueue, er, getPublicAddress, postError, postResult, registerExtendedPublicKeyForPath, sendCommand, setNetwork, _base, _base1;

  try {
    importScripts('../utils/logger.js', '../../libs/btchip/lib/q.js', '../../libs/bitcoinjs-min.js', '../../libs/btchip/lib/bitcoinjs-min.js', 'extended_public_key.js', '../../libs/btchip/lib/inheritance.js', '../../libs/btchip/lib/BitcoinExternal.js', '../../libs/btchip/btchip-js-api/ByteString.js', '../../libs/btchip/btchip-js-api/Convert.js', '../../libs/btchip/btchip-js-api/GlobalConstants.js', '../../libs/btchip/ucrypt/JSUCrypt.js', '../../libs/btchip/ucrypt/helpers.js', '../../libs/btchip/ucrypt/hash.js', '../../libs/btchip/ucrypt/sha256.js', '../../libs/btchip/ucrypt/ripemd160.js', '../../libs/underscore-min.js', '../../libs/underscore.string.min.js', '../utils/object.js', '../utils/amount.js', '../bitcoin/networks.js', '../build.js', '../configuration.js');
  } catch (_error) {
    er = _error;
    console.error(er);
    return;
  }

  LastQueryId = 0x8000000;

  QueryHandlers = [];

  ExtendedPublicKeys = {};

  Queue = [];

  LockQueue = false;

  CurrentCommand = null;

  if (ledger.app == null) {
    ledger.app = {};
  }

  if (ledger.wallet == null) {
    ledger.wallet = {};
  }

  if ((_base = ledger.wallet).Wallet == null) {
    _base.Wallet = {};
  }

  if ((_base1 = ledger.wallet.Wallet).instance == null) {
    _base1.instance = {};
  }

  enqueue = function(command, parameters, queryId) {
    return Queue.push({
      command: command,
      parameters: parameters,
      queryId: queryId
    });
  };

  postResult = function(result) {
    postMessage({
      command: CurrentCommand.command,
      result: result,
      queryId: CurrentCommand.queryId
    });
    CurrentCommand = null;
    LockQueue = false;
    return dequeue();
  };

  postError = function(error) {
    postMessage({
      command: CurrentCommand.command,
      error: error,
      queryId: CurrentCommand.queryId
    });
    CurrentCommand = null;
    LockQueue = false;
    return dequeue();
  };

  sendCommand = function(command, parameters, callback) {
    var queryId;
    queryId = LastQueryId++;
    QueryHandlers.push({
      id: queryId,
      callback: callback
    });
    return postMessage({
      command: command,
      parameters: parameters,
      queryId: queryId
    });
  };

  WorkerWallet = (function() {
    function WorkerWallet() {}

    ledger.app.dongle = new WorkerWallet;

    WorkerWallet.prototype.getPublicAddress = function(path, callback) {
      return sendCommand('private:getPublicAddress', [path], (function(_this) {
        return function(result, error) {
          if (result != null) {
            result.publicKey = new ByteString(result.publicKey, HEX);
            result.bitcoinAddress = new ByteString(result.bitcoinAddress, HEX);
            result.chainCode = new ByteString(result.chainCode, HEX);
          }
          return typeof callback === "function" ? callback(result, error) : void 0;
        };
      })(this));
    };

    return WorkerWallet;

  })();

  WorkerCache = (function() {
    function WorkerCache() {}

    ledger.wallet.Wallet.instance.cache = new WorkerCache;

    WorkerCache.prototype.get = function() {
      return null;
    };

    WorkerCache.prototype.set = function(entries, callback) {
      if (callback == null) {
        callback = _.noop;
      }
      return sendCommand('private:setCacheEntries', [entries], (function(_this) {
        return function(result, error) {
          return typeof callback === "function" ? callback(result, error) : void 0;
        };
      })(this));
    };

    return WorkerCache;

  })();

  setNetwork = function(networkName) {
    ledger.config.network = _(ledger.bitcoin.Networks).find((function(_this) {
      return function(item) {
        return item.name === networkName;
      };
    })(this));
    return postResult(true);
  };

  registerExtendedPublicKeyForPath = function(path) {
    if (ExtendedPublicKeys[path] != null) {
      postResult('Already registered');
      return;
    }
    return sendCommand('private:getXpubFromCache', [path], (function(_this) {
      return function(xpu58, error) {
        ExtendedPublicKeys[path] = new ledger.wallet.ExtendedPublicKey(ledger.app.dongle, path);
        if (xpu58 != null) {
          ExtendedPublicKeys[path].initializeWithBase58(xpu58);
          return postResult('registered');
        } else {
          return ExtendedPublicKeys[path].initialize(function(xpub) {
            var entry;
            entry = [path, ExtendedPublicKeys[path].toString()];
            sendCommand('private:setXpubCacheEntries', [[entry]], _.noop);
            if (xpub != null) {
              return postResult('registered');
            } else {
              return postError('Xpub creation error');
            }
          });
        }
      };
    })(this));
  };

  getPublicAddress = function(path) {
    var address, derivationPath, parentDerivationPath, xpub;
    address = null;
    for (parentDerivationPath in ExtendedPublicKeys) {
      xpub = ExtendedPublicKeys[parentDerivationPath];
      derivationPath = path;
      if (_.str.startsWith(derivationPath, "" + parentDerivationPath + "/")) {
        derivationPath = derivationPath.replace("" + parentDerivationPath + "/", '');
        address = xpub.getPublicAddress(derivationPath);
        postResult(address);
        return;
      }
    }
    if (address == null) {
      console.warn("Trying to derive with dongle ", path);
      return ledger.app.dongle.getPublicAddress(path, function(publicKey) {
        var _ref;
        this._derivationPath;
        if (publicKey != null) {
          address = publicKey != null ? (_ref = publicKey.bitcoinAddress) != null ? _ref.value : void 0 : void 0;
        }
        if (address != null) {
          return postResult(address);
        } else {
          return postError("Unable to derive path '" + path + "'");
        }
      });
    }
  };

  this.onmessage = (function(_this) {
    return function(event) {
      var command, index, parameters, queryHandler, queryId, _i, _ref, _ref1;
      _ref = event.data, command = _ref.command, parameters = _ref.parameters, queryId = _ref.queryId;
      if (queryId != null) {
        for (index = _i = 0, _ref1 = QueryHandlers.length; 0 <= _ref1 ? _i < _ref1 : _i > _ref1; index = 0 <= _ref1 ? ++_i : --_i) {
          queryHandler = QueryHandlers[index];
          if (queryHandler.id === queryId) {
            QueryHandlers.splice(index, 1);
            queryHandler.callback.apply(command, [event.data['result'], event.data['error']]);
            return;
          }
        }
      }
      if (command === 'private:unlockQueue') {
        LockQueue = false;
        if (CurrentCommand != null) {
          postError('Unknown Error');
        }
        dequeue();
        return;
      }
      enqueue(command, parameters, queryId);
      return dequeue();
    };
  })(this);

  dequeue = function() {
    var command, parameters;
    if (LockQueue || Queue.length === 0) {
      return;
    }
    LockQueue = true;
    CurrentCommand = Queue.splice(0, 1)[0];
    command = CurrentCommand.command, parameters = CurrentCommand.parameters;
    switch (command) {
      case 'public:registerExtendedPublicKeyForPath':
        return registerExtendedPublicKeyForPath.apply(command, parameters);
      case 'public:setNetwork':
        return setNetwork.apply(command, parameters);
      case 'public:getPublicAddress':
        return getPublicAddress.apply(command, parameters);
      default:
        return LockQueue = false;
    }
  };

}).call(this);
