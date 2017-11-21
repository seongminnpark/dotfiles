(function() {
  _.mixin({
    toJson: function(data) {
      var key, value;
      if (_(data).isObject() && !_(data).isArray()) {
        data = _(data).chain().pairs().sort().object().value();
        return '{' + ((function() {
          var _results;
          _results = [];
          for (key in data) {
            value = data[key];
            _results.push(JSON.stringify(key) + ':' + _(value).toJson());
          }
          return _results;
        })()).join(',') + '}';
      } else {
        return JSON.stringify(data);
      }
    }
  });

}).call(this);
