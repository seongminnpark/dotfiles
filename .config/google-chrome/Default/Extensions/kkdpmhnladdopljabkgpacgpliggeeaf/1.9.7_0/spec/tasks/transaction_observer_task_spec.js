(function() {
  describe("TransactionObserverTask", function() {
    var account, init, originalTimeout, originalWS;
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    originalWS = null;
    account = null;
    init = function(pin, seed, pairingKey, callback) {
      var dongleInst;
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
                ledger.wallet.Wallet.instance.createAccount();
                return _.defer(function() {
                  return ledger.tasks.AddressDerivationTask.instance.registerExtendedPublicKeyForPath("44'/0'/0'", function() {
                    ledger.wallet.Wallet.instance.getOrCreateAccount(0).notifyPathsAsUsed(["44'/0'/0'/0/6"]);
                    return ledger.wallet.pathsToAddresses(["44'/0'/0'/0/6"], function() {
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
      var WebSocket, dongle;
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 50000;
      ledger.tasks.Task.stopAllRunningTasks();
      ledger.tasks.Task.resetAllSingletonTasks();
      originalWS = window.WebSocket;
      window.WebSocket = WebSocket = (function() {
        function WebSocket() {}

        return WebSocket;

      })();
      window.WebSocket.prototype = jasmine.createSpyObj('ws', ['send', 'close']);
      dongle = ledger.specs.fixtures.dongles.dongle1;
      return init(dongle.pin, dongle.masterSeed, dongle.pairingKeyHex, done);
    });
    afterEach(function(done) {
      window.WebSocket = originalWS;
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
    it("should check if my txs are added to db", function(done) {
      ledger.tasks.TransactionObserverTask.instance.start();
      return ledger.tasks.TransactionObserverTask.instance.on('start', function() {
        return _.defer(function() {
          ledger.tasks.TransactionObserverTask.instance.newTransactionStream.onmessage({
            data: JSON.stringify({
              payload: {
                type: "new-transaction",
                block_chain: "bitcoin",
                transaction: ledger.specs.fixtures.dongle1_transactions.tx1
              }
            })
          });
          return ledger.database.contexts.main.on('insert:operation', function() {
            var res;
            res = _.isEmpty(Operation.find({
              hash: 'aa1a80314f077bd2c0e335464f983eef56dfeb0eb65c99464a0e5dbe2c25b7dc'
            }).data());
            expect(res).toBeFalsy();
            return done();
          });
        });
      });
    });
    it("should check if not my txs are not added to db", function(done) {
      ledger.tasks.TransactionObserverTask.instance.start();
      return ledger.tasks.TransactionObserverTask.instance.on('start', function() {
        return _.defer(function() {
          var cb;
          cb = {
            cb: function() {
              var res;
              return res = _.isEmpty(Operation.find({
                hash: 'a863b9a56c40c194c11eb9db9f3ea1f6ab472b02cc57679c50d16b4151c8a6e5'
              }).data());
            }
          };
          spyOn(cb, 'cb');
          ledger.tasks.TransactionObserverTask.instance.newTransactionStream.onmessage({
            data: JSON.stringify({
              payload: {
                type: "new-transaction",
                block_chain: "bitcoin",
                transaction: ledger.specs.fixtures.dongle1_transactions.tx2
              }
            })
          });
          ledger.database.contexts.main.on('insert:operation', cb);
          return setTimeout(function() {
            expect(cb.cb).not.toHaveBeenCalled();
            return done();
          }, 100);
        });
      });
    });
    return it("should update unconfirmed tx", function(done) {
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
