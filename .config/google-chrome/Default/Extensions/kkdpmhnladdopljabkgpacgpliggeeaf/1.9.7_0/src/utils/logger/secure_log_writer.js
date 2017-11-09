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

  this.ledger.utils.SecureLogWriter = (function(_super) {
    __extends(SecureLogWriter, _super);

    function SecureLogWriter(key, bitIdAddress, daysMax, fsmode) {
      if (daysMax == null) {
        daysMax = 2;
      }
      if (fsmode == null) {
        fsmode = PERSISTENT;
      }
      this._bitIdAddress = bitIdAddress;
      this._key = key;
      this._aes = new ledger.crypto.AES(this._key);
      SecureLogWriter.__super__.constructor.call(this, this._daysMax, fsmode);
    }

    SecureLogWriter.prototype.write = function(msg) {
      msg = this._aes.encrypt(msg);
      return SecureLogWriter.__super__.write.call(this, msg);
    };


    /*
     Set file name with bitIdAdress and date of the day
     */

    SecureLogWriter.prototype._getFileName = function() {
      return "secure_" + this._bitIdAddress + "_" + (moment().format('YYYY_MM_DD')) + ".log";
    };

    return SecureLogWriter;

  })(this.ledger.utils.LogWriter);

}).call(this);
