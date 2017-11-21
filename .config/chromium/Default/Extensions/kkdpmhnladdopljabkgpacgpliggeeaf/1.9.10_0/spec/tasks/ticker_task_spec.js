(function() {
  describe("TickerTask", function() {
    var originalTimeout;
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    beforeAll(function() {
      ledger.tasks.Task.stopAllRunningTasks();
      ledger.tasks.Task.resetAllSingletonTasks();
      return jasmine.DEFAULT_TIMEOUT_INTERVAL = 50000;
    });
    it("should set currencies into cache", function(done) {
      ledger.tasks.TickerTask.instance.start();
      return ledger.tasks.TickerTask.instance.getCacheAsync(function(currencies) {
        expect(currencies).toEqual(jasmine.objectContaining({
          EUR: jasmine.objectContaining({
            name: "Euro",
            symbol: "€",
            ticker: "EUR"
          }),
          USD: jasmine.objectContaining({
            name: "United States dollar",
            symbol: "$",
            ticker: "USD"
          }),
          GBP: jasmine.objectContaining({
            name: "Pound sterling",
            symbol: "£",
            ticker: "GBP"
          })
        }));
        expect(ledger.tasks.TickerTask.instance.getCache()).toEqual(jasmine.objectContaining({
          EUR: jasmine.objectContaining({
            name: "Euro",
            symbol: "€",
            ticker: "EUR"
          }),
          USD: jasmine.objectContaining({
            name: "United States dollar",
            symbol: "$",
            ticker: "USD"
          }),
          GBP: jasmine.objectContaining({
            name: "Pound sterling",
            symbol: "£",
            ticker: "GBP"
          })
        }));
        return done();
      });
    });
    return afterAll(function() {
      ledger.tasks.Task.stopAllRunningTasks();
      ledger.tasks.Task.resetAllSingletonTasks();
      return jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });
  });

}).call(this);
