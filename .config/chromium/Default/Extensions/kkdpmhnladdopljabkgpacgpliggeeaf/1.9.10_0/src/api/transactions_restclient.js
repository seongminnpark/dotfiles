(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ledger.api.TransactionsRestClient = (function(_super) {
    __extends(TransactionsRestClient, _super);

    function TransactionsRestClient() {
      return TransactionsRestClient.__super__.constructor.apply(this, arguments);
    }

    TransactionsRestClient.singleton();

    TransactionsRestClient.prototype.DefaultBatchSize = 20;

    TransactionsRestClient.prototype.getSyncToken = function(callback) {
      return this.http().get({
        url: "blockchain/v2/" + ledger.config.network.ticker + "/syncToken",
        onSuccess: function(response) {
          return typeof callback === "function" ? callback(response['token']) : void 0;
        },
        onError: this.networkErrorCallback(callback)
      });
    };

    TransactionsRestClient.prototype.deleteSyncToken = function(token, callback) {
      this.http().setHttpHeader("X-LedgerWallet-SyncToken", token);
      return this.http()["delete"]({
        url: "blockchain/v2/" + ledger.config.network.ticker + "/syncToken",
        onSuccess: function(response) {
          return typeof callback === "function" ? callback() : void 0;
        },
        onError: this.networkErrorCallback(callback)
      });
    };

    TransactionsRestClient.prototype.getRawTransaction = function(transactionHash, callback) {
      return this.http().get({
        url: "blockchain/v2/" + ledger.config.network.ticker + "/transactions/" + transactionHash + "/hex",
        onSuccess: function(response) {
          return typeof callback === "function" ? callback(response[0].hex) : void 0;
        },
        onError: this.networkErrorCallback(callback)
      });
    };

    TransactionsRestClient.prototype.safeGetRawTransaction = function(transactionHash, callback) {
      return this.http().get({
        url: "blockchain/v2/" + ledger.config.network.ticker + "/transactions/" + transactionHash + "/hex",
        onSuccess: function(response) {
          if (response.length === 0) {
            return typeof callback === "function" ? callback(_.str.pad("", 1000, "00")) : void 0;
          } else {
            return typeof callback === "function" ? callback(response[0].hex) : void 0;
          }
        },
        onError: this.networkErrorCallback(callback)
      });
    };

    TransactionsRestClient.prototype.getTransactionSize = function(transactionHash) {
      var d;
      d = ledger.defer();
      this.safeGetRawTransaction(transactionHash, (function(_this) {
        return function(tx, error) {
          if (error != null) {
            return d.reject(error);
          } else {
            return d.resolve(tx.length / 2);
          }
        };
      })(this));
      return d.promise;
    };

    TransactionsRestClient.prototype.getTransactionsFromPaths = function(paths, batchsize, callback) {
      return ledger.wallet.pathsToAddresses(paths, (function(_this) {
        return function(addresses) {
          return _this.getTransactions(_(addresses).values(), batchsize, callback);
        };
      })(this));
    };

    TransactionsRestClient.prototype.getTransactions = function(addresses, batchSize, callback) {
      var transactions;
      if (_.isFunction(batchSize)) {
        callback = batchSize;
        batchSize = null;
      }
      if (batchSize == null) {
        batchSize = this.DefaultBatchSize;
      }
      transactions = [];
      return _.async.eachBatch(addresses, batchSize, (function(_this) {
        return function(batch, done, hasNext, batchIndex, batchCount) {
          return _this.http().get({
            url: "blockchain/v2/" + ledger.config.network.ticker + "/addresses/" + (batch.join(',')) + "/transactions",
            onSuccess: function(response) {
              transactions = transactions.concat(response);
              if (!hasNext) {
                callback(transactions);
              }
              return done();
            },
            onError: _this.networkErrorCallback(callback)
          });
        };
      })(this));
    };

    TransactionsRestClient.prototype.getPaginatedTransactions = function(addresses, blockHash, syncToken, callback) {
      var data;
      data = _.pick({
        blockHash: blockHash
      }, _.identity);
      this.http().setHttpHeader("X-LedgerWallet-SyncToken", syncToken);
      return this.http().get({
        url: "blockchain/v2/" + ledger.config.network.ticker + "/addresses/" + (addresses.join(',')) + "/transactions",
        data: data,
        onSuccess: function(response) {
          return typeof callback === "function" ? callback(response) : void 0;
        },
        onError: this.networkErrorCallback(callback)
      });
    };

    TransactionsRestClient.prototype.createTransactionStreamForAllObservedPaths = function() {
      var addresses;
      addresses = ledger.wallet.pathsToAddressesStream(ledger.wallet.Wallet.instance.getAllObservedAddressesPaths()).map(function(e) {
        return e[1];
      });
      return this.createTransactionStream(addresses);
    };

    TransactionsRestClient.prototype.createTransactionStream = function(addresses) {
      return highland(addresses).batch(this.DefaultBatchSize).consume((function(_this) {
        return function(err, batch, push, next) {
          if (batch === ledger.stream.nil) {
            return push(null, batch);
          }
          _this.http().get({
            url: "blockchain/v2/" + ledger.config.network.ticker + "/addresses/" + (batch.join(',')) + "/transactions",
            onSuccess: function(transactions) {
              var transaction, _i, _len;
              for (_i = 0, _len = transactions.length; _i < _len; _i++) {
                transaction = transactions[_i];
                push(null, transaction);
              }
              return next();
            },
            onError: function(err) {
              push(err);
              return next();
            }
          }).done();
        };
      })(this));
    };

    TransactionsRestClient.prototype.postTransaction = function(transaction, callback) {
      return this.http().post({
        url: "blockchain/v2/" + ledger.config.network.ticker + "/transactions/send",
        data: {
          tx: transaction.getSignedTransaction()
        },
        onSuccess: function(response) {
          transaction.setHash(response.transaction_hash);
          return typeof callback === "function" ? callback(transaction) : void 0;
        },
        onError: this.networkErrorCallback(callback)
      });
    };

    TransactionsRestClient.prototype.postTransactionHex = function(txHex, callback) {
      return this.http().post({
        url: "blockchain/" + ledger.config.network.ticker + "/pushtx",
        data: {
          tx: txHex
        },
        onSuccess: function(response) {
          return typeof callback === "function" ? callback(response.transaction_hash) : void 0;
        },
        onError: this.networkErrorCallback(callback)
      });
    };

    TransactionsRestClient.prototype.getTransactionByHash = function(transactionHash) {
      var d;
      d = ledger.defer();
      this.http().get({
        url: "blockchain/v2/" + ledger.config.network.ticker + "/transactions/" + transactionHash,
        onSuccess: function(response) {
          if (response.length === 0) {
            return d.reject("Transaction '" + transactionHash + "' not found.");
          } else {
            return d.resolve(response[0]);
          }
        },
        onError: function(ex) {
          return d.reject(ex);
        }
      });
      return d.promise;
    };

    TransactionsRestClient.prototype.refreshTransaction = function(transactions, callback) {
      var outTransactions;
      outTransactions = [];
      return _.async.each(transactions, (function(_this) {
        return function(transaction, done, hasNext) {
          return _this.http().get({
            url: "blockchain/v2/" + ledger.config.network.ticker + "/transactions/" + (transaction.get('hash')),
            onSuccess: function(response) {
              outTransactions.push(response);
              if (!hasNext) {
                if (typeof callback === "function") {
                  callback(outTransactions);
                }
              }
              return done();
            },
            onError: _this.networkErrorCallback(callback)
          });
        };
      })(this));
    };

    TransactionsRestClient.prototype.getTime = function() {
      return ledger.defer().resolve(this.http().get({
        url: "timestamp"
      })).promise.then(function(result) {
        return result['timestamp'];
      });
    };

    return TransactionsRestClient;

  })(ledger.api.RestClient);

}).call(this);
