(function() {
  describe("OperationsSynchronizationTask", function() {
    var account, dongleInst, init, originalTimeout;
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    dongleInst = null;
    account = null;
    init = function(pin, seed, pairingKey, callback) {
      dongleInst = new ledger.dongle.MockDongle(pin, seed, pairingKey);
      ledger.app.dongle = dongleInst;
      return dongleInst.unlockWithPinCode('0000', function() {
        ledger.tasks.AddressDerivationTask.instance.start();
        ledger.storage.databases = new ledger.storage.MemoryStore("databases");
        ledger.storage.wallet = new ledger.storage.MemoryStore("wallet");
        ledger.storage.sync = new ledger.storage.MemoryStore("sync");
        ledger.storage.sync.wallet = ledger.storage.sync.substore("wallet_layout");
        return ledger.wallet.initialize(dongleInst, function() {
          var cache;
          cache = new ledger.wallet.Wallet.Cache('ops_cache', ledger.wallet.Wallet.instance);
          return cache.initialize(function() {
            var xcache;
            ledger.wallet.Wallet.instance.cache = cache;
            xcache = new ledger.wallet.Wallet.Cache('xpub_cache', ledger.wallet.Wallet.instance);
            return xcache.initialize(function() {
              var paths;
              ledger.wallet.Wallet.instance.xpubCache = xcache;
              paths = ["44'/0'/0'/1/0", "44'/0'/0'/1/1", "44'/0'/0'/1/2", "44'/0'/0'/1/3", "44'/0'/0'/1/4", "44'/0'/0'/1/5", "44'/0'/0'/1/6", "44'/0'/0'/1/7", "44'/0'/0'/1/8", "44'/0'/0'/1/9", "44'/0'/0'/1/10", "44'/0'/0'/1/11", "44'/0'/0'/1/12", "44'/0'/0'/1/13", "44'/0'/0'/1/14", "44'/0'/0'/1/15", "44'/0'/0'/1/16", "44'/0'/0'/1/17", "44'/0'/0'/1/18", "44'/0'/0'/1/19", "44'/0'/0'/1/20", "44'/0'/0'/0/0", "44'/0'/0'/0/1", "44'/0'/0'/0/2", "44'/0'/0'/0/3", "44'/0'/0'/0/4", "44'/0'/0'/0/5", "44'/0'/0'/0/6", "44'/0'/0'/0/7", "44'/0'/0'/0/8", "44'/0'/0'/0/9"];
              return ledger.database.init(function() {
                ledger.database.contexts.open();
                Wallet.instance = Wallet.findOrCreate(1, {
                  id: 1
                }).save();
                account = Account.findOrCreate({
                  index: 0
                }).save();
                account.set('wallet', Wallet.instance).save();
                return _.defer(function() {
                  return ledger.tasks.AddressDerivationTask.instance.registerExtendedPublicKeyForPath("44'/0'/0'", function() {
                    var txs;
                    ledger.wallet.Wallet.instance.getOrCreateAccount(0).notifyPathsAsUsed(paths);
                    txs = [ledger.specs.fixtures.dongle1_transactions.tx1, ledger.specs.fixtures.dongle1_transactions.tx2, ledger.specs.fixtures.dongle1_transactions.tx3, ledger.specs.fixtures.dongle1_transactions.tx4];
                    return _.async.each(txs, function(item, next) {
                      account.addRawTransactionAndSave(item, next);
                      return typeof callback === "function" ? callback() : void 0;
                    });
                  });
                });
              });
            });
          });
        });
      });
    };
    beforeEach(function(done) {
      var dongle;
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 200000;
      ledger.tasks.Task.stopAllRunningTasks();
      ledger.tasks.Task.resetAllSingletonTasks();
      dongle = ledger.specs.fixtures.dongles.dongle1;
      return init(dongle.pin, dongle.masterSeed, dongle.pairingKeyHex, done);
    });
    afterEach(function(done) {
      [ledger.storage.databases, ledger.storage.wallet, ledger.storage.sync, ledger.storage.sync.wallet].forEach(function(that) {
        return that.clear();
      });
      ledger.tasks.Task.stopAllRunningTasks();
      ledger.tasks.Task.resetAllSingletonTasks();
      jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
      return _.defer(function() {
        return done();
      });
    });
    return it("should sync confirmation number", function(done) {
      ledger.tasks.TransactionObserverTask.instance.start();
      return ledger.tasks.TransactionObserverTask.instance.on('start', function() {
        return _.defer(function() {
          var tx1;
          spyOn(ledger.tasks.OperationsSynchronizationTask.instance, 'synchronizeConfirmationNumbers');
          tx1 = _.clone(ledger.specs.fixtures.dongle1_transactions.tx1);
          tx1.confirmations = 0;
          account.addRawTransactionAndSave(tx1);
          return ledger.app.on('wallet:operations:new', function() {
            ledger.tasks.TransactionObserverTask.instance.newTransactionStream.onmessage({
              data: JSON.stringify({
                payload: {
                  type: "new-block",
                  block_chain: "bitcoin",
                  block: ledger.specs.fixtures.dongle1_blocks.blockTx1
                }
              })
            });
            return setTimeout(function() {
              expect(ledger.tasks.OperationsSynchronizationTask.instance.synchronizeConfirmationNumbers).toHaveBeenCalled();
              return done();
            }, 100);
          });
        });
      });
    });
  });

}).call(this);
