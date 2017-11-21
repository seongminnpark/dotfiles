(function() {
  describe("m2fa", function() {
    beforeAll(function() {
      spyOn(_, 'defer');
      ledger.storage.sync = new ledger.storage.SyncedStore("synced_store", "private_key");
      return ledger.storage.sync.client = jasmine.createSpyObj('restClient', ['get_settings_md5', 'get_settings', 'post_settings', 'put_settings', 'delete_settings']);
    });
    beforeEach(function() {
      this.$ = ledger.m2fa;
      spyOn(this.$, 'Client').and.returnValue(jasmine.createSpyObj('client', ['on', 'off', 'once', 'sendChallenge', 'rejectPairing', 'confirmPairing', 'requestValidation']));
      return this.$._clientFactory = function(pairingId) {
        return new ledger.m2fa.Client(pairingId);
      };
    });
    it("init device pairing with a new random pairingId, a client, listen client event, and return the pairingId and a promise", function() {
      var client, pairingId, result;
      pairingId = "a_random_pairing_id";
      spyOn(this.$, '_nextPairingId').and.returnValue(pairingId);
      result = this.$.pairDevice();
      expect(this.$._nextPairingId).toHaveBeenCalled();
      client = this.$.clients[pairingId];
      expect(client).toBeDefined();
      expect(this.$.Client).toHaveBeenCalledWith(pairingId);
      expect(client.on.calls.count()).toBe(3);
      expect(client.on.calls.argsFor(0)[0]).toBe('m2fa.identify');
      expect(client.on.calls.argsFor(0)[1]).toEqual(jasmine.any(Function));
      expect(client.on.calls.argsFor(1)[0]).toBe('m2fa.challenge');
      expect(client.on.calls.argsFor(1)[1]).toEqual(jasmine.any(Function));
      expect(result).toEqual(jasmine.any(Array));
      expect(result.length).toBe(3);
      expect(result[0]).toBe(pairingId);
      return expect(result[1].constructor.name).toBe('Promise');
    });
    it("prefix pairingId when it save asociated label", function() {
      spyOn(ledger.m2fa.PairedSecureScreen, 'create').and.callThrough();
      spyOn(ledger.m2fa.PairedSecureScreen.prototype, 'toStore');
      this.$.saveSecureScreen("a_random_pairing_id", {
        name: 'a_name',
        platform: 'a_platform',
        uuid: 'an_uuid'
      });
      expect(ledger.m2fa.PairedSecureScreen.create).toHaveBeenCalledWith("a_random_pairing_id", {
        name: 'a_name',
        platform: 'a_platform',
        uuid: 'an_uuid'
      });
      return expect(ledger.m2fa.PairedSecureScreen.prototype.toStore).toHaveBeenCalled();
    });
    it("remove pairingId prefix when it get all pairing labels", function() {
      var result;
      spyOn(ledger.storage.sync, 'keys').and.callFake(function(cb) {
        return cb(["__m2fa_a_random_pairing_id", 'onOtherBadKey']);
      });
      spyOn(ledger.storage.sync, 'get').and.callFake(function(key, cb) {
        return cb({
          "__m2fa_a_random_pairing_id": "label"
        });
      });
      result = this.$.getPairingIds();
      expect(result.constructor.name).toBe('Promise');
      expect(ledger.storage.sync.get).toHaveBeenCalled();
      expect(ledger.storage.sync.get.calls.argsFor(0)[0]).toEqual(["__m2fa_a_random_pairing_id"]);
      return expect(result.valueOf()).toEqual({
        "a_random_pairing_id": "label"
      });
    });
    it("get client corresponding to pairingId, clear previous listeners, set new listeners and call requestValidation on validateTx", function() {
      var c, client, pairingId, r, tx, _ref;
      tx = {
        authorizationPaired: "XxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx"
      };
      pairingId = "a_random_pairing_id";
      client = jasmine.createSpyObj('client', ['on', 'off', 'once', 'sendChallenge', 'rejectPairing', 'confirmPairing', 'requestValidation']);
      spyOn(this.$, '_getClientFor').and.returnValue(client);
      spyOn(ledger.api.M2faRestClient.instance, 'wakeUpSecureScreens');
      _ref = this.$.validateTx(tx, pairingId), c = _ref[0], r = _ref[1];
      expect(r.constructor.name).toBe('Promise');
      expect(ledger.api.M2faRestClient.instance.wakeUpSecureScreens).toHaveBeenCalledWith([pairingId]);
      expect(this.$._getClientFor).toHaveBeenCalledWith(pairingId);
      expect(client.off.calls.count()).toBe(2);
      expect(client.off.calls.argsFor(0)).toEqual(["m2fa.accept"]);
      expect(client.off.calls.argsFor(1)).toEqual(["m2fa.response"]);
      expect(client.on.calls.argsFor(0)[0]).toBe('m2fa.accept');
      expect(client.on.calls.argsFor(0)[1]).toEqual(jasmine.any(Function));
      expect(client.on.calls.argsFor(1)[0]).toBe('m2fa.response');
      expect(client.on.calls.argsFor(1)[1]).toEqual(jasmine.any(Function));
      return expect(client.requestValidation).toHaveBeenCalledWith(tx.authorizationPaired);
    });
    xit("get call validateTx for each client on validateTxOnAll", function() {
      var c, r, tx, _ref;
      tx = {
        _out: {
          authorizationPaired: "XxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx"
        }
      };
      spyOn(this.$, 'getPairingIds').and.returnValue(Q([
        {
          "a_random_pairing_id": "label"
        }
      ]));
      spyOn(this.$, 'validateTx').and.returnValue(Q());
      console.log(typeof ledger.api.M2faRestClient.instance);
      spyOn(ledger.api.M2faRestClient.instance, 'wakeUpSecureScreens');
      _ref = this.$.validateTxOnAll(tx), c = _ref[0], r = _ref[1];
      expect(ledger.api.M2faRestClient.instance.wakeUpSecureScreens).toHaveBeenCalledWith(["a_random_pairing_id"]);
      expect(this.$.validateTx.calls.count()).toBe(1);
      return expect(this.$.validateTx.calls.argsFor(0)).toEqual([tx, "a_random_pairing_id"]);
    });
    it("_nextPairingId call _randomPairingId", function() {
      spyOn(this.$, '_randomPairingId');
      this.$._nextPairingId();
      return expect(this.$._randomPairingId).toHaveBeenCalled();
    });
    it("_randomPairingId return a 17 bytes hex encoded string", function() {
      var i, r, _i, _results;
      _results = [];
      for (i = _i = 0; _i < 50; i = ++_i) {
        r = this.$._randomPairingId();
        expect(r).toEqual(jasmine.any(String));
        _results.push(expect(r).toMatch(/^[0-9a-fA-F]{34}$/));
      }
      return _results;
    });
    return it("_getClientFor return client or create it if not present", function() {
      var r;
      this.$.clients["9876"] = "saved_client";
      r = this.$._getClientFor("9876");
      expect(r).toBe("saved_client");
      expect(this.$.Client).not.toHaveBeenCalled();
      r = this.$._getClientFor("0123");
      expect(this.$.Client).toHaveBeenCalledWith("0123");
      return expect(this.$.clients["0123"]).toEqual(r);
    });
  });

}).call(this);
