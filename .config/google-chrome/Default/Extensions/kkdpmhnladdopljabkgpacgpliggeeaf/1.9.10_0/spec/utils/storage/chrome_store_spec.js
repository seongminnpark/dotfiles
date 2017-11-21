(function() {
  describe("ChromeStore", function() {
    var obj, store;
    store = null;
    obj = {
      cb: function() {}
    };
    beforeEach(function() {
      return store = new ledger.storage.ChromeStore("chrome_test");
    });
    return it("_raw_keys return keys from items", function() {
      spyOn(chrome.storage.local, 'get').and.callFake(function(raw_keys, cb) {
        return cb({
          key1: 1,
          key2: 2
        });
      });
      spyOn(obj, 'cb');
      store._raw_keys(obj.cb);
      return expect(obj.cb).toHaveBeenCalledWith(["key1", "key2"]);
    });
  });

}).call(this);
