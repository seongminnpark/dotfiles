(function() {
  describe("SyncedStore", function() {
    var decrypt, encrypt, jdecrypt, jencrypt, store;
    store = null;
    jencrypt = function(obj) {
      return store._encryptToJson(obj);
    };
    encrypt = function(obj) {
      return JSON.parse(jencrypt(obj));
    };
    decrypt = function(obj) {
      return store._decrypt(obj);
    };
    jdecrypt = function(json) {
      return decrypt(JSON.parse(json));
    };
    beforeEach(function(done) {
      chrome.storage.local.clear();
      store = new ledger.storage.SyncedStore("synced_store", "specs", "private_key", new ledger.storage.MemoryStore("specs"));
      store.client = jasmine.createSpyObj('restClient', ['get_settings_md5', 'get_settings', 'post_settings', 'put_settings', 'delete_settings']);
      store.client.get_settings_md5.and.callFake(function() {
        return Q.defer().promise;
      });
      return _.defer(function() {
        return done();
      });
    });
    it("returns the value just set", function(done) {
      return store.set({
        foo: 'bar'
      }, function() {
        return store.get(['foo'], function(result) {
          expect(result['foo']).toBe('bar');
          return done();
        });
      });
    });
    it("returns no value when it has been removed", function(done) {
      return store.set({
        foo: 'bar'
      }, function() {
        return store.remove(['foo'], function() {
          return store.get(['foo'], function(result) {
            expect(result['foo']).toBe(void 0);
            return done();
          });
        });
      });
    });
    it("returns the keys just set", function(done) {
      return store.set({
        foo: 'bar'
      }, function() {
        return store.keys(function(keys) {
          expect(keys).toContain('foo');
          return done();
        });
      });
    });
    it("doesn't return removed keys", function(done) {
      return store._secureStore.set({
        foo: 'bar',
        ledger: 'wallet'
      }, function() {
        return store.remove(['foo'], function() {
          return store.keys(function(keys) {
            expect(keys).toContain('ledger');
            expect(keys).not.toContain('foo');
            return done();
          });
        });
      });
    });
    it("posts when there is data on server side", function(done) {
      store.client.get_settings_md5.and.callFake(function() {
        return ledger.defer().reject({
          status: 404
        }).promise;
      });
      store.client.post_settings.and.callFake(function(data) {
        data = jdecrypt(data);
        expect(data['__hashes'][0]).toBe('7a38bf81f383f69433ad6e900d35b3e2385593f76a7b7ab5d4355b8ba41ee24b');
        expect(data['foo']).toBe('bar');
        done();
        return ledger.defer().promise;
      });
      store.client.put_settings.and.callFake(function() {
        return fail('Put settings shall not be called');
      });
      return store.set({
        foo: 'bar'
      });
    });
    it("merges and puts when there is data on server side", function(done) {
      store.client.get_settings_md5.and.callFake(function() {
        return ledger.defer().resolve('f48139f3d9bfdab0b5374212e06f3994').promise;
      });
      store.client.post_settings.and.throwError('Post settings shall not be called');
      store.client.get_settings.and.callFake(function() {
        return ledger.defer().resolve(encrypt({
          "__hashes": ["7a38bf81f383f69433ad6e900d35b3e2385593f76a7b7ab5d4355b8ba41ee24b"],
          "foo": "bar"
        })).promise;
      });
      store.client.put_settings.and.callFake(function(data) {
        data = jdecrypt(data);
        expect(data['__hashes'].length).toBe(2);
        expect(data['__hashes'][0]).toBe('64d7027314ccc697e64663e9ae203bc013bbce597b85df03ec9b2b2f7ef5201b');
        expect(data['response']).toBe(42);
        expect(data['foo']).toBe('bar');
        done();
        return ledger.defer().promise;
      });
      return store.set({
        response: 42
      });
    });
    return it("merges and puts when there is data on server side with old format", function(done) {
      store.client.get_settings_md5.and.callFake(function() {
        return ledger.defer().resolve('f48139f3d9bfdab0b5374212e06f3994').promise;
      });
      store.client.post_settings.and.throwError('Post settings shall not be called');
      store.client.get_settings.and.callFake(function() {
        return ledger.defer().resolve(encrypt({
          "foo": "bar"
        })).promise;
      });
      store.client.put_settings.and.callFake(function(data) {
        data = jdecrypt(data);
        expect(data['__hashes'].length).toBe(1);
        expect(data['__hashes'][0]).toBe('504b02065ae353c2e8fac6623db7699823b9a0f99cd7b73213fbbb319b644b1b');
        expect(data['response']).toBe(42);
        expect(data['foo']).toBe('bar');
        done();
        return ledger.defer().promise;
      });
      return store.set({
        response: 42
      });
    });
  });

  describe("SyncedStore (special case with custom store configurations)", function() {
    var decrypt, encrypt, jdecrypt, jencrypt, setup, store;
    store = null;
    jencrypt = function(obj) {
      return store._encryptToJson(obj);
    };
    encrypt = function(obj) {
      return JSON.parse(jencrypt(obj));
    };
    decrypt = function(obj) {
      return store._decrypt(obj);
    };
    jdecrypt = function(json) {
      return decrypt(JSON.parse(json));
    };
    setup = function(initialSetup) {
      var d;
      d = ledger.defer();
      store = new ledger.storage.SecureStore(initialSetup.name, initialSetup.key);
      store.set(initialSetup.local, function() {
        var memoryStore;
        memoryStore = new ledger.storage.MemoryStore("specs");
        return memoryStore.set(initialSetup.aux, function() {
          store = new ledger.storage.SyncedStore(initialSetup.name, initialSetup.addr, initialSetup.key, memoryStore);
          store.client = initialSetup.client || jasmine.createSpyObj('restClient', ['get_settings_md5', 'get_settings', 'post_settings', 'put_settings', 'delete_settings']);
          store.client.get_settings_md5.and.callFake(function() {
            return ledger.defer().resolve(initialSetup.md5).promise;
          });
          return d.resolve(store);
        });
      });
      return d.promise;
    };
    beforeEach(function() {
      return chrome.storage.local.clear();
    });
    it("doesn't pull if data are up to date", function(done) {
      store = new ledger.storage.SyncedStore("synced_store", "specs", "private_key", new ledger.storage.MemoryStore("specs"));
      store.client = jasmine.createSpyObj('restClient', ['get_settings_md5', 'get_settings', 'post_settings', 'put_settings', 'delete_settings']);
      store.client.get_settings_md5.and.callFake(function() {
        return ledger.defer().resolve('f48139f3d9bfdab0b5374212e06f3994').promise;
      });
      store._lastMd5 = 'f48139f3d9bfdab0b5374212e06f3994';
      store._setLastMd5('f48139f3d9bfdab0b5374212e06f3994');
      store.client.get_settings.and.callFake(function() {
        return fail("It should not pull settings if already up to date");
      });
      return _.defer(function() {
        return store._pull().fin(function() {
          expect().toBeUndefined();
          return done();
        });
      });
    });
    it("merges correctly when there is already old formatted data", function(done) {
      done = _.after(2, done);
      return setup({
        name: "synced_store",
        addr: "specs",
        key: "private_key",
        md5: 'f48139f3d9bfdab0b5374212e06f3994',
        local: {
          foo: '?',
          ledger: 'wallet'
        },
        aux: {
          __last_sync_md5: 'f48139f3d9bfdab0b5374212e06f3993'
        }
      }).then(function(store) {
        store.client.get_settings_md5.and.callFake(function() {
          return ledger.defer().resolve('f48139f3d9bfdab0b5374212e06f3994').promise;
        });
        store.client.get_settings.and.callFake(function() {
          var d;
          d = ledger.defer();
          setTimeout((function() {
            return d.resolve(encrypt({
              "__hashes": ["7a38bf81f383f69433ad6e900d35b3e2385593f76a7b7ab5d4355b8ba41ee24b"],
              "foo": "bar"
            }));
          }), 200);
          return d.promise;
        });
        store.keys(function(keys) {
          return expect(keys).toContain('foo');
        });
        return store.get(['foo'], function(result) {
          expect(result['foo']).toBe('?');
          return store.pull().then(function() {
            store.get(['foo'], function(result) {
              expect(result['foo']).toBe('bar');
              return done();
            });
            return store.keys(function(keys) {
              expect(keys).toContain('foo');
              expect(keys).not.toContain('ledger');
              return done();
            });
          });
        });
      });
    });
    it("merges correctly when there is already data", function(done) {
      return setup({
        name: "synced_store",
        addr: "specs",
        key: "private_key",
        md5: 'f48139f3d9bfdab0b5374212e06f3994',
        local: {
          foo: '?',
          ledger: 'wallet',
          __hashes: ['3b30160dd7a7076243220b73f1de84c0e7cfc376ef27638f26e66d01cbfcb04a']
        },
        aux: {
          __last_sync_md5: 'f48139f3d9bfdab0b5374212e06f3993'
        }
      }).then(function(store) {
        store.client.get_settings_md5.and.callFake(function() {
          return ledger.defer().resolve('f48139f3d9bfdab0b5374212e06f3994').promise;
        });
        store.client.get_settings.and.callFake(function() {
          var d;
          d = ledger.defer();
          setTimeout((function() {
            return d.resolve(encrypt({
              "__hashes": ["5be384c27ddb5d8279f8d35653503bd331c070cd938da3dc23138331795916e9", "7a38bf81f383f69433ad6e900d35b3e2385593f76a7b7ab5d4355b8ba41ee24b"],
              "foo": "bar"
            }));
          }), 200);
          return d.promise;
        });
        return store.pull().fin(function() {
          return store.get(['foo', 'ledger'], function(result) {
            expect(result['foo']).toBe('bar');
            expect(result['ledger']).toBeUndefined();
            return done();
          });
        });
      }).done();
    });
    it("doesn't push when the changes are meaningless", function(done) {
      return setup({
        name: "synced_store",
        addr: "specs",
        key: "private_key",
        md5: 'f48139f3d9bfdab0b5374212e06f3993',
        local: {
          foo: '?',
          ledger: 'wallet',
          __hashes: ['3b30160dd7a7076243220b73f1de84c0e7cfc376ef27638f26e66d01cbfcb04a']
        },
        aux: {
          __last_sync_md5: 'f48139f3d9bfdab0b5374212e06f3993'
        }
      }).then(function(store) {
        store.client.get_settings_md5.and.callFake(function() {
          return ledger.defer().resolve('f48139f3d9bfdab0b5374212e06f3993').promise;
        });
        store.client.post_settings.and.callFake(function() {
          return fail('It should not push meaningless changes');
        });
        store.client.put_settings.and.callFake(function() {
          return fail('It should not push meaningless changes');
        });
        return store.pull().fin(function() {
          store.set({
            foo: '?'
          });
          return store.push().then(function() {
            return store.get(['foo', 'ledger'], function(result) {
              expect(result['foo']).toBe('?');
              expect(result['ledger']).toBe('wallet');
              return done();
            });
          });
        });
      }).done();
    });
    it("doesn't push when the remote store is up to date", function(done) {
      return setup({
        name: "synced_store",
        addr: "specs",
        key: "private_key",
        md5: 'f48139f3d9bfdab0b5374212e06f3993',
        local: {
          foo: '?',
          ledger: 'wallet',
          __hashes: ['3b30160dd7a7076243220b73f1de84c0e7cfc376ef27638f26e66d01cbfcb04a']
        },
        aux: {
          __last_sync_md5: 'f48139f3d9bfdab0b5374212e06f3993'
        }
      }).then(function(store) {
        store.client.get_settings_md5.and.callFake(function() {
          return ledger.defer().resolve('f48139f3d9bfdab0b5374212e06f3993').promise;
        });
        store.client.get_settings.and.callFake(function() {
          var d;
          d = ledger.defer();
          setTimeout((function() {
            return d.resolve(encrypt({
              "__hashes": ["5be384c27ddb5d8279f8d35653503bd331c070cd938da3dc23138331795916e9", "7a38bf81f383f69433ad6e900d35b3e2385593f76a7b7ab5d4355b8ba41ee24b"],
              "foo": "bar"
            }));
          }), 200);
          return d.promise;
        });
        store.client.put_settings.and.callFake(function() {
          return fail("It pushed data");
        });
        store.client.post_settings.and.callFake(function() {
          return fail("It pushed data");
        });
        return store.pull().fin(function() {
          store.client.get_settings_md5.and.callFake(function() {
            return ledger.defer().resolve('f48139f3d9bfdab0b5374212e06f3994').promise;
          });
          store.set({
            foo: 'bar'
          });
          store.remove(['ledger']);
          return store.push().fail(function() {
            return _.noop();
          }).fin(function() {
            return store.get(['foo'], function(result) {
              expect(result['foo']).toBe('bar');
              return done();
            });
          });
        });
      }).done();
    });
    return it("works with substores too!", function(done) {
      return setup({
        name: "synced_store",
        add: "specs",
        key: "private_key",
        md5: 'f48139f3d9bfdab0b5374212e06f3993',
        local: {
          __preferences_btcUnit: "mBTC",
          __preferences_currency: "EUR",
          __i18n_favLang: "fr",
          __i18n_favLocale: "fr_FR"
        },
        aux: {
          __last_sync_md5: 'f48139f3d9bfdab0b5374212e06f3993'
        }
      }).then(function(store) {
        store.client.get_settings_md5.and.callFake(function() {
          return ledger.defer().resolve('f48139f3d9bfdab0b5374212e06f3993').promise;
        });
        return store.pull().fin(function() {
          return store.substore("preferences").keys(function(keys) {
            return store.substore("preferences").get(keys, function(result) {
              expect(result['btcUnit']).toBe('mBTC');
              expect(result['currency']).toBe('EUR');
              return done();
            });
          });
        });
      }).done();
    });
  });

}).call(this);
