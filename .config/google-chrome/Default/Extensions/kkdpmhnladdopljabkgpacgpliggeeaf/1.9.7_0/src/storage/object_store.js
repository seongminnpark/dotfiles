(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.ledger.storage.ObjectStore = (function(_super) {
    __extends(ObjectStore, _super);

    function ObjectStore(store) {
      this.store = store;
      this.store.get('__lastUniqueIdentifier', (function(_this) {
        return function(result) {
          _this._lastUniqueIdentifier = ((result != null ? result.__lastUniqueIdentifier : void 0) != null) && !isNaN(result != null ? result.__lastUniqueIdentifier : void 0) ? result.__lastUniqueIdentifier : 1;
          return _this.emit('initialized');
        };
      })(this));
    }

    ObjectStore.prototype.perform = function(cb) {
      if (this._lastUniqueIdentifier != null) {
        return cb();
      } else {
        return this.once('initialized', (function(_this) {
          return function() {
            return setTimeout(cb, 0);
          };
        })(this));
      }
    };

    ObjectStore.prototype.set = function(objects, callback) {
      if (!_.isArray(objects)) {
        return this.set([objects], callback);
      }
      return this.perform((function(_this) {
        return function() {
          var idsToUpdate, insertionBatch, object, onInserted, uid, value, _i, _len;
          insertionBatch = {};
          for (_i = 0, _len = objects.length; _i < _len; _i++) {
            object = objects[_i];
            if (_.isArray(object)) {
              _this._flattenArray(object, insertionBatch);
            } else if (_.isObject(object)) {
              _this._flattenStructure(object, insertionBatch);
            }
          }
          onInserted = (function() {
            return typeof callback === "function" ? callback(insertionBatch) : void 0;
          }).bind(_this);
          idsToUpdate = (function() {
            var _results;
            _results = [];
            for (uid in insertionBatch) {
              value = insertionBatch[uid];
              _results.push(uid);
            }
            return _results;
          })();
          return _this.store.get(idsToUpdate, function(items) {
            for (uid in items) {
              value = items[uid];
              insertionBatch[uid] = _.extend(JSON.parse(value), insertionBatch[uid]);
            }
            return _this.store.set(insertionBatch, function() {
              return setTimeout(callback, 0);
            });
          });
        };
      })(this));
    };

    ObjectStore.prototype.get = function(ids, callback) {
      var onGetItems;
      if (!_.isArray(ids)) {
        return this.get([ids], callback);
      }
      onGetItems = (function(result) {
        var object, objects, uid, value;
        objects = {};
        for (uid in result) {
          value = result[uid];
          object = JSON.parse(value);
          if (object.__type === 'array') {
            object = object.content;
            object.__uid = uid;
          }
          objects[uid] = object;
        }
        return callback(objects);
      }).bind(this);
      return this.store.get(ids, function(result) {
        return setTimeout((function() {
          return onGetItems(result);
        }), 0);
      });
    };

    ObjectStore.prototype.exists = function(ids, callback) {
      var onGetItems;
      if (!_.isArray(ids)) {
        return this.exists([ids], callback);
      }
      onGetItems = (function(result) {
        var id, objects, _i, _len;
        objects = {};
        for (_i = 0, _len = ids.length; _i < _len; _i++) {
          id = ids[_i];
          objects[id] = result[id] != null ? true : false;
        }
        return callback(objects);
      }).bind(this);
      return this.store.get(ids, function(result) {
        return setTimeout((function() {
          return onGetItems(result);
        }), 0);
      });
    };

    ObjectStore.prototype.remove = function(ids, callback) {
      if (!_.isArray(ids)) {
        return this.remove([ids], callback);
      }
      return this.store.get(ids, function(result) {
        return setTimeout((function() {
          return typeof callback === "function" ? callback() : void 0;
        }), 0);
      });
    };

    ObjectStore.prototype.clear = function(callback) {
      return this.store.clear(callback);
    };

    ObjectStore.prototype.createUniqueObjectIdentifier = function(prefix, id) {
      if (prefix == null) {
        prefix = 'auto';
      }
      if (id != null) {
        this.store.set({
          __lastUniqueIdentifier: this._lastUniqueIdentifier + 1
        });
      }
      id = id != null ? id : -(this._lastUniqueIdentifier++);
      return [id, ledger.crypto.SHA256.hashString(prefix + id)];
    };

    ObjectStore.prototype._flattenStructure = function(structure, destination) {
      var arrayId, id, key, object, uid, value, valueId, _ref, _value;
      object = {};
      for (key in structure) {
        value = structure[key];
        _value = _(value);
        if (_value.isFunction() || _value.isStoreReference()) {
          continue;
        }
        if (_value.isArray()) {
          arrayId = this._flattenArray(value, destination).__uid;
          object[key] = {
            __type: 'ref',
            __uid: arrayId
          };
        } else if (_value.isObject()) {
          valueId = this._flattenStructure(value, destination).__uid;
          object[key] = {
            __type: 'ref',
            __uid: valueId
          };
        } else {
          object[key] = value;
        }
      }
      if (object.__uid == null) {
        _ref = this.createUniqueObjectIdentifier(), id = _ref[0], uid = _ref[1];
        object.__uid = uid;
      }
      destination[object.__uid] = object;
      return object;
    };

    ObjectStore.prototype._flattenArray = function(structure, destination) {
      var array, arrayId, id, uid, value, valueId, _i, _len, _ref, _value;
      array = [];
      for (_i = 0, _len = structure.length; _i < _len; _i++) {
        value = structure[_i];
        _value = _(value);
        if (_value.isFunction()) {
          continue;
        }
        if (_value.isStoreReference()) {
          array.push(value);
        } else if (_value.isArray()) {
          arrayId = this._flattenArray(value, destination).__uid;
          array.push({
            __type: 'ref',
            __uid: arrayId
          });
        } else if (_value.isObject()) {
          valueId = this._flattenStructure(value, destination).__uid;
          array.push({
            __type: 'ref',
            __uid: valueId
          });
        } else {
          array.push(value);
        }
      }
      array.__uid = structure.__uid;
      array.__modCount = structure.__modCount != null ? structure.__modCount : 0;
      if (array.__uid == null) {
        _ref = this.createUniqueObjectIdentifier(), id = _ref[0], uid = _ref[1];
        array.__uid = uid;
      }
      destination[array.__uid] = {
        __type: 'array',
        __uid: array.__uid,
        content: array
      };
      return array;
    };

    return ObjectStore;

  })(ledger.storage.Store);

  _.mixin({
    isStoreReference: function(object) {
      if ((object != null) && object.__type === 'ref') {
        return true;
      } else {
        return false;
      }
    }
  });

}).call(this);
