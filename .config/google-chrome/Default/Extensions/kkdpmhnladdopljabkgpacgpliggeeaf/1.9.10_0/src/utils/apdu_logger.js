(function() {
  var apduFilter, _base,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (this.ledger == null) {
    this.ledger = {};
  }

  if ((_base = this.ledger).utils == null) {
    _base.utils = {};
  }

  apduFilter = [
    {
      test: 'e0220000',
      length: 0
    }, {
      test: 'd02600001104',
      length: 0
    }, {
      test: 'e020',
      length: 4
    }
  ];

  ledger.utils.ApduLogger = (function(_super) {
    __extends(ApduLogger, _super);

    function ApduLogger() {
      ApduLogger.__super__.constructor.apply(this, arguments);
    }

    ApduLogger.prototype._storeLog = function(msg, msgType) {
      var apdu, result;
      if (msg.match(/(=>)/) != null) {
        apdu = msg.substr(msg.match(/(=> [0-9a-f]{14})/) != null ? 17 : 3);
        result = _.find(apduFilter, (function(item) {
          return apdu.startsWith(item.test);
        }));
        if ((result != null ? result.test : void 0) != null) {
          msg = _.str.rpad(msg.substr(0, msg.indexOf(result.test) + result.test.length), msg.length, 'x');
          this._obfuscatedApdu = result.length;
        } else if (msg.startsWith('=>') && (this._obfuscatedApdu != null) && this._obfuscatedApdu > 0) {
          msg = _.str.rpad("=> ", msg.length, 'x');
          this._obfuscatedApdu -= 1;
        }
      }
      return ApduLogger.__super__._storeLog.call(this, msg, msgType);
    };

    return ApduLogger;

  })(ledger.utils.Logger);

}).call(this);
