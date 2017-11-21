(function() {
  var VERSION;

  if (ledger.m2fa == null) {
    ledger.m2fa = {};
  }

  VERSION = 1;

  ledger.m2fa.PairedSecureScreen = (function() {
    PairedSecureScreen.prototype.id = null;

    PairedSecureScreen.prototype.createdAt = null;

    PairedSecureScreen.prototype.name = null;

    PairedSecureScreen.prototype.uuid = null;

    PairedSecureScreen.prototype.platform = null;

    PairedSecureScreen.prototype.version = VERSION;

    function PairedSecureScreen(base) {
      if (base != null) {
        this._deserialize(base);
      }
    }

    PairedSecureScreen.prototype._deserialize = function(base) {
      this.id = base['id'];
      this.createdAt = new Date(base['created_at']);
      this.name = base['name'];
      this.uuid = base['uuid'];
      this.platform = base['platform'];
      return this.version = VERSION;
    };

    PairedSecureScreen.prototype.toStore = function(store) {
      var data, serialized;
      serialized = {
        id: this.id,
        created_at: this.createdAt.getTime(),
        name: this.name,
        uuid: this.uuid,
        platform: this.platform,
        version: VERSION
      };
      data = {};
      data["__m2fa_" + this.id] = serialized;
      store.set(data);
      return this;
    };

    PairedSecureScreen.prototype.toSyncedStore = function() {
      return this.toStore(ledger.storage.sync);
    };

    PairedSecureScreen.prototype.removeFromStore = function(store) {
      return store.remove(["__m2fa_" + this.id]);
    };

    PairedSecureScreen.prototype.removeFromSyncedStore = function() {
      return this.removeFromStore(ledger.storage.sync);
    };

    PairedSecureScreen.fromStore = function(id, store, callback) {
      var d;
      if (callback == null) {
        callback = void 0;
      }
      d = ledger.defer(callback);
      store.get("__m2fa_" + id, function(objects) {
        if (objects.length > 0) {
          return d.resolve(new this(objects[0]));
        } else {
          return d.reject(ledger.errors.NotFound);
        }
      });
      return d.promise;
    };

    PairedSecureScreen.fromSyncedStore = function(id, callback) {
      if (callback == null) {
        callback = void 0;
      }
      return this.fromStore(id, ledger.storage.sync, callback);
    };

    PairedSecureScreen.create = function(id, data) {
      return new this({
        id: id,
        name: data['name'],
        created_at: new Date().getTime(),
        uuid: data['uuid'],
        platform: data['platform'],
        version: VERSION
      });
    };

    PairedSecureScreen.getAllFromStore = function(store, callback) {
      var d;
      if (callback == null) {
        callback = void 0;
      }
      d = ledger.defer(callback);
      store.keys((function(_this) {
        return function(keys) {
          keys = _.filter(keys, function(key) {
            return key.match(/^__m2fa_/);
          });
          if (keys.length === 0) {
            return d.resolve([]);
          }
          return store.get(keys, function(objects) {
            var k, object, screens;
            screens = (function() {
              var _results;
              _results = [];
              for (k in objects) {
                object = objects[k];
                _results.push(new this(object));
              }
              return _results;
            }).call(_this);
            return d.resolve(screens);
          });
        };
      })(this));
      return d.promise;
    };

    PairedSecureScreen.getAllFromSyncedStore = function(callback) {
      if (callback == null) {
        callback = void 0;
      }
      return this.getAllFromStore(ledger.storage.sync, callback);
    };

    PairedSecureScreen.getMostRecentFromStore = function(store, callback) {
      var defer, p;
      if (callback == null) {
        callback = void 0;
      }
      defer = ledger.defer(callback);
      p = this.getAllFromStore(store).then(function(screens) {
        if (screens.length === 0) {
          throw ledger.errors["new"](ledger.errors.NotFound);
        }
        return _(screens).max(function(screen) {
          return screen.createdAt.getTime();
        });
      });
      return defer.resolve(p).promise;
    };

    PairedSecureScreen.getMostRecentFromSyncedStore = function(callback) {
      if (callback == null) {
        callback = void 0;
      }
      return this.getMostRecentFromStore(ledger.storage.sync, callback);
    };

    PairedSecureScreen.getByNameFromStore = function(store, name, callback) {
      var defer, p;
      if (callback == null) {
        callback = void 0;
      }
      defer = ledger.defer(callback);
      p = this.getAllFromStore(store).then(function(results) {
        return _(results).where({
          name: name
        })[0] || null;
      });
      return defer.resolve(p).promise;
    };

    PairedSecureScreen.getByNameFromSyncedStore = function(name, callback) {
      if (callback == null) {
        callback = void 0;
      }
      return this.getByNameFromStore(ledger.storage.sync, name, callback);
    };

    PairedSecureScreen.getAllGroupedByPropertyFromStore = function(store, property, callback) {
      var defer, p;
      if (callback == null) {
        callback = void 0;
      }
      defer = ledger.defer(callback);
      p = this.getAllFromStore(store).then(function(screens) {
        return _.groupBy(screens, function(s) {
          return s[property];
        });
      });
      return defer.resolve(p).promise;
    };

    PairedSecureScreen.getAllGroupedByPropertyFromSyncedStore = function(property, callback) {
      if (callback == null) {
        callback = void 0;
      }
      return this.getAllGroupedByPropertyFromStore(ledger.storage.sync, property, callback);
    };

    PairedSecureScreen.getAllGroupedByUuidFromStore = function(store, callback) {
      if (callback == null) {
        callback = void 0;
      }
      return this.getAllGroupedByPropertyFromStore(store, 'uuid', callback);
    };

    PairedSecureScreen.getAllGroupedByUuidFromSyncedStore = function(callback) {
      if (callback == null) {
        callback = void 0;
      }
      return this.getAllGroupedByUuidFromStore(ledger.storage.sync, callback);
    };

    PairedSecureScreen.getScreensByUuidFromStore = function(store, uuid, callback) {
      var defer, p;
      if (callback == null) {
        callback = void 0;
      }
      defer = ledger.defer(callback);
      p = this.getAllFromStore(store).then(function(results) {
        return _(results).where({
          uuid: uuid
        });
      });
      return defer.resolve(p).promise;
    };

    PairedSecureScreen.getScreensByUuidFromSyncedStore = function(uuid, callback) {
      if (callback == null) {
        callback = void 0;
      }
      return this.getScreensByUuidFromStore(ledger.storage.sync, uuid, callback);
    };

    PairedSecureScreen.removePairedSecureScreensFromStore = function(store, screens, callback) {
      var screen;
      if (callback == null) {
        callback = void 0;
      }
      return store.remove((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = screens.length; _i < _len; _i++) {
          screen = screens[_i];
          _results.push("__m2fa_" + screen.id);
        }
        return _results;
      })(), callback);
    };

    PairedSecureScreen.removePairedSecureScreensFromSyncedStore = function(screens, callback) {
      return this.removePairedSecureScreensFromStore(ledger.storage.sync, screens, callback);
    };

    PairedSecureScreen.removePairedSecureScreensByUuidFromStore = function(store, uuid, callback) {
      if (callback == null) {
        callback = void 0;
      }
      return this.getScreensByUuidFromStore(store, uuid)["catch"](function(error) {
        if (typeof callback === "function") {
          callback(false, error);
        }
        throw error;
      }).then((function(_this) {
        return function(screens) {
          return _this.removePairedSecureScreensFromStore(store, screens, callback);
        };
      })(this));
    };

    PairedSecureScreen.removePairedSecureScreensByUuidFromSyncedStore = function(uuid, callback) {
      if (callback == null) {
        callback = void 0;
      }
      return this.removePairedSecureScreensByUuidFromStore(ledger.storage.sync, uuid, callback);
    };

    return PairedSecureScreen;

  })();

}).call(this);
