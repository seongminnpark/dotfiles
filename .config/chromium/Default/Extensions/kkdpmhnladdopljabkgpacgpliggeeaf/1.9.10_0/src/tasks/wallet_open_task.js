
/*
  Procedures declaration
 */

(function() {
  var ProceduresOrder, completeLayoutInitialization, ensureDataConsistency, initializePreferences, initializeWalletModel, logger, openAddressCache, openDatabase, openHdWallet, openStores, openXpubCache, pullStore, refreshHdWallet, restoreStructure, startDerivationTask, startTransactionConsumerTask,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  openStores = function(dongle, raise, done) {
    return ledger.app.dongle.setCoinVersion(ledger.config.network.version.regular, ledger.config.network.version.P2SH, (function(_this) {
      return function() {
        ledger.preferences.common.setCoin(ledger.config.network.name);
        return ledger.bitcoin.bitid.getAddress(function(address) {
          var bitIdAddress;
          bitIdAddress = address.bitcoinAddress.toString(ASCII);
          dongle.getPublicAddress("0x50DA'/0xBED'/0xC0FFEE'", function(pubKey) {
            if (!((pubKey != null ? pubKey.bitcoinAddress : void 0) != null) || !(bitIdAddress != null)) {
              logger().error("Fatal error during openStores, missing bitIdAddress and/or pubKey.bitcoinAddress");
              raise(ledger.errors["new"](ledger.errors.UnableToRetrieveBitidAddress));
              ledger.app.emit('wallet:initialization:fatal_error');
              return;
            }
            ledger.storage.openStores(bitIdAddress, pubKey.bitcoinAddress.value);
            ledger.utils.Logger._secureWriter = new ledger.utils.SecureLogWriter(pubKey.bitcoinAddress.toString(ASCII), bitIdAddress, ledger.config.defaultLoggerDaysMax);
            ledger.utils.Logger._secureReader = new ledger.utils.SecureLogReader(pubKey.bitcoinAddress.toString(ASCII), bitIdAddress, ledger.config.defaultLoggerDaysMax);
            if (typeof done === "function") {
              done();
            }
          });
        });
      };
    })(this));
  };

  pullStore = function(dongle, raise, done) {
    ledger.storage.sync.pull();
    return done();
  };

  openHdWallet = function(dongle, raise, done) {
    return ledger.wallet.initialize(dongle, done);
  };

  startDerivationTask = function(dongle, raise, done) {
    var hdWallet;
    hdWallet = ledger.wallet.Wallet.instance;
    ledger.tasks.AddressDerivationTask.instance.start();
    return _.defer((function(_this) {
      return function() {
        var accountIndex, _i, _ref;
        ledger.tasks.AddressDerivationTask.instance.setNetwork(ledger.config.network.name);
        for (accountIndex = _i = 0, _ref = hdWallet.getAccountsCount(); 0 <= _ref ? _i < _ref : _i > _ref; accountIndex = 0 <= _ref ? ++_i : --_i) {
          ledger.tasks.AddressDerivationTask.instance.registerExtendedPublicKeyForPath("" + (hdWallet.getRootDerivationPath()) + "/" + accountIndex + "'", _.noop);
        }
        return typeof done === "function" ? done() : void 0;
      };
    })(this));
  };

  startTransactionConsumerTask = function(dongle, raise, done) {
    ledger.tasks.TransactionConsumerTask.instance.startIfNeccessary();
    return done();
  };

  openAddressCache = function(dongle, raise, done) {
    var cache;
    cache = new ledger.wallet.Wallet.Cache('cache', ledger.wallet.Wallet.instance);
    return cache.initialize((function(_this) {
      return function() {
        ledger.wallet.Wallet.instance.cache = cache;
        return typeof done === "function" ? done() : void 0;
      };
    })(this));
  };

  openXpubCache = function(dongle, raise, done) {
    var cache;
    cache = new ledger.wallet.Wallet.Cache('xpub_cache', ledger.wallet.Wallet.instance);
    return cache.initialize((function(_this) {
      return function() {
        ledger.wallet.Wallet.instance.xpubCache = cache;
        return typeof done === "function" ? done() : void 0;
      };
    })(this));
  };

  refreshHdWallet = function(dongle, raise, done) {
    return ledger.wallet.Wallet.instance.initialize(ledger.storage.sync.wallet, done);
  };

  restoreStructure = function(dongle, raise, done) {
    var block;
    block = Block.lastBlock();
    if (_.isEmpty(block) || (new Date().getTime() - block.get('time').getTime() >= 7 * 24 * 60 * 60 * 1000)) {
      ledger.app.emit('wallet:initialization:creation');
      ledger.tasks.WalletLayoutRecoveryTask.instance.on('done', (function(_this) {
        return function() {
          if (Account.chain().count() === 0) {
            Account.recoverAccount(0, Wallet.instance);
          }
          ledger.tasks.OperationsSynchronizationTask.instance.startIfNeccessary();
          return typeof done === "function" ? done({
            operation_consumption: true
          }) : void 0;
        };
      })(this));
      ledger.tasks.WalletLayoutRecoveryTask.instance.on('fatal_error', (function(_this) {
        return function() {
          ledger.app.emit('wallet:initialization:failed');
          return typeof done === "function" ? done() : void 0;
        };
      })(this));
      return ledger.tasks.WalletLayoutRecoveryTask.instance.startIfNeccessary();
    } else {
      ledger.tasks.WalletLayoutRecoveryTask.instance.startIfNeccessary();
      return typeof done === "function" ? done() : void 0;
    }
  };

  completeLayoutInitialization = function(dongle, raise, done) {
    ledger.wallet.Wallet.instance.isInitialized = true;
    return typeof done === "function" ? done() : void 0;
  };

  openDatabase = function(dongle, raise, done) {
    return ledger.database.init((function(_this) {
      return function() {
        ledger.database.contexts.open();
        return done();
      };
    })(this));
  };

  initializeWalletModel = function(dongle, raise, done) {
    return Wallet.initializeWallet(done);
  };

  initializePreferences = function(dongle, raise, done) {
    return ledger.preferences.init(done);
  };

  ensureDataConsistency = function(dongle, raise, done) {
    var checkAccounts, checkWallet;
    checkWallet = (function(_this) {
      return function() {
        if (Wallet.findById(1) != null) {
          return Wallet.initializeWallet(checkAccounts);
        } else {
          return checkAccounts();
        }
      };
    })(this);
    checkAccounts = (function(_this) {
      return function() {
        var account, accounts, _i, _len;
        accounts = Account.all() || [];
        if (accounts.length === 0) {
          Account.recoverAccount(0).save();
        } else {
          for (_i = 0, _len = accounts.length; _i < _len; _i++) {
            account = accounts[_i];
            account.set('wallet', Wallet.instance).save();
            if (account.get('color') == null) {
              account.set('color', ledger.preferences.defaults.Accounts.firstAccountColor).save();
            }
          }
        }
        return done();
      };
    })(this);
    return checkWallet();
  };

  ProceduresOrder = [openStores, openHdWallet, startDerivationTask, openAddressCache, openXpubCache, openDatabase, initializeWalletModel, startTransactionConsumerTask, pullStore, restoreStructure, completeLayoutInitialization, initializePreferences, ensureDataConsistency];


  /*
    End of procedures declaration
   */

  ledger.tasks.WalletOpenTask = (function(_super) {
    __extends(WalletOpenTask, _super);

    WalletOpenTask.prototype.steps = ProceduresOrder;

    WalletOpenTask.instance = new WalletOpenTask;

    WalletOpenTask.reset = function() {
      return this.instance = new this;
    };

    function WalletOpenTask() {
      WalletOpenTask.__super__.constructor.call(this, 'wallet_open_task');
      this._completion = new ledger.utils.CompletionClosure();
    }

    WalletOpenTask.prototype.onStart = function() {
      var raise, result;
      WalletOpenTask.__super__.onStart.apply(this, arguments);
      raise = (function(_this) {
        return function(error) {
          _this._completion.failure(error);
          raise.next = _.noop;
          return _this.stopIfNeccessary();
        };
      })(this);
      result = _({});
      return _.async.each(this.steps, (function(_this) {
        return function(step, next, hasNext) {
          if (!_this.isRunning()) {
            return;
          }
          raise.next = next;
          return step(ledger.app.dongle, raise, function(r) {
            result.extend(r);
            raise.next();
            if (!hasNext) {
              _this._completion.success(result.value());
              return _this.stopIfNeccessary();
            }
          });
        };
      })(this));
    };

    WalletOpenTask.prototype.onStop = function() {
      if (!this._completion.isCompleted()) {
        this._completion.failure(ledger.errors["new"](ledger.errors.InterruptedTask));
      }
      return this._completion = new ledger.utils.CompletionClosure();
    };

    WalletOpenTask.prototype.onComplete = function(callback) {
      return this._completion.onComplete(callback);
    };

    return WalletOpenTask;

  })(ledger.tasks.Task);

  logger = function() {
    return ledger.utils.Logger.getLoggerByTag("WalletOpening");
  };

}).call(this);
