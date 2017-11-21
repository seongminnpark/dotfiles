(function() {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000000;

  describe('Hardware and Software derivations', function() {
    var PinCode;
    PinCode = '0000';
    return it('compute the same address', function(done) {
      ledger.app.dongle.lock();
      return ledger.app.dongle.unlockWithPinCode(PinCode).then(function() {
        return ledger.app.dongle.getPublicAddress("44'/0'/0'/1/84");
      }).then(function(address) {
        expect(address.bitcoinAddress.toString(ASCII)).toBe('1PCbsXooZxknnX8p9kpUZeedYRbTGUTsSL');
        return done();
      }).done();
    });
  });

}).call(this);
