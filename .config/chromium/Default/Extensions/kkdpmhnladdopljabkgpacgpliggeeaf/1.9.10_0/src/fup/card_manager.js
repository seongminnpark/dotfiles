(function() {
  var Modes;

  if (ledger.fup == null) {
    ledger.fup = {};
  }

  Modes = _.extend(_.clone(ledger.fup.FirmwareUpdateRequest.Modes), {
    PreferBootloader: 2
  });

  ledger.fup.CardManager = (function() {
    CardManager.ScanDelayMs = 100;

    function CardManager() {
      var factory, key, _fn, _ref;
      this._stopped = false;
      this._connectedCard = null;
      this._factories = {
        bootloader: new ChromeapiPlugupCardTerminalFactory(0x1808),
        hidBootloader: new ChromeapiPlugupCardTerminalFactory(0x1807),
        newHidBootloader: new ChromeapiPlugupCardTerminalFactory(0x3b7c),
        os: new ChromeapiPlugupCardTerminalFactory(0x1b7c),
        osHid: new ChromeapiPlugupCardTerminalFactory(0x2b7c),
        osHidLedger: new ChromeapiPlugupCardTerminalFactory(0x3b7c, void 0, true)
      };
      _ref = this._factories;
      _fn = function(factory) {
        var old_list_async;
        old_list_async = factory.list_async.bind(factory);
        return factory.list_async = function() {
          return old_list_async().then(function(result) {
            var _ref1;
            if (((_ref1 = result[0]) != null ? _ref1.device.productId : void 0) === factory.pid) {
              return [factory, result];
            } else {
              return [];
            }
          });
        };
      };
      for (key in _ref) {
        factory = _ref[key];
        _fn(factory);
      }
    }

    CardManager.prototype.stopWaiting = function() {
      var _ref;
      this._stopped = true;
      return (_ref = this._deferredWait) != null ? _ref.reject(ledger.errors["new"](ledger.errors.Cancelled)) : void 0;
    };

    CardManager.prototype.checkIfCardIsStillConnected = function(card) {
      return this._scanDongles().then((function(_this) {
        return function() {
          return l(arguments);
        };
      })(this));
    };

    CardManager.prototype.waitForInsertion = function() {
      if (this._stopped) {
        return;
      }
      this._deferredWait = ledger.defer();
      this._ensureCardDisconnect();
      this._scanDongles().then((function(_this) {
        return function(_arg) {
          var mode, terminal;
          terminal = _arg.terminal, mode = _arg.mode;
          return terminal.getCard_async().then(function(card) {
            _this._connectedCard = card;
            return _this._deferredWait.resolve({
              card: card,
              mode: mode
            });
          }).done();
        };
      })(this)).fail((function(_this) {
        return function() {
          return _this._deferredWait.resolve(_this.waitForInsertion());
        };
      })(this)).done();
      return this._deferredWait.promise;
    };

    CardManager.prototype.waitForDisconnection = function(silent) {
      if (silent == null) {
        silent = false;
      }
      if (this._stopped) {
        return;
      }
      this._ensureCardDisconnect();
      return this._scanDongles().then((function(_this) {
        return function(_arg) {
          var terminal;
          terminal = _arg.terminal;
          if ((terminal == null) || silent) {
            return void 0;
          } else {
            return ledger.delay(ledger.fup.CardManager.ScanDelayMs).then(function() {
              return _this.waitForDisconnection(silent);
            });
          }
        };
      })(this));
    };

    CardManager.prototype.waitForPowerCycle = function(silent) {
      if (silent == null) {
        silent = false;
      }
      this._ensureCardDisconnect();
      return this.waitForDisconnection(silent).then((function(_this) {
        return function() {
          return _this.waitForInsertion();
        };
      })(this));
    };

    CardManager.prototype._ensureCardDisconnect = function() {
      if (this._connectedCard != null) {
        this._connectedCard.disconnect();
        this._connectedCard = null;
        return true;
      } else {
        return false;
      }
    };

    CardManager.prototype._createScanHandler = function(_arg) {
      var mode;
      mode = _arg.mode;
      return (function(_this) {
        return function(_arg1) {
          var factory, result;
          factory = _arg1[0], result = _arg1[1];
          if ((result != null ? result.length : void 0) > 0) {
            return {
              mode: mode,
              terminal: factory.getCardTerminal(result[0]),
              factory: factory,
              result: result
            };
          } else {
            throw ledger.errors["new"](ledger.errors.NotFound, "No device found");
          }
        };
      })(this);
    };

    CardManager.prototype._scanDongles = function() {
      return this._scanWinUsbDongles().fail((function(_this) {
        return function() {
          return _this._scanDongleHid().then(function(scanResult) {
            var mode;
            mode = scanResult.mode;
            if (mode === Modes.PreferBootloader) {
              return _this._checkForBootloader(scanResult).then(function(mode) {
                return _.extend(scanResult, {
                  mode: mode
                });
              }).fail(function() {
                return _this._scanDongleHidOs();
              });
            } else {
              return scanResult;
            }
          });
        };
      })(this)).fail((function(_this) {
        return function(error) {
          if ((error != null ? error.code : void 0) === ledger.errors.NotFound) {
            return {};
          } else {
            throw error;
          }
        };
      })(this));
    };

    CardManager.prototype._scanWinUsbDongles = function() {
      return this._factories.os.list_async().then(this._createScanHandler({
        mode: Modes.Os
      })).fail((function(_this) {
        return function() {
          return _this._factories.bootloader.list_async().then(_this._createScanHandler({
            mode: Modes.Bootloader
          }));
        };
      })(this));
    };

    CardManager.prototype._scanDongleHid = function() {
      return this._factories.osHid.list_async().then(this._createScanHandler({
        mode: Modes.Os
      })).fail((function(_this) {
        return function() {
          return _this._factories.newHidBootloader.list_async().then(_this._createScanHandler({
            mode: Modes.PreferBootloader
          }));
        };
      })(this)).fail((function(_this) {
        return function() {
          return _this._factories.hidBootloader.list_async().then(_this._createScanHandler({
            mode: Modes.Bootloader
          }));
        };
      })(this));
    };

    CardManager.prototype._scanDongleHidOs = function() {
      return this._factories.osHidLedger.list_async().then(this._createScanHandler({
        mode: Modes.Os
      }));
    };

    CardManager.prototype._checkForBootloader = function(_arg) {
      var terminal;
      terminal = _arg.terminal;
      return terminal.getCard_async().then(function(card) {
        var apdu;
        apdu = new ByteString("F001000000", HEX);
        return _(card.exchange_async(apdu)).smartTimeout(500).then(function(result) {
          if (result.byteAt(0) === 0xF0) {
            throw new Error();
          } else {
            return Modes.Bootloader;
          }
        });
      });
    };

    return CardManager;

  })();

}).call(this);
