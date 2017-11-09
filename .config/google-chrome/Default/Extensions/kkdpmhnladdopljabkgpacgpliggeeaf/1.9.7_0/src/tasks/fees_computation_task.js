
/*
  Put currencies in cache memory
 */

(function() {
  var CurrencyCache,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  CurrencyCache = (function() {
    function CurrencyCache() {
      this._cache = {};
      this._chromeStore = new ledger.storage.ChromeStore('ticker');
    }

    CurrencyCache.prototype.get = function() {
      return this._cache;
    };

    CurrencyCache.prototype.set = function(currencies) {
      this._cache = currencies;
      return this._chromeStore.set({
        ticker_cache: currencies
      });
    };

    CurrencyCache.prototype.isCacheEmpty = function() {
      return _.isEmpty(this._cache);
    };

    return CurrencyCache;

  })();


  /*
    Update tickers task
   */

  ledger.tasks.FeesComputationTask = (function(_super) {
    __extends(FeesComputationTask, _super);

    FeesComputationTask.UpdateRate = 5 * 60 * 1000;

    function FeesComputationTask() {
      FeesComputationTask.__super__.constructor.call(this, 'FeesComputationTask');
      this._client = new ledger.api.FeesRestClient();
      this._store = new ledger.storage.ChromeStore("fees_" + ledger.config.network.ticker + "_cache");
      this._fees = {};
      this._store.get(['fees'], (function(_this) {
        return function(result) {
          return _this._fees = _(result['fees'] || {}).extend(_this._fees);
        };
      })(this));
    }

    FeesComputationTask.instance = new FeesComputationTask();

    FeesComputationTask.reset = function() {
      this.instance.stopIfNeccessary();
      return this.instance = new this();
    };

    FeesComputationTask.prototype.onStart = function() {
      FeesComputationTask.__super__.onStart.apply(this, arguments);
      return this._update(true);
    };

    FeesComputationTask.prototype.onStop = function() {
      return FeesComputationTask.__super__.onStop.apply(this, arguments);
    };

    FeesComputationTask.prototype.update = function() {
      return this._update(false);
    };

    FeesComputationTask.prototype.getFeesForNumberOfBlocks = function(numberOfBlock) {
      return this._fees["" + numberOfBlock];
    };

    FeesComputationTask.prototype.getFeesForLevel = function(level) {
      var value;
      value = this._fees["" + level.numberOfBlock] || level.defaultValue;
      return new this.constructor.Fee(value, level);
    };

    FeesComputationTask.prototype.getFeesForLevelId = function(levelId) {
      return this.getFeesForLevel(ledger.preferences.fees.getLevelFromId(levelId));
    };

    FeesComputationTask.prototype.getFeesForPreferredLevel = function() {
      return this.getFeesForLevelId(ledger.preferences.instance.getMiningFee());
    };

    FeesComputationTask.prototype._update = function(scheduleNext) {
      var d;
      if (!this.isRunning()) {
        return;
      }
      d = ledger.defer();
      this._client.getEstimatedFees((function(_this) {
        return function(fees, error) {
          if (fees != null) {
            _this._updateFeesAndSave(fees);
          }
          d.resolve();
          if (scheduleNext) {
            return setTimeout((function() {
              return _this._update(true);
            }), ledger.tasks.FeesComputationTask.UpdateRate);
          }
        };
      })(this));
      return d.promise;
    };

    FeesComputationTask.prototype._updateFeesAndSave = function(newFees) {
      this._fees = newFees;
      this._store.set({
        fees: this._fees
      });
      return this.emit('fees:updated');
    };

    return FeesComputationTask;

  })(ledger.tasks.Task);

  ledger.tasks.FeesComputationTask.Fee = (function() {
    function Fee(value, level) {
      this.value = value;
      this.level = level;
    }

    Fee.prototype.isBeyondDefaultValue = function() {
      return this.value > this.level.defaultValue;
    };

    Fee.prototype.isBeyondMaxValue = function() {
      return this.value > ledger.preferences.fees.MaxValue;
    };

    return Fee;

  })();

}).call(this);
