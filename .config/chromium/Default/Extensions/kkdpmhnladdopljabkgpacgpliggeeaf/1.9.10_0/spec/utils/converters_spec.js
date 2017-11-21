(function() {
  describe("Currency converters", function() {
    var converters;
    converters = ledger.converters;
    beforeEach(function(done) {
      ledger.storage.sync = new ledger.storage.MemoryStore('i18n');
      ledger.tasks.TickerTask.instance.getCache = function() {
        return {
          EUR: {
            values: [
              {
                fromBTC: {
                  value: "250"
                }
              }, {
                toBTC: {
                  value: "0.0039"
                }
              }, {
                toSatoshis: {
                  value: "368189"
                }
              }
            ]
          }
        };
      };
      return ledger.i18n.setFavLangByUI('en').then(function() {
        return ledger.i18n.setLocaleByUI('en-GB');
      }).then(function() {
        return done();
      });
    });
    it("should converts EUR to Satoshi", function(done) {
      var res;
      res = converters.currencyToSatoshi(555, 'EUR');
      expect(res).toBe(204344895);
      return done();
    });
    it("should converts EUR to Satoshi - decimal number", function(done) {
      var res;
      res = converters.currencyToSatoshi(555.78, 'EUR');
      expect(res).toBe(204632082);
      return done();
    });
    it("should converts Satoshi to EUR", function(done) {
      var res;
      res = converters.satoshiToCurrency(9999999, 'EUR');
      expect(res).toBe('25.00');
      return done();
    });
    return afterEach(function() {
      return ledger.tasks.Task.resetAllSingletonTasks();
    });
  });

}).call(this);
