(function() {
  var $info, Collection, collectionNameForRelationship,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (ledger.database == null) {
    ledger.database = {};
  }

  if (ledger.database.contexts == null) {
    ledger.database.contexts = {};
  }

  $info = ledger.utils.Logger.getLazyLoggerByTag("ModelContext").$info;

  collectionNameForRelationship = function(object, relationship) {
    switch (relationship.type) {
      case 'many_one':
        return relationship.Class;
      case 'many_many':
        return _.sortBy([relationship.Class, object.constructor.name], (function(s) {
          return s;
        })).join('_');
      case 'one_many':
        return relationship.Class;
      case 'one_one':
        return relationship.Class;
    }
  };

  Collection = (function() {
    function Collection(collection, context) {
      this._collection = collection;
      this._context = context;
      this._syncSubstores = {};
    }

    Collection.prototype.insert = function(model) {
      if (model._object == null) {
        model._object = {};
      }
      model._object['objType'] = model.getCollectionName();
      model._object = this._collection.insert(model._object);
      this._insertSynchronizedProperties(model);
      return this._context.notifyDatabaseChange();
    };

    Collection.prototype.remove = function(model) {
      var er, id;
      if (!(model != null ? model._object : void 0)) {
        return;
      }
      id = model.getBestIdentifier();
      model.getBestIdentifier = function() {
        return id;
      };
      $info("Remove from database", model._object, new Error().stack);
      try {
        this._collection.remove(model._object);
      } catch (_error) {
        er = _error;
        e(er);
      }
      this._removeSynchronizedProperties(model);
      this._context.emit("delete:" + _.str.underscored(model._object['objType']).toLowerCase(), model);
      return this._context.notifyDatabaseChange();
    };

    Collection.prototype.update = function(model) {
      var er;
      try {
        this._collection.update(model._object);
      } catch (_error) {
        er = _error;
        this._updateHackOfTheCentury(model);
      }
      this._updateSynchronizedProperties(model);
      return this._context.notifyDatabaseChange();
    };

    Collection.prototype._updateHackOfTheCentury = function(model) {
      var $loki, impostor, impostors, _i, _len, _results;
      $loki = model._object.$loki;
      impostors = this._modelize(this._collection.find({
        $loki: $loki
      }));
      if (impostors.length === 0) {
        return;
      }
      this._collection.idIndex = _(this._collection.idIndex).reject(function(v) {
        return v === $loki;
      });
      this._collection.data = _(this._collection.data).reject(function(v) {
        return v.$loki === $loki;
      });
      _results = [];
      for (_i = 0, _len = impostors.length; _i < _len; _i++) {
        impostor = impostors[_i];
        model._object = _(model._object).omit("$loki", "meta");
        _results.push(model._object = this._collection.insert(model._object));
      }
      return _results;
    };

    Collection.prototype.get = function(id) {
      return this._modelize(this._collection.get(id));
    };

    Collection.prototype.getRelationshipView = function(object, relationship) {
      var collectionName, query, view, viewName;
      viewName = "" + relationship.type + "_" + relationship.name + "_" + relationship.inverse + ":" + (object.getBestIdentifier());
      collectionName = collectionNameForRelationship(object, relationship);
      view = this._context.getCollection(collectionName).getCollection().getDynamicView(viewName);
      if (view == null) {
        view = this._context.getCollection(collectionName).getCollection().addDynamicView(viewName, false);
        switch (relationship.type) {
          case 'many_one':
            query = {};
            query["" + relationship.inverse + "_id"] = object.getBestIdentifier();
            view.applyFind(query);
            break;
          case 'many_many':
            throw 'Not implemented yet';
        }
        if (_(relationship.sort).isArray() && relationship.sort.length === 1) {
          view.applySimpleSort(relationship.sort[0][0], relationship.sort[0][1]);
        } else if (_(relationship.sort).isArray()) {
          view.applySortCriteria(relationship.sort);
        } else if (_(relationship.sort).isFunction()) {
          view.applySort(relationship.sort);
        }
      }
      view.modelize = (function(_this) {
        return function() {
          return _this._modelize(view.data());
        };
      })(this);
      return view.rematerialize();
    };

    Collection.prototype.updateSynchronizedProperties = function(data) {
      var existingsIds, index, k, key, object, objectDeclarations, objectId, objectNamePattern, synchronizedIndexField, synchronizedObject, v, value, __, _ref;
      synchronizedIndexField = this.getModelClass()._synchronizedIndex.field;
      objectDeclarations = _(data).pick((function(_this) {
        return function(v, key) {
          return key.match("^__sync_" + (_.str.underscored(_this._collection.name).toLowerCase()) + "_[a-zA-Z0-9]+_" + synchronizedIndexField);
        };
      })(this));
      existingsIds = [];
      for (key in objectDeclarations) {
        index = objectDeclarations[key];
        _ref = key.match("^__sync_" + (_.str.underscored(this._collection.name).toLowerCase()) + "_([a-zA-Z0-9]+)_" + synchronizedIndexField), __ = _ref[0], objectId = _ref[1];
        existingsIds.push(objectId);
        objectNamePattern = "__sync_" + (_.str.underscored(this._collection.name).toLowerCase()) + "_" + objectId + "_";
        object = this.getModelClass().find(_.object([synchronizedIndexField], [index]), this._context).data()[0];
        synchronizedObject = {};
        existingsIds.push(index);
        for (key in data) {
          value = data[key];
          if (!(key.match(objectNamePattern))) {
            continue;
          }
          key = key.replace(objectNamePattern, '');
          synchronizedObject[key] = value;
        }
        this._context._syncStore.getAll(l);
        if (object == null) {
          object = this.getModelClass().create(synchronizedObject, this._context);
        } else {
          for (k in synchronizedObject) {
            v = synchronizedObject[k];
            object.set(k, v);
          }
        }
        object.save();
      }
      $info("Remove item", _(this.getModelClass().where(((function(_this) {
        return function(i) {
          return !_.contains(existingsIds, i[_this.getModelClass().getBestIdentifierName()]);
        };
      })(this)), this._context).data() || []).map(function(i) {
        return i._object;
      }));
      $info("Received data", data);
      this.getModelClass().where(((function(_this) {
        return function(i) {
          return !_.contains(existingsIds, i[_this.getModelClass().getBestIdentifierName()]);
        };
      })(this)), this._context).remove();
    };

    Collection.prototype._getModelSyncSubstore = function(model) {
      var _base, _name;
      return (_base = this._syncSubstores)[_name = "sync_" + (_.str.underscored(model.getCollectionName()).toLowerCase()) + "_" + (model.getBestIdentifier())] || (_base[_name] = this._context._syncStore.substore("sync_" + (_.str.underscored(model.getCollectionName()).toLowerCase()) + "_" + (model.getBestIdentifier())));
    };

    Collection.prototype._insertSynchronizedProperties = function(model) {
      return this._updateSynchronizedProperties(model);
    };

    Collection.prototype._updateSynchronizedProperties = function(model) {
      var dataToRemove, dataToSet, key, value, _ref;
      if (!model.hasSynchronizedProperties()) {
        return;
      }
      dataToSet = {};
      dataToRemove = {};
      _ref = model.getSynchronizedProperties();
      for (key in _ref) {
        value = _ref[key];
        if (model.hasKeyChanged(key)) {
          (value != null ? dataToSet : dataToRemove)[key] = value;
        }
      }
      if (!_.isEmpty(dataToSet)) {
        this._getModelSyncSubstore(model).set(dataToSet);
      }
      if (!_.isEmpty(dataToRemove)) {
        return this._getModelSyncSubstore(model).remove(_(dataToRemove).keys());
      }
    };

    Collection.prototype._removeSynchronizedProperties = function(model) {
      if (!model.hasSynchronizedProperties()) {
        return;
      }
      return this._getModelSyncSubstore(model).remove(model.constructor.getSynchronizedPropertiesNames());
    };

    Collection.prototype.query = function() {
      return this._wrapQuery(this._collection.chain());
    };

    Collection.prototype._wrapQuery = function(query) {
      var data, limit, simplesort, sort;
      if (query._wrapped) {
        return query;
      }
      data = query.data, sort = query.sort, limit = query.limit, simplesort = query.simplesort;
      query.data = (function(_this) {
        return function() {
          return _this._modelize(data.call(query));
        };
      })(this);
      query.first = (function(_this) {
        return function() {
          return _this._modelize(data.call(query)[0]);
        };
      })(this);
      query.last = (function(_this) {
        return function() {
          var d;
          d = data.call(query);
          return _this._modelize(d[d.length - 1]);
        };
      })(this);
      query.all = query.data;
      query.count = function() {
        return data.call(query).length;
      };
      query.remove = function() {
        var object, _i, _len, _ref, _results;
        _ref = query.all();
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          object = _ref[_i];
          _results.push(object["delete"]());
        }
        return _results;
      };
      query.sort = (function(_this) {
        return function() {
          return _this._wrapQuery(sort.apply(query, arguments));
        };
      })(this);
      query.limit = (function(_this) {
        return function() {
          return _this._wrapQuery(limit.apply(query, arguments));
        };
      })(this);
      query.simpleSort = (function(_this) {
        return function() {
          return _this._wrapQuery(simplesort.apply(query, arguments));
        };
      })(this);
      query._wrapped = true;
      return query;
    };

    Collection.prototype.getCollection = function() {
      return this._collection;
    };

    Collection.prototype.getModelClass = function() {
      return ledger.database.Model.AllModelClasses()[this.getCollection().name];
    };

    Collection.prototype._modelize = function(data) {
      var item, modelizeSingleItem, _i, _len, _results;
      if (data == null) {
        return null;
      }
      modelizeSingleItem = (function(_this) {
        return function(item) {
          var Class;
          Class = ledger.database.Model.AllModelClasses()[item.objType];
          return new Class(_this._context, item);
        };
      })(this);
      if (_.isArray(data)) {
        _results = [];
        for (_i = 0, _len = data.length; _i < _len; _i++) {
          item = data[_i];
          if (item != null) {
            _results.push(modelizeSingleItem(item));
          }
        }
        return _results;
      } else {
        return modelizeSingleItem(data);
      }
    };

    Collection.prototype.refresh = function(model) {
      model._object = this._collection.get(model.getId());
      return model;
    };

    return Collection;

  })();

  ledger.database.contexts.Context = (function(_super) {
    __extends(Context, _super);

    function Context(db, syncStore) {
      var collection, _i, _len, _ref;
      if (syncStore == null) {
        syncStore = ledger.storage.sync;
      }
      this._db = db;
      this._collections = {};
      this._synchronizedCollections = {};
      this._syncStore = syncStore;
      _ref = this._db.listCollections();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        collection = _ref[_i];
        this._collections[collection.name] = new Collection(this._db.getCollection(collection.name), this);
        this._listenCollectionEvent(this._collections[collection.name]);
      }
      this._syncStore.on('pulled', (this.onSyncStorePulled = this.onSyncStorePulled.bind(this)));
      this.initialize();
    }

    Context.prototype.initialize = function() {
      var className, collection, er, index, modelClass, modelClasses, _i, _len, _ref;
      modelClasses = ledger.database.Model.AllModelClasses();
      for (className in modelClasses) {
        modelClass = modelClasses[className];
        if (modelClass._synchronizedIndex != null) {
          this._synchronizedCollections[className] = modelClass;
        }
        collection = this.getCollection(className);
        collection.getCollection().DynamicViews = [];
        if (modelClass.__indexes != null) {
          _ref = modelClass._indexes;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            index = _ref[_i];
            collection.getCollection().ensureIndex(index.field);
          }
        }
      }
      try {
        new ledger.database.MigrationHandler(this).applyMigrations();
        return this.onSyncStorePulled();
      } catch (_error) {
        er = _error;
        return e(er);
      }
    };

    Context.prototype.getCollection = function(name) {
      var collection;
      collection = this._collections[name];
      if (collection == null) {
        collection = new Collection(this._db.addCollection(name), this);
        this._collections[name] = collection;
        this._listenCollectionEvent(collection);
      }
      return collection;
    };

    Context.prototype.notifyDatabaseChange = function() {
      return this._db.scheduleFlush();
    };

    Context.prototype.close = function() {
      return this._syncStore.off('pulled', this.onSyncStorePulled);
    };

    Context.prototype._listenCollectionEvent = function(collection) {
      collection.getCollection().on('insert', (function(_this) {
        return function(data) {
          return _this.emit("insert:" + _.str.underscored(data['objType']).toLowerCase(), _this._modelize(data));
        };
      })(this));
      return collection.getCollection().on('update', (function(_this) {
        return function(data) {
          return _this.emit("update:" + _.str.underscored(data['objType']).toLowerCase(), _this._modelize(data));
        };
      })(this));
    };

    Context.prototype.onSyncStorePulled = function() {
      return _.defer((function(_this) {
        return function() {
          return _this._syncStore.getAll(function(data) {
            var collection, collectionData, name, _ref;
            _ref = _this._collections;
            for (name in _ref) {
              collection = _ref[name];
              if (!collection.getModelClass().hasSynchronizedProperties()) {
                continue;
              }
              collectionData = _(data).pick(function(v, k) {
                return k.match("__sync_" + (_.str.underscored(name).toLowerCase())) != null;
              });
              if (!_(collectionData).isEmpty()) {
                collection.updateSynchronizedProperties(collectionData);
              }

              /*else
                 * delete all
                $info 'Delete all', collectionData
                $info 'Received data', data
                collection.getModelClass().chain(this).remove()
               */
            }
            return _this.emit('synchronized');
          });
        };
      })(this));
    };

    Context.prototype.refresh = function() {
      var d;
      d = ledger.defer();
      ledger.storage.sync.pull().then((function(_this) {
        return function(uptodate) {
          if (uptodate === true) {
            return d.resolve(false);
          }
          return _this.once('synchronized', function() {
            return d.resolve(true);
          });
        };
      })(this)).fail(function() {
        return d.resolve(false);
      }).done();
      return d.promise;
    };

    Context.prototype._modelize = function(data) {
      var _ref;
      return (_ref = this.getCollection(data['objType'])) != null ? _ref._modelize(data) : void 0;
    };

    return Context;

  })(EventEmitter);

  _.extend(ledger.database.contexts, {
    open: function() {
      return ledger.database.contexts.main = new ledger.database.contexts.Context(ledger.database.main);
    },
    close: function() {
      var _ref;
      return (_ref = ledger.database.contexts.main) != null ? _ref.close() : void 0;
    }
  });

}).call(this);
