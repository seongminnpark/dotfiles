(function() {
  describe("AddressDerivationTask", function() {
    describe("– MainNet", function() {
      var addrDerivationInstance, init;
      if (ledger.config.network.name === 'bitcoin') {
        addrDerivationInstance = ledger.tasks.AddressDerivationTask.instance;
        init = function(pin, seed, pairingKey, callback) {
          var dongleInst;
          chrome.storage.local.clear();
          addrDerivationInstance.start();
          dongleInst = new ledger.dongle.MockDongle(pin, seed, pairingKey);
          ledger.app.dongle = dongleInst;
          return dongleInst.unlockWithPinCode('0000', callback);
        };
        beforeAll(function(done) {
          var dongle;
          ledger.tasks.Task.stopAllRunningTasks();
          ledger.tasks.Task.resetAllSingletonTasks();
          dongle = ledger.specs.fixtures.dongles.dongle1;
          return init(dongle.pin, dongle.masterSeed, dongle.pairingKeyHex, done);
        });
        it("should get public address", function(done) {
          return addrDerivationInstance.registerExtendedPublicKeyForPath("44'/0'/0'", function() {
            return addrDerivationInstance.getPublicAddress("44'/0'/0'/0", function(addr) {
              expect(addr).toBe('19H1wRZdk17o3pUL2NsXqGLVTDk6DvsvyF');
              return done();
            });
          });
        });
      }
      return describe("– TestNet", function() {
        if (ledger.config.network.name === 'testnet') {
          addrDerivationInstance = ledger.tasks.AddressDerivationTask.instance;
          init = function(pin, seed, pairingKey, callback) {
            var dongleInst;
            chrome.storage.local.clear();
            addrDerivationInstance.start();
            dongleInst = new ledger.dongle.MockDongle(pin, seed, pairingKey);
            ledger.app.dongle = dongleInst;
            return dongleInst.unlockWithPinCode('0000', callback);
          };
          beforeAll(function(done) {
            var dongle;
            ledger.tasks.Task.stopAllRunningTasks();
            ledger.tasks.Task.resetAllSingletonTasks();
            dongle = ledger.specs.fixtures.dongles.bitcoin_testnet;
            return init(dongle.pin, dongle.masterSeed, dongle.pairingKeyHex, done);
          });
          return it("should get public address", function(done) {
            return addrDerivationInstance.registerExtendedPublicKeyForPath("44'/0'/0'", function() {
              return addrDerivationInstance.getPublicAddress("44'/0'/0'/0", function(addr) {
                expect(addr).toBe('myUyeg1x5kMnh5PHT4xcwdSoJ6mZJREuyB');
                return done();
              });
            });
          });
        }
      });
    });
    return afterAll(function() {
      ledger.tasks.Task.stopAllRunningTasks();
      return ledger.tasks.Task.resetAllSingletonTasks();
    });
  });

}).call(this);
