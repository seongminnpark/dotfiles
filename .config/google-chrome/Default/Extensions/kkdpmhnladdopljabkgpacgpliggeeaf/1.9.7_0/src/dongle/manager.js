(function() {
  var $error, DevicesInfo, _base,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_base = this.ledger).dongle == null) {
    _base.dongle = {};
  }

  DevicesInfo = [
    {
      productId: 0x1b7c,
      vendorId: 0x2581,
      type: 'usb',
      scanner: 'WinUsb'
    }, {
      productId: 0x2b7c,
      vendorId: 0x2581,
      type: 'hid',
      scanner: 'LegacyHid'
    }, {
      productId: 0x3b7c,
      vendorId: 0x2581,
      type: 'hid',
      scanner: 'Hid'
    }, {
      productId: 0x0000,
      vendorId: 0x2c97,
      type: 'hid',
      scanner: 'HidBlue'
    }, {
      productId: 0x0001,
      vendorId: 0x2c97,
      type: 'hid',
      scanner: 'HidNanoS'
    }, {
      productId: 0x1808,
      vendorId: 0x2581,
      type: 'usb',
      scanner: 'WinUsbBootloader'
    }, {
      productId: 0x1807,
      vendorId: 0x2581,
      type: 'hid',
      scanner: 'HidBootloader'
    }
  ];

  $error = ledger.utils.Logger.getLazyLoggerByTag("ledger.dongle.Manager").$error;

  this.ledger.dongle.Manager = (function(_super) {
    __extends(Manager, _super);

    Manager.prototype.DevicesInfo = DevicesInfo;

    Manager.prototype._running = false;

    Manager.prototype._dongles = {};

    Manager.prototype._scanning = [];

    function Manager(app) {
      this._dongles = {};
      this._factoryDongleBootloader = new ChromeapiPlugupCardTerminalFactory(0x1808);
      this._factoryDongleBootloaderHID = new ChromeapiPlugupCardTerminalFactory(0x1807);
      this._factoryDongleBootloaderHIDNew = new ChromeapiPlugupCardTerminalFactory(0x3b7c);
      this._factoryDongleOS = new ChromeapiPlugupCardTerminalFactory(0x1b7c);
      this._factoryDongleOSHID = new ChromeapiPlugupCardTerminalFactory(0x2b7c);
      this._factoryDongleOSHIDLedger = new ChromeapiPlugupCardTerminalFactory(0x3b7c, void 0, true);
      this._factoryDongleOSHIDLedgerBlue = new ChromeapiPlugupCardTerminalFactory(0x0000, void 0, true, 0x2c97);
      this._factoryDongleOSHIDLedgerNanoS = new ChromeapiPlugupCardTerminalFactory(0x0001, void 0, true, 0x2c97);
      this._isPaused = true;
    }

    Manager.prototype.start = function() {
      if (this._running) {
        return;
      }
      this._dongles = {};
      this._running = true;
      this._isPaused = false;
      return this._interval = setInterval(this._checkIfDongleIsPluggedIn.bind(this), 200);
    };

    Manager.prototype.pause = function() {
      if (!this._isPaused) {
        this._isPaused = true;
        this._emit = this.emit;
        this.emit = _.noop;
        return clearInterval(this._interval);
      }
    };

    Manager.prototype.resume = function() {
      if (this._isPaused) {
        this._isPaused = false;
        this.emit = this._emit;
        return this._interval = setInterval(this._checkIfDongleIsPluggedIn.bind(this), 200);
      }
    };

    Manager.prototype.stop = function() {
      this._running = false;
      return clearInterval(this._interval);
    };

    Manager.prototype.dongles = function() {
      return _.values(this._dongles).filter(function(d) {
        return d != null;
      });
    };

    Manager.prototype._checkIfDongleIsPluggedIn = function() {
      return this._getDevices((function(_this) {
        return function(devices) {
          var device, dongle, id, _i, _len, _ref, _results;
          for (_i = 0, _len = devices.length; _i < _len; _i++) {
            device = devices[_i];
            device.deviceId = parseInt(device.deviceId || device.device);
            if (!device.deviceId) {
              continue;
            }
            if (!_this._dongles.hasOwnProperty(device.deviceId) && !_(_this._scanning).contains(device.deviceId)) {
              _this._scanDongle(device);
            }
          }
          _ref = _this._dongles;
          _results = [];
          for (id in _ref) {
            dongle = _ref[id];
            if (_(devices).where({
              deviceId: +id
            }).length === 0) {
              if (dongle != null) {
                _results.push(dongle.disconnect());
              } else {
                _results.push(void 0);
              }
            }
          }
          return _results;
        };
      })(this));
    };

    Manager.prototype._getDevices = function(cb) {
      var devices;
      devices = [];
      return _.async.each(DevicesInfo, function(device, next, hasNext) {
        var info, type;
        type = device.type === "usb" ? chrome.usb : chrome.hid;
        info = {
          productId: device.productId,
          vendorId: device.vendorId
        };
        return type.getDevices(info, function(d) {
          devices = devices.concat(d);
          if (!hasNext || devices.length > 0) {
            if (typeof cb === "function") {
              cb(devices);
            }
          }
          return next();
        });
      });
    };

    Manager.prototype._scanDongle = function(device) {
      var scanner;
      this._scanning.push(device.deviceId);
      scanner = _(DevicesInfo).find(function(info) {
        return info.productId === device.productId && info.vendorId === device.vendorId;
      }).scanner;
      l("_scanDongle" + scanner);
      return this["_scanDongle" + scanner](device).then((function(_this) {
        return function(_arg) {
          var isInBootloaderMode, terminal;
          terminal = _arg[0], isInBootloaderMode = _arg[1];
          return terminal.getCard_async().then(function(card) {
            if (device.vendorId === 0x2c97) {
              return new BTChip(card).getWalletPublicKey_async("0'/0").then(function() {
                _this.emit('connecting', device);
                return _this._connectDongle(card, device, isInBootloaderMode);
              });
            } else {
              _this.emit('connecting', device);
              return _this._connectDongle(card, device, isInBootloaderMode);
            }
          });
        };
      })(this)).fail((function(_this) {
        return function(error) {
          $error("Failed to connect dongle: ", (error != null ? error.message : void 0) || error);
          return _this.emit('failed:connecting');
        };
      })(this))["finally"]((function(_this) {
        return function() {
          return _this._scanning = _(_this._scanning).without(device.deviceId);
        };
      })(this));
    };

    Manager.prototype._scanDongleWinUsb = function() {
      return this._factoryDongleOS.list_async().then((function(_this) {
        return function(result) {
          if (result.length > 0) {
            return [_this._factoryDongleOS.getCardTerminal(result[0]), false];
          } else {
            throw new Error("Factory dongle OS (USB) failed");
          }
        };
      })(this));
    };

    Manager.prototype._scanDongleWinUsbBootloader = function() {
      return this._factoryDongleBootloader.list_async().then((function(_this) {
        return function(result) {
          if (result.length > 0) {
            return [_this._factoryDongleBootloader.getCardTerminal(result[0]), true];
          } else {
            throw new Error("Factory dongle Bootloader (USB) failed");
          }
        };
      })(this));
    };

    Manager.prototype._scanDongleLegacyHid = function() {
      return this._factoryDongleOSHID.list_async().then((function(_this) {
        return function(result) {
          if (result.length > 0) {
            return [_this._factoryDongleOSHID.getCardTerminal(result[0]), false];
          } else {
            throw new Error("Factory dongle Legacy (HID) failed");
          }
        };
      })(this));
    };

    Manager.prototype._scanDongleHidBootloader = function() {
      return this._factoryDongleBootloaderHID.list_async().then((function(_this) {
        return function(result) {
          if (result.length > 0) {
            return [_this._factoryDongleBootloaderHID.getCardTerminal(result[0]), true];
          } else {
            throw new Error("Factory dongle Bootloader (HID) failed");
          }
        };
      })(this));
    };

    Manager.prototype._scanDongleHid = function() {
      return this._factoryDongleBootloaderHIDNew.list_async().then((function(_this) {
        return function(result) {
          if (result.length > 0) {
            return _this._factoryDongleBootloaderHIDNew.getCardTerminal(result[0]);
          } else {
            throw new Error("Factory dongle Bootloader HID new failed");
          }
        };
      })(this)).then((function(_this) {
        return function(terminal) {
          l("AFTER HID NEW");
          return terminal.getCard_async().then(function(card) {
            var apdu;
            apdu = new ByteString("F001000000", HEX);
            return card.exchange_async(apdu).then((function(_this) {
              return function(result) {
                l("Begin exchange check");
                if (result.byteAt(0) !== 0xF0) {
                  return [
                    {
                      getCard_async: function() {
                        return ledger.defer().resolve(card).promise;
                      }
                    }, true
                  ];
                } else {
                  throw new Error();
                }
              };
            })(this)).fail((function(_this) {
              return function(error) {
                l("Not in BL disconnect");
                return card.disconnect_async().then(function() {
                  throw new Error();
                });
              };
            })(this));
          });
        };
      })(this)).fail((function(_this) {
        return function() {
          l("Connect OS card");
          return _this._factoryDongleOSHIDLedger.list_async().then(function(result) {
            if (result.length > 0) {
              return [_this._factoryDongleOSHIDLedger.getCardTerminal(result[0]), false];
            } else {
              throw new Error("Factory dongle Bootloader HID new failed");
            }
          });
        };
      })(this));
    };

    Manager.prototype._scanDongleHidBlue = function() {
      l("Connect Hid blue");
      return this._factoryDongleOSHIDLedgerBlue.list_async().then((function(_this) {
        return function(result) {
          if (result.length > 0) {
            return [_this._factoryDongleOSHIDLedgerBlue.getCardTerminal(result[0]), false];
          } else {
            throw new Error("Factory dongle HID blue new failed");
          }
        };
      })(this));
    };

    Manager.prototype._scanDongleHidNanoS = function() {
      l("Connect Hid Nano S");
      return this._factoryDongleOSHIDLedgerNanoS.list_async().then((function(_this) {
        return function(result) {
          if (result.length > 0) {
            return [_this._factoryDongleOSHIDLedgerBlue.getCardTerminal(result[0]), false];
          } else {
            throw new Error("Factory dongle HID blue new failed");
          }
        };
      })(this));
    };

    Manager.prototype._connectDongle = function(card, device, isInBlMode) {
      var dongle;
      _.extend(card, {
        deviceId: device.deviceId,
        productId: device.productId,
        vendorId: device.vendorId
      });
      dongle = new ledger.dongle.Dongle(card);
      this._dongles[device.deviceId] = dongle;
      l("Connect ", arguments);
      dongle.connect(isInBlMode).then((function(_this) {
        return function(state) {
          var States;
          l("Connection done", state);
          States = ledger.dongle.States;
          switch (state) {
            case States.LOCKED:
              _this.emit('connected', dongle);
              break;
            case States.UNLOCKED:
              _this.emit('connected', dongle);
              break;
            case States.BLANK:
              _this.emit('connected', dongle);
          }
          return l("Connection done", state);
        };
      })(this)).fail((function(_this) {
        return function(error) {
          e("Connection failed", error);
          return _this.emit('connection:failure', error);
        };
      })(this)).done();
      dongle.once('forged', (function(_this) {
        return function(event) {
          return _this.emit('forged', dongle);
        };
      })(this));
      dongle.once('state:disconnected', (function(_this) {
        return function(event) {
          delete _this._dongles[device.deviceId];
          return _this.emit('disconnected', dongle);
        };
      })(this));
    };

    Manager.prototype.getConnectedDongles = function() {
      return _(_.values(this._dongles)).filter(function(d) {
        return (d != null) && d.state !== ledger.dongle.States.DISCONNECTED;
      });
    };

    return Manager;

  })(EventEmitter);

}).call(this);
