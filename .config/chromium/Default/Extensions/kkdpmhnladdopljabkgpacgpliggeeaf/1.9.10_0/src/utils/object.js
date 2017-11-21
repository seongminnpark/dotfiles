(function() {
  _.mixin({
    isKindOf: function(object, clazz) {
      switch (clazz) {
        case String:
          return _.isString(object);
        case Array:
          return _.isArray(object);
        case Function:
          return _.isFunction(object);
        case Number:
          return _.isNumber(object);
        case Object:
          return _.isObject(object);
      }
      while ((object != null ? object.constructor : void 0) != null) {
        if (object.constructor === clazz) {
          return true;
        }
        object = object.constructor.__super__;
      }
      return false;
    },
    getClassName: function(object) {
      var _ref;
      if (object == null) {
        object = null;
      }
      return object != null ? (_ref = object.constructor) != null ? _ref.name : void 0 : void 0;
    },
    getClass: function(object) {
      if (object == null) {
        object = null;
      }
      return object != null ? object.constructor : void 0;
    }
  });

}).call(this);
