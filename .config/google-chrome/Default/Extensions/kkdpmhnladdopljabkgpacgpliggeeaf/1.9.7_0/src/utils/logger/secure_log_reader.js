(function() {
  var _base,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (this.ledger == null) {
    this.ledger = {};
  }

  if ((_base = this.ledger).utils == null) {
    _base.utils = {};
  }

  this.ledger.utils.SecureLogReader = (function(_super) {
    __extends(SecureLogReader, _super);

    function SecureLogReader(key, bitIdAddress, daysMax, fsmode) {
      if (daysMax == null) {
        daysMax = 2;
      }
      if (fsmode == null) {
        fsmode = PERSISTENT;
      }
      this._bitIdAddress = bitIdAddress;
      this._key = key;
      this._aes = new ledger.crypto.AES(this._key);
      SecureLogReader.__super__.constructor.call(this, this._daysMax, fsmode);
    }

    SecureLogReader.prototype.read = function(callback) {
      var deciphLines;
      deciphLines = [];
      return SecureLogReader.__super__.read.call(this, (function(_this) {
        return function(lines) {
          var e, line, _i, _len;
          for (_i = 0, _len = lines.length; _i < _len; _i++) {
            line = lines[_i];
            try {
              deciphLines.push(_this._aes.decrypt(line));
            } catch (_error) {
              e = _error;
              l(e);
            }
          }
          return typeof callback === "function" ? callback(deciphLines) : void 0;
        };
      })(this));
    };

    SecureLogReader.prototype._isFileOfMine = function(name) {
      var regex;
      regex = "secure_" + this._bitIdAddress + "_[\\d]{4}_[\\d]{2}_[\\d]{2}\\.log";
      return name.match(new RegExp(regex));
    };

    return SecureLogReader;

  })(this.ledger.utils.LogReader);

}).call(this);
