(function() {
  describe("Extended public key", function() {
    var dongleInst, init, xpubInstance;
    xpubInstance = null;
    dongleInst = null;
    init = function(pin, seed, pairingKey, callback) {
      chrome.storage.local.clear();
      dongleInst = new ledger.dongle.MockDongle(pin, seed, pairingKey);
      ledger.app.dongle = dongleInst;
      return dongleInst.unlockWithPinCode('0000', callback);
    };
    describe("Bitcoin MainNet", function() {
      if (ledger.config.network.name === 'bitcoin') {
        beforeAll(function(done) {
          var dongle;
          dongle = ledger.specs.fixtures.dongles.dongle1;
          return init(dongle.pin, dongle.masterSeed, dongle.pairingKeyHex, function() {
            xpubInstance = new ledger.wallet.ExtendedPublicKey(ledger.app.dongle, "44'/0'/0'", false);
            return xpubInstance.initialize(done);
          });
        });
        it("should create an xPub", function(done) {
          expect(xpubInstance._xpub58).toBe('xpub6DCi5iJ57ZPd5qPzvTm5hUt6X23TJdh9H4NjNsNbt7t7UuTMJfawQWsdWRFhfLwkiMkB1rQ4ZJWLB9YBnzR7kbs9N8b2PsKZgKUHQm1X4or');
          return done();
        });
        it("should get the first public address", function(done) {
          expect(xpubInstance.getPublicAddress("0/0")).toBe('151krzHgfkNoH3XHBzEVi6tSn4db7pVjmR');
          return done();
        });
        return afterAll(function() {
          chrome.storage.local.clear();
          return dongleInst = null;
        });
      }
    });
    return describe("Bitcoin TestNet", function() {
      if (ledger.config.network.name === 'testnet') {
        beforeAll(function(done) {
          var dongle;
          dongle = ledger.specs.fixtures.dongles.bitcoin_testnet;
          return init(dongle.pin, dongle.masterSeed, dongle.pairingKeyHex, function() {
            xpubInstance = new ledger.wallet.ExtendedPublicKey(ledger.app.dongle, "44'/0'/0'", false);
            return xpubInstance.initialize(done);
          });
        });
        it("should create an xPub", function(done) {
          expect(xpubInstance._xpub58).toBe('tpubDC5zQEehVX1nttyguXZoLpJL6wCbf47jASUjdff6yJeeJqKmhkXBRjwjHKJHz1r74uidpjXh2zQoX2wrwJv1fnsEzth35qtUECV2qZDWqfV');
          return done();
        });
        it("should get the first public address", function(done) {
          expect(xpubInstance.getPublicAddress("0/0")).toBe('mmc6jah6sCb9W8cia14MtY51QFytVsZ8Nk');
          return done();
        });
        return afterAll(function() {
          chrome.storage.local.clear();
          return dongleInst = null;
        });
      }
    });
  });

}).call(this);
