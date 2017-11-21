(function() {
  var $info, $logger, Errors, OperationTypes,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  OperationTypes = {
    SET: 0,
    REMOVE: 1
  };

  Errors = {
    NoRemoteData: 0,
    NetworkError: 1,
    NoChanges: 2,
    Closed: 3
  };

  $logger = function() {
    return ledger.utils.Logger.getLoggerByTag('SyncedStore');
  };

  $info = function() {
    var args, _ref;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return (_ref = $logger()).info.apply(_ref, args);
  };

  ledger.storage.SyncedStore = (function(_super) {
    __extends(SyncedStore, _super);

    SyncedStore.prototype.PULL_INTERVAL_DELAY = ledger.config.syncRestClient.pullIntervalDelay || 10000;

    SyncedStore.prototype.PULL_THROTTLE_DELAY = ledger.config.syncRestClient.pullThrottleDelay || 1000;

    SyncedStore.prototype.PUSH_DEBOUNCE_DELAY = ledger.config.syncRestClient.pushDebounceDelay || 1000;

    SyncedStore.prototype.HASHES_CHAIN_MAX_SIZE = 20;

    function SyncedStore(name, addr, key, auxiliaryStore) {
      if (auxiliaryStore == null) {
        auxiliaryStore = ledger.storage.wallet;
      }
      SyncedStore.__super__.constructor.call(this, name);
      this._secureStore = new ledger.storage.SecureStore(name, key);
      this.client = ledger.api.SyncRestClient.instance(addr);
      this._throttled_pull = ledger.utils.promise.throttle(_.bind((function() {
        return this._pull();
      }), this), this.PULL_THROTTLE_DELAY, {
        immediate: true
      });
      this._debounced_push = ledger.utils.promise.debounce(_.bind((function() {
        return this._push();
      }), this), this.PUSH_DEBOUNCE_DELAY);
      this._auxiliaryStore = auxiliaryStore;
      this._changes = [];
      this._unlockMethods = _.lock(this, ['set', 'get', 'remove', 'clear', 'pull', 'push', 'keys']);
      this._deferredPull = null;
      this._deferredPush = null;
      this._data = {};
      _.defer((function(_this) {
        return function() {
          return _this._auxiliaryStore.get(['__last_sync_md5', '__sync_changes'], function(item) {
            _this._lastMd5 = item.__last_sync_md5;
            _this._unlockMethods();
            return _this.getAll(function(data) {
              _this._data = data;
              if (item['__sync_changes'] != null) {
                _this._changes = _this._cleanChanges(data, item['__sync_changes'].concat(_this._changes));
              }
              $info('Initialize store: ', {
                md5: _this._lastMd5,
                changes: _.clone(_this._changes),
                init: item,
                data: data
              });
              _this.pull();
              if (_this._changes.length > 0) {
                return _this.push();
              }
            });
          });
        };
      })(this));
    }

    SyncedStore.prototype.pull = function() {
      return this._throttled_pull();
    };

    SyncedStore.prototype.push = function() {
      return this._debounced_push();
    };

    SyncedStore.prototype.set = function(items, cb) {
      var key, value;
      if (items == null) {
        return typeof cb === "function" ? cb() : void 0;
      }
      for (key in items) {
        value = items[key];
        if (this._areChangesMeaningful(this._data, [
          {
            type: OperationTypes.SET,
            key: key,
            value: value
          }
        ])) {
          this._changes.push({
            type: OperationTypes.SET,
            key: key,
            value: value
          });
        }
      }
      this._debounced_push();
      return this._saveChanges(function() {
        return typeof cb === "function" ? cb() : void 0;
      });
    };

    SyncedStore.prototype.get = function(keys, cb) {
      var changes, handledKeys, key, values, _i, _len, _ref;
      if (!_(keys).isArray()) {
        keys = [keys];
      }
      values = {};
      handledKeys = [];
      for (_i = 0, _len = keys.length; _i < _len; _i++) {
        key = keys[_i];
        if (!((changes = _.where(this._changes, {
          key: key
        })).length > 0)) {
          continue;
        }
        if (_(changes).last().type === OperationTypes.SET) {
          values[key] = _(changes).last().value;
        }
        handledKeys.push(key);
      }
      keys = (_ref = _(keys)).without.apply(_ref, handledKeys);
      return this._secureStore.get(keys, function(storeValues) {
        return typeof cb === "function" ? cb(_.extend(storeValues, values)) : void 0;
      });
    };

    SyncedStore.prototype.keys = function(cb) {
      return this._secureStore.keys((function(_this) {
        return function(keys) {
          var key, keyChanges, _ref;
          _ref = _(_this._changes).groupBy('key');
          for (key in _ref) {
            keyChanges = _ref[key];
            if (_(keyChanges).last().type === OperationTypes.REMOVE) {
              keys = _(keys).without(key);
            } else if (!_(keys).contains(key)) {
              keys.push(key);
            }
          }
          return typeof cb === "function" ? cb(keys) : void 0;
        };
      })(this));
    };

    SyncedStore.prototype.remove = function(keys, cb) {
      var key, _i, _len;
      if (keys == null) {
        return typeof cb === "function" ? cb() : void 0;
      }
      for (_i = 0, _len = keys.length; _i < _len; _i++) {
        key = keys[_i];
        if (this._areChangesMeaningful(this._data, [
          {
            type: OperationTypes.REMOVE,
            key: key
          }
        ])) {
          this._changes.push({
            type: OperationTypes.REMOVE,
            key: key
          });
        }
      }
      this._debounced_push();
      return _.defer((function(_this) {
        return function() {
          return typeof cb === "function" ? cb() : void 0;
        };
      })(this));
    };

    SyncedStore.prototype.clear = function(cb) {
      this._secureStore.clear(cb);
      this._clearChanges();
      return this.client.delete_settings();
    };

    SyncedStore.prototype._pull = function() {
      if (this.isClosed()) {
        return ledger.defer().reject(Errors.Closed).promise;
      }
      return this.client.get_settings_md5().then((function(_this) {
        return function(md5) {
          $info('Remote md5: ', md5, ', local md5', _this._lastMd5);
          if (_this._lastMd5 === md5) {
            return true;
          }
          return _this.client.get_settings().then(function(data) {
            $info('PULL, before decrypt ', data);
            data = Try(function() {
              return _this._decrypt(data);
            });
            $info('PULL, after decrypt ', data.getOrElse("Unable to decrypt data"));
            if (data.isFailure()) {
              return;
            }
            data = data.getValue();
            $info('Changes before merge', _this._changes);
            return _this._merge(data).then(function() {
              _this._setLastMd5(md5);
              $info("Storage pulled");
              _this.emit('pulled');
              return true;
            });
          });
        };
      })(this)).fail((function(_this) {
        return function(e) {
          $error("Pull error", e);
          if (e.status === 404) {
            throw Errors.NoRemoteData;
          }
          throw Errors.NetworkError;
        };
      })(this));
    };

    SyncedStore.prototype._merge = function(remoteData) {
      return this._getAllData().then((function(_this) {
        return function(localData) {
          var localHashes, nextCommitData, nextCommitHash, remoteHashes, _ref;
          $info('Data before merge ', localData);
          remoteHashes = (remoteData['__hashes'] || []).join(' ');
          localHashes = (localData['__hashes'] || []).join(' ').substr(0, 2 * 64 + 1);
          if (remoteHashes.length === 0 || localHashes.length === 0) {
            $info('Merge scenario 1', remoteHashes, localHashes);
            return _this._setAllData(remoteData);
          } else if ((remoteHashes.indexOf(localHashes) >= (_this.HASHES_CHAIN_MAX_SIZE * 3 / 4) * (64 + 1)) || remoteHashes.indexOf(localHashes) === -1) {
            $info('Merge scenario 2', remoteHashes, localHashes);
            _this._clearChanges();
            return _this._setAllData(remoteData);
          } else if ((localData['__hashes'] || []).join(' ').indexOf((remoteData['__hashes'] || []).join(' ').substr(0, 2 * 64 + 1)) !== -1) {
            $info('Merge scenario 3', remoteHashes, localHashes);
            return _this._setAllData(remoteData);
          } else {
            _ref = _this._computeCommit(localData, _this._changes), nextCommitHash = _ref[0], nextCommitData = _ref[1];
            if (_(remoteData['__hashes']).contains(nextCommitData)) {
              $info('Merge scenario 4', remoteHashes, localHashes, nextCommitHash);
              _this._setAllData(remoteData);
              return _this._clearChanges();
            } else {
              $info('Merge scenario 5', remoteHashes, localHashes);
              return _this._setAllData(remoteData);
            }
          }
        };
      })(this));
    };

    SyncedStore.prototype._push = function() {
      var changes, hasRemoteData, pushedData, unlockMutableOperations;
      if (this.isClosed()) {
        return ledger.defer().reject(Errors.Closed).promise;
      }
      if (this._changes.length === 0) {
        return ledger.defer().reject(Errors.NoChanges).promise;
      }
      hasRemoteData = true;
      unlockMutableOperations = _.noop;
      pushedData = null;
      changes = _.clone(this._changes);
      return this._getAllData().then((function(_this) {
        return function(data) {
          changes = _this._cleanChanges(data, changes);
          if (!_this._areChangesMeaningful(data, changes)) {
            throw Errors.NoChanges;
          }
        };
      })(this)).then((function(_this) {
        return function() {
          return _this.pull();
        };
      })(this)).fail((function(_this) {
        return function(e) {
          if (e === Errors.NoChanges) {
            throw Errors.NoChanges;
          }
          if (e === Errors.NetworkError) {
            throw Errors.NetworkError;
          }
          return hasRemoteData = false;
        };
      })(this)).then((function(_this) {
        return function() {
          if (changes.length === 0) {
            throw Errors.NoChanges;
          }
          unlockMutableOperations = _.lock(_this, ['set', 'remove', 'clear', 'pull', 'push']);
          return _this._getAllData();
        };
      })(this)).then((function(_this) {
        return function(data) {
          var commitHash, _ref;
          $info('Changes to apply', changes);
          if (!_this._areChangesMeaningful(data, changes)) {
            throw Errors.NoChanges;
          }
          _ref = _this._computeCommit(data, changes), commitHash = _ref[0], pushedData = _ref[1];
          $info('Push ', commitHash, ' -> ', pushedData, ' Local data ', data, ' Changes ', changes);
          return _this._encryptToJson(pushedData);
        };
      })(this)).then((function(_this) {
        return function(data) {
          if (hasRemoteData) {
            return _this.client.put_settings(data);
          } else {
            return _this.client.post_settings(data);
          }
        };
      })(this)).then((function(_this) {
        return function(md5) {
          _this._setLastMd5(md5);
          $info('Clear changes and sets', pushedData);
          _this._clearChanges();
          return _this._setAllData(pushedData);
        };
      })(this)).then((function(_this) {
        return function() {
          return _this.emit('pushed', _this);
        };
      })(this)).then((function(_this) {
        return function() {
          return unlockMutableOperations();
        };
      })(this)).fail((function(_this) {
        return function(e) {
          $info('Push failed due to ', e);
          _.defer(function() {
            return unlockMutableOperations();
          });
          if (e === Errors.NoChanges) {
            _this._clearChanges();
            return;
          }
          $info("Failed push ", e);
          _this.push();
          throw e;
        };
      })(this));
    };

    SyncedStore.prototype._cleanChanges = function(data, changes) {
      var change, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = changes.length; _i < _len; _i++) {
        change = changes[_i];
        if (this._areChangesMeaningful(data, [change])) {
          _results.push(change);
        }
      }
      return _results;
    };

    SyncedStore.prototype._applyChanges = function(data, changes) {
      var change, _i, _len;
      for (_i = 0, _len = changes.length; _i < _len; _i++) {
        change = changes[_i];
        if (change.type === OperationTypes.SET) {
          data[change.key] = change.value;
        } else {
          data = _.omit(data, change.key);
        }
      }
      return data;
    };

    SyncedStore.prototype._computeCommit = function(data, changes) {
      var commitHash;
      data = this._applyChanges(data, changes);
      data.__hashes = (data.__hashes || []).slice(0, this.HASHES_CHAIN_MAX_SIZE - 1);
      commitHash = ledger.crypto.SHA256.hashString(_(data).toJson());
      data.__hashes = [commitHash].concat(data.__hashes);
      return [commitHash, data];
    };

    SyncedStore.prototype._areChangesMeaningful = function(data, changes) {
      var checkData, lastCommitHash, __, _ref, _ref1;
      if (((_ref = data['__hashes']) != null ? _ref.length : void 0) > 0) {
        if (_(changes).every(function(change) {
          return change.type === OperationTypes.REMOVE && (data[change.key] === change.value);
        })) {
          return false;
        }
        checkData = _.clone(data);
        checkData['__hashes'] = _(checkData['__hashes']).without(checkData['__hashes'][0]);
        if (checkData['__hashes'].length === 0) {
          checkData = _(checkData).omit('__hashes');
        }
        _ref1 = this._computeCommit(checkData, changes), lastCommitHash = _ref1[0], __ = _ref1[1];
        return lastCommitHash !== data['__hashes'][0];
      }
      return true;
    };

    SyncedStore.prototype._setLastMd5 = function(md5) {
      this._lastMd5 = md5;
      return this._auxiliaryStore.set({
        __last_sync_md5: md5
      });
    };

    SyncedStore.prototype._getAllData = function() {
      var d;
      d = ledger.defer();
      this._secureStore.keys((function(_this) {
        return function(keys) {
          return _this._secureStore.get(keys, function(data) {
            return d.resolve(data);
          });
        };
      })(this));
      return d.promise;
    };

    SyncedStore.prototype._setAllData = function(data) {
      var d, unlock;
      this._data = data;
      d = ledger.defer();
      unlock = _.lock(this, ["set", "get", "pull", "push", "keys", "remove"]);
      this._secureStore.clear((function(_this) {
        return function() {
          return _this._secureStore.set(data, function() {
            unlock();
            return d.resolve();
          });
        };
      })(this));
      return d.promise;
    };

    SyncedStore.prototype._saveChanges = function(callback) {
      if (callback == null) {
        callback = void 0;
      }
      return this._auxiliaryStore.set({
        __sync_changes: this._changes
      }, callback);
    };

    SyncedStore.prototype._clearChanges = function(callback) {
      if (callback == null) {
        callback = void 0;
      }
      this._changes = [];
      return this._saveChanges(callback);
    };

    SyncedStore.prototype._encryptToJson = function(data) {
      var key, value;
      data = _(data).chain().pairs().sort().object().value();
      return '{' + ((function() {
        var _results;
        _results = [];
        for (key in data) {
          value = data[key];
          _results.push(JSON.stringify(this._secureStore._preprocessKey(key)) + ':' + JSON.stringify(this._secureStore._preprocessValue(value)));
        }
        return _results;
      }).call(this)).join(',') + '}';
    };

    SyncedStore.prototype._decrypt = function(data) {
      var key, out, value;
      out = {};
      for (key in data) {
        value = data[key];
        out[this._secureStore._deprocessKey(key)] = this._secureStore._deprocessValue(value);
      }
      return out;
    };

    return SyncedStore;

  })(ledger.storage.Store);

}).call(this);
