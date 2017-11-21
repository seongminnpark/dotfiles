(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (ledger.database == null) {
    ledger.database = {};
  }

  ledger.database.Database = (function(_super) {
    __extends(Database, _super);

    function Database(name, persistenceAdapter) {
      this._name = name;
      this._persistenceAdapter = persistenceAdapter;
      this._changes = [];
    }

    Database.prototype.load = function(callback) {
      return this._persistenceAdapter.serialize().then((function(_this) {
        return function(json) {
          var collection, er, _i, _len, _ref;
          try {
            l("Serialized ", json);
            _this._db = new loki(_this._name, {
              ENV: 'BROWSER'
            });
            if (json != null) {
              _this._db.loadJSON(JSON.stringify(json));
            }
            _this._db.save = _this.scheduleFlush.bind(_this);
            _ref = _this.listCollections();
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              collection = _ref[_i];
              collection.setChangesApi(true);
            }
          } catch (_error) {
            er = _error;
            e(er);
          }
          if (typeof callback === "function") {
            callback();
          }
          return _this.emit('loaded');
        };
      })(this)).fail(function(er) {
        return e(er);
      }).done();
    };

    Database.prototype.addCollection = function(collectionName) {
      var collection;
      collection = this._db.addCollection(collectionName);
      collection.setChangesApi(true);
      this._persistenceAdapter.declare(collection);
      return collection;
    };

    Database.prototype.listCollections = function() {
      return this._db.collections || [];
    };

    Database.prototype.getCollection = function(collectionName) {
      return this._db.getCollection(collectionName);
    };

    Database.prototype._migrateJsonToLoki125 = function(json) {
      var key, value, _results;
      if ((json['__version'] == null) || json['__version'] !== '1.2.5') {
        _results = [];
        for (key in json) {
          value = json[key];
          if (!key.match(/^(__version)$/)) {
            _results.push(this._migrateDbJsonToLoki125(value));
          }
        }
        return _results;
      }
    };

    Database.prototype._migrateDbJsonToLoki125 = function(dbJson) {
      var collection, item, _i, _len, _ref, _results;
      if (!((dbJson != null) && (dbJson['collections'] != null))) {
        return;
      }
      _ref = dbJson['collections'];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        collection = _ref[_i];
        _results.push((function() {
          var _j, _len1, _ref1, _results1;
          _ref1 = collection['data'];
          _results1 = [];
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            item = _ref1[_j];
            if (item['id']) {
              item['$loki'] = item['id'];
            }
            item['id'] = item['originalId'] || item['$loki'];
            _results1.push(delete item['originalId']);
          }
          return _results1;
        })());
      }
      return _results;
    };

    Database.prototype.perform = function(callback) {
      if (this._db != null) {
        return typeof callback === "function" ? callback() : void 0;
      } else {
        return this.once('loaded', callback);
      }
    };

    Database.prototype.flush = function(callback) {
      var changes;
      changes = this._changes;
      this._changes = [];
      return this.perform((function(_this) {
        return function() {
          if (_this._scheduledFlush != null) {
            clearTimeout(_this._scheduledFlush);
          }
          return _this._persistenceAdapter.saveChanges(changes).then(function() {
            return typeof callback === "function" ? callback() : void 0;
          });
        };
      })(this));
    };

    Database.prototype.scheduleFlush = function() {
      if (this._db == null) {
        return;
      }
      this._changes = this._changes.concat(this._db.generateChangesNotification());
      this._db.clearChanges();
      if (this._scheduledFlush != null) {
        clearTimeout(this._scheduledFlush);
      }
      if (this._changes.length > 50) {
        this._scheduledFlush = null;
        return this.flush();
      } else {
        return this._scheduledFlush = setTimeout((function(_this) {
          return function() {
            _this._scheduledFlush = null;
            return _this.flush();
          };
        })(this), 1000);
      }
    };

    Database.prototype.isLoaded = function() {
      if (this._db != null) {
        return true;
      } else {
        return false;
      }
    };

    Database.prototype.getDb = function() {
      if (this._db == null) {
        throw 'Unable to use database right now (not loaded)';
      }
      return this._db;
    };

    Database.prototype["delete"] = function(callback) {
      return this._persistenceAdapter["delete"]().then(function() {
        return typeof callback === "function" ? callback() : void 0;
      });
    };

    Database.prototype.close = function() {
      this.flush((function(_this) {
        return function() {
          return _this._persistenceAdapter.stop();
        };
      })(this));
      return this._db = null;
    };

    return Database;

  })(EventEmitter);

  _.extend(ledger.database, {
    init: function(callback) {
      var _base;
      return ledger.database.main = ledger.database.open('main_' + ledger.storage.databases.name, typeof (_base = ledger.storage.databases).getCipher === "function" ? _base.getCipher().key : void 0, function() {
        return typeof callback === "function" ? callback() : void 0;
      });
    },
    open: function(databaseName, encryptionKey, callback) {
      var db, persistenceAdapter;
      persistenceAdapter = new ledger.database.DatabasePersistenceAdapter(databaseName, encryptionKey);
      db = new ledger.database.Database(databaseName, persistenceAdapter);
      db.load(callback);
      return db;
    },
    close: function() {
      var _ref;
      if ((_ref = ledger.database.main) != null) {
        _ref.close();
      }
      return ledger.database.main = null;
    }
  });

}).call(this);
