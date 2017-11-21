(function() {
  describe("OperationsConsumptionTask", function() {
    var account, dongleInst, init, originalTimeout;
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    dongleInst = null;
    account = null;
    init = function(pin, seed, pairingKey, callback) {
      dongleInst = new ledger.dongle.MockDongle(pin, seed, pairingKey);
      ledger.app.dongle = dongleInst;
      return dongleInst.unlockWithPinCode('0000', function() {
        ledger.storage.databases = new ledger.storage.MemoryStore("databases");
        ledger.storage.wallet = new ledger.storage.MemoryStore("wallet");
        ledger.storage.sync = new ledger.storage.MemoryStore("sync");
        ledger.storage.sync.wallet = ledger.storage.sync.substore("wallet_layout");
        return ledger.wallet.initialize(dongleInst, function() {
          var cache;
          ledger.tasks.AddressDerivationTask.instance.start();
          cache = new ledger.wallet.Wallet.Cache('ops_cache', ledger.wallet.Wallet.instance);
          return cache.initialize(function() {
            var xcache;
            ledger.wallet.Wallet.instance.cache = cache;
            xcache = new ledger.wallet.Wallet.Cache('xpub_cache', ledger.wallet.Wallet.instance);
            return xcache.initialize(function() {
              ledger.wallet.Wallet.instance.xpubCache = xcache;
              return ledger.database.init(function() {
                ledger.database.contexts.open();
                Wallet.instance = Wallet.findOrCreate(1, {
                  id: 1
                }).save();
                account = Account.findOrCreate({
                  index: 0
                }).save();
                account.set('wallet', Wallet.instance).save();
                return ledger.tasks.AddressDerivationTask.instance.registerExtendedPublicKeyForPath("44'/0'/0'", function() {
                  return _.defer(function() {
                    var paths, txs;
                    paths = ["44'/0'/0'/1/0", "44'/0'/0'/1/1", "44'/0'/0'/1/2", "44'/0'/0'/1/3", "44'/0'/0'/1/4", "44'/0'/0'/1/5", "44'/0'/0'/1/6", "44'/0'/0'/1/7", "44'/0'/0'/1/8", "44'/0'/0'/1/9", "44'/0'/0'/1/10", "44'/0'/0'/1/11", "44'/0'/0'/1/12", "44'/0'/0'/1/13", "44'/0'/0'/1/14", "44'/0'/0'/1/15", "44'/0'/0'/1/16", "44'/0'/0'/1/17", "44'/0'/0'/1/18", "44'/0'/0'/1/19", "44'/0'/0'/1/20", "44'/0'/0'/0/0", "44'/0'/0'/0/1", "44'/0'/0'/0/2", "44'/0'/0'/0/3", "44'/0'/0'/0/4", "44'/0'/0'/0/5", "44'/0'/0'/0/6", "44'/0'/0'/0/7", "44'/0'/0'/0/8", "44'/0'/0'/0/9"];
                    ledger.wallet.Wallet.instance.getOrCreateAccount(0).notifyPathsAsUsed(paths);
                    txs = [ledger.specs.fixtures.dongle1_transactions.tx1, ledger.specs.fixtures.dongle1_transactions.tx2, ledger.specs.fixtures.dongle1_transactions.tx3, ledger.specs.fixtures.dongle1_transactions.tx4];
                    ledger.specs.fixtures.dongle1_transactions.tx1.confirmations = 999999999999;
                    ledger.specs.fixtures.dongle1_transactions.tx4.confirmations = 2;
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
    it("should retrieve account operations", function(done) {
      ledger.tasks.OperationsConsumptionTask.instance.start();
      return ledger.tasks.OperationsConsumptionTask.instance.on('stop', function() {
        var hashes, i, ops, v, _i, _len;
        ops = Operation.all();
        hashes = [];
        for (i = _i = 0, _len = ops.length; _i < _len; i = ++_i) {
          v = ops[i];
          hashes.push(ops[i].get('hash'));
        }
        expect(ops.length >= 17).toBe(true);
        expect(hashes).toContain('d1c90810c08827e26e33a9a7e5a37703d3cb55b155f3c6900f88743fe9e91421');
        expect(hashes).toContain('41b961f740f2577d8a489dc1ab34ae985e6b0f17e790705e3bc33a7d94dbb248');
        expect(hashes).toContain('655636fe8d36af2b082a8656bd2d15332a1fc4e5109aaf7f322b8ff250c84edc');
        expect(hashes).toContain('1cb013db58c896d9ddb919c3938ae6be6672ed47a9c69a1b56375c2a62be1d03');
        return done();
      });
    });
    return it("should update confirmation count", function(done) {
      ledger.tasks.OperationsConsumptionTask.instance.start();
      return ledger.tasks.OperationsConsumptionTask.instance.on('stop', function() {
        var ops;
        ops = Operation.all();
        expect(ops[3].get('confirmations') >= 30848).toBe(true);
        expect(ops[0].get('confirmations') >= 30845 && ops[0]._object.confirmations !== 999999999999).toBe(true);
        return done();
      });
    });
  });

}).call(this);
