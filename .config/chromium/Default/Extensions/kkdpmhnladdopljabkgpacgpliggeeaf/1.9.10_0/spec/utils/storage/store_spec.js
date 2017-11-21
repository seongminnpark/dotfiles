(function() {
  describe("Store", function() {
    var obj, store;
    store = null;
    obj = {
      cb: function() {}
    };
    beforeEach(function() {
      return store = new ledger.storage.Store("a.pretty.ns");
    });
    it("transform key to namespaced key", function() {
      return expect(store._to_ns_key("key")).toBe("a.pretty.ns.key");
    });
    it("transform keys to namespaced keys", function() {
      return expect(store._to_ns_keys(["key1", "key2"])).toEqual(["a.pretty.ns.key1", "a.pretty.ns.key2"]);
    });
    it("transform namespaced key to key", function() {
      return expect(store._from_ns_key("a.pretty.ns.key")).toBe("key");
    });
    it("transform namespaced keys to keys", function() {
      return expect(store._from_ns_keys(["a.pretty.ns.key1", "a.pretty.ns.key2"])).toEqual(["key1", "key2"]);
    });
    it("filter namespaced keys", function() {
      return expect(store._from_ns_keys(["a.pretty.ns.key1", "an.other.ns.key2"])).toEqual(["key1"]);
    });
    it("preprocess key should namespace key", function() {
      return expect(store._preprocessKey("key")).toBe("a.pretty.ns.key");
    });
    it("preprocess keys should preprocess each key", function() {
      return expect(store._preprocessKeys(["key1", "key2"])).toEqual(["a.pretty.ns.key1", "a.pretty.ns.key2"]);
    });
    it("preprocess value should stringify to JSON", function() {
      return expect(store._preprocessValue([1, 2, 3])).toBe("[1,2,3]");
    });
    it("preprocess items should preprocess keys and values", function() {
      return expect(store._preprocessItems({
        key: [1, 2, 3]
      })).toEqual({
        "a.pretty.ns.key": "[1,2,3]"
      });
    });
    it("filter falsy keys and function values during items preprocess", function() {
      return expect(store._preprocessItems({
        key: 42,
        "": 1,
        undefined: 2,
        "null": 3
      })).toEqual({
        "a.pretty.ns.key": "42"
      });
    });
    it("deprocess key should slice namespace", function() {
      return expect(store._deprocessKey("a.pretty.ns.key")).toBe("key");
    });
    it("deprocess keys should deprocess each key", function() {
      return expect(store._deprocessKeys(["a.pretty.ns.key1", "a.pretty.ns.key2"])).toEqual(["key1", "key2"]);
    });
    it("deprocess keys should skip bad keys", function() {
      return expect(store._deprocessKeys(["a.pretty.ns.key1", "a.pretty.ns.key2"])).toEqual(["key1", "key2"]);
    });
    it("deprocess value should parse JSON", function() {
      return expect(store._deprocessValue("[1,2,3]")).toEqual([1, 2, 3]);
    });
    it("deprocess items should deprocess keys and values", function() {
      return expect(store._deprocessItems({
        "a.pretty.ns.key": "[1,2,3]"
      })).toEqual({
        key: [1, 2, 3]
      });
    });
    it("calls _raw_set with preprocessed items on set", function() {
      spyOn(store, '_raw_set').and.callFake(function(raw_items, cb) {
        return cb();
      });
      spyOn(obj, 'cb');
      store.set({
        key: 42
      }, obj.cb);
      expect(store._raw_set.calls.count()).toBe(1);
      expect(store._raw_set.calls.argsFor(0)[0]).toEqual({
        "a.pretty.ns.key": "42"
      });
      return expect(obj.cb).toHaveBeenCalled();
    });
    it("#get calls _raw_get with preprocessed keys", function() {
      var spy;
      spy = spyOn(store, '_raw_get').and.callFake(function(raw_keys, cb) {
        return cb({
          "a.pretty.ns.key": "42"
        });
      });
      spyOn(obj, 'cb');
      store.get("key", obj.cb);
      expect(store._raw_get.calls.count()).toBe(1);
      expect(store._raw_get.calls.argsFor(0)[0]).toEqual(["a.pretty.ns.key"]);
      expect(obj.cb).toHaveBeenCalledWith({
        key: 42
      });
      spy.and.callFake(function(raw_keys, cb) {
        return cb({
          "a.pretty.ns.key1": "1",
          "a.pretty.ns.key2": "2"
        });
      });
      store.get(["key1", "key2"], obj.cb);
      expect(store._raw_get.calls.argsFor(1)[0]).toEqual(["a.pretty.ns.key1", "a.pretty.ns.key2"]);
      return expect(obj.cb).toHaveBeenCalledWith({
        key1: 1,
        key2: 2
      });
    });
    it("#keys calls _raw_keys", function() {
      spyOn(store, '_raw_keys').and.callFake(function(cb) {
        return cb(["a.pretty.ns.key1", "a.pretty.ns.key2"]);
      });
      spyOn(obj, 'cb');
      store.keys(obj.cb);
      expect(store._raw_keys).toHaveBeenCalled();
      return expect(obj.cb).toHaveBeenCalledWith(["key1", "key2"]);
    });
    it("#keys filter bad keys", function() {
      spyOn(store, '_raw_keys').and.callFake(function(cb) {
        return cb(["a.pretty.ns.key1", "a.other.ns.key2"]);
      });
      spyOn(obj, 'cb');
      store.keys(obj.cb);
      expect(store._raw_keys).toHaveBeenCalled();
      return expect(obj.cb).toHaveBeenCalledWith(["key1"]);
    });
    it("#remove calls _raw_remove with preprocessed keys", function() {
      var spy;
      spy = spyOn(store, '_raw_remove').and.callFake(function(raw_keys, cb) {
        return cb({
          "a.pretty.ns.key": "42"
        });
      });
      spyOn(obj, 'cb');
      store.remove("key", obj.cb);
      expect(store._raw_remove.calls.count()).toBe(1);
      expect(store._raw_remove.calls.argsFor(0)[0]).toEqual(["a.pretty.ns.key"]);
      expect(obj.cb).toHaveBeenCalledWith({
        key: 42
      });
      spy.and.callFake(function(raw_keys, cb) {
        return cb({
          "a.pretty.ns.key1": "1",
          "a.pretty.ns.key2": "2"
        });
      });
      store.remove(["key1", "key2"], obj.cb);
      expect(store._raw_remove.calls.argsFor(1)[0]).toEqual(["a.pretty.ns.key1", "a.pretty.ns.key2"]);
      return expect(obj.cb).toHaveBeenCalledWith({
        key1: 1,
        key2: 2
      });
    });
    return it("#clear calls _raw_keys and _raw_remove", function() {
      spyOn(store, '_raw_keys').and.callFake(function(cb) {
        return cb(["a.pretty.ns.key1", "a.pretty.ns.key2"]);
      });
      spyOn(store, '_raw_remove').and.callFake(function(raw_keys, cb) {
        return cb({
          "a.pretty.ns.key1": "1",
          "a.pretty.ns.key2": "2"
        });
      });
      spyOn(obj, 'cb');
      store.clear(obj.cb);
      expect(store._raw_keys).toHaveBeenCalled();
      expect(store._raw_remove.calls.count()).toBe(1);
      expect(store._raw_remove.calls.argsFor(0)[0]).toEqual(["a.pretty.ns.key1", "a.pretty.ns.key2"]);
      return expect(obj.cb).toHaveBeenCalledWith({
        key1: 1,
        key2: 2
      });
    });
  });

}).call(this);
