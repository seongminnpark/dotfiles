(function() {
  var extendTransactionWithSize, gatherAllUnconfirmedTransactions;

  if (window.ledger == null) {
    window.ledger = {};
  }

  if (ledger.bitcoin == null) {
    ledger.bitcoin = {};
  }

  gatherAllUnconfirmedTransactions = function(client, rootTxHash, txs, deffer) {
    var p;
    if (txs == null) {
      txs = [];
    }
    if (deffer == null) {
      deffer = ledger.defer();
    }
    p = client.getTransactionByHash(rootTxHash).then(function(transaction) {
      var input;
      if (transaction["block"] != null) {
        return txs;
      } else {
        txs.push(transaction);
        return Q.all((function() {
          var _i, _len, _ref, _results;
          _ref = transaction["inputs"];
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            input = _ref[_i];
            _results.push(gatherAllUnconfirmedTransactions(client, input["output_hash"]));
          }
          return _results;
        })()).then(function(unconfirmed) {
          unconfirmed = _.flatten(unconfirmed);
          txs = txs.concat(unconfirmed);
          return txs;
        });
      }
    });
    deffer.resolve(p);
    return deffer.promise;
  };

  extendTransactionWithSize = function(client, tx) {
    return client.getTransactionSize(tx["hash"]).then(function(size) {
      tx.size = size;
      return tx;
    });
  };

  ledger.bitcoin.cpfp = {
    fetchUnconfirmedTransactions: function(rootTxHash) {
      var client;
      client = new ledger.api.TransactionsRestClient();
      return gatherAllUnconfirmedTransactions(client, rootTxHash).then(function(transactions) {
        var tx;
        if (!ledger.bitcoin.cpfp.isEligibleToCpfp(rootTxHash)) {
          throw ledger.errors["new"](ledger.errors.TransactionNotEligible);
        }
        if (transactions.length === 0) {
          throw ledger.errors["new"](ledger.errors.TransactionAlreadyConfirmed);
        }
        return Q.all((function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = transactions.length; _i < _len; _i++) {
            tx = transactions[_i];
            _results.push(extendTransactionWithSize(client, tx));
          }
          return _results;
        })());
      }).then(function(transactions) {
        var totalFees, totalSize, transaction, _i, _len;
        totalSize = ledger.Amount.fromSatoshi(0);
        totalFees = ledger.Amount.fromSatoshi(0);
        for (_i = 0, _len = transactions.length; _i < _len; _i++) {
          transaction = transactions[_i];
          totalSize = totalSize.add(transaction.size);
          totalFees = totalFees.add(transaction.fees);
        }
        return {
          transactions: transactions,
          size: totalSize,
          fees: totalFees
        };
      });
    },
    isEligibleToCpfp: function(rootTxHash) {
      var output, _i, _len, _ref, _ref1;
      if ((_ref = Input.find({
        previous_tx: rootTxHash
      }).data().length) != null ? _ref : 0) {
        return false;
      }
      _ref1 = Output.find({
        transaction_hash: rootTxHash
      }).data();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        output = _ref1[_i];
        if (!_.isEmpty(output.get("path"))) {
          return true;
        }
      }
      return false;
    },
    createTransaction: function(account, rootTxHash, fees) {
      var findUtxo, utxo;
      utxo = _(account.getUtxo()).sortBy(function(o) {
        return o.get('transaction').get('confirmations');
      });
      findUtxo = function(hash) {
        var output, _i, _len;
        for (_i = 0, _len = utxo.length; _i < _len; _i++) {
          output = utxo[_i];
          if (output.get("transaction_hash")) {
            return output;
          }
        }
      };
      return ledger.tasks.FeesComputationTask.instance.update().then(function() {
        var feePerByte;
        if (fees != null) {
          if (!fees.gt(0)) {
            throw ledger.errors["new"](ledger.errors.WrongFeesFormat);
          }
          feePerByte = fees;
        } else {
          feePerByte = ledger.tasks.FeesComputationTask.instance.getFeesForNumberOfBlocks(1) / 1000;
        }
        return ledger.bitcoin.cpfp.fetchUnconfirmedTransactions(rootTxHash).then(function(unconfirmed) {
          var collectedAmount, feeAmount, hasInput, index, input, inputs, requiredAmount, totalSize;
          inputs = [];
          hasInput = function(input) {
            var i, _i, _len;
            for (_i = 0, _len = inputs.length; _i < _len; _i++) {
              i = inputs[_i];
              if (input.get("transaction_hash") === i.get("transaction_hash") && input.get("index") === i.get("index")) {
                return true;
              }
            }
            return false;
          };
          inputs.push(findUtxo(unconfirmed.transactions[0]["hash"]));
          collectedAmount = ledger.Amount.fromSatoshi(inputs[0].get("value"));
          index = 0;
          while (true) {
            totalSize = unconfirmed.size.add(ledger.bitcoin.estimateTransactionSize(inputs.length, 2).max);
            feeAmount = totalSize.multiply(feePerByte).subtract(unconfirmed.fees);
            requiredAmount = feeAmount.add(5430);
            if (collectedAmount.gte(requiredAmount)) {
              return {
                unconfirmed: unconfirmed,
                inputs: inputs,
                collectedAmount: collectedAmount,
                fees: feeAmount,
                size: totalSize
              };
            }
            input = utxo[index];
            if ((input != null) && !hasInput(input)) {
              inputs.push(input);
              collectedAmount = collectedAmount.add(ledger.Amount.fromSatoshi(input.get("value")));
            }
            index += 1;
            if (input == null) {
              break;
            }
          }
          throw ledger.errors["new"](ledger.errors.NotEnoughFunds);
        });
      }).then(function(preparedTransaction) {
        if (!preparedTransaction.fees.gte(1)) {
          throw ledger.errors["new"](ledger.errors.FeesTooLowCpfp, '', preparedTransaction);
        }
        preparedTransaction.amount = preparedTransaction.collectedAmount.subtract(preparedTransaction.fees);
        return preparedTransaction;
      });
    }
  };

}).call(this);
