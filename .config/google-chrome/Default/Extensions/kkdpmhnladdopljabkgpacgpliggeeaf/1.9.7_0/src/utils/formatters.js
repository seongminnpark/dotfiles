(function() {
  if (ledger.formatters == null) {
    ledger.formatters = {};
  }


  /*
    This class is a namespace and cannot be instantiated
   */

  ledger.formatters = (function() {

    /*
      This constructor prevent the class to be instantiated
    
      @throw [Object] error Throw an error when user try to instantiates the class
     */
    function formatters() {
      throw new Error('This class cannot be instantiated');
    }


    /*
      This generic method formats the input value in satoshi to an other unit (BTC, mBTC, bits). You can also specify the number of digits following the decimal point.
    
      @param [Number] value An input value in satoshi
      @param [String] unit The denomination of the unit
      @param [Integer] precision Fixed number of decimal places (the number of digits following the decimal point)
      @return [String] The formatted value
     */

    formatters.formatUnit = function(value, unit, precision, localized) {
      var d, decimalSeparator, digit, found, fractionalPart, fractionalPartTmp, index, integerPart, k, reverseIntegerPart, thousandSeparator, v, _i, _len, _ref;
      if (precision == null) {
        precision = -1;
      }
      if (localized == null) {
        localized = true;
      }
      if ((value == null) || (unit == null)) {
        return;
      }
      found = false;
      _ref = ledger.preferences.defaults.Display.units;
      for (k in _ref) {
        v = _ref[k];
        if (v.symbol === unit) {
          unit = v.unit;
          found = true;
          break;
        }
      }
      if (found === false) {
        throw new Error("unit must be in " + _.reduce(ledger.preferences.instance.getAllBitcoinUnits(), function(cumul, unit) {
          return cumul + ', ' + unit;
        }), '');
      }
      if (localized) {
        decimalSeparator = ledger.number.getLocaleDecimalSeparator(ledger.preferences.instance.getLocale().replace('_', '-'));
        thousandSeparator = ledger.number.getLocaleThousandSeparator(ledger.preferences.instance.getLocale().replace('_', '-'));
      } else {
        decimalSeparator = '.';
        thousandSeparator = '';
      }
      integerPart = new Bitcoin.BigInteger(value.toString()).divide(Bitcoin.BigInteger.valueOf(10).pow(unit));
      fractionalPartTmp = new Bitcoin.BigInteger(value.toString()).mod(Bitcoin.BigInteger.valueOf(10).pow(unit));
      fractionalPart = _.str.lpad(fractionalPartTmp, unit, '0');
      if (precision === -1) {
        fractionalPart = fractionalPart.replace(/\.?0+$/, '');
      } else {
        if (fractionalPart < precision) {
          fractionalPart = _.str.rpad(fractionalPart, precision, '0');
        } else {
          d = fractionalPart.length - precision;
          fractionalPart = parseFloat(fractionalPart) / Math.pow(10, d);
          fractionalPart = _.str.lpad(Math.ceil(fractionalPart).toString(), precision, '0');
        }
      }
      reverseIntegerPart = integerPart.toString().match(/./g).reverse();
      integerPart = [];
      for (index = _i = 0, _len = reverseIntegerPart.length; _i < _len; index = ++_i) {
        digit = reverseIntegerPart[index];
        integerPart.push(digit);
        if ((index + 1) % 3 === 0 && (index + 1) < reverseIntegerPart.length) {
          integerPart.push(thousandSeparator);
        }
      }
      value = integerPart.reverse().join('') + decimalSeparator + fractionalPart;
      if (_.str.endsWith(value, decimalSeparator)) {
        value = _.str.splice(value, -1, 1);
      }
      return value;
    };


    /*
      This method formats the amount with the default currency
    
      @param [Number] value An input value in satoshi
      @param [Integer] precision Fixed number of decimal places (the number of digits following the decimal point)
      @return [String] The formatted value
     */

    formatters.fromValue = function(value, precision, localized) {
      return this.formatUnit(value, this._getBtcUnit(), precision, localized);
    };


    /*
      This method formats the amount and add symbol
     */

    formatters.formatValue = function(value, precision) {
      var num;
      num = this.formatUnit(value, this._getBtcUnit(), precision);
      if (this.symbolIsFirst()) {
        return this.getUnitSymbol() + ' ' + num;
      } else {
        return num + ' ' + this.getUnitSymbol();
      }
    };


    /*
      Symbol order
     */

    formatters.symbolIsFirst = function() {
      return isNaN(parseInt(ledger.i18n.formatAmount(0, ledger.preferences.defaults.Display.units.bitcoin.symbol).charAt(0)));
    };


    /*
      Add unit symbol
     */

    formatters.getUnitSymbol = function() {
      return this._getBtcUnit();
    };


    /*
      This method converts Satoshi to BTC
    
      @param [Number] value An input value in satoshi
      @param [Integer] precision Fixed number of decimal places (the number of digits following the decimal point)
      @return [String] The formatted value
     */

    formatters.fromSatoshiToBTC = function(value, precision) {
      return this.formatUnit(value, ledger.preferences.defaults.Display.units.bitcoin.symbol, precision);
    };


    /*
      This method converts Satoshi to mBTC
    
      @param [Number] value An input value in Satoshi
      @param [Integer] precision Fixed number of decimal places (the number of digits following the decimal point)
      @return [String] The formatted value
     */

    formatters.fromSatoshiToMilliBTC = function(value, precision) {
      return this.formatUnit(value, ledger.preferences.defaults.Display.units.milibitcoin.symbol, precision);
    };


    /*
      This method converts Satoshi to bits/uBTC
    
      @param [Number] value An input value in Satoshi
      @param [Integer] precision Fixed number of decimal places (the number of digits following the decimal point)
      @return [String] The formatted value
     */

    formatters.fromSatoshiToMicroBTC = function(value, precision) {
      return this.formatUnit(value, ledger.preferences.defaults.Display.units.microbitcoin.symbol, precision);
    };


    /*
      Whatever to Satoshi
     */


    /*
      This method converts BTC to Satoshi
    
      @param [Number] value An input value in BTC
      @return [String] The formatted value
     */

    formatters.fromBtcToSatoshi = function(value) {
      if (value == null) {
        return;
      }
      return this._formatUnitToSatoshi(value, 'bitcoin');
    };


    /*
      This method converts mBTC to Satoshi
    
      @param [Number] value An input value in mBTC
      @return [String] The formatted value
     */

    formatters.fromMilliBtcToSatoshi = function(value) {
      if (value == null) {
        return;
      }
      return this._formatUnitToSatoshi(value, 'milibitcoin');
    };


    /*
      This method converts uBTC/bits to Satoshi
    
      @param [Number] value An input value in uBTC
      @return [String] The formatted value
     */

    formatters.fromMicroBtcToSatoshi = function(value) {
      if (value == null) {
        return;
      }
      return this._formatUnitToSatoshi(value, 'microbitcoin');
    };

    formatters._formatUnitToSatoshi = function(value, _name) {
      var fracPart, intPart, num, res, _ref;
      _ref = value.toString().split("."), intPart = _ref[0], fracPart = _ref[1];
      if (fracPart == null) {
        fracPart = '';
      }
      if (fracPart.length > ledger.preferences.defaults.Display.units[_name].unit) {
        this._logger().warn('Fractional part cannot be less than one Satoshi');
        fracPart = fracPart.substring(0, ledger.preferences.defaults.Display.units[_name].unit);
      } else {
        fracPart = _.str.rpad(fracPart, ledger.preferences.defaults.Display.units[_name].unit, '0');
      }
      res = intPart + fracPart;
      num = new Bitcoin.BigInteger(res.toString());
      return num.toString();
    };

    formatters.fromValueToSatoshi = function(value) {
      switch (this.getUnitSymbol()) {
        case ledger.preferences.defaults.Display.units.bitcoin.symbol:
          return this.fromBtcToSatoshi(value);
        case ledger.preferences.defaults.Display.units.milibitcoin.symbol:
          return this.fromMilliBtcToSatoshi(value);
        case ledger.preferences.defaults.Display.units.microbitcoin.symbol:
          return this.fromMicroBtcToSatoshi(value);
      }
      return void 0;
    };

    formatters._logger = function() {
      return ledger.utils.Logger.getLoggerByTag('Formatters');
    };


    /*
      This private method defaults to BTC when preferences are not yet ready
      (API calls don't wait for the wallet to be fully initialized)
    
      @return [String] The BTC formatting unit
     */

    formatters._getBtcUnit = function() {
      if (ledger.preferences.instance != null) {
        return ledger.preferences.instance.getBtcUnit();
      } else {
        return 'BTC';
      }
    };

    return formatters;

  })();

}).call(this);
