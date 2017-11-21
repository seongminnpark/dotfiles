(function() {
  LRUCache.fromJson = function(jsonArray, limit) {
    var cache, item, _i, _len;
    if (limit == null) {
      limit = 200000;
    }
    cache = new LRUCache(limit);
    for (_i = 0, _len = jsonArray.length; _i < _len; _i++) {
      item = jsonArray[_i];
      cache.put(item.key, item.value);
    }
    return cache;
  };

}).call(this);
