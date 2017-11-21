(function() {
  var $error, $info, $log, Amount, Errors, ValidationModes, _base,
    __slice = [].slice;

  ValidationModes = {
    PIN: 0x01,
    KEYCARD: 0x02,
    SECURE_SCREEN: 0x03,
    KEYCARD_NEW: 0x04
  };

  Errors = this.ledger.errors;

  Amount = ledger.Amount;

  $log = function() {
    return ledger.utils.Logger.getLoggerByTag("Transaction");
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

  if ((_base = this.ledger).wallet == null) {
    _base.wallet = {};
  }


  /*
  @example Usage
    amount = ledger.Amount.fromBtc("1.234")
    fee = ledger.Amount.fromBtc("0.0001")
    recipientAddress = "1DR6p2UVfu1m6mCU8hyvh5r6ix3dJEPMX7"
    ledger.wallet.Transaction.createAndPrepareTransaction(amount, fees, recipientAddress, inputsAccounts, changeAccount).then (tx) =>
      console.log("Prepared tx :", tx)
   */

  ledger.wallet.Transaction = (function() {
    var Transaction;

    Transaction = Transaction;

    Transaction.ValidationModes = ValidationModes;

    Transaction.MINIMUM_OUTPUT_VALUE = Amount.fromSatoshi(5430);

    Transaction.prototype.amount = void 0;

    Transaction.prototype.recipientAddress = void 0;

    Transaction.prototype.inputs = void 0;

    Transaction.prototype.changePath = void 0;

    Transaction.prototype.changeAddress = void 0;

    Transaction.prototype.hash = void 0;

    Transaction.prototype.authorizationPaired = void 0;

    Transaction.prototype._isValidated = false;

    Transaction.prototype._resumeData = void 0;

    Transaction.prototype._validationMode = void 0;

    Transaction.prototype._btInputs = void 0;

    Transaction.prototype._btcAssociatedKeyPath = void 0;

    Transaction.prototype._signedRawTransaction = void 0;

    function Transaction(dongle, amount, fees, recipientAddress, inputs, changePath, changeAddress, data) {
      var input, splitTransaction, _i, _len;
      this.dongle = dongle;
      this.amount = amount;
      this.fees = fees;
      this.recipientAddress = recipientAddress;
      this.inputs = inputs;
      this.changePath = changePath;
      this.changeAddress = changeAddress;
      this.data = data;
      this._btInputs = [];
      this._btcAssociatedKeyPath = [];
      for (_i = 0, _len = inputs.length; _i < _len; _i++) {
        input = inputs[_i];
        splitTransaction = this.dongle.splitTransaction(input, ledger.config.network.areTransactionTimestamped, ledger.config.network.isSegwitSupported);
        this._btInputs.push([splitTransaction, input.output_index]);
        this._btcAssociatedKeyPath.push(input.paths[0]);
      }
    }

    Transaction.prototype.isValidated = function() {
      return this._isValidated;
    };

    Transaction.prototype.getSignedTransaction = function() {
      return this._signedRawTransaction;
    };

    Transaction.prototype.getValidationMode = function() {
      return this._validationMode;
    };

    Transaction.prototype.getAmount = function() {
      return this.amount;
    };

    Transaction.prototype.getRecipientAddress = function() {
      return this.receiverAddress;
    };

    Transaction.prototype.setHash = function(hash) {
      return this.hash = hash;
    };

    Transaction.prototype.serialize = function() {
      return {
        amount: this.amount.toSatoshiNumber(),
        address: this.receiverAddress,
        fee: this.fees.toSatoshiNumber(),
        hash: this.hash,
        raw: this.getSignedTransaction()
      };
    };

    Transaction.prototype.getValidationDetails = function() {
      var amountChars, decimalPart, details, firstIdx, i, idx, integerPart, lastIdx, length, stringifiedAmount, _i, _results;
      details = {
        validationMode: this._validationMode,
        recipientsAddress: {
          text: this.recipientAddress,
          indexes: (function() {
            var _i, _len, _ref, _results;
            _ref = this._resumeData.indexesKeyCard.match(/../g);
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              i = _ref[_i];
              _results.push(parseInt(i, 16));
            }
            return _results;
          }).call(this)
        },
        needsAmountValidation: false
      };
      if (this._validationMode === ledger.wallet.Transaction.ValidationModes.SECURE_SCREEN) {
        length = details.recipientsAddress.indexes.shift();
        details.recipientsAddress.indexes = details.recipientsAddress.indexes.slice(0, length);
      }
      details.validationCharacters = (function() {
        var _i, _len, _ref, _results;
        _ref = details.recipientsAddress.indexes;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          idx = _ref[_i];
          _results.push(this.recipientAddress[idx]);
        }
        return _results;
      }).call(this);
      if (this.dongle.getIntFirmwareVersion() < ledger.dongle.Firmwares.V_B_1_4_13) {
        stringifiedAmount = this.amount.toString();
        stringifiedAmount = _.str.lpad(stringifiedAmount, 9, '0');
        integerPart = stringifiedAmount.substr(0, stringifiedAmount.length - 8);
        decimalPart = stringifiedAmount.substr(stringifiedAmount.length - 8);
        amountChars = [integerPart.charAt(integerPart.length - 1)];
        if (decimalPart !== "00000000") {
          amountChars.concat(decimalPart.substring(0, 3).split(''));
        }
        details.validationCharacters = amountChars.concat(details.validationCharacters);
        firstIdx = integerPart.length - 1;
        lastIdx = decimalPart === "00000000" ? firstIdx : firstIdx + 3;
        details.amount = {
          text: stringifiedAmount,
          indexes: (function() {
            _results = [];
            for (var _i = firstIdx; firstIdx <= lastIdx ? _i <= lastIdx : _i >= lastIdx; firstIdx <= lastIdx ? _i++ : _i--){ _results.push(_i); }
            return _results;
          }).apply(this)
        };
        details.needsAmountValidation = true;
      }
      return details;
    };

    Transaction.prototype.prepare = function(callback, progressCallback) {
      var d;
      if (callback == null) {
        callback = void 0;
      }
      if (progressCallback == null) {
        progressCallback = void 0;
      }
      if ((this.amount == null) || (this.fees == null) || (this.recipientAddress == null)) {
        Errors["throw"]('Transaction must me initialized before preparation');
      }
      d = ledger.defer(callback);
      this.dongle.createPaymentTransaction(this._btInputs, this._btcAssociatedKeyPath, this.changePath, this.changeAddress, this.recipientAddress, this.amount, this.fees, this.data).progress((function(_this) {
        return function(progress) {
          var currentStep, index, key, percent, stepsCount, value, __, _ref;
          currentStep = progress.currentPublicKey + progress.currentSignTransaction + progress.currentTrustedInput + progress.currentHashOutputBase58 + progress.currentUntrustedHash;
          stepsCount = progress.publicKeyCount + progress.transactionSignCount + progress.trustedInputsCount + progress.hashOutputBase58Count + progress.untrustedHashCount;
          for (key in progress) {
            value = progress[key];
            _ref = key.match(/currentTrustedInputProgress_(\d)/) || [null, null], __ = _ref[0], index = _ref[1];
            if (index == null) {
              continue;
            }
            currentStep += progress["currentTrustedInputProgress_" + index];
            stepsCount += progress["trustedInputsProgressTotal_" + index];
          }
          percent = Math.ceil(currentStep / stepsCount * 100);
          d.notify({
            currentStep: currentStep,
            stepsCount: stepsCount,
            percent: percent
          });
          return typeof progressCallback === "function" ? progressCallback({
            currentStep: currentStep,
            stepsCount: stepsCount,
            percent: percent
          }) : void 0;
        };
      })(this)).then((function(_this) {
        return function(_resumeData) {
          _this._resumeData = _resumeData;
          _this._validationMode = _this._resumeData.authorizationRequired;
          _this.authorizationPaired = _this._resumeData.authorizationPaired;
          _this.encryptedOutputScript = _this._resumeData.encryptedOutputScript;
          return d.resolve(_this);
        };
      })(this)).fail((function(_this) {
        return function(error) {
          e("GOT ERROR", error);
          return d.rejectWithError(Errors.SignatureError);
        };
      })(this)).done();
      return d.promise;
    };

    Transaction.prototype.sign = function(callback, progressCallback) {
      var d;
      if (callback == null) {
        callback = void 0;
      }
      if (progressCallback == null) {
        progressCallback = void 0;
      }
      d = ledger.defer(callback);
      this.dongle.createPaymentTransaction(this._btInputs, this._btcAssociatedKeyPath, this.changePath, this.changeAddress, this.recipientAddress, this.amount, this.fees, this.data).progress((function(_this) {
        return function(progress) {
          return d.notify(progress);
        };
      })(this)).then((function(_this) {
        return function(_signedRawTransaction) {
          _this._signedRawTransaction = _signedRawTransaction;
          _this._isValidated = true;
          $info("Raw TX: ", _this.getSignedTransaction());
          return _.defer(function() {
            return d.resolve(_this);
          });
        };
      })(this)).fail((function(_this) {
        return function(error) {
          e("GOT ERROR", error);
          return d.rejectWithError(Errors.SignatureError);
        };
      })(this)).done();
      return d.promise;
    };

    Transaction.prototype.validateWithPinCode = function(validationPinCode, callback, progressCallback) {
      var char;
      if (callback == null) {
        callback = void 0;
      }
      if (progressCallback == null) {
        progressCallback = void 0;
      }
      return this._validate(((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = validationPinCode.length; _i < _len; _i++) {
          char = validationPinCode[_i];
          _results.push(char.charCodeAt(0).toString(16));
        }
        return _results;
      })()).join(''), callback, progressCallback);
    };

    Transaction.prototype.validateWithKeycard = function(validationKey, callback, progressCallback) {
      var char;
      if (callback == null) {
        callback = void 0;
      }
      if (progressCallback == null) {
        progressCallback = void 0;
      }
      return this._validate(((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = validationKey.length; _i < _len; _i++) {
          char = validationKey[_i];
          _results.push("0" + char);
        }
        return _results;
      })()).join(''), callback, progressCallback);
    };

    Transaction.prototype._validate = function(validationKey, callback, progressCallback) {
      var d;
      if (callback == null) {
        callback = void 0;
      }
      if (progressCallback == null) {
        progressCallback = void 0;
      }
      if ((this._resumeData == null) || (this._validationMode == null)) {
        Errors["throw"]('Transaction must me prepared before validation');
      }
      d = ledger.defer(callback);
      this.dongle.createPaymentTransaction(this._btInputs, this._btcAssociatedKeyPath, this.changePath, this.changeAddress, this.recipientAddress, this.amount, this.fees, this.data, void 0, void 0, validationKey, this._resumeData).progress((function(_this) {
        return function(progress) {
          var currentStep, index, key, percent, stepsCount, value, __, _ref;
          currentStep = progress.currentPublicKey + progress.currentSignTransaction + progress.currentTrustedInput + progress.currentHashOutputBase58 + progress.currentUntrustedHash;
          stepsCount = progress.publicKeyCount + progress.transactionSignCount + progress.trustedInputsCount + progress.hashOutputBase58Count + progress.untrustedHashCount;
          for (key in progress) {
            value = progress[key];
            _ref = key.match(/currentTrustedInputProgress_(\d)/) || [null, null], __ = _ref[0], index = _ref[1];
            if (!index) {
              continue;
            }
            currentStep += progress["currentTrustedInputProgress_" + index];
            stepsCount += progress["trustedInputsProgressTotal_" + index];
          }
          percent = Math.ceil(currentStep / stepsCount * 100);
          d.notify({
            currentStep: currentStep,
            stepsCount: stepsCount,
            percent: percent
          });
          return typeof progressCallback === "function" ? progressCallback({
            currentStep: currentStep,
            stepsCount: stepsCount,
            percent: percent
          }) : void 0;
        };
      })(this)).then((function(_this) {
        return function(_signedRawTransaction) {
          _this._signedRawTransaction = _signedRawTransaction;
          _this._isValidated = true;
          _.defer(function() {
            return d.resolve(_this);
          });
        };
      })(this))["catch"]((function(_this) {
        return function(error) {
          return _.defer(function() {
            return d.rejectWithError(Errors.SignatureError, error);
          });
        };
      })(this)).done();
      return d.promise;
    };


    /*
      Creates a new transaction asynchronously. The created transaction will only be initialized (i.e. it will only retrieve
      a sufficient number of input to perform the transaction)
    
      @param {ledger.Amount} amount The amount to send (expressed in satoshi)
      @param {ledger.Amount} fees The miner fees (expressed in satoshi)
      @param {String} address The recipient address
      @param {Array<Output>} utxo The list of utxo to sign in order to perform the transaction
      @param {String} changePath The path to use for the change
      @param {String} changeAddress The change address
      @option [Function] callback The callback called once the transaction is created
      @return [Q.Promise] A closure
     */

    Transaction.create = function(_arg, callback) {
      var address, amount, changeAddress, changeAmount, changePath, d, data, dust, fees, iterate, totalUtxoAmount, utxo;
      amount = _arg.amount, fees = _arg.fees, address = _arg.address, utxo = _arg.utxo, changePath = _arg.changePath, changeAddress = _arg.changeAddress, data = _arg.data;
      if (callback == null) {
        callback = null;
      }
      d = ledger.defer(callback);
      dust = Amount.fromSatoshi(ledger.config.network.dust);
      if (amount.lte(dust)) {
        return d.rejectWithError(Errors.DustTransaction) && d.promise;
      }
      totalUtxoAmount = _(utxo).chain().map(function(u) {
        return ledger.Amount.fromSatoshi(u.get('value'));
      }).reduce((function(a, b) {
        return a.add(b);
      }), ledger.Amount.fromSatoshi(0)).value();
      if (totalUtxoAmount.lt(amount.add(fees))) {
        return d.rejectWithError(Errors.NotEnoughFunds) && d.promise;
      }
      $info("--- CREATE TRANSACTION ---");
      $info("Amount: ", amount.toString());
      $info("Fees: ", fees.toString());
      $info("Total send: ", totalUtxoAmount.toString());
      $info("Address: ", address);
      $info("UTXO: ", utxo);
      $info("Change path: ", changePath);
      $info("Change address: ", changeAddress);
      $info("Data: ", data);
      changeAmount = totalUtxoAmount.subtract(amount.add(fees));
      if (changeAmount.lte(dust)) {
        fees = totalUtxoAmount.subtract(amount);
        changeAmount = ledger.Amount.fromSatoshi(0);
        $info("Applied fees: ", fees);
      }
      iterate = function(index, inputs) {
        var output;
        output = utxo[index];
        if (output == null) {
          return d.resolve(inputs);
        }
        d = ledger.defer();
        ledger.api.TransactionsRestClient.instance.getRawTransaction(output.get('transaction_hash'), function(rawTransaction, error) {
          var result;
          if (error != null) {
            console.log(error);
            return d.rejectWithError(Errors.NetworkError);
          }
          result = {
            raw: rawTransaction,
            paths: [output.get('path')],
            output_index: output.get('index'),
            value: output.get('value')
          };
          return d.resolve(iterate(index + 1, inputs.concat([result])));
        });
        return d.promise;
      };
      d.resolve(iterate(0, []).then((function(_this) {
        return function(inputs) {
          return new Transaction(ledger.app.dongle, amount, fees, address, inputs, changePath, changeAddress, data);
        };
      })(this)));
      return d.promise;
    };


    /*
    Creates a new transaction asynchronously. The created transaction will only be initialized (i.e. it will only retrieve
    a sufficient number of input to perform the transaction)
    
    @param {ledger.Amount} amount The amount to send (expressed in satoshi)
    @param {ledger.Amount} fees The miner fees (expressed in satoshi)
    @param {String} address The recipient address
    @param {Array<String>} inputsPath The paths of the addresses to use in order to perform the transaction
    @param {String} changePath The path to use for the change
    @option [Function] callback The callback called once the transaction is created
    @return [Q.Promise] A closure
     */


    /*
    @create: ({amount, fees, address, inputsPath, changePath, excludedInputs}, callback = null) ->
      d = ledger.defer(callback)
      return d.rejectWithError(Errors.DustTransaction) && d.promise if amount.lte(Transaction.MINIMUM_OUTPUT_VALUE)
      return d.rejectWithError(Errors.NotEnoughFunds) && d.promise unless inputsPath?.length
      requiredAmount = amount.add(fees)
    
      excludedInputs = excludedInputs or []
    
      $info("--- CREATE TRANSACTION ---")
      $info("Amount: ", amount.toString())
      $info("Fees: ", fees.toString())
      $info("Address: ", address)
      $info("Inputs paths: ", inputsPath)
      $info("Change path: ", changePath)
      $info("Excluded inputs", excludedInputs)
    
      isOutputExcluded = (output) ->
        return for [index, hash] in excludedInputs when output['transaction_hash'] is hash and output['output_index'] is index
        no
    
      ledger.app.dongle.getPublicAddress changePath, (dongleChangeAddress) ->
        ledger.tasks.AddressDerivationTask.instance.getPublicAddress changePath, (workerChangeaddress, error) ->
          if dongleChangeAddress.bitcoinAddress.toString(ASCII) isnt workerChangeaddress
            $error("Error change derivation error #{changePath} ", dongleChangeAddress.bitcoinAddress.toString(ASCII), " <> ", workerChangeaddress)
            return d.rejectWithError(Errors.ChangeDerivationError)
          ledger.api.UnspentOutputsRestClient.instance.getUnspentOutputsFromPaths inputsPath, (outputs, error) ->
            if error?
              $error("Error during unspents outputs gathering", error)
              return d.rejectWithError(Errors.NetworkError, error)
             * Collect each valid outputs and sort them by desired priority
    
            validOutputs =
              _(output for output in outputs when output.paths.length > 0 and !isOutputExcluded(output))
                .chain()
                .sortBy (output) ->  -output['confirmatons']
                .value()
            if validOutputs.length == 0
              $error("Error not enough funds")
              return d.rejectWithError(Errors.NotEnoughFunds)
            validOutputs = _(validOutputs).uniq no, (i) ->  i['output_index'] +  i['transaction_hash']
            finalOutputs = []
            collectedAmount = new Amount()
            collectedAmountWithUnconfirmed = new Amount()
            hadNetworkFailure = no
            $info("Valid outputs: ", validOutputs)
    
             * For each valid outputs we try to get its raw transaction.
            _.async.each validOutputs, (output, done, hasNext) =>
              ledger.api.TransactionsRestClient.instance.getRawTransaction output.transaction_hash, (rawTransaction, error) ->
                if error?
                  hadNetworkFailure = yes
                else if output.confirmations is 0 and !output.paths[0].match(/\d+'\/\d+'\/\d+'\/1\/\d+/)?
                  collectedAmountWithUnconfirmed = collectedAmountWithUnconfirmed.add(Amount.fromSatoshi(output.value))
                else
                  output.raw = rawTransaction
                  finalOutputs.push(output)
                  collectedAmount = collectedAmount.add(Amount.fromSatoshi(output.value))
                  collectedAmountWithUnconfirmed = collectedAmountWithUnconfirmed.add(Amount.fromSatoshi(output.value))
                if collectedAmount.gte(requiredAmount)
                  changeAmount = collectedAmount.subtract(requiredAmount)
                  fees = fees.add(changeAmount) if changeAmount.lte(Transaction.MINIMUM_OUTPUT_VALUE)
    
                  $info("Used outputs: ", finalOutputs)
    
                   * We have reached our required amount. It's time to prepare the transaction
                  transaction = new Transaction(ledger.app.dongle, amount, fees, address, finalOutputs, changePath)
                  d.resolve(transaction)
                else if hasNext is true
                   * Continue to collect funds
                  done()
                else if collectedAmountWithUnconfirmed.gte(requiredAmount)
                  d.rejectWithError(Errors.NotEnoughFundsConfirmed)
                else if hadNetworkFailure
                  d.rejectWithError(Errors.NetworkError)
                else
                  d.rejectWithError(Errors.NotEnoughFunds)
      d.promise
     */

    return Transaction;

  })();

}).call(this);
