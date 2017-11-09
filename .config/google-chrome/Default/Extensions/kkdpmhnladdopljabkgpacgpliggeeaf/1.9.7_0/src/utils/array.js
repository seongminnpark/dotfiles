(function() {
  _.mixin({
    eachBatch: function(array, batchSize, iteratee) {
      var batch, item, _i, _len;
      batch = [];
      for (_i = 0, _len = array.length; _i < _len; _i++) {
        item = array[_i];
        batch.push(item);
        if (batch.length >= batchSize) {
          iteratee(array, true);
          batch = [];
        }
      }
      return iteratee(batch, false);
    }
  });

}).call(this);
