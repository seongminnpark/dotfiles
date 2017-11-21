(function() {
  var _base;

  if ((_base = this.ledger).bitcoin == null) {
    _base.bitcoin = {};
  }

  _.extend(ledger.bitcoin, {
    verifyAddress: function(address) {
      return ledger.bitcoin.checkAddress(address);
    },
    estimateTransactionSize: function(inputsCount, outputsCount) {
      var maxNoWitness, maxSize, maxWitness, minNoWitness, minSize, minWitness, varintLength;
      if (inputsCount < 0xfd) {
        varintLength = 1;
      } else if (inputsCount < 0xffff) {
        varintLength = 3;
      } else {
        varintLength = 5;
      }
      if (ledger.config.network.handleSegwit) {
        minNoWitness = varintLength + 4 + 2 + (59 * inputsCount) + 1 + (31 * outputsCount) + 4;
        maxNoWitness = varintLength + 4 + 2 + (59 * inputsCount) + 1 + (33 * outputsCount) + 4;
        minWitness = varintLength + 4 + 2 + (59 * inputsCount) + 1 + (31 * outputsCount) + 4 + (106 * inputsCount);
        maxWitness = varintLength + 4 + 2 + (59 * inputsCount) + 1 + (33 * outputsCount) + 4 + (108 * inputsCount);
        minSize = (minNoWitness * 3 + minWitness) / 4;
        maxSize = (maxNoWitness * 3 + maxWitness) / 4;
      } else {
        minSize = varintLength + 4 + (145 * inputsCount) + 1 + (31 * outputsCount) + 4;
        maxSize = varintLength + 4 + (147 * inputsCount) + 1 + (33 * outputsCount) + 4;
      }
      return {
        min: minSize,
        max: maxSize
      };
    }
  });

}).call(this);
