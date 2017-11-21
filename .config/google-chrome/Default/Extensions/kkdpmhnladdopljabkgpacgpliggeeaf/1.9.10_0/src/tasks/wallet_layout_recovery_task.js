(function() {
  var $error, $info, $log,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  $log = function() {
    return ledger.utils.Logger.getLoggerByTag("WalletLayoutRecoveryTask");
  };

  $info = function() {
    var args, _ref;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return (_ref = $log()).info.apply(_ref, args);
  };

  $error = function() {
    var args, _ref;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return (_ref = $log()).error.apply(_ref, args);
  };

  ledger.tasks.WalletLayoutRecoveryTask = (function(_super) {
    __extends(WalletLayoutRecoveryTask, _super);

    WalletLayoutRecoveryTask.prototype.BatchSize = 50;

    WalletLayoutRecoveryTask.prototype.NumberOfRetry = 1;

    function WalletLayoutRecoveryTask() {
      WalletLayoutRecoveryTask.__super__.constructor.call(this, 'recovery-global-instance');
    }

    WalletLayoutRecoveryTask.instance = new WalletLayoutRecoveryTask();

    WalletLayoutRecoveryTask.prototype.getLastSynchronizationStatus = function() {
      return this._loadSynchronizationData().then(function(state) {
        return state['lastSyncStatus'];
      });
    };

    WalletLayoutRecoveryTask.prototype.getLastSynchronizationDate = function() {
      return this._loadSynchronizationData().then(function(state) {
        return new Date(state['lastSyncTime']);
      });
    };

    WalletLayoutRecoveryTask.prototype.getConsumer = function() {
      return this._consumer || (this._consumer = ledger.tasks.AddressDerivationTask.instance);
    };

    WalletLayoutRecoveryTask.prototype.onStart = function() {
      var startDate, unconfirmedTxs;
      unconfirmedTxs = this._findUnconfirmedTransaction();
      startDate = new Date();
      $info("Start synchronization", startDate.toString());
      $info("Looking for mempool tx", _(unconfirmedTxs).map(function(tx) {
        return tx.get('hash');
      }));
      return this._performRecovery(unconfirmedTxs).then((function(_this) {
        return function(transactionsNotFound) {
          $info("Recovery completed");
          $info("Unable to find these transactions", _(transactionsNotFound).map(function(tx) {
            return tx.get('hash');
          }));
          _this._discardTransactions(transactionsNotFound);
          ledger.app.emit('wallet:operations:sync:done');
          return _this.emit('done');
        };
      })(this)).fail((function(_this) {
        return function(er) {
          $error("Synchronization failed", er);
          ledger.app.emit("wallet:operations:sync:failed");
          return _this.emit('fatal_error');
        };
      })(this)).fin((function(_this) {
        return function() {
          var duration;
          if (_this._syncToken != null) {
            _this._deleteSynchronizationToken(_this._syncToken);
          }
          _this._syncToken = null;
          duration = moment.duration(new Date().getTime() - startDate.getTime());
          $info("Stop synchronization. Synchronization took " + (duration.get("minutes")) + ":" + (duration.get("seconds")) + ":" + (duration.get("milliseconds")));
          return _this.stopIfNeccessary();
        };
      })(this));
    };

    WalletLayoutRecoveryTask.prototype._performRecovery = function(unconfirmedTransactions, retryCount) {
      var lastBlock, persistState, savedState;
      if (retryCount == null) {
        retryCount = 0;
      }
      savedState = {};
      persistState = false;
      lastBlock = void 0;
      return this._loadSynchronizationData().then((function(_this) {
        return function(data) {
          savedState = _this._migrateSavedState(data);
          persistState = true;
          return ledger.api.BlockRestClient.instance.refreshLastBlock();
        };
      })(this)).then((function(_this) {
        return function(block) {
          lastBlock = block;
          return _this._requestSynchronizationToken();
        };
      })(this)).then((function(_this) {
        return function(token) {
          _this._syncToken = token;
          return _this._recoverAccounts(unconfirmedTransactions, savedState, token);
        };
      })(this)).fail((function(_this) {
        return function(er) {
          var d;
          e("Failure during synchro", er);
          if ((er != null ? typeof er.getStatusCode === "function" ? er.getStatusCode() : void 0 : void 0) === 404) {
            return _this._handleReorgs(savedState, er.block).then(function() {
              return _this._performRecovery(unconfirmedTransactions);
            });
          } else if (retryCount < _this.NumberOfRetry) {
            d = ledger.defer();
            _.delay((function() {
              return d.resolve(_this._performRecovery(unconfirmedTransactions, retryCount + 1));
            }), 1000);
            return d.promise;
          } else {
            savedState['lastSyncStatus'] = 'failure';
            d = ledger.defer();
            if (persistState) {
              _this._saveSynchronizationData(savedState).then(function() {
                return d.reject(er);
              });
            } else {
              d.reject(er);
            }
            return d.promise;
          }
        };
      })(this)).then((function(_this) {
        return function(unconfirmed) {
          unconfirmedTransactions = unconfirmed;
          savedState['lastSyncStatus'] = 'success';
          savedState['lastSyncTime'] = new Date().getTime();
          if (persistState) {
            return _this._saveSynchronizationData(savedState);
          }
        };
      })(this)).then((function(_this) {
        return function() {
          return unconfirmedTransactions;
        };
      })(this));
    };

    WalletLayoutRecoveryTask.prototype._numberOfAccountInState = function(savedState) {
      var accountIndex;
      accountIndex = 0;
      while (savedState["account_" + accountIndex] != null) {
        accountIndex += 1;
      }
      return accountIndex;
    };

    WalletLayoutRecoveryTask.prototype._recoverAccounts = function(unconfirmedTransactions, savedState, syncToken) {
      var accountsCount, hdWallet, recover, recoverUntilEmpty;
      hdWallet = ledger.wallet.Wallet.instance;
      accountsCount = this._numberOfAccountInState(savedState);
      recover = (function(_this) {
        return function(fromIndex, toIndex) {
          var account, accountIndex, promises;
          if (toIndex == null) {
            toIndex = 0;
          }
          promises = [];
          accountIndex = fromIndex;
          while ((savedState["account_" + accountIndex] != null) || accountIndex <= toIndex) {
            account = hdWallet.getOrCreateAccount(accountIndex);
            (function(account) {
              var d;
              d = ledger.defer();
              _this.getConsumer().registerExtendedPublicKeyForPath(account.getRootDerivationPath(), function() {
                return d.resolve(_this._recoverAccount(account, savedState, syncToken));
              });
              return promises.push(d.promise);
            })(account);
            accountIndex += 1;
          }
          return Q.all(promises);
        };
      })(this);
      recoverUntilEmpty = (function(_this) {
        return function(fromIndex, toIndex) {
          if (fromIndex == null) {
            fromIndex = 0;
          }
          if (toIndex == null) {
            toIndex = 0;
          }
          return recover(fromIndex, toIndex).then(function(results) {
            var containsEmpty, isEmpty, txs, _i, _len, _ref;
            containsEmpty = false;
            for (_i = 0, _len = results.length; _i < _len; _i++) {
              _ref = results[_i], isEmpty = _ref[0], txs = _ref[1];
              containsEmpty || (containsEmpty = isEmpty);
              unconfirmedTransactions = _(unconfirmedTransactions).filter(function(tx) {
                return !_(txs).some(function(hash) {
                  return tx.get('hash') === hash;
                });
              });
            }
            if (!containsEmpty) {
              accountsCount = _this._numberOfAccountInState(savedState);
              return recoverUntilEmpty(accountsCount, accountsCount);
            } else {
              return unconfirmedTransactions;
            }
          }).fail(function(er) {
            throw er;
          });
        };
      })(this);
      return recoverUntilEmpty();
    };

    WalletLayoutRecoveryTask.prototype._recoverAccount = function(account, savedState, syncToken) {
      var batches, fetchTxs, recover, recoverUntilEmpty, savedAccountState;
      $info("Recover account " + account.index);
      savedAccountState = savedState["account_" + account.index] || {};
      savedState["account_" + account.index] = savedAccountState;
      batches = savedAccountState["batches"] || [];
      savedAccountState["batches"] = batches;
      fetchTxs = [];
      recover = (function(_this) {
        return function(fromIndex, toIndex) {
          var index, promises, _fn, _i;
          promises = [];
          _fn = function(index) {
            var batch, recoverUntilEnd;
            batch = batches[index];
            if (batch == null) {
              batch = {
                index: index,
                blockHash: null
              };
              batches.push(batch);
            }
            $info("Recover batch " + batch.index + " for account " + account.index);
            recoverUntilEnd = function() {
              return _this._recoverBatch(batch, account.index, syncToken).then(function(_arg) {
                var block, d, hasNext, transactions;
                hasNext = _arg.hasNext, block = _arg.block, transactions = _arg.transactions;
                fetchTxs = fetchTxs.concat(transactions);
                if ((block != null) && ((batch['blockHeight'] == null) || block.height > batch['blockHeight'])) {
                  batch['blockHash'] = block.hash;
                  batch['blockHeight'] = block.height;
                }
                d = ledger.defer();
                l("Batch " + batch.index + " for account " + account.index + " has next", hasNext);
                if (hasNext) {
                  ledger.tasks.TransactionConsumerTask.instance.pushCallback(function() {
                    return d.resolve(recoverUntilEnd());
                  });
                } else {
                  d.resolve();
                }
                return d.promise;
              });
            };
            return promises.push(recoverUntilEnd());
          };
          for (index = _i = fromIndex; fromIndex <= toIndex ? _i <= toIndex : _i >= toIndex; index = fromIndex <= toIndex ? ++_i : --_i) {
            _fn(index);
          }
          return Q.all(promises);
        };
      })(this);
      recoverUntilEmpty = (function(_this) {
        return function(fromIndex, toIndex) {
          if (fromIndex == null) {
            fromIndex = 0;
          }
          if (toIndex == null) {
            toIndex = Math.max(batches.length - 1, 0);
          }
          return recover(fromIndex, toIndex).then(function() {
            if (_(batches).last().blockHash != null) {
              return recoverUntilEmpty(batches.length, batches.length);
            } else {
              $info("Download txs ", fetchTxs);
              return [batches.length <= 1, fetchTxs];
            }
          }).fail(function(er) {
            throw er;
          });
        };
      })(this);
      return recoverUntilEmpty();
    };

    WalletLayoutRecoveryTask.prototype._recoverBatch = function(batch, accountIndex, syncToken) {
      var account, blockHash, from, hasNext, to, wallet;
      wallet = ledger.wallet.Wallet.instance;
      account = wallet.getOrCreateAccount(accountIndex);
      blockHash = batch['blockHash'];
      from = batch.index * this.BatchSize;
      to = from + this.BatchSize;
      hasNext = false;
      return this._recoverAddresses(account.getRootDerivationPath(), from, to, blockHash, syncToken).then((function(_this) {
        return function(result) {
          var block, d, transactions;
          d = ledger.defer();
          hasNext = result["truncated"];
          block = _this._findHighestBlock(result.txs);
          transactions = _(result['txs']).map(function(tx) {
            return tx.hash;
          });
          ledger.tasks.TransactionConsumerTask.instance.pushTransactions(result['txs']);
          ledger.tasks.TransactionConsumerTask.instance.pushCallback(function() {
            return d.resolve({
              hasNext: hasNext,
              block: block,
              transactions: transactions
            });
          });
          return d.promise;
        };
      })(this)).fail(function(er) {
        er.block = batch;
        throw er;
      });
    };

    WalletLayoutRecoveryTask.prototype._recoverAddresses = function(root, from, to, blockHash, syncToken) {
      var callback, d, paths, _i, _j, _results, _results1;
      paths = _.map((function() {
        _results = [];
        for (var _i = from; from <= to ? _i < to : _i > to; from <= to ? _i++ : _i--){ _results.push(_i); }
        return _results;
      }).apply(this), function(i) {
        return "" + root + "/" + 0 + "/" + i;
      });
      paths = paths.concat(_.map((function() {
        _results1 = [];
        for (var _j = from; from <= to ? _j < to : _j > to; from <= to ? _j++ : _j--){ _results1.push(_j); }
        return _results1;
      }).apply(this), function(i) {
        return "" + root + "/" + 1 + "/" + i;
      }));
      d = ledger.defer();
      l("Recovering ", paths);
      callback = (function(_this) {
        return function(response, error) {
          if (error != null) {
            return d.reject(error);
          }
          return d.resolve(response);
        };
      })(this);
      ledger.wallet.pathsToAddresses(paths, (function(_this) {
        return function(addresses) {
          return ledger.api.TransactionsRestClient.instance.getPaginatedTransactions(_.values(addresses), blockHash, syncToken, callback);
        };
      })(this));
      return d.promise;
    };

    WalletLayoutRecoveryTask.prototype._findHighestBlock = function(txs) {
      var bestBlock, tx, _i, _len, _ref;
      bestBlock = null;
      for (_i = 0, _len = txs.length; _i < _len; _i++) {
        tx = txs[_i];
        if ((bestBlock == null) || (((_ref = tx.block) != null ? _ref.height : void 0) > bestBlock.height)) {
          bestBlock = tx.block;
        }
      }
      return bestBlock;
    };

    WalletLayoutRecoveryTask.prototype._requestSynchronizationToken = function() {
      var d;
      d = ledger.defer();
      ledger.api.TransactionsRestClient.instance.getSyncToken(function(token, error) {
        if ((error != null)) {
          return d.reject(error);
        } else {
          return d.resolve(token);
        }
      });
      return d.promise;
    };

    WalletLayoutRecoveryTask.prototype._deleteSynchronizationToken = function(token) {
      var d;
      d = ledger.defer();
      ledger.api.TransactionsRestClient.instance.deleteSyncToken(token, function() {
        return d.resolve();
      });
      return d.promise;
    };

    WalletLayoutRecoveryTask.prototype._loadSynchronizationData = function() {
      var d;
      d = ledger.defer();
      ledger.storage.local.get('ledger.tasks.WalletLayoutRecoveryTask', (function(_this) {
        return function(data) {
          l("Synchronization saved state ", data);
          if (data['ledger.tasks.WalletLayoutRecoveryTask'] == null) {
            return d.resolve({});
          } else {
            return d.resolve(data['ledger.tasks.WalletLayoutRecoveryTask']);
          }
        };
      })(this));
      return d.promise.then((function(_this) {
        return function(data) {
          return data;
        };
      })(this));
    };

    WalletLayoutRecoveryTask.prototype._saveSynchronizationData = function(data) {
      var d, save;
      d = ledger.defer();
      l("Saving state", data);
      save = {};
      save['ledger.tasks.WalletLayoutRecoveryTask'] = data;
      ledger.storage.local.set(save, (function(_this) {
        return function() {
          return d.resolve();
        };
      })(this));
      return d.promise;
    };

    WalletLayoutRecoveryTask.prototype._removeOldTransactions = function() {
      var d, op, _i, _len, _ref;
      $info("Removing old transactions");
      d = ledger.defer();
      _ref = Operation.all();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        op = _ref[_i];
        if (op.get('block') == null) {
          op["delete"]();
        }
      }
      d.resolve();
      return d.promise;
    };

    WalletLayoutRecoveryTask.prototype._findUnconfirmedTransaction = function() {
      return Transaction.find({
        block_id: void 0
      }).data();
    };

    WalletLayoutRecoveryTask.prototype._discardTransactions = function(transactions) {
      var transaction, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = transactions.length; _i < _len; _i++) {
        transaction = transactions[_i];
        if (transaction.get('block') == null) {
          _results.push(transaction["delete"]());
        }
      }
      return _results;
    };

    WalletLayoutRecoveryTask.prototype._handleReorgs = function(savedState, failedBlock) {
      var batch, block, idx, previousBlock, _i, _j, _len, _len1, _ref, _ref1;
      $info("Handle reorg for block " + failedBlock.blockHash + " at " + failedBlock.blockHeight);
      previousBlock = Block.find({
        height: {
          $lt: failedBlock.blockHeight
        }
      }).simpleSort("height", true).limit(1).data()[0];
      $info("Revert to block " + (previousBlock.get('hash')) + " at " + (previousBlock.get('height')));
      idx = 0;
      while (savedState["account_" + idx] != null) {
        _ref = savedState["account_" + idx]["batches"];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          batch = _ref[_i];
          if (batch.blockHeight > previousBlock.get('height')) {
            batch.blockHeight = previousBlock.get('height');
            batch.blockHash = previousBlock.get('hash');
          }
        }
        idx += 1;
      }
      _ref1 = Block.find({
        height: {
          $gte: failedBlock.blockHeight
        }
      }).data();
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        block = _ref1[_j];
        block["delete"]();
      }
      return this._saveSynchronizationData(savedState);
    };

    WalletLayoutRecoveryTask.prototype._migrateSavedState = function(state) {
      var batches, idx, oldBatchSize, oldBatches, total;
      if (state == null) {
        state = {};
      }
      oldBatchSize = state["batch_size"] || 20;
      if (oldBatchSize !== this.BatchSize) {
        idx = 0;
        while (state["account_" + idx] != null) {
          oldBatches = state["account_" + idx]["batches"];
          batches = [];
          total = oldBatches.length * oldBatchSize;
          state["account_" + idx] = {
            batches: batches
          };
          idx += 1;
        }
      }
      state["batch_size"] = this.BatchSize;
      return state;
    };

    WalletLayoutRecoveryTask.reset = function() {
      return this.instance = new this;
    };

    return WalletLayoutRecoveryTask;

  })(ledger.tasks.Task);

}).call(this);
