(function() {
  var Cipher, EventHandler, IndexedDb, MEMORY_WARNING, assertDbIsPrepared, cipher, databaseName, db, e, encryptedDataBytesCounter, er, flushChanges, iterateThroughCollection, l, queue, resetCounter, storeChanges, storify, unstorify, updateCounter;

  this.ledger = {};

  try {
    importScripts('../utils/logger.js', '../../libs/btchip/lib/q.js', '../../libs/underscore-min.js');
  } catch (_error) {
    er = _error;
    console.error(er);
    return;
  }

  IndexedDb = this.indexedDB;

  db = null;

  databaseName = null;

  cipher = null;

  l = console.log.bind(console);

  e = console.error.bind(console);

  assertDbIsPrepared = function() {
    if (db == null) {
      throw new Error("Database not prepared");
    }
  };

  encryptedDataBytesCounter = 0;

  MEMORY_WARNING = 5 * 1024 * 1024;

  resetCounter = function() {
    return encryptedDataBytesCounter = 0;
  };

  updateCounter = function(data) {
    encryptedDataBytesCounter += data.byteLength;
    return data;
  };

  storify = function(obj) {
    return cipher.encrypt(JSON.stringify(obj)).then(function(data) {
      return {
        $loki: obj['$loki'],
        data: updateCounter(data)
      };
    });
  };

  unstorify = function(obj) {
    return cipher.decrypt(obj.data).then(function(json) {
      return JSON.parse(json);
    });
  };

  flushChanges = function(changes) {
    var change, d, index, store, transaction, _i, _len;
    d = Q.defer();
    transaction = db.transaction(db.objectStoreNames, 'readwrite');
    for (index = _i = 0, _len = changes.length; _i < _len; index = ++_i) {
      change = changes[index];
      store = transaction.objectStore(change.name);
      if (change.operation === "R") {
        store["delete"](change.id);
      } else {
        store.put(change.obj);
      }
    }
    transaction.oncomplete = function() {
      return d.resolve();
    };
    transaction.onerror = function(er) {
      e(er);
      return d.reject("Save error");
    };
    return d.promise;
  };

  storeChanges = function(changes, index, encryptedChanges) {
    if (index == null) {
      index = 0;
    }
    if (encryptedChanges == null) {
      encryptedChanges = [];
    }
    return Q.fcall(function() {
      var flushedChanges;
      if (encryptedDataBytesCounter > MEMORY_WARNING || index >= changes.length) {
        flushedChanges = encryptedChanges;
        encryptedChanges = [];
        return flushChanges(flushedChanges);
      }
    }).then(function() {
      var change;
      if (index >= changes.length) {
        return;
      }
      change = changes[index];
      changes[index] = null;
      return Q.fcall(function() {
        if (change.operation === 'R') {
          change.id = change.obj['$loki'];
          return change.obj = null;
        } else {
          return storify(change.obj).then(function(cryptedObj) {
            return change.obj = cryptedObj;
          });
        }
      }).then(function() {
        return storeChanges(changes, index + 1, encryptedChanges.concat(change));
      });
    });
  };

  iterateThroughCollection = function(collectionName, handler) {
    var d, result, store;
    if (handler == null) {
      handler = function(key, value) {
        return value;
      };
    }
    store = db.transaction(collectionName).objectStore(collectionName);
    d = Q.defer();
    result = [];
    store.openCursor().onsuccess = function(event) {
      var cursor;
      cursor = event.target.result;
      if (cursor != null) {
        try {
          result = result.concat(handler(cursor.key, cursor.value));
          return cursor["continue"]();
        } catch (_error) {
          er = _error;
          e(er);
          return d.reject(er);
        }
      } else {
        return d.resolve(result);
      }
    };
    return d.promise;

    /*
      var objectStore = db.transaction("customers").objectStore("customers");
    
      objectStore.openCursor().onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
          alert("Name for SSN " + cursor.key + " is " + cursor.value.name);
          cursor.continue();
        }
        else {
          alert("No more entries!");
        }
      };
     */
  };

  EventHandler = {
    prepare: function(_arg) {
      var d, dbName, password, request;
      dbName = _arg.dbName, password = _arg.password;
      d = Q.defer();
      databaseName = dbName;
      cipher = new Cipher(password);
      request = IndexedDb.open(dbName);
      request.onupgradeneeded = function(e) {
        db = e.target.result;
        if (!db.objectStoreNames.contains("__collections")) {
          return db.createObjectStore("__collections", {
            keyPath: 'name'
          });
        }
      };
      request.onsuccess = function(e) {
        db = e.target.result;
        return d.resolve();
      };
      request.onerror = function(e) {
        return d.reject(e);
      };
      return d.promise;
    },
    changes: function(_arg) {
      var changes;
      changes = _arg.changes;
      assertDbIsPrepared();
      resetCounter();
      return storeChanges(changes);
    },
    serialize: function(_arg) {
      _arg;
      assertDbIsPrepared();
      return iterateThroughCollection('__collections').then(function(collections) {
        var iterate;
        iterate = function(index) {
          var collection, inflateCollection;
          if (index == null) {
            index = 0;
          }
          if (index >= collections.length) {
            return collections;
          }
          collection = collections[index];
          inflateCollection = function(id, object) {
            return (collection.data || (collection.data = [])).push(object);
          };
          return iterateThroughCollection(collection.name, inflateCollection).then(function() {
            var maxId, unstorifyCollection;
            maxId = 0;
            unstorifyCollection = function(index) {
              if (index == null) {
                index = 0;
              }
              if (index >= collection.data.length) {
                return Q();
              }
              return unstorify(collection.data[index]).then(function(obj) {
                if (maxId <= obj.$loki) {
                  maxId = obj.$loki + 1;
                }
                collection.data[index] = obj;
                return unstorifyCollection(index + 1);
              });
            };
            return unstorifyCollection().then(function() {
              collection.maxId = maxId;
              return iterate(index + 1);
            });
          });
        };
        return iterate();
      }).then(function(collections) {
        return {
          filename: databaseName,
          collections: collections,
          databaseVersion: 1.1,
          engineVersion: 1.1,
          autosave: false,
          autosaveInterval: 5000,
          autosaveHandle: null,
          options: {
            "ENV": "BROWSER"
          },
          persistenceMethod: "localStorage",
          persistenceAdapter: null,
          events: {
            init: [null],
            "flushChanges": [],
            "close": [],
            "changes": [],
            "warning": []
          },
          ENV: "CORDOVA"
        };
      });
    },
    "delete": function() {
      assertDbIsPrepared();
      db.close();
      IndexedDb.deleteDatabase(databaseName);
      return Q();
    },
    declare: function(_arg) {
      var collection, d, request, store, transaction;
      collection = _arg.collection;
      assertDbIsPrepared();
      d = Q.defer();
      collection.data = [];
      transaction = db.transaction(['__collections'], 'readwrite');
      store = transaction.objectStore('__collections');
      request = store.put(collection);
      request.onerror = function() {
        return d.reject("Error");
      };
      request.onsuccess = function() {
        var version;
        version = db.version + 1;
        db.close();
        request = IndexedDb.open(databaseName, version);
        request.onupgradeneeded = function(e) {
          db = e.target.result;
          if (!db.objectStoreNames.contains(collection.name)) {
            return db.createObjectStore(collection.name, {
              keyPath: '$loki'
            });
          }
        };
        request.onsuccess = function(e) {
          db = e.target.result;
          return d.resolve();
        };
        return request.onerror = function(e) {
          return d.reject(e);
        };
      };
      return d.promise;
    }
  };

  queue = Q();

  this.onmessage = function(message) {
    return queue = queue.then((function(_this) {
      return function() {
        var queryId, _ref;
        queryId = message.data.queryId;
        return Q.fcall(EventHandler[(_ref = message.data) != null ? _ref.command : void 0], message.data).then(function(result) {
          return _this.postMessage({
            queryId: queryId,
            result: result
          });
        }).fail(function(error) {
          return _this.postMessage({
            queryId: queryId,
            error: error
          });
        });
      };
    })(this));
  };

  this.onerror = function(er) {
    return e(er);
  };

  Cipher = (function() {
    function Cipher(key, _arg) {
      var algorithm, encoding, _ref;
      _ref = _arg != null ? _arg : {}, algorithm = _ref.algorithm, encoding = _ref.encoding;
      this._keyPromise = null;
      this._encoding = encoding || 'utf-8';
      this._algorithm = algorithm || 'AES-CBC';
      this._key = key;
      this._encoder = new TextEncoder(this._encoding);
      this._decoder = new TextDecoder(this._encoding);
    }

    Cipher.prototype.encrypt = function(data) {
      data = this._encode(data);
      return this._importKey().then((function(_this) {
        return function(key) {
          return crypto.subtle.encrypt({
            name: _this._algorithm,
            iv: _this._iv()
          }, key, data);
        };
      })(this));
    };

    Cipher.prototype.decrypt = function(data) {
      return this._importKey().then((function(_this) {
        return function(key) {
          return crypto.subtle.decrypt({
            name: _this._algorithm,
            iv: _this._iv()
          }, key, data);
        };
      })(this)).then((function(_this) {
        return function(data) {
          return _this._decode(data);
        };
      })(this));
    };

    Cipher.prototype._encode = function(data) {
      return this._encoder.encode(data).buffer;
    };

    Cipher.prototype._decode = function(data) {
      return this._decoder.decode(data);
    };

    Cipher.prototype._importKey = function() {
      return this._keyPromise || (this._keyPromise = Q(crypto.subtle.digest({
        name: 'SHA-256'
      }, this._encode(this._key))).then((function(_this) {
        return function(key) {
          return crypto.subtle.importKey("raw", key, {
            name: _this._algorithm
          }, true, ['encrypt', 'decrypt']);
        };
      })(this)));
    };

    Cipher.prototype._iv = function() {
      return this.__iv || (this.__iv = new Uint8Array(16));
    };

    return Cipher;

  })();

}).call(this);
