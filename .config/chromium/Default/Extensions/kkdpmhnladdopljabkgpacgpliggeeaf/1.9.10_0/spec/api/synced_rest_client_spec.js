(function() {
  describe("SyncedRestClient", function() {
    var client;
    client = null;
    return beforeEach(function() {
      return client = new ledger.storage.SyncedRestClient.instance;
    });
  });

}).call(this);
