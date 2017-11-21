(function() {
  describe("BalanceTask", function() {
    var dongleInst, init, originalTimeout;
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    dongleInst = null;
    init = function(pin, seed, pairingKey, callback) {
      dongleInst = new ledger.dongle.MockDongle(pin, seed, pairingKey);
      ledger.app.dongle = dongleInst;
      return dongleInst.unlockWithPinCode('0000', callback);
    };
    beforeEach(function(done) {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 300000;
      ledger.tasks.Task.stopAllRunningTasks();
      ledger.tasks.Task.resetAllSingletonTasks();
      ledger.storage.databases = new ledger.storage.MemoryStore("databases");
      ledger.storage.wallet = new ledger.storage.MemoryStore("wallet");
      ledger.storage.sync = new ledger.storage.MemoryStore("sync");
      ledger.storage.sync.wallet = ledger.storage.sync.substore("wallet_layout");
      return ledger.wallet.initialize(dongleInst, function() {
        return ledger.database.init(function() {
          var acc, dongle;
          ledger.database.contexts.open();
          Wallet.instance = Wallet.findOrCreate(1, {
            id: 1
          }).save();
          acc = Account.findOrCreate({
            index: 0
          }).save();
          acc.set('wallet', Wallet.instance).save();
          ledger.wallet.Wallet.instance.createAccount();
          ledger.tasks.AddressDerivationTask.instance.start();
          dongle = ledger.specs.fixtures.dongles.dongle1;
          return init(dongle.pin, dongle.masterSeed, dongle.pairingKeyHex, done);
        });
      });
    });
    it("should get account balance", function(done) {
      var account, accountIndex, balanceTask;
      accountIndex = 0;
      ledger.tasks.BalanceTask.get(accountIndex).start();
      balanceTask = ledger.tasks.BalanceTask.get(accountIndex);
      balanceTask.getAccountBalance();
      account = Account.find({
        index: accountIndex
      }).first();
      return ledger.app.once('wallet:balance:changed wallet:balance:unchanged', function() {
        expect(account.get('wallet').getBalance().wallet.total).toBe(0);
        return done();
      });
    });
    return afterEach(function(done) {
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
  });

}).call(this);
