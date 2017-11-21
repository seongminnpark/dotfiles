(function() {
  describe("SecureStore", function() {
    var store;
    store = null;
    beforeEach(function() {
      return store = new ledger.storage.SecureStore("secure_test", "key");
    });
    it("encrypt key", function() {
      spyOn(store._aes, 'encrypt').and.returnValue('encrypted_key');
      spyOn(ledger.storage.Store.prototype, '_preprocessKey').and.returnValue('preprocessed_key');
      expect(store._preprocessKey("key")).toBe("preprocessed_key");
      expect(store._aes.encrypt).toHaveBeenCalledWith("key");
      return expect(ledger.storage.Store.prototype._preprocessKey).toHaveBeenCalledWith("encrypted_key");
    });
    it("decrypt key", function() {
      spyOn(store._aes, 'decrypt').and.returnValue('decrypted_key');
      spyOn(ledger.storage.Store.prototype, '_deprocessKey').and.returnValue('deprocessed_key');
      expect(store._deprocessKey("encrypted_key")).toBe("decrypted_key");
      expect(ledger.storage.Store.prototype._deprocessKey).toHaveBeenCalledWith("encrypted_key");
      return expect(store._aes.decrypt).toHaveBeenCalledWith("deprocessed_key");
    });
    it("encrypt value", function() {
      spyOn(store._aes, 'encrypt').and.returnValue('encrypted_value');
      spyOn(ledger.storage.Store.prototype, '_preprocessValue').and.returnValue('preprocessed_value');
      expect(store._preprocessValue("value")).toBe("encrypted_value");
      expect(ledger.storage.Store.prototype._preprocessValue).toHaveBeenCalledWith("value");
      return expect(store._aes.encrypt).toHaveBeenCalledWith("preprocessed_value");
    });
    return it("encrypt value", function() {
      spyOn(store._aes, 'decrypt').and.returnValue('decrypted_value');
      spyOn(ledger.storage.Store.prototype, '_deprocessValue').and.returnValue('deprocessed_value');
      expect(store._deprocessValue("encrypted_value")).toBe("deprocessed_value");
      expect(ledger.storage.Store.prototype._deprocessValue).toHaveBeenCalledWith("decrypted_value");
      return expect(store._aes.decrypt).toHaveBeenCalledWith("encrypted_value");
    });
  });

}).call(this);
