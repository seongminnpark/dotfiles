(function() {
  var Modes;

  if (ledger.fup == null) {
    ledger.fup = {};
  }

  Modes = ledger.fup.FirmwareUpdateRequest.Modes;

  ledger.fup.Card = (function() {
    function Card(card) {
      this._card = card;
    }

    Card.prototype.getVersion = function(mode, forceBl) {
      var apdu;
      apdu = new ByteString((mode === Modes.Os ? 'E0C4000000' : 'F001000000'), HEX);
      return this._card.exchange_async(apdu).then((function(_this) {
        return function(result) {
          if (mode === Modes.Os && !forceBl) {
            if (_this._card.SW === 0x9000) {
              return [result.byteAt(1), (result.byteAt(2) << 16) + (result.byteAt(3) << 8) + result.byteAt(4), result];
            } else if (_this._card.SW === 0x6D00 || _this._card.SW === 0x6E00) {
              return _this.getVersion(mode, true);
            }
          } else {
            if (_this._card.SW === 0x9000) {
              apdu = new ByteString('E001000000', HEX);
              return _this._card.exchange_async(apdu).then(function(reloaderResult) {
                if (_this._card.SW === 0x9000) {
                  result = reloaderResult;
                }
                return [0, (result.byteAt(5) << 16) + (result.byteAt(6) << 8) + (result.byteAt(7)), result];
              });
            } else if (mode === Modes.Os && ((_this._card.SW === 0x6D00) || _this._card.SW === 0x6E00)) {
              return [0, (1 << 16) + (4 << 8) + 3.];
            } else {
              return ledger.errors["new"](ledger.errors.UnexpectedResult, "Failed to get version - SW " + _this._card.SW);
            }
          }
        };
      })(this)).then((function(_this) {
        return function(version) {
          return new ledger.fup.Card.Version(version);
        };
      })(this));
    };

    Card.prototype.unlockWithPinCode = function(pin) {
      return this._card.exchange_async(new ByteString("E0220000" + Convert.toHexByte(pin.length), HEX).concat(new ByteString(pin, ASCII))).then((function(_this) {
        return function(result) {
          var error;
          if (_this._card.SW !== 0x9000) {
            error = ledger.errors["new"](Errors.WrongPinCode);
            error.remaining = +(_this._card.SW.toString(16).match(/63c(.)/i) || [])[1] || 0;
            throw error;
          }
        };
      })(this));
    };

    Card.prototype.getRemainingPinAttempt = function() {
      return this._card.exchange_async(new ByteString("E02280000100", HEX)).then((function(_this) {
        return function(result) {
          var remainingPinAttempt, statusWord, _ref;
          statusWord = ((_ref = _this._card.SW) != null ? _ref.toString(16) : void 0) || '6985';
          remainingPinAttempt = statusWord.match(/63c(\d)/);
          if ((remainingPinAttempt != null ? remainingPinAttempt.length : void 0) === 2) {
            return +remainingPinAttempt[1];
          } else {
            throw new Error("Invalid status - " + statusWord);
          }
        };
      })(this));
    };

    Card.prototype.getCard = function() {
      return this._card;
    };

    return Card;

  })();

  ledger.fup.Card.Version = (function() {
    function Version(version) {
      this._version = version;
      if (version[2] != null) {
        this._firmware = new ledger.dongle.FirmwareInformation(null, version[2]);
      }
    }

    Version.prototype.equals = function(version) {
      if (!_(version).isKindOf(ledger.fup.Card.Version)) {
        return this.equals(new ledger.fup.Card.Version(version));
      }
      return this._version[0] === version._version[0] && this._version[1] === version._version[1];
    };

    Version.prototype.lt = function(version) {
      if (!_(version).isKindOf(ledger.fup.Card.Version)) {
        return this.equals(new ledger.fup.Card.Version(version));
      }
      return this._version[0] < version._version[0] && this._version[1] < version._version[1];
    };

    Version.prototype.gt = function(version) {
      if (!_(version).isKindOf(ledger.fup.Card.Version)) {
        return this.equals(new ledger.fup.Card.Version(version));
      }
      return this._version[0] < version._version[0] && this._version[1] < version._version[1];
    };

    Version.prototype.lte = function(version) {
      return this.equals(version) || this.lt(version);
    };

    Version.prototype.gte = function(version) {
      return this.equals(version) || this.gt(version);
    };

    Version.prototype.getFirmwareInformation = function() {
      return this._firmware;
    };

    Version.prototype.toString = function() {
      return ledger.fup.utils.versionToString(this._version);
    };

    return Version;

  })();

}).call(this);
