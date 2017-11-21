(function() {
  describe("WalletLayoutRecoveryTask", function() {
    var dongleInst, init, mockTask, originalTimeout;
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    mockTask = null;
    dongleInst = null;
    beforeAll(function() {
      return jasmine.DEFAULT_TIMEOUT_INTERVAL = 150000;
    });
    afterAll(function() {
      return jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });
    init = function(pin, seed, pairingKey, callback) {
      ledger.tasks.Task.stopAllRunningTasks();
      ledger.tasks.Task.resetAllSingletonTasks();
      ledger.tasks.AddressDerivationTask.instance.start();
      chrome.storage.local.clear();
      mockTask = new ledger.tasks.WalletLayoutRecoveryTask();
      spyOn(mockTask, '_restoreChronocoinLayout').and.callThrough();
      dongleInst = new ledger.dongle.MockDongle(pin, seed, pairingKey);
      ledger.app.dongle = dongleInst;
      dongleInst.unlockWithPinCode('0000');
      return ledger.bitcoin.bitid.getAddress(function(address) {
        var bitIdAddress;
        bitIdAddress = address.bitcoinAddress.toString(ASCII);
        return dongleInst.getPublicAddress("0x50DA'/0xBED'/0xC0FFEE'", function(pubKey) {
          if (!((pubKey != null ? pubKey.bitcoinAddress : void 0) != null) || !(bitIdAddress != null)) {
            logger().error("Fatal error during openStores, missing bitIdAddress and/or pubKey.bitcoinAddress");
            raise(ledger.errors["new"](ledger.errors.UnableToRetrieveBitidAddress));
            ledger.app.emit('wallet:initialization:fatal_error');
            return;
          }
          ledger.storage.openStores(bitIdAddress, pubKey.bitcoinAddress.value);
          return ledger.wallet.initialize(dongleInst, function() {
            var cache;
            cache = new ledger.wallet.Wallet.Cache('xpub_cache', ledger.wallet.Wallet.instance);
            cache.initialize((function(_this) {
              return function() {
                return ledger.wallet.Wallet.instance.xpubCache = cache;
              };
            })(this));
            mockTask.start();
            return mockTask.on('stop', function() {
              return typeof callback === "function" ? callback() : void 0;
            });
          });
        });
      });
    };
    describe(" - zero account", function() {
      beforeEach(function(done) {
        var dongle;
        dongle = ledger.specs.fixtures.dongles.dongle2;
        return init(dongle.pin, dongle.masterSeed, dongle.pairingKeyHex, function() {
          return done();
        });
      });
      it("should call restoreChronocoinLayout", function() {
        expect(mockTask._restoreChronocoinLayout).toHaveBeenCalled();
        return expect(ledger.wallet.Wallet.instance.getAccountsCount()).toBe(1);
      });
      return afterEach(function(done) {
        ledger.tasks.Task.stopAllRunningTasks();
        ledger.tasks.Task.resetAllSingletonTasks();
        chrome.storage.local.clear();
        dongleInst = null;
        return _.defer(function() {
          return done();
        });
      });
    });
    describe(" - seed with one empty account", function() {
      beforeEach(function(done) {
        var dongle;
        dongle = ledger.specs.fixtures.dongles.dongle2;
        return init(dongle.pin, dongle.masterSeed, dongle.pairingKeyHex, done);
      });
      it("should have 1 account", function(done) {
        expect(typeof ledger.wallet.Wallet.instance.getAccount(0)).toBe('object');
        expect(ledger.wallet.Wallet.instance.getAccount(1)).toBeUndefined();
        return done();
      });
      it("should have 0 address in internal and external nodes", function(done) {
        expect(ledger.wallet.Wallet.instance.getAccount(0).getCurrentChangeAddressIndex()).toBe(0);
        expect(ledger.wallet.Wallet.instance.getAccount(0).getCurrentPublicAddressIndex()).toBe(0);
        return done();
      });
      return afterEach(function(done) {
        ledger.tasks.Task.stopAllRunningTasks();
        ledger.tasks.Task.resetAllSingletonTasks();
        chrome.storage.local.clear();
        dongleInst = null;
        return _.defer(function() {
          return done();
        });
      });
    });
    return describe(" - seed with two accounts", function() {
      beforeEach(function(done) {
        var dongle;
        dongle = ledger.specs.fixtures.dongles.dongle1;
        return init(dongle.pin, dongle.masterSeed, dongle.pairingKeyHex, done);
      });
      it("should have 2 accounts", function(done) {
        expect(ledger.wallet.Wallet.instance.getAccountsCount()).toBe(2);
        expect(typeof ledger.wallet.Wallet.instance.getAccount(0)).toBe('object');
        expect(typeof ledger.wallet.Wallet.instance.getAccount(1)).toBe('object');
        expect(ledger.wallet.Wallet.instance.getAccount(2)).toBeUndefined();
        return done();
      });
      it("first account should have 7 addresses in internal nodes and 31 in external nodes", function(done) {
        expect(ledger.wallet.Wallet.instance.getAccount(0).getCurrentChangeAddressIndex()).toBe(7);
        expect(ledger.wallet.Wallet.instance.getAccount(0).getCurrentPublicAddressIndex()).toBe(31);
        return done();
      });
      it("should have importedChangePaths and importedPublicPaths", function(done) {
        expect(ledger.wallet.Wallet.instance.getAccount(0).getAllChangeAddressesPaths()).toContain("0'/1/0");
        expect(ledger.wallet.Wallet.instance.getAccount(0).getAllPublicAddressesPaths()).toContain("0'/0/0");
        return done();
      });
      return afterEach(function(done) {
        ledger.tasks.Task.stopAllRunningTasks();
        ledger.tasks.Task.resetAllSingletonTasks();
        chrome.storage.local.clear();
        dongleInst = null;
        return _.defer(function() {
          return done();
        });
      });
    });
  });

}).call(this);
