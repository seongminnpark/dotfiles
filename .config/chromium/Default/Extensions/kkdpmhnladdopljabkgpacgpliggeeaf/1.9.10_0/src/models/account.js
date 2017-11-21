(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.Account = (function(_super) {
    __extends(Account, _super);

    Account.init();

    Account.has({
      many: 'operations',
      onDelete: 'destroy',
      sortBy: Operation.defaultSort
    });

    Account.has({
      one: 'wallet',
      forMany: 'accounts',
      onDelete: 'nullify',
      sync: true
    });

    Account.index('index', {
      sync: true
    });

    Account.sync('name');

    Account.sync('color');

    Account.sync('hidden');

    function Account() {
      Account.__super__.constructor.apply(this, arguments);
      this.retrieveBalance = _.debounce(this.retrieveBalance.bind(this), 200);
    }

    Account.fromWalletAccount = function(hdAccount) {
      if (hdAccount == null) {
        return null;
      }
      return this.find({
        index: hdAccount.index
      }).first();
    };

    Account.getRemainingAccountCreation = function(context) {
      if (context == null) {
        context = ledger.database.contexts.main;
      }
      return ledger.wallet.Wallet.instance.getAccountsCount() - Account.all(context).length;
    };

    Account.displayableAccounts = function(context) {
      var account, accounts;
      if (context == null) {
        context = ledger.database.contexts.main;
      }
      accounts = (function() {
        var _i, _len, _ref, _results;
        _ref = Account.find({
          hidden: {
            $ne: true
          }
        }, context).simpleSort('index').data();
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          account = _ref[_i];
          _results.push({
            index: account.get('index'),
            name: account.get('name'),
            balance: account.get('total_balance'),
            color: account.get('color')
          });
        }
        return _results;
      })();
      return _.sortBy(accounts, (function(_this) {
        return function(account) {
          return account.index;
        };
      })(this));
    };

    Account.hiddenAccounts = function(context) {
      var account, accounts;
      if (context == null) {
        context = ledger.database.contexts.main;
      }
      accounts = (function() {
        var _i, _len, _ref, _results;
        _ref = Account.find({
          hidden: true
        }, context).simpleSort('index').data();
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          account = _ref[_i];
          _results.push({
            index: account.get('index'),
            name: account.get('name'),
            balance: account.get('total_balance'),
            color: account.get('color')
          });
        }
        return _results;
      })();
      return _.sortBy(accounts, (function(_this) {
        return function(account) {
          return account.index;
        };
      })(this));
    };

    Account.recoverAccount = function(index, wallet) {
      var account;
      if (index === 0) {
        account = Account.create({
          index: 0,
          name: t('common.default_account_name'),
          hidden: false,
          color: ledger.preferences.defaults.Accounts.firstAccountColor
        }).save();
      } else {
        account = Account.create({
          index: index,
          name: _.str.sprintf(t("common.default_recovered_account_name"), index),
          hidden: false,
          color: ledger.preferences.defaults.Accounts.recoveredAccountColor
        }).save();
      }
      return account.set('wallet', wallet).save();
    };

    Account.prototype.getWalletAccount = function() {
      return ledger.wallet.Wallet.instance.getAccount(this.get('index'));
    };

    Account.prototype.get = function(key) {
      var val;
      val = Account.__super__.get.call(this, key);
      if (key === 'total_balance' || key === 'unconfirmed_balance') {
        if (val != null) {
          return ledger.Amount.fromSatoshi(val);
        } else {
          return ledger.Amount.fromSatoshi(0);
        }
      }
      return val;
    };

    Account.prototype.set = function(key, value) {
      if (key === 'hidden') {
        _.defer(function() {
          return ledger.app.emit('wallet:balance:changed', Wallet.instance.getBalance());
        });
      }
      return Account.__super__.set.call(this, key, value);
    };

    Account.prototype.getExtendedPublicKey = function(callback) {
      var d, hdAccount, xpub, _ref;
      d = ledger.defer(callback);
      hdAccount = this.getWalletAccount();
      if ((xpub = (_ref = ledger.wallet.Wallet.instance) != null ? _ref.xpubCache.get(hdAccount.getRootDerivationPath()) : void 0) != null) {
        d.resolve(xpub);
      } else {
        new ledger.wallet.ExtendedPublicKey(ledger.app.dongle, hdAccount.getRootDerivationPath()).initialize((function(_this) {
          return function(xpub, error) {
            if (!error) {
              return d.resolve(xpub.toString());
            } else {
              return d.reject(error);
            }
          };
        })(this));
      }
      return d.promise;
    };

    Account.prototype.serialize = function() {
      return $.extend(Account.__super__.serialize.apply(this, arguments), {
        root_path: this.getWalletAccount().getRootDerivationPath()
      });
    };

    Account.prototype.isHidden = function() {
      return this.get('hidden' || false);
    };

    Account.prototype.isDeletable = function() {
      return this.get('operations').length === 0;
    };

    Account.prototype.getUtxo = function() {
      var hdaccount;
      hdaccount = this.getWalletAccount();
      return _(Output.utxo()).filter(function(utxo) {
        return utxo.get('path').match(hdaccount.getRootDerivationPath());
      });
    };

    Account.prototype.retrieveBalance = function() {
      var totalBalance, unconfirmedBalance;
      totalBalance = this.get('total_balance');
      unconfirmedBalance = this.get('unconfirmed_balance');
      this.set('total_balance', this.getBalanceFromUtxo(0).toString());
      this.set('unconfirmed_balance', this.getBalanceFromUtxo(0).toString());
      this.save();
      if (ledger.Amount.fromSatoshi(totalBalance || 0).neq(this.get('total_balance') || 0) || ledger.Amount.fromSatoshi(unconfirmedBalance || 0).neq(this.get('unconfirmed_balance') || 0)) {
        return ledger.app.emit("wallet:balance:changed", Wallet.instance.getBalance());
      } else {
        return ledger.app.emit("wallet:balance:unchanged", Wallet.instance.getBalance());
      }
    };

    Account.prototype.getBalanceFromUtxo = function(minConfirmation) {
      var output, total, utxo, _i, _len;
      total = ledger.Amount.fromSatoshi(0);
      if (this.getWalletAccount() == null) {
        return total;
      }
      utxo = this.getUtxo();
      for (_i = 0, _len = utxo.length; _i < _len; _i++) {
        output = utxo[_i];
        if ((output.get('double_spent_priority') == null) || output.get('double_spent_priority') === 0) {
          if ((output.get('path').match(this.getWalletAccount().getRootDerivationPath()) && output.get('transaction').get('confirmations')) >= minConfirmation) {
            total = total.add(output.get('value'));
          }
        }
      }
      return total;
    };

    Account.prototype.isDeletable = function() {
      return this.getWalletAccount().isEmpty();
    };

    Account.isAbleToCreateAccount = function() {
      return this.chain().count() < ledger.wallet.Wallet.instance.getAccountsCount();
    };


    /*
      Creates a new transaction asynchronously. The created transaction will only be initialized (i.e. it will only retrieve
      a sufficient number of input to perform the transaction)
    
      @param {ledger.Amount} amount The amount to send (expressed in satoshi)
      @param {ledger.Amount} fees The miner fees (expressed in satoshi)
      @param {String} address The recipient address
      @option [Function] callback The callback called once the transaction is created
      @return [Q.Promise] A closure
     */

    Account.prototype.createTransaction = function(_arg, callback) {
      var address, amount, changeAddress, changeIndex, changePath, data, fees, utxo;
      amount = _arg.amount, fees = _arg.fees, address = _arg.address, utxo = _arg.utxo, data = _arg.data;
      amount = ledger.Amount.fromSatoshi(amount);
      fees = ledger.Amount.fromSatoshi(fees);
      changeIndex = this.getWalletAccount().getCurrentChangeAddressIndex();
      changePath = this.getWalletAccount().getChangeAddressPath(changeIndex);
      changeAddress = this.getWalletAccount().getCurrentChangeAddress();
      return ledger.wallet.Transaction.create({
        amount: amount,
        fees: fees,
        address: address,
        utxo: utxo,
        changePath: changePath,
        changeAddress: changeAddress,
        data: data
      }, callback);
    };


    /*
      Special get change address path to 'avoid' LW 1.0.0 derivation failure.
     */

    Account.prototype._createTransactionGetChangeAddressPath = function(changeIndex, callback) {
      var changePath;
      changePath = this.getWalletAccount().getChangeAddressPath(changeIndex);
      if (ledger.app.dongle.getIntFirmwareVersion() !== ledger.dongle.Firmwares.V_L_1_0_0) {
        return callback(changePath);
      } else {
        return ledger.tasks.AddressDerivationTask.instance.getPublicAddress(changePath, (function(_this) {
          return function(xpubAddress) {
            return ledger.app.dongle.getPublicAddress(changePath, function(address) {
              address = address.bitcoinAddress.toString(ASCII);
              if (xpubAddress === address) {
                return typeof callback === "function" ? callback(changePath) : void 0;
              } else {
                return _this._createTransactionGetChangeAddressPath(changeIndex + 1, callback);
              }
            });
          };
        })(this));
      }
    };

    Account.prototype.addRawTransactionAndSave = function(rawTransaction, callback) {
      var hdAccount, _ref;
      if (callback == null) {
        callback = _.noop;
      }
      hdAccount = (_ref = ledger.wallet.Wallet.instance) != null ? _ref.getAccount(this.get('index')) : void 0;
      return ledger.wallet.pathsToAddresses(hdAccount.getAllPublicAddressesPaths(), (function(_this) {
        return function(publicAddresses) {
          return ledger.wallet.pathsToAddresses(hdAccount.getAllChangeAddressesPaths(), function(changeAddresses) {
            var inserts, updates, _ref1;
            _ref1 = _this._addRawTransaction(rawTransaction, _.values(publicAddresses), _.values(changeAddresses)), inserts = _ref1.inserts, updates = _ref1.updates;
            _this.save();
            if (inserts.length > 0) {
              ledger.app.emit('wallet:operations:new', inserts);
            }
            if (updates.length > 0) {
              ledger.app.emit('wallet:operations:update', updates);
            }
            return callback();
          });
        };
      })(this));
    };

    Account.prototype._addRawTransaction = function(rawTransaction, publicAddresses, changeAddresses) {
      var hasAddressesInInput, hasAddressesInOutput, input, insert, output, result, update, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3;
      rawTransaction.outputAddresses = [];
      rawTransaction.inputAddresses = [];
      _ref = rawTransaction.outputs;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        output = _ref[_i];
        rawTransaction.outputAddresses = rawTransaction.outputAddresses.concat(output.addresses);
      }
      _ref1 = rawTransaction.inputs;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        input = _ref1[_j];
        rawTransaction.inputAddresses = rawTransaction.inputAddresses.concat(input.addresses);
      }
      hasAddressesInInput = _.some(rawTransaction.inputAddresses, (function(address) {
        return _.contains(publicAddresses, address) || _.contains(changeAddresses, address);
      }));
      hasAddressesInOutput = _.some(rawTransaction.outputAddresses, (function(address) {
        return _.contains(publicAddresses, address);
      }));
      result = {
        inserts: [],
        updates: []
      };
      if (hasAddressesInInput) {
        _ref2 = this._addRawSendTransaction(rawTransaction, changeAddresses), insert = _ref2[0], update = _ref2[1];
        if (insert != null) {
          result.inserts.push(insert);
        }
        if (update != null) {
          result.updates.push(update);
        }
      }
      if (hasAddressesInOutput) {
        _ref3 = this._addRawReceptionTransaction(rawTransaction, publicAddresses), insert = _ref3[0], update = _ref3[1];
        if (insert != null) {
          result.inserts.push(insert);
        }
        if (update != null) {
          result.updates.push(update);
        }
      }
      return result;
    };

    Account.prototype._addRawReceptionTransaction = function(rawTransaction, ownAddresses) {
      var address, isInserted, operation, output, recipients, senders, uid, value, _i, _len, _ref;
      value = 0;
      _ref = rawTransaction.outputs;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        output = _ref[_i];
        if (_.select(output.addresses, (function(address) {
          return _.contains(ownAddresses, address);
        })).length > 0) {
          if (output.value != null) {
            value += parseInt(output.value);
          }
        }
      }
      recipients = (function() {
        var _j, _len1, _ref1, _results;
        _ref1 = rawTransaction.outputAddresses;
        _results = [];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          address = _ref1[_j];
          if (_.contains(ownAddresses, address)) {
            _results.push(address);
          }
        }
        return _results;
      })();
      senders = (function() {
        var _j, _len1, _ref1, _results;
        _ref1 = rawTransaction.inputAddresses;
        _results = [];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          address = _ref1[_j];
          _results.push(address);
        }
        return _results;
      })();
      senders = _.unique(senders);
      recipients = _.unique(recipients);
      uid = "reception_" + rawTransaction.hash + "_" + (this.get('index'));
      operation = Operation.findOrCreate({
        uid: uid
      });
      operation.set('hash', rawTransaction['hash']);
      operation.set('fees', rawTransaction['fees']);
      operation.set('time', (new Date(rawTransaction['chain_received_at'])).getTime());
      operation.set('type', 'reception');
      operation.set('value', value);
      operation.set('confirmations', rawTransaction['confirmations']);
      operation.set('senders', senders);
      operation.set('recipients', recipients);
      isInserted = !operation.isInserted();
      operation.save();
      this.add('operations', operation);
      if (isInserted) {
        return [operation, null];
      } else {
        return [null, operation];
      }
    };

    Account.prototype._addRawSendTransaction = function(rawTransaction, changeAddresses) {
      var address, isInserted, operation, output, recipients, senders, uid, value, _i, _len, _ref;
      value = 0;
      _ref = rawTransaction.outputs;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        output = _ref[_i];
        if (_.select(output.addresses, (function(address) {
          return _.contains(changeAddresses, address) === false;
        })).length > 0) {
          if (output.value != null) {
            value += parseInt(output.value);
          }
        }
      }
      recipients = (function() {
        var _j, _len1, _ref1, _results;
        _ref1 = rawTransaction.outputAddresses;
        _results = [];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          address = _ref1[_j];
          if (_.contains(changeAddresses, address) === false) {
            _results.push(address);
          }
        }
        return _results;
      })();
      senders = (function() {
        var _j, _len1, _ref1, _results;
        _ref1 = rawTransaction.inputAddresses;
        _results = [];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          address = _ref1[_j];
          _results.push(address);
        }
        return _results;
      })();
      senders = _.unique(senders);
      recipients = _.unique(recipients);
      uid = "sending" + rawTransaction.hash + "_" + (this.get('index'));
      operation = Operation.findOrCreate({
        uid: uid
      });
      operation.set('hash', rawTransaction['hash']);
      operation.set('fees', rawTransaction['fees']);
      operation.set('time', (new Date(rawTransaction['chain_received_at'])).getTime());
      operation.set('type', 'sending');
      operation.set('value', value);
      operation.set('confirmations', rawTransaction['confirmations']);
      operation.set('senders', senders);
      operation.set('recipients', recipients);
      isInserted = !operation.isInserted();
      operation.save();
      this.add('operations', operation);
      if (isInserted) {
        return [operation, null];
      } else {
        return [null, operation];
      }
    };

    return Account;

  })(ledger.database.Model);

}).call(this);
