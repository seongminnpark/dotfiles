(function() {
  _.async = {
    each: function(array, callback) {
      var done, index, length;
      index = 0;
      if (!(array instanceof Array)) {
        return typeof callback === "function" ? callback(void 0, _.noop, false, 0, 0) : void 0;
      }
      length = array.length;
      if (!length) {
        return typeof callback === "function" ? callback(void 0, _.noop, false, 0, 0) : void 0;
      }
      done = function() {
        var hasNext;
        if (index >= length) {
          return;
        }
        index += 1;
        hasNext = index < length;
        return callback(array[index - 1], (hasNext ? done : _.noop), hasNext, index - 1, length);
      };
      return done();
    },
    eachBatch: function(array, batchSize, iteratee) {
      var batch, batchCount, batchIndex, done, length;
      batch = [];
      batchCount = Math.floor(array.length / batchSize) + (array.length % batchSize > 0 ? 1 : 0);
      batchIndex = 0;
      length = array.length;
      done = function() {
        var firstIndex, hasNext, index, lastIndex;
        if (batchIndex >= batchCount) {
          return;
        }
        batchIndex += 1;
        hasNext = batchIndex < batchCount;
        firstIndex = (batchIndex - 1) * batchSize;
        lastIndex = Math.min(batchIndex * batchSize - 1, length - 1);
        batch = (function() {
          var _i, _results;
          _results = [];
          for (index = _i = firstIndex; firstIndex <= lastIndex ? _i <= lastIndex : _i >= lastIndex; index = firstIndex <= lastIndex ? ++_i : --_i) {
            _results.push(array[index]);
          }
          return _results;
        })();
        return iteratee(batch, (hasNext ? done : _.noop), hasNext, batchIndex, batchCount);
      };
      return done();
    }
  };

}).call(this);
