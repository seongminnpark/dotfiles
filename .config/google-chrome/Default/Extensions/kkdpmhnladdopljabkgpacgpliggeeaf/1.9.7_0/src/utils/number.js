(function() {
  var _base;

  if ((_base = this.ledger).number == null) {
    _base.number = {};
  }

  _.extend(this.ledger.number, {
    intArray2a: function(hex) {
      var i, str, _i, _ref;
      str = '';
      for (i = _i = 0, _ref = hex.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        str += String.fromCharCode(hex[i]);
      }
      return str;
    },
    hex2a: function(hex) {
      var i, str, _i, _ref;
      str = '';
      for (i = _i = 0, _ref = hex.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
      }
      return str;
    },
    a2hex: function(str) {
      var charCode, charset, i, out, _i, _ref;
      charset = "0123456789abcdef";
      out = '';
      for (i = _i = 0, _ref = str.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        charCode = str.charCodeAt(i);
        out += charset[Math.floor(charCode / 16)] + charset[charCode % 16];
      }
      return out;
    },
    getLocaleDecimalSeparator: function(locale) {
      var hasSeparator, number, separator;
      number = 0.5;
      separator = number.toLocaleString(locale).charAt(1);
      hasSeparator = isNaN(parseInt(separator));
      if (hasSeparator) {
        return separator;
      } else {
        return '';
      }
    },
    getLocaleThousandSeparator: function(locale) {
      var hasSeparator, number, separator;
      number = 1000;
      separator = number.toLocaleString(locale).charAt(1);
      hasSeparator = isNaN(parseInt(separator));
      if (hasSeparator) {
        return separator;
      } else {
        return '';
      }
    }
  });

}).call(this);
