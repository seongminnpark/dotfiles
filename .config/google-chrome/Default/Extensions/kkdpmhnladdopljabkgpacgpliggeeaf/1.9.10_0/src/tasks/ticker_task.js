
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

  ledger.tasks.TickerTask = (function(_super) {
    __extends(TickerTask, _super);

    function TickerTask() {
      TickerTask.__super__.constructor.call(this, 'tickerTaskID');
      this._currenciesRestClient = new ledger.api.CurrenciesRestClient;
      this._cache = new CurrencyCache;
    }

    TickerTask.instance = new TickerTask();

    TickerTask.reset = function() {
      return this.instance = new this;
    };

    TickerTask.prototype.onStart = function() {
      TickerTask.__super__.onStart.apply(this, arguments);
      return this._updateTicker(true);
    };

    TickerTask.prototype.updateTicker = function() {
      return this._updateTicker(false);
    };

    TickerTask.prototype._updateTicker = function(scheduleNext) {
      if (!this.isRunning()) {
        return;
      }
      return this._currenciesRestClient.getAllCurrencies((function(_this) {
        return function(currencies) {
          if (currencies != null) {
            _this._cache.set(currencies);
          }
          if (scheduleNext) {
            setTimeout((function() {
              return _this.updateTicker();
            }), 300000);
          }
          if (currencies != null) {
            return _this.emit('updated', _this._cache.get());
          }
        };
      })(this));
    };

    TickerTask.prototype.getCache = function() {
      return this._cache.get();
    };

    TickerTask.prototype.getCacheAsync = function(callback) {
      if (callback == null) {
        callback = void 0;
      }
      if (this._cache.isCacheEmpty()) {
        this.once('updated', (function(_this) {
          return function(event, data) {
            return typeof callback === "function" ? callback(_this.getCache()) : void 0;
          };
        })(this));
        return this._updateTicker(false);
      } else {
        return typeof callback === "function" ? callback(this.getCache()) : void 0;
      }
    };

    return TickerTask;

  })(ledger.tasks.Task);

}).call(this);
