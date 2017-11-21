(function() {
  var $info, resolveRelationship,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  $info = ledger.utils.Logger.getLazyLoggerByTag("Model").$info;

  resolveRelationship = function(object, relationship) {
    var Class;
    Class = window[relationship.Class];
    switch (relationship.type) {
      case 'many_one':
        return object._collection.getRelationshipView(object, relationship).modelize();
      case 'one_many':
        return Class.find(_.object([Class.getBestIdentifierName()], [object.get("" + relationship.name + "_id")]), object._context).data()[0];
      case 'one_one':
        return Class.find(_.object([Class.getBestIdentifierName()], [object.get("" + relationship.name + "_id")]), object._context).data()[0];
      case 'many_many':
        return object._collection.getRelationshipView(object, relationship).modelize();
    }
  };

  this.ledger.database.Model = (function(_super) {
    __extends(Model, _super);

    function Model(context, base) {
      var key, value, _ref;
      if (context == null) {
        throw 'Model can not be build without a context';
      }
      this._context = context;
      this._collection = context.getCollection(this.getCollectionName());
      this._object = base;
      this._needsUpdate = this.isInserted() ? false : true;
      this._deleted = false;
      this._changes = [];
      if (!this.isInserted()) {
        _ref = base || {};
        for (key in _ref) {
          value = _ref[key];
          this._changes.push({
            type: 'set',
            key: key,
            value: value
          });
        }
      }
    }

    Model.prototype.get = function(key) {
      var relationship, result, _ref, _ref1, _ref2;
      if (((_ref = this.getRelationships()) != null ? _ref[key] : void 0) != null) {
        relationship = this.getRelationships()[key];
        result = resolveRelationship(this, relationship);
        if (result == null) {
          result = (_ref1 = this._pendingRelationships) != null ? _ref1[key] : void 0;
        }
        return result;
      } else {
        return (_ref2 = this._object) != null ? _ref2[key] : void 0;
      }
    };

    Model.prototype.getId = function() {
      return this.getBestIdentifier();
    };

    Model.prototype.getLokiId = function() {
      var _ref;
      return (_ref = this._object) != null ? _ref['$loki'] : void 0;
    };

    Model.getBestIdentifierName = function() {
      return this._bestIdentifier;
    };

    Model.prototype.getBestIdentifierName = function() {
      return this.constructor.getBestIdentifierName();
    };

    Model.prototype.getBestIdentifier = function() {
      var _ref;
      return (_ref = this._object) != null ? _ref[this.constructor.getBestIdentifierName()] : void 0;
    };

    Model.prototype.set = function(key, value) {
      var _ref;
      if (this._object == null) {
        this._object = {};
      }
      if (((_ref = this.getRelationships()) != null ? _ref[key] : void 0) != null) {
        if (_.contains(['many_one', 'many_many'], this.getRelationships()[key].type)) {
          throw "Attempt to set a value to a '" + (this.getRelationships()[key].type.replace('_', ':')) + "'";
        }
        if (this._pendingRelationships == null) {
          this._pendingRelationships = {};
        }
        this._pendingRelationships[key] = {};
        if (value != null) {
          this._pendingRelationships[key].add = value;
        }
        if (value == null) {
          this._pendingRelationships[key].remove = {};
        }
      } else {
        this._object[key] = value;
      }
      this._needsUpdate = true;
      this._changes.push({
        type: 'set',
        key: key,
        value: value
      });
      return this;
    };

    Model.prototype.remove = function(key, value) {
      var _base, _base1, _ref;
      if (value == null) {
        return this.set(key, null);
      }
      if (((_ref = this.getRelationships()) != null ? _ref[key] : void 0) != null) {
        if (_.contains(['one_one', 'one_many'], this.getRelationships()[key].type)) {
          throw "Attempt to remove a value to a '" + (this.getRelationships()[key].type.replace('_', ':')) + "'";
        }
        if (this._pendingRelationships == null) {
          this._pendingRelationships = {};
        }
        if ((_base = this._pendingRelationships)[key] == null) {
          _base[key] = {};
        }
        if ((_base1 = this._pendingRelationships[key]).remove == null) {
          _base1.remove = [];
        }
        this._pendingRelationships[key].remove.push(value);
      } else if (_.isArray(this._object[key])) {
        if (_.contains(this._object[key], value)) {
          this._object[key] = _.without(this._object[key], value);
        }
      }
      this._needsUpdate = true;
      this._changes.push({
        type: 'remove',
        key: key,
        value: value
      });
      return this;
    };

    Model.prototype.add = function(key, value) {
      var _base, _base1, _base2, _ref;
      if (((_ref = this.getRelationships()) != null ? _ref[key] : void 0) != null) {
        if (_.contains(['one_one', 'one_many'], this.getRelationships()[key].type)) {
          throw "Attempt to add a value to a '" + (this.getRelationships()[key].type.replace('_', ':')) + "'";
        }
        if (this._pendingRelationships == null) {
          this._pendingRelationships = {};
        }
        if ((_base = this._pendingRelationships)[key] == null) {
          _base[key] = {};
        }
        if ((_base1 = this._pendingRelationships[key]).add == null) {
          _base1.add = [];
        }
        this._pendingRelationships[key].add.push(value);
      } else if ((this._object[key] == null) || _.isArray(this._object[key])) {
        if ((_base2 = this._object)[key] == null) {
          _base2[key] = [];
        }
        if (!_.contains(this._object[key], value)) {
          this._object[key].push(value);
        }
      }
      this._needsUpdate = true;
      this._changes.push({
        type: 'add',
        key: key,
        value: value
      });
      return this;
    };

    Model.prototype.save = function() {
      if (!this.hasChange()) {
        return this;
      }
      if (this.isInserted() && this.onUpdate() !== false) {
        this._commitPendingRelationships();
        this._collection.update(this);
      } else if (this.onInsert() !== false) {
        this._collection.insert(this);
        this._commitPendingRelationships();
      }
      this._needsUpdate = false;
      this._changes = [];
      return this;
    };

    Model.prototype["delete"] = function() {
      var item, relationship, relationshipName, _i, _j, _len, _len1, _ref, _ref1, _ref2;
      $info("Delete model from database", this._object, new Error().stack);
      if (!this._deleted && this.onDelete() !== false) {
        if (this.getRelationships() != null) {
          _ref = this.getRelationships();
          for (relationshipName in _ref) {
            relationship = _ref[relationshipName];
            switch (relationship.onDelete) {
              case 'destroy':
                switch (relationship.type) {
                  case 'many_one':
                    _ref1 = this.get(relationshipName);
                    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                      item = _ref1[_i];
                      item["delete"]();
                    }
                    break;
                  case 'one_one':
                    this.get(relationshipName)["delete"]();
                    break;
                  case 'one_many':
                    this.get(relationshipName)["delete"]();
                    break;
                  case 'many_many':
                    throw 'many:many relationships are not implemented yet';
                }
                break;
              case 'nullify':
                switch (relationship.type) {
                  case 'many_one':
                    _ref2 = this.get(relationshipName);
                    for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
                      item = _ref2[_j];
                      item.set(relationship.inverse, null).save();
                    }
                    break;
                  case 'one_one':
                    this.get(relationshipName).set(relationship.inverse, null);
                    break;
                  case 'many_many':
                    throw 'many:many relationships are not implemented yet';
                }
            }
          }
        }
        this._deleted = true;
        this._collection.remove(this);
      }
    };

    Model.prototype.getChanges = function() {
      return this._changes;
    };

    Model.prototype.hasKeyChanged = function(key) {
      return _(this._changes).some(function(change) {
        return change.key === key;
      });
    };

    Model.prototype.refresh = function() {
      this._collection.refresh(this);
      return this;
    };

    Model.prototype.onInsert = function() {};

    Model.prototype.onDelete = function() {};

    Model.prototype.onUpdate = function() {};

    Model.prototype.onAdd = function() {};

    Model.prototype.onRemove = function() {};

    Model.prototype.isInserted = function() {
      var _ref;
      if (((_ref = this._object) != null ? _ref.meta : void 0) != null) {
        return true;
      } else {
        return false;
      }
    };

    Model.prototype.isDeleted = function() {
      return this._deleted;
    };

    Model.prototype.hasChange = function() {
      return this._needsUpdate;
    };

    Model.prototype.getRelationships = function() {
      return this.constructor._relationships;
    };

    Model.prototype._getModelValue = function(relationship, value) {
      var ValueClass;
      ValueClass = window[relationship.Class];
      if (!_(value).isKindOf(ValueClass)) {
        value = new ValueClass(this._context, value);
        value.save();
      }
      return value;
    };

    Model.prototype._commitAddPendingRelationship = function(pending, relationship) {
      var v, value, _i, _len, _ref, _results;
      switch (relationship.type) {
        case 'many_one':
          _ref = pending.add;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            v = _ref[_i];
            value = this._getModelValue(relationship, v);
            value.set("" + relationship.inverse + "_id", this.getBestIdentifier());
            _results.push(value.save());
          }
          return _results;
          break;
        case 'one_many':
          value = this._getModelValue(relationship, pending.add);
          this._object["" + relationship.name + "_id"] = value.getBestIdentifier();
          return this._collection.update(this);
        case 'one_one':
          value = this._getModelValue(relationship, pending.add);
          this._object["" + relationship.name + "_id"] = value.getBestIdentifier();
          value.set("" + relationship.inverse + "_id", this.getBestIdentifier());
          value.save();
          return this._collection.update(this);
        case 'many_many':
          throw 'many:many relationships are not implemented yet';
      }
    };

    Model.prototype._commitRemovePendingRelationship = function(pending, relationship) {
      var v, value, _i, _len, _ref, _results;
      switch (relationship.type) {
        case 'many_one':
          _ref = pending.remove;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            v = _ref[_i];
            value = this._getModelValue(relationship, v);
            value.set("" + relationship.inverse + "_id", null);
            _results.push(value.save());
          }
          return _results;
          break;
        case 'one_many':
          this._object["" + relationship.name + "_id"] = null;
          return this._collection.update(this);
        case 'one_one':
          value = this.get(relationship.name);
          this._object["" + relationship.name + "_id"] = value.getBestIdentifier();
          value.set("" + relationship.inverse + "_id", null);
          value.save();
          return this._collection.update(this);
        case 'many_many':
          throw 'many:many relationships are not implemented yet';
      }
    };

    Model.prototype._commitPendingRelationships = function() {
      var pending, relationship, relationshipName, _ref;
      if (this._pendingRelationships == null) {
        return;
      }
      _ref = this._pendingRelationships;
      for (relationshipName in _ref) {
        pending = _ref[relationshipName];
        relationship = this.getRelationships()[relationshipName];
        if (relationship == null) {
          continue;
        }
        if (pending.add != null) {
          this._commitAddPendingRelationship(pending, relationship);
        }
        if (pending.remove != null) {
          this._commitRemovePendingRelationship(pending, relationship);
        }
      }
      return this._pendingRelationships = null;
    };

    Model.create = function(base, context) {
      var bestIdentifier, _base, _name;
      if (context == null) {
        context = ledger.database.contexts.main;
      }
      bestIdentifier = _(this._indexes).filter((function(_this) {
        return function(i) {
          return i.options.unique === true && i.field === _this.getBestIdentifierName() && i.options.auto === true;
        };
      })(this))[0];
      if (bestIdentifier != null) {
        if ((_base = (base || (base = {})))[_name = bestIdentifier.field] == null) {
          _base[_name] = this.uniqueId(bestIdentifier.field);
        }
      }
      return new this(context, base);
    };

    Model.uniqueId = function(prefix) {
      var byte;
      if (prefix == null) {
        prefix = "";
      }
      return ledger.crypto.SHA256.hashString(prefix + ((function() {
        var _i, _len, _ref, _results;
        _ref = crypto.getRandomValues(new Uint8Array(32));
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          byte = _ref[_i];
          _results.push(byte.toString(16));
        }
        return _results;
      })()).join(''));
    };

    Model.findById = function(id, context) {
      if (context == null) {
        context = ledger.database.contexts.main;
      }
      if (this.getBestIdentifierName() === '$loki') {
        return context.getCollection(this.getCollectionName()).get(id);
      } else {
        return this.find(_.object([this.getBestIdentifierName()], [id]), context).data()[0];
      }
    };

    Model.findOrCreate = function(query, base, context) {
      var object;
      if (context == null) {
        context = ledger.database.contexts.main;
      }
      if (_.isKindOf(base, ledger.database.contexts.Context)) {
        context = base;
        base = void 0;
      }
      if (_.isObject(query)) {
        object = this.find(query, context).data()[0];
        if (base == null) {
          base = {};
        }
        _.extend(base, query);
      } else {
        object = this.findById(query, context);
      }
      if (object == null) {
        object = this.create(base, context);
      }
      return object;
    };

    Model.chain = function(context) {
      if (context == null) {
        context = ledger.database.contexts.main;
      }
      return context.getCollection(this.getCollectionName()).query();
    };

    Model.find = function(query, context) {
      var chain;
      if (context == null) {
        context = ledger.database.contexts.main;
      }
      chain = this.chain(context);
      if (query != null) {
        chain.find(query);
      }
      return chain;
    };

    Model.where = function(filterFunction, context) {
      var chain;
      if (context == null) {
        context = ledger.database.contexts.main;
      }
      chain = this.chain(context);
      if (filterFunction != null) {
        chain.where(filterFunction);
      }
      return chain;
    };

    Model.all = function(context) {
      if (context == null) {
        context = ledger.database.contexts.main;
      }
      return this.chain(context).data();
    };

    Model.has = function(relationshipDeclaration) {
      if (relationshipDeclaration['many'] != null) {
        return this._createRelationship(relationshipDeclaration, 'many');
      } else if (relationshipDeclaration['one']) {
        return this._createRelationship(relationshipDeclaration, 'one');
      }
    };

    Model._createRelationship = function(relationshipDeclaration, myType) {
      var er, finalSort, i, index, normalizedIndex, onDelete, r, relationship, sort, value, _i, _ref;
      if (myType === 'many') {
        r = _.isArray(relationshipDeclaration['many']) ? relationshipDeclaration['many'] : [relationshipDeclaration['many'], _.str.capitalize(_.singularize(_.str.camelize(relationshipDeclaration['many'])))];
      } else {
        r = _.isArray(relationshipDeclaration['one']) ? relationshipDeclaration['one'] : [relationshipDeclaration['one'], _.str.capitalize(_.str.camelize(relationshipDeclaration['one']))];
      }
      if (relationshipDeclaration['forOne'] != null) {
        i = [relationshipDeclaration['forOne'], 'one'];
      } else if (relationshipDeclaration['forMany'] != null) {
        i = [relationshipDeclaration['forMany'], 'many'];
      } else {
        i = [_.str.underscored(this.name).toLocaleLowerCase(), 'one'];
      }
      sort = null;
      if (relationshipDeclaration['sortBy'] != null) {
        sort = relationshipDeclaration['sortBy'];
        if (_(sort).isArray()) {
          finalSort = [];
          normalizedIndex = 0;
          for (index = _i = 0, _ref = sort.length; 0 <= _ref ? _i <= _ref : _i >= _ref; index = 0 <= _ref ? ++_i : --_i) {
            value = sort[index];
            if (normalizedIndex % 2 === 0) {
              if (value != null) {
                finalSort.push([value]);
              }
            } else if (_(value).isString() && !value.match(/^(asc|desc)$/)) {
              normalizedIndex += 1;
              finalSort[finalSort.length - 1][1] = false;
              finalSort.push([value]);
            } else {
              finalSort[finalSort.length - 1][1] = (value == null) || value === 'desc' ? true : false;
            }
            normalizedIndex += 1;
          }
          sort = finalSort;
        } else if (!_(sort).isFunction()) {
          sort = [[sort, false]];
        }
      }
      onDelete = relationshipDeclaration['onDelete'] != null ? relationshipDeclaration['onDelete'] : 'nullify';
      if (!_.contains(['nullify', 'destroy', 'none'], onDelete)) {
        e("Relationship " + this.name + "::" + r[0] + " delete rule '" + onDelete + "' is not valid. Please review this. Should be either 'nullify', 'none' or 'destroy'");
        onDelete = 'nullify';
      }
      relationship = {
        name: r[0],
        type: "" + myType + "_" + i[1],
        inverse: i[0],
        Class: r[1],
        inverseType: "" + i[1] + "_" + myType,
        sort: sort,
        onDelete: onDelete,
        sync: relationshipDeclaration.sync
      };
      try {
        if (relationshipDeclaration.sync === true) {
          if (myType === 'one') {
            this.sync("" + relationship.name + "_id");
          } else {
            e("Cannot synchronize relationship " + this.name + "-" + relationship.name + ", please synchronize relationship " + relationship.name + "-" + this.name);
          }
        }
      } catch (_error) {
        er = _error;
        e(er);
      }
      if (this._relationships == null) {
        this._relationships = {};
      }
      return this._relationships[relationship.name] = relationship;
    };

    Model.commitRelationship = function() {
      var Class, ClassName, InverseClass, bestId, relationship, relationshipName, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _results;
      if (this !== Model) {
        throw 'This methods should only be called once by Model';
      }
      _ref = this.AllModelClasses();
      _results = [];
      for (ClassName in _ref) {
        Class = _ref[ClassName];
        Class._synchronizedIndex = _(Class._indexes).filter(function(i) {
          var _ref1;
          return ((_ref1 = i.options) != null ? _ref1.sync : void 0) === true;
        });
        if (Class._synchronizedIndex.length > 1) {
          e("Found multiple synchronized indexes in declaration of model " + ClassName);
        }
        Class._synchronizedIndex = Class._synchronizedIndex[0];
        if (((_ref1 = Class._synchronizedProperties) != null ? _ref1.length : void 0) > 0 && !Class._synchronizedIndex) {
          e("Found synchronized property without any synchronized index. Add @index 'index_name', sync: yes. In the declaration of " + ClassName);
        }
        _ref2 = Class._relationships;
        for (relationshipName in _ref2) {
          relationship = _ref2[relationshipName];
          InverseClass = window[relationship.Class];
          if ((InverseClass._relationships != null) && ((_ref3 = InverseClass._relationships[relationship.inverse]) != null ? _ref3.inverse : void 0) === relationship.name && ((_ref4 = InverseClass._relationships[relationship.inverse]) != null ? _ref4.type : void 0) === relationship.inverseType && ((_ref5 = InverseClass._relationships[relationship.inverse]) != null ? _ref5.Class : void 0) === ClassName) {
            continue;
          } else if (!((_ref6 = InverseClass._relationships) != null ? _ref6[relationship.inverse] : void 0)) {
            if (InverseClass._relationships == null) {
              InverseClass._relationships = {};
            }
            InverseClass._relationships[relationship.inverse] = {
              name: relationship.inverse,
              type: relationship.inverseType,
              inverse: relationship.name,
              Class: ClassName,
              inverseType: relationship.type,
              onDelete: 'nullify'
            };
          } else {
            e("Bad relationship " + relationship.name + " <-> " + relationship.inverse + ". You must absolutely check for errors for classes " + ClassName + " and " + relationship.Class);
          }
        }
        _results.push(Class._bestIdentifier = Class._synchronizedIndex != null ? Class._synchronizedIndex.field : ((_ref7 = (bestId = _(Class._indexes).find(function(i) {
          return (i.options['unique'] != null) === true;
        }))) != null ? _ref7.length : void 0) === 1 ? bestId[0] : '$loki');
      }
      return _results;
    };

    Model.index = function(field, options) {
      if (options == null) {
        options = {};
      }
      if (this._indexes == null) {
        this._indexes = [];
      }
      return this._indexes.push({
        field: field,
        options: options
      });
    };

    Model.sync = function(propertyName, options) {
      if (options == null) {
        options = {};
      }
      if (this._synchronizedProperties == null) {
        this._synchronizedProperties = [];
      }
      return this._synchronizedProperties.push({
        property: propertyName,
        options: options
      });
    };

    Model.init = function() {
      var _base;
      if ((_base = ledger.database.Model)._allModelClasses == null) {
        _base._allModelClasses = {};
      }
      return ledger.database.Model._allModelClasses[this.name] = this;
    };

    Model.getCollectionName = function() {
      return this.name;
    };

    Model.prototype.getCollectionName = function() {
      return this.constructor.getCollectionName();
    };

    Model.AllModelClasses = function() {
      return this._allModelClasses;
    };

    Model.prototype.getSynchronizedProperties = function() {
      var object, property, _i, _len, _ref;
      if ((this._object == null) || (this.constructor._synchronizedIndex == null)) {
        return {};
      }
      object = {};
      object[this.constructor.getBestIdentifierName()] = this._object[this.constructor.getBestIdentifierName()];
      _ref = this.constructor._synchronizedProperties || [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        property = _ref[_i];
        object[property.property] = this._object[property.property];
      }
      return object;
    };

    Model.getSynchronizedPropertiesNames = function() {
      var property;
      return (this._synchronizedIndex != null ? [this._synchronizedIndex.field] : []).concat((function() {
        var _i, _len, _ref, _results;
        _ref = this._synchronizedProperties || [];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          property = _ref[_i];
          _results.push(property.property);
        }
        return _results;
      }).call(this));
    };

    Model.hasSynchronizedProperties = function() {
      return (this._synchronizedIndex != null) && this._synchronizedIndex !== void 0;
    };

    Model.prototype.hasSynchronizedProperties = function() {
      return this.constructor.hasSynchronizedProperties();
    };

    Model.prototype.serialize = function() {
      var json;
      json = $.extend({}, this._object);
      delete json['meta'];
      delete json['objType'];
      delete json['$loki'];
      return json;
    };

    return Model;

  })(this.EventEmitter);

}).call(this);
