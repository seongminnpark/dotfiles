(function() {
  var _base;

  if ((_base = this.ledger).wallet == null) {
    _base.wallet = {};
  }

  _.extend(ledger.wallet, {
    sweepPrivateKey: function(_arg, callback) {
      var account, addresses, d, ecKey, privateKey, publicKey, recipientAddress, txFee;
      privateKey = _arg.privateKey, account = _arg.account, txFee = _arg.txFee;
      if (txFee == null) {
        txFee = ledger.preferences.instance.getMiningFee();
      }
      d = ledger.defer(callback);
      recipientAddress = account.getHDAccount().getCurrentPublicAddress();
      ecKey = new window.bitcoin.ECKey.fromWIF(privateKey);
      publicKey = ecKey.pub.getAddress().toString();
      addresses = [publicKey];
      ledger.api.UnspentOutputsRestClient.instance.getUnspentOutputsFromAddresses(addresses, function(outputs, error) {
        var amountToSend, txBuilder;
        if (error != null) {
          return d.reject(error);
        }
        txBuilder = new window.bitcoin.TransactionBuilder();
        amountToSend = new ledger.Amount();
        return _.async.each(outputs, function(output, done, hasNext) {
          var index, input, txHex, _i, _len, _ref;
          amountToSend = amountToSend.add(output.value);
          txBuilder.addInput(output.transaction_hash, output.output_index);
          if (hasNext === false && amountToSend.lte(txFee)) {
            return d.rejectWithError(ledger.errors.NotEnoughFunds);
          } else if (hasNext === false) {
            amountToSend = amountToSend.subtract(10000);
            txBuilder.addOutput(recipientAddress, amountToSend.toNumber());
            _ref = txBuilder.tx.ins;
            for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
              input = _ref[index];
              txBuilder.sign(index, ecKey);
            }
            txHex = txBuilder.build().toHex();
            return ledger.api.TransactionsRestClient.instance.postTransactionHex(txHex, (function(_this) {
              return function(txHash, error) {
                return d.resolve(txHash, error);
              };
            })(this));
          } else {
            return done();
          }
        });
      });
      return d.promise;
    }
  });

}).call(this);
