(function() {
  var findRate;

  if (ledger.converters == null) {
    ledger.converters = {};
  }

  findRate = function(rateName, currency) {
    var currencies, rate, rates, _i, _len, _ref;
    if (currency == null) {
      currency = ledger.preferences.instance.getCurrency();
    }
    currencies = ledger.tasks.TickerTask.instance.getCache();
    rates = (currencies != null ? (_ref = currencies[currency]) != null ? _ref.values : void 0 : void 0) || [];
    for (_i = 0, _len = rates.length; _i < _len; _i++) {
      rate = rates[_i];
      if (rate[rateName] != null) {
        return rate[rateName].value;
      }
    }
    return 0.0;
  };


  /*
    This class is a namespace and cannot be instantiated
   */

  ledger.converters = (function() {

    /*
      This constructor prevent the class to be instantiated
    
      @throw [Object] error Throw an error when user try to instantiates the class
     */
    function converters() {
      var e;
      try {
        throw new Error('This class cannot be instantiated');
      } catch (_error) {
        e = _error;
        console.log(e.name + ": " + e.message);
      }
    }


    /*
      Currency converter to satoshi
    
      @example Converts to Satoshi
        ledger.converters.currencyToSatoshi('USD', 50)
    
      @param [Number] currencyValue The amount in the given currency
      @param [String] currency The currency that you want to convert
      @return [Number] The formatted amount in satoshi
     */

    converters.currencyToSatoshi = function(currencyValue, currency) {
      var currencies, satoshiValue, satoshiValueCurrency;
      if (currency == null) {
        currency = ledger.preferences.instance.getCurrency();
      }
      currencies = ledger.tasks.TickerTask.instance.getCache();
      satoshiValueCurrency = findRate(ledger.config.network.tickerKey.to, currency) * Math.pow(10, 8);
      satoshiValue = satoshiValueCurrency * currencyValue;
      return Math.round(satoshiValue);
    };


    /*
      Converter from satoshi to a given currency
    
      @param [Number] satoshiValue The amount in satoshi
      @param [String] currency The currency to which you want your output
      @return [Number] The formatted amount in the given currency
     */

    converters.satoshiToCurrency = function(satoshiValue, currency) {
      var currencies, currencyValueBTC, currencyValueSatoshi, val;
      if (currency == null) {
        currency = ledger.preferences.instance.getCurrency();
      }
      currencies = ledger.tasks.TickerTask.instance.getCache();
      currencyValueBTC = findRate(ledger.config.network.tickerKey.from, currency);
      val = currencyValueBTC * Math.pow(10, -8);
      currencyValueSatoshi = val * satoshiValue;
      return ledger.i18n.formatNumber(parseFloat(currencyValueSatoshi.toFixed(2)));
    };


    /*
      Converter from satoshi to a given currency with formatting
    
      @param [Number] satoshiValue The amount in satoshi
      @param [String] currency The currency to which you want your output
      @return [Number] The formatted amount in the given currency
     */

    converters.satoshiToCurrencyFormatted = function(satoshiValue, currency) {
      var currencies, currencyValueBTC, currencyValueSatoshi, rate, res, val;
      if (currency == null) {
        currency = ledger.preferences.instance.getCurrency();
      }
      currencies = ledger.tasks.TickerTask.instance.getCache();
      rate = findRate(ledger.config.network.tickerKey.from, currency);
      if (rate > 0) {
        currencyValueBTC = rate;
        val = currencyValueBTC * Math.pow(10, -8);
        currencyValueSatoshi = val * satoshiValue;
        res = parseFloat(currencyValueSatoshi.toFixed(2));
      } else {
        res = void 0;
      }
      return ledger.i18n.formatAmount(res, currency);
    };

    return converters;

  })();

}).call(this);
