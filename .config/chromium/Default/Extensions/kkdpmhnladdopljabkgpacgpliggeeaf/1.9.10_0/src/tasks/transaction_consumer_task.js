
/*
  This class holds a stream of transaction and is responsible for inserting them in the database. All application modules
  must feed the stream and should not consider inserting/updating transactions data.

  The stream should only accept JSON formatted transactions

  @example Transaction format
     {
      "hash":"38ea5d67277ad65c8c2c1760898fb26f12d32e81109a5eeabee3c227219883a5",
      "block_hash":"00000000000000001428ee1c464628567ae9267e6b942a85897a35a95283aa5b",
      "block_time":"2015-07-09T14:59:02Z",
      "confirmations":990,
      "lock_time":0,
      "inputs":[
         {
            "output_hash":"9da5299f0fc92ba495f336dab06fd4ef41c2732ce92bceac03eacc61ceebd9cd",
            "output_index":1,
            "value":1000000,
            "addresses":[
               "1AKiuYKJfaMA6wS54oomYMabvfudLCimz2"
            ]
         },
         {
            "output_hash":"587fe083c4d88cedada9238dcfdeb4bb532ddbe550648fdf65a05264a9902437",
            "output_index":1,
            "value":141220757,
            "addresses":[
               "16ikkRZAYXnmUAYanoVYBkZkuCnrKfpCca"
            ]
         }
      ],
      "outputs":[
         {
            "output_index":0,
            "value":10000000,
            "addresses":[
               "1Kmz7KqZWM5RuSjjGNfjPxwNbHmyJMHRCY"
            ],
            "required_signatures":1,
         },
         {
            "output_index":1,
            "value":132175914,
            "addresses":[
               "1E6q1KkrCDDjA8CqRLB42mjwq59gSLA3HR"
            ],
            "required_signatures":1,
         }
      ],
      "fees":44843,
      "amount":142175914
   }

  @example Transaction format v2
  {
      "hash": "da21f9616fb92a7fbe5e72d1537fe30e9b33603d456af72747baf5e5d28f54e3",
      "received_at": "2015-07-06T15:48:58Z",
      "lock_time": 0,
      "block": {
        "hash": "0000000000000000053197f9e8e5b0601071be99ca2a5c6ba18252a1aa895b04",
        "height": 364133,
        "time": "2015-07-06T15:48:58Z"
      },
      "inputs": [
        {
          "output_hash": "a8e499e551c4729ae74bf2136d3e046601e68f09ae30ed187bd772fc375a772e",
          "output_index": 0,
          "input_index": 0,
          "value": 1000000,
          "addresses": [
            "1Jt4tMBHBgiGcVFEDZKAEjqvqWxSUZrJxR"
          ],
          "script_signature": "473044022064dd34233b584ef220049a012294e50c0d05b9b1131843fad89982fc055af6d102202d2d96055859857a96702ebb8167eec2aae3e3269309432943c7f92718efcd8601210387ec9eb50e00c73984917d12610919d945c16ef1f52454306a8757368c004e7b"
        },
        {
          "output_hash": "a8e499e551c4729ae74bf2136d3e046601e68f09ae30ed187bd772fc375a772e",
          "output_index": 1,
          "input_index": 1,
          "value": 148513500,
          "addresses": [
            "1L3TGaALb8tVLNjuxRcePfYFr2nS2wpWwQ"
          ],
          "script_signature": "47304402202a70262a9c9510b6bc37df3ab395a79cf6ea9def1a31ba403d91754d65bc6b5b02206d7dac112b116c9715e59c83e96eac60dee03f712b137f4d6e3ce495dd2bb94a012102c21b0b1cc945e855f7fd71518811faa85954edd370b36f9c29d86f8fe792baa7"
        }
      ],
      "outputs": [
        {
          "output_index": 0,
          "value": 1000000,
          "addresses": [
            "18VLgzpLjLMRB8udaSrs4ha8gwzjzVgHUT"
          ],
          "script_hex": "76a9145224f6a5cbfa97dbe098bd72c1813c60982ff04e88ac"
        },
        {
          "output_index": 1,
          "value": 148503500,
          "addresses": [
            "1BcmwbMrp6tXATwRUkRUdzgo3MyQSFMn4M"
          ],
          "script_hex": "76a914747554e1770e5a3cd05f03fdf3a3961290f599f688ac"
        }
      ],
      "fees": 10000,
      "amount": 149503500
    }
 */

(function() {
  var $error, $info, $warn, checkForDoubleSpent, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ledger.tasks.TransactionConsumerTask = (function(_super) {
    __extends(TransactionConsumerTask, _super);

    TransactionConsumerTask.reset = function() {
      return this.instance = new this;
    };

    function TransactionConsumerTask() {
      var safe;
      TransactionConsumerTask.__super__.constructor.call(this, 'global_transaction_consumer');
      this._deferredWait = {};
      safe = function(f) {
        return function(err, i, push, next) {
          if (err != null) {
            ledger.utils.Logger.getLoggerByTag("TransactionStream").error("An error occured", err);
            push(err);
            return next();
          }
          if (i === ledger.stream.nil) {
            return push(null, ledger.stream.nil);
          }
          return f(err, i, push, next);
        };
      };
      this._input = ledger.stream();
      this._stream = ledger.stream(this._input).consume(safe(this._extendTransaction.bind(this))).filter(this._filterTransaction.bind(this)).consume(safe(this._updateDatabase.bind(this)));
      this._errorInput = ledger.stream();
      this._errorStream = ledger.stream(this._errorInput);
    }


    /*
     */

    TransactionConsumerTask.prototype.pushCallback = function(callback) {
      this._input.write(callback);
      return this;
    };


    /*
      Push a single json formatted transaction into the stream.
     */

    TransactionConsumerTask.prototype.pushTransaction = function(transaction) {
      if (_.isArray(transaction)) {
        return this.pushTransactions(transaction);
      }
      if (transaction == null) {
        $warn("Transaction consumer received a null transaction.", new Error().stack);
        return;
      }
      this._input.write(transaction);
      return this;
    };

    TransactionConsumerTask.prototype.pushTransactionsFromStream = function(stream) {
      return stream.each((function(_this) {
        return function(transaction) {
          return _this.pushTransaction(transaction);
        };
      })(this));
    };


    /*
      Push an array of json formatted transactions into the stream.
     */

    TransactionConsumerTask.prototype.pushTransactions = function(transactions) {
      var transaction, _i, _len;
      for (_i = 0, _len = transactions.length; _i < _len; _i++) {
        transaction = transactions[_i];
        this.pushTransaction(transaction);
      }
      return this;
    };


    /*
      Get an observable version of the transaction stream
     */

    TransactionConsumerTask.prototype.observe = function() {
      return this._stream.fork();
    };


    /*
      Return a promise completed once a transaction is inserted/updated in the database
     */

    TransactionConsumerTask.prototype.waitForTransactionToBeInserted = function(txHash) {
      var _base;
      return ((_base = this._deferredWait)[txHash] || (_base[txHash] = ledger.defer())).promise;
    };


    /*
      Get an observable version of the error stream
     */

    TransactionConsumerTask.prototype.errorStream = function() {
      return this._errorStream.observe();
    };

    TransactionConsumerTask.prototype.onStart = function() {
      TransactionConsumerTask.__super__.onStart.apply(this, arguments);
      this._input.resume();
      return this._stream.resume();
    };

    TransactionConsumerTask.prototype.onStop = function() {
      TransactionConsumerTask.__super__.onStop.apply(this, arguments);
      this._input.end();
      this._stream.pause();
      return this._stream.end();
    };

    TransactionConsumerTask.prototype._requestDerivations = function() {
      var d;
      d = ledger.defer();
      ledger.wallet.pathsToAddresses(ledger.wallet.Wallet.instance.getAllObservedAddressesPaths(), function(addresses) {
        return d.resolve(_.invert(addresses));
      });
      return d.promise;
    };

    TransactionConsumerTask.prototype._getAddressCache = function() {
      return this._requestDerivations();
    };


    /*
      Extends the given transaction with derivation paths and related accounts
      @private
     */

    TransactionConsumerTask.prototype._extendTransaction = function(err, transaction, push, next) {
      var wallet;
      if (_.isFunction(transaction)) {
        Try(function() {
          return transaction();
        });
        push(null, transaction);
        return next();
      }
      wallet = ledger.wallet.Wallet.instance;
      return this._getAddressCache().then((function(_this) {
        return function(cache) {
          var extendIos;
          transaction.accounts = [];
          extendIos = function(ios) {
            var accountIndex, address, hasOwn, index, io, node, path, __, _i, _j, _len, _len1, _ref, _ref1;
            hasOwn = false;
            for (_i = 0, _len = ios.length; _i < _len; _i++) {
              io = ios[_i];
              io.paths = [];
              io.accounts = [];
              io.nodes = [];
              io.addresses || (io.addresses = _.compact([io.address]));
              _ref = io.addresses || [];
              for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
                address = _ref[_j];
                path = cache[address];
                io.paths.push(path);
                if (path != null) {
                  ledger.wallet.Wallet.instance.getAccountFromDerivationPath(path).notifyPathsAsUsed([path]);
                  hasOwn = true;
                }
                io.accounts.push((path != null ? wallet.getOrCreateAccountFromDerivationPath(path) : void 0));
                if (path != null) {
                  if (ios === transaction.outputs) {
                    (transaction.ownOutputs || (transaction.ownOutputs = [])).push(io);
                  }
                  _ref1 = path.match("" + (wallet.getRootDerivationPath()) + "/(\\d+)'/(0|1)/(\\d+)"), __ = _ref1[0], accountIndex = _ref1[1], node = _ref1[2], index = _ref1[3];
                  transaction.accounts.push(wallet.getOrCreateAccount(accountIndex));
                  io.nodes.push([+accountIndex, +node, +index]);
                } else {
                  io.nodes.push(void 0);
                }
              }
            }
            return hasOwn;
          };
          transaction.hasOwn = extendIos(transaction.inputs);
          transaction.hasOwn = extendIos(transaction.outputs) || transaction.hasOwn;
          return _.defer(function() {
            push(null, transaction);
            return next();
          });
        };
      })(this)).fail(function(error) {
        push({
          error: error,
          transaction: transaction
        });
        return next();
      }).done();
    };


    /*
      Filters transactions depending if they belong to the wallet or not.
      @private
     */

    TransactionConsumerTask.prototype._filterTransaction = function(transaction) {
      if (_.isFunction(transaction)) {
        return false;
      }
      return transaction.hasOwn;
    };

    TransactionConsumerTask.prototype._updateDatabase = function(err, transaction, push, next) {
      var accounts, pulled;
      accounts = _(transaction.accounts).chain().uniq(function(a) {
        return a.index;
      }).value();
      pulled = false;
      return ledger.stream(accounts).consume((function(_this) {
        return function(err, account, push, next) {
          var createAccount;
          if (account === ledger.stream.nil) {
            return push(null, ledger.stream.nil);
          }
          createAccount = function() {
            var databaseAccount;
            databaseAccount = Account.findById(account.index);
            if ((databaseAccount == null) && pulled) {
              push(null, Account.recoverAccount(account.index, Wallet.instance));
              return next();
            } else if (databaseAccount == null) {
              return ledger.database.contexts.main.refresh().then(function() {
                pulled = true;
                return createAccount();
              }).done();
            } else {
              push(null, databaseAccount);
              return next();
            }
          };
          createAccount();
        };
      })(this)).consume((function(_this) {
        return function(err, account, push, next) {
          var inputs, isReception, isSending, operation, outputs, tx;
          if (account === ledger.stream.nil) {
            return push(null, ledger.stream.nil);
          }
          inputs = transaction.inputs;
          outputs = transaction.outputs;
          tx = transaction;
          tx.inputs = inputs;
          tx.outputs = outputs;
          isSending = false;
          if (_(inputs).chain().some(function(i) {
            return _(i.accounts).some(function(a) {
              return (a != null ? a.index : void 0) === account.getId();
            });
          }).value()) {
            isSending = true;
            operation = Operation.fromSend(tx, account);
            ledger.app.emit((operation.isInserted() ? 'wallet:operations:update' : 'wallet:operations:new'), [operation]);
            operation.save();
            (transaction.operations || (transaction.operations = [])).push(operation);
          }
          isReception = _(transaction.ownOutputs || []).chain().some(function(o) {
            var a, b;
            a = _(o.accounts).some(function(a) {
              return (a != null ? a.index : void 0) === account.getId();
            }) && !_(o.nodes).chain().compact().every(function(n) {
              return n[1] === 1;
            }).value();
            b = !isSending && _(o.accounts).some(function(a) {
              return (a != null ? a.index : void 0) === account.getId();
            });
            return a || b;
          }).value();
          if (isReception) {
            operation = Operation.fromReception(tx, account);
            ledger.app.emit((operation.isInserted() ? 'wallet:operations:update' : 'wallet:operations:new'), [operation]);
            operation.save();
            (transaction.operations || (transaction.operations = [])).push(operation);
          }
          checkForDoubleSpent(operation);
          return next();
        };
      })(this)).done((function(_this) {
        return function() {
          return _.defer(function() {
            var _ref;
            if ((_ref = _this._deferredWait[transaction.hash]) != null) {
              _ref.resolve(transaction);
            }
            _this._deferredWait = _(_this._deferredWait).omit(transaction.hash);
            return next();
          });
        };
      })(this));
    };

    TransactionConsumerTask.instance = new TransactionConsumerTask;

    return TransactionConsumerTask;

  })(ledger.tasks.Task);

  _ref = ledger.utils.Logger.getLazyLoggerByTag("TransactionConsumerTask"), $info = _ref.$info, $error = _ref.$error, $warn = _ref.$warn;

  checkForDoubleSpent = function(operation) {
    var er, index, inputUid, transaction, transactions, tx, txs, _i, _j, _len, _len1, _ref1, _results;
    if (operation.get('confirmations') > 0) {
      return false;
    }
    try {
      transaction = operation.get('transaction');
      transactions = [];
      _ref1 = transaction.get('inputs_uids');
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        inputUid = _ref1[_i];
        txs = Transaction.find({
          inputs_uids: {
            $contains: inputUid
          }
        }).data();
        transactions = transactions.concat(txs);
      }
      transactions = _(transactions).uniq(function(tx) {
        return tx.get('hash');
      }).sort(function(a, b) {
        if (a.get('fees') > b.get('fees')) {
          return -1;
        } else if (a.get('fees') < b.get('fees')) {
          return 1;
        } else if (a.get('time') < b.get('time')) {
          return -1;
        } else if (a.get('time') > b.get('time')) {
          return 1;
        } else {
          return 0;
        }
      });
      _results = [];
      for (index = _j = 0, _len1 = transactions.length; _j < _len1; index = ++_j) {
        tx = transactions[index];
        _results.push(tx.set('double_spent_priority', index).save());
      }
      return _results;
    } catch (_error) {
      er = _error;
      return e(er);
    }
  };

}).call(this);
