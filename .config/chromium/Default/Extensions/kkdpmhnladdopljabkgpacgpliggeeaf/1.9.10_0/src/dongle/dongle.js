(function() {
  var $log, Attestation, Attestations, BitIdRootPath, Errors, Firmwares, States, _base,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  States = {
    UNDEFINED: void 0,
    LOCKED: 'locked',
    UNLOCKED: 'unlocked',
    BLANK: 'blank',
    DISCONNECTED: 'disconnected',
    ERROR: 'error'
  };

  Firmwares = ledger.dongle.Firmwares;

  Attestations = {};

  Attestation = (function() {
    Attestation.prototype.xPoint = null;

    Attestation.prototype.yPoint = null;

    Attestation.prototype.Bytes = null;

    Attestation.prototype.BatchId = null;

    Attestation.prototype.DerivationId = null;

    function Attestation(batchId, derivationId, value) {
      var hex, _i, _len, _ref;
      if (_(this).isKindOf(Attestation)) {
        this.BatchId = batchId;
        this.DerivationId = derivationId;
        this.Id = Convert.toHexInt(batchId) + Convert.toHexInt(derivationId);
        this.String = value;
        _ref = this.String.match(/\w\w/g);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          hex = _ref[_i];
          this.Bytes = parseInt(hex, 16);
        }
        this.xPoint = this.String.substr(2, 64);
        this.yPoint = this.String.substr(66);
        Attestations[this.Id] = this;
      } else {
        new Attestation(batchId, derivationId, value);
      }
    }

    Attestation.prototype.isBeta = function() {
      return this.BatchId === 0;
    };

    Attestation.prototype.isProduction = function() {
      return !this.isBeta();
    };

    Attestation.prototype.getAttestationId = function() {
      return new ByteString(this.Id, HEX);
    };

    return Attestation;

  })();

  Attestation(0, 1, "04e69fd3c044865200e66f124b5ea237c918503931bee070edfcab79a00a25d6b5a09afbee902b4b763ecf1f9c25f82d6b0cf72bce3faf98523a1066948f1a395f");

  Attestation(1, 1, "04223314cdffec8740150afe46db3575fae840362b137316c0d222a071607d61b2fd40abb2652a7fea20e3bb3e64dc6d495d59823d143c53c4fe4059c5ff16e406");

  Attestation(2, 1, "04c370d4013107a98dfef01d6db5bb3419deb9299535f0be47f05939a78b314a3c29b51fcaa9b3d46fa382c995456af50cd57fb017c0ce05e4a31864a79b8fbfd6");

  BitIdRootPath = "0'/0/0xb11e";

  Errors = this.ledger.errors;

  $log = function() {
    return ledger.utils.Logger.getLoggerByTag("Dongle");
  };

  if ((_base = this.ledger).dongle == null) {
    _base.dongle = {};
  }

  _.extend(this.ledger.dongle, {
    States: States,
    BitIdRootPath: BitIdRootPath
  });


  /*
  Signals :
    @emit state:changed(States)
    @emit state:locked
    @emit state:unlocked
    @emit state:blank
    @emit state:disconnected
    @emit state:error(args...)
   */

  this.ledger.dongle.Dongle = (function(_super) {
    var Dongle, _btchipQueue;

    __extends(Dongle, _super);

    Dongle = Dongle;

    Dongle.prototype.id = void 0;

    Dongle.prototype.deviceId = void 0;

    Dongle.prototype.productId = void 0;

    Dongle.prototype.state = States.UNDEFINED;

    Dongle.prototype.firmwareVersion = void 0;

    Dongle.prototype.operationMode = void 0;

    Dongle.prototype._btchip = void 0;

    Dongle.prototype._xpubs = [];

    Dongle.prototype._pin = void 0;

    _btchipQueue = void 0;

    function Dongle(card) {
      Dongle.__super__.constructor.apply(this, arguments);
      this._attestation = null;
      this._xpubs = _.clone(this._xpubs);
      this.id = card.deviceId;
      this.deviceId = card.deviceId;
      this.productId = card.productId;
      _btchipQueue = new ledger.utils.PromiseQueue("Dongle#" + this.id);
      this._btchip = new BTChip(card);
    }

    Dongle.prototype.connect = function(forceBootloader, callback) {
      if (forceBootloader == null) {
        forceBootloader = false;
      }
      if (callback == null) {
        callback = void 0;
      }
      this._forceBl = forceBootloader;
      this.state = States.UNDEFINED;
      if (!this.isInBootloaderMode()) {
        return this._recoverFirmwareVersion().then((function(_this) {
          return function() {
            if (_this.getFirmwareInformation().hasSetupFirmwareSupport() && !_this.getFirmwareInformation().hasScreenAndButton()) {
              return _this.getRemainingPinAttempt().then(function() {
                _this._setState(States.LOCKED);
                return States.LOCKED;
              }).fail(function(error) {
                _this._setState(States.BLANK);
                return States.BLANK;
              });
            } else {
              if (_this.getFirmwareInformation().hasScreenAndButton()) {
                _this.ensureDeviceIsUnlocked(true);
                _this._setState(States.UNLOCKED);
                return States.UNLOCKED;
              } else {
                return _this._sendApdu(0xE0, 0x40, 0x00, 0x00, 0x05, 0x01).then(function(result) {
                  var configureBlank;
                  switch (_this.getSw()) {
                    case 0x9000:
                    case 0x6982:
                      _this._setState(States.LOCKED);
                      return States.LOCKED;
                    case 0x6985:
                      configureBlank = function() {
                        _this._setState(States.BLANK);
                        return States.BLANK;
                      };
                      if (_this.getFirmwareInformation().hasSubFirmwareSupport() && _this.getFirmwareInformation().hasOperationFirmwareSupport()) {
                        return _this.restoreSetup().then(function() {
                          _this._setState(States.LOCKED);
                          return States.LOCKED;
                        })["catch"](function() {
                          return configureBlank();
                        });
                      } else {
                        return configureBlank();
                      }
                      break;
                    case 0x6faa:
                      throw "Invalid statue - 0x6faa";
                  }
                });
              }
            }
          };
        })(this))["catch"]((function(_this) {
          return function(error) {
            console.error("Fail to initialize Dongle :", error);
            _this._setState(States.ERROR);
            throw error;
          };
        })(this));
      } else {
        return ledger.delay(0).then((function(_this) {
          return function() {
            return _this._setState(States.BLANK);
          };
        })(this)).then(function() {
          return States.BLANK;
        });
      }
    };

    Dongle.prototype.ensureDeviceIsUnlocked = function(runForever) {
      if (runForever == null) {
        runForever = false;
      }
      if (this._ensureDeviceIsUnlockedTimeout != null) {
        return;
      }
      return this._ensureDeviceIsUnlockedTimeout = _.delay((function(_this) {
        return function() {
          return _this.getPublicAddress("0'/0").then(function() {
            return true;
          }).fail(function(err) {
            if (_this.state === States.LOCKED) {
              _this.disconnect();
            }
            return true;
          }).then(function() {
            _this._ensureDeviceIsUnlockedTimeout = void 0;
            if (runForever) {
              return _this.ensureDeviceIsUnlocked(runForever);
            }
          }).done();
        };
      })(this), 30000);
    };

    Dongle.prototype.setCoinVersion = function(p2pkhVersion, p2shVersion, callback) {
      var d;
      if (callback == null) {
        callback = void 0;
      }
      d = ledger.defer(callback);
      if (this.getFirmwareInformation().hasUInt16CoinVersion()) {
        this._sendApdu(new ByteString("E014000002" + (Convert.toHexShort(p2pkhVersion)) + (Convert.toHexShort(p2shVersion)), HEX)).then(function() {
          return d.resolve();
        }).fail(function(e) {
          return d.reject(e);
        });
      } else {
        this._sendApdu(new ByteString("E014000002" + (("0" + p2pkhVersion.toString(16)).substr(-2)) + (("0" + p2shVersion.toString(16)).substr(-2)), HEX)).then(function() {
          return d.resolve();
        }).fail(function(e) {
          return d.reject(e);
        });
      }
      return d.promise;
    };

    Dongle.prototype.getCoinVersion = function(callback) {
      var d;
      if (callback == null) {
        callback = void 0;
      }
      d = ledger.defer(callback);
      d.resolve(this._sendApdu(new ByteString("E016000000", HEX)).then((function(_this) {
        return function(result) {
          var P2PKH, P2SH, message, short;
          if (_this.getFirmwareInformation().hasUInt16CoinVersion()) {
            P2PKH = (result.byteAt(0) << 8) + result.byteAt(1);
            P2SH = (result.byteAt(2) << 8) + result.byteAt(3);
            message = result.bytes(5, result.byteAt(4));
            short = result.bytes(5 + message.length + 1, result.byteAt(5 + message.length));
          } else {
            P2PKH = result.byteAt(0);
            P2SH = result.byteAt(1);
            message = result.bytes(3, result.byteAt(2));
            short = result.bytes(3 + message.length + 1, result.byteAt(3 + message.length));
          }
          return {
            P2PKH: P2PKH,
            P2SH: P2SH,
            message: "" + message + " signed message:\n",
            short: short
          };
        };
      })(this)).fail((function(_this) {
        return function() {
          l("FAILED");
          return {
            P2PKH: ledger.bitcoin.Networks.bitcoin.version.regular,
            P2SH: ledger.bitcoin.Networks.bitcoin.version.P2SH,
            message: "Bitcoin signed message:\n",
            short: 'BTC'
          };
        };
      })(this)));
      return d.promise;
    };

    Dongle.prototype.getFirmwareInformation = function() {
      return this._firmwareInformation;
    };

    Dongle.prototype.getSw = function() {
      return this._btchip.card.SW;
    };

    Dongle.prototype.disconnect = function() {
      if (this._ensureDeviceIsUnlockedTimeout != null) {
        clearTimeout(this._ensureDeviceIsUnlockedTimeout);
      }
      this._ensureDeviceIsUnlockedTimeout = void 0;
      this._btchip.card.disconnect();
      return this._setState(States.DISCONNECTED);
    };

    Dongle.prototype.getStringFirmwareVersion = function() {
      return Try((function(_this) {
        return function() {
          return _this.getFirmwareInformation().getStringFirmwareVersion();
        };
      })(this)).getOrElse('unknown');
    };

    Dongle.prototype.getIntFirmwareVersion = function() {
      return this.getFirmwareInformation().getIntFirmwareVersion();
    };


    /*
      Gets the raw version {ByteString} of the dongle.
    
      @param [Boolean] isInBootLoaderMode Must be true if the current dongle is in bootloader mode.
      @param [Boolean] forceBl Force the call in BootLoader mode
      @param [Function] callback Called once the version is retrieved. The callback must be prototyped like size `(version, error) ->`
      @return [Q.Promise]
     */

    Dongle.prototype.getRawFirmwareVersion = function(isInBootLoaderMode, forceBl, checkHiddenReloader, callback) {
      if (forceBl == null) {
        forceBl = false;
      }
      if (checkHiddenReloader == null) {
        checkHiddenReloader = false;
      }
      if (callback == null) {
        callback = void 0;
      }
      return _btchipQueue.enqueue("getRawFirmwareVersion", (function(_this) {
        return function() {
          var apdu, d;
          d = ledger.defer(callback);
          apdu = new ByteString((!isInBootLoaderMode && !forceBl ? "E0C4000000" : "F001000000"), HEX);
          _this._sendApdu(apdu).then(function(result) {
            var result2, sw;
            sw = _this._btchip.card.SW;
            if (!isInBootLoaderMode && !forceBl) {
              if (sw === 0x9000) {
                return d.resolve([result.byteAt(1), (result.byteAt(2) << 16) + (result.byteAt(3) << 8) + result.byteAt(4)]);
              } else {
                return d.resolve(_this.getRawFirmwareVersion(isInBootLoaderMode, true));
              }
            } else {
              if (sw === 0x9000) {
                result2 = result;
                apdu = new ByteString("E001000000", HEX);
                if (checkHiddenReloader) {
                  return _this._sendApdu(apdu).then(function(result) {
                    if (_this._btchip.card.SW !== 0x9000) {
                      result = result2;
                    }
                    return d.resolve([0, (result.byteAt(5) << 16) + (result.byteAt(6) << 8) + result.byteAt(7)]);
                  }).fail(function() {
                    result = result2;
                    return d.resolve([0, (result.byteAt(5) << 16) + (result.byteAt(6) << 8) + result.byteAt(7)]);
                  });
                } else {
                  result = result2;
                  return d.resolve([0, (result.byteAt(5) << 16) + (result.byteAt(6) << 8) + result.byteAt(7)]);
                }
              } else if (!isInBootLoaderMode && (sw === 0x6d00 || sw === 0x6e00)) {
                return d.resolve([0, (1 << 16) + (4 << 8) + 3.]);
              } else {
                return d.rejectWithError(ledger.errors.UnknowError, "Failed to get version");
              }
            }
          }).fail(function(error) {
            return d.rejectWithError(ledger.errors.UnknowError, error);
          })["catch"](function(error) {
            return console.error("Fail to getRawFirmwareVersion :", error);
          }).done();
          return d.promise;
        };
      })(this));
    };

    Dongle.prototype.isInBootloaderMode = function() {
      if (this.productId === 0x1808 || this.productId === 0x1807 || this._forceBl) {
        return true;
      } else {
        return false;
      }
    };

    Dongle.prototype.getFirmwareUpdater = function() {
      return ledger.fup.FirmwareUpdater.instance;
    };

    Dongle.prototype.isFirmwareUpdateAvailable = function(callback) {
      var d;
      if (callback == null) {
        callback = void 0;
      }
      d = ledger.defer(callback);
      this.getFirmwareUpdater().getFirmwareUpdateAvailability(this).then(function(availablity) {
        return d.resolve(availablity.result === ledger.fup.FirmwareUpdater.FirmwareAvailabilityResult.Update);
      }).fail(function(er) {
        return d.rejectWithError(er);
      }).done();
      return d.promise;
    };

    Dongle.prototype.isFirmwareOverwriteOrUpdateAvailable = function(callback) {
      var d;
      if (callback == null) {
        callback = void 0;
      }
      d = ledger.defer(callback);
      this.getFirmwareUpdater().getFirmwareUpdateAvailability(this).then(function(availablity) {
        return d.resolve(availablity.result === ledger.fup.FirmwareUpdater.FirmwareAvailabilityResult.Update || availablity.result === ledger.fup.FirmwareUpdater.FirmwareAvailabilityResult.Overwrite);
      }).fail(function(er) {
        return d.rejectWithError(er);
      }).done();
      return d.promise;
    };

    Dongle.prototype.isCertified = function(callback) {
      if (callback == null) {
        callback = void 0;
      }
      return this._checkCertification(false, callback);
    };

    Dongle.prototype.isBetaCertified = function(callback) {
      if (callback == null) {
        callback = void 0;
      }
      return this._checkCertification(true, callback);
    };

    Dongle.prototype._checkCertification = function(isBeta, callback) {
      if (callback == null) {
        callback = void 0;
      }
      return _btchipQueue.enqueue("checkCertification", (function(_this) {
        return function() {
          var d, random, randomValues;
          d = ledger.defer(callback);
          if (_this.getIntFirmwareVersion() < ledger.dongle.Firmwares.V_L_1_0_0) {
            return d.resolve(true).promise;
          }
          randomValues = new Uint32Array(2);
          crypto.getRandomValues(randomValues);
          random = _.str.lpad(randomValues[0].toString(16), 8, '0') + _.str.lpad(randomValues[1].toString(16), 8, '0');
          _this._sendApdu(new ByteString("E0" + "C2" + "00" + "00" + "08" + random, HEX), [0x9000]).then(function(result) {
            var affinePoint, attestation, dataSig, dataSigBytes, dataToSign, domain, ecsig, n, pubkey, sha;
            attestation = result.toString(HEX);
            dataToSign = attestation.substring(16, 32) + random;
            dataSig = attestation.substring(32);
            dataSig = "30" + dataSig.substr(2);
            dataSigBytes = (function() {
              var _i, _len, _ref, _results;
              _ref = dataSig.match(/\w\w/g);
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                n = _ref[_i];
                _results.push(parseInt(n, 16));
              }
              return _results;
            })();
            sha = new JSUCrypt.hash.SHA256();
            domain = JSUCrypt.ECFp.getEcDomainByName("secp256k1");
            if (isBeta) {
              Attestation = Attestations["0000000000000001"];
            } else {
              Attestation = Attestations[result.bytes(0, 8).toString()];
            }
            affinePoint = new JSUCrypt.ECFp.AffinePoint(Attestation.xPoint, Attestation.yPoint);
            pubkey = new JSUCrypt.key.EcFpPublicKey(256, domain, affinePoint);
            ecsig = new JSUCrypt.signature.ECDSA(sha);
            ecsig.init(pubkey, JSUCrypt.signature.MODE_VERIFY);
            if (ecsig.verify(dataToSign, dataSigBytes)) {
              _this._attestation = Attestation;
              d.resolve(_this);
            } else {
              d.rejectWithError(Errors.DongleNotCertified);
            }
          }).fail(function(err) {
            return d.rejectWithError(Errors.CommunicationError, err);
          }).done();
          return d.promise;
        };
      })(this));
    };

    Dongle.prototype.getAttestation = function() {
      return this._attestation;
    };

    Dongle.prototype.getState = function(callback) {
      var d;
      if (callback == null) {
        callback = void 0;
      }
      d = ledger.defer(callback);
      if (this.state === States.UNDEFINED) {
        this.once('state:changed', (function(_this) {
          return function(e, state) {
            return d.resolve(state);
          };
        })(this));
      } else {
        d.resolve(this.state);
      }
      return d.promise;
    };

    Dongle.prototype.getRemainingPinAttempt = function(callback) {
      if (callback == null) {
        callback = void 0;
      }
      return _btchipQueue.enqueue("getRemainingPinAttempt", (function(_this) {
        return function() {
          var d;
          d = ledger.defer(callback);
          _this._sendApdu(new ByteString("E0228000010000", HEX), [0x9000])["catch"](function(statusCode) {
            var m;
            if (m = statusCode.match(/63c(\d)/)) {
              return d.resolve(parseInt(m[1]));
            } else {
              return d.reject(_this._handleErrorCode(statusCode));
            }
          }).done();
          return d.promise;
        };
      })(this));
    };

    Dongle.prototype.unlockWithPinCode = function(pin, callback) {
      if (callback == null) {
        callback = void 0;
      }
      if (this.state === States.UNLOCKED) {
        Errors["throw"](Errors.DongleAlreadyUnlock);
      }
      return _btchipQueue.enqueue("unlockWithPinCode", (function(_this) {
        return function() {
          var d;
          d = ledger.defer(callback);
          _this._pin = pin;
          _this._btchip.verifyPin_async(new ByteString(_this._pin, ASCII)).then(function() {
            if (_this.getFirmwareInformation().hasSubFirmwareSupport() && _this.getFirmwareInformation().hasSetupFirmwareSupport()) {
              d.resolve();
              return;
            }
            return _this._sendApdu(0xE0, 0x26, 0x01, 0x01, 0x01, 0x01, [0x9000]).then(function() {
              var mode;
              if (_this.getIntFirmwareVersion() >= Firmwares.V_B_1_4_13) {
                mode = _this.getIntFirmwareVersion() >= Firmwares.V_L_1_0_0 ? 0x02 : 0x01;
                _this._sendApdu(0xE0, 0x26, mode, 0x00, 0x01, 0x01, [0x9000]).fail(function() {
                  return e('Unlock FAIL', arguments);
                }).done();
              }
              _this._setState(States.UNLOCKED);
              return d.resolve();
            }).fail(function(err) {
              var error;
              error = Errors["new"](Errors.NotSupportedDongle, err);
              console.log("unlockWithPinCode 2 fail :", err);
              return d.reject(error);
            })["catch"](function(error) {
              return console.error("Fail to unlockWithPinCode 2 :", error);
            }).done();
          }).fail(function(err) {
            var error;
            console.error("Fail to unlockWithPinCode 1 :", err);
            error = _this._handleErrorCode(err);
            return d.reject(error);
          })["catch"](function(error) {
            return console.error("Fail to unlockWithPinCode 1 :", error);
          }).done();
          return d.promise;
        };
      })(this));
    };

    Dongle.prototype.lock = function() {
      if (this.state !== ledger.dongle.States.BLANK && (this.state != null)) {
        return this._setState(States.LOCKED);
      }
    };


    /*
    @overload setup(pin, callback)
      @param [String] pin
      @param [Function] callback
      @return [Q.Promise]
    
    @overload setup(pin, options={}, callback=undefined)
      @param [String] pin
      @param [String] restoreSeed
        @options options [String] restoreSeed
        @options options [ByteString] keyMap
      @param [Function] callback
      @return [Q.Promise]
     */

    Dongle.prototype.setup = function(pin, restoreSeed, callback) {
      var _ref;
      if (callback == null) {
        callback = void 0;
      }
      if (this.state !== States.BLANK) {
        Errors["throw"](Errors.DongleNotBlank);
      }
      if (!callback && typeof restoreSeed === 'function') {
        _ref = [callback, restoreSeed], restoreSeed = _ref[0], callback = _ref[1];
      }
      return _btchipQueue.enqueue("setup", (function(_this) {
        return function() {
          var bytesSeed, d;
          d = ledger.defer(callback);
          if (restoreSeed != null) {
            bytesSeed = new ByteString(restoreSeed, HEX);
            if (bytesSeed.length !== 64) {
              e('Invalid seed :', restoreSeed);
              return d.reject().promise;
            }
          }
          _this._btchip.setupNew_async(BTChip.MODE_WALLET, BTChip.FEATURE_DETERMINISTIC_SIGNATURE | BTChip.FEATURE_NO_2FA_P2SH, ledger.config.network.version.regular, ledger.config.network.version.P2SH, new ByteString(pin, ASCII), void 0, BTChip.QWERTY_KEYMAP_NEW, restoreSeed != null, bytesSeed).then(function() {
            var msg;
            if (restoreSeed != null) {
              msg = "Seed restored, please reopen the extension";
            } else {
              msg = "Plug the dongle into a secure host to read the generated seed, then reopen the extension";
            }
            console.warn(msg);
            _this._setState(States.ERROR, msg);
            return d.resolve();
          }).fail(function(err) {
            var error;
            error = Errors["new"](Errors.UnknowError, err);
            return d.reject(error);
          })["catch"](function(error) {
            return console.error("Fail to setup :", error);
          }).done();
          return d.promise;
        };
      })(this));
    };

    Dongle.prototype.setupSwappedBip39 = function(pin, userEntropy, callback) {
      if (userEntropy == null) {
        userEntropy = void 0;
      }
      if (callback == null) {
        callback = void 0;
      }
      return this._setupSwappedBip39({
        pin: pin,
        userEntropy: userEntropy,
        callback: callback
      });
    };

    Dongle.prototype.restoreSwappedBip39 = function(pin, restoreSeed, callback) {
      if (callback == null) {
        callback = void 0;
      }
      return this._setupSwappedBip39({
        pin: pin,
        restoreSeed: restoreSeed,
        callback: callback
      });
    };

    Dongle.prototype.verifyAddressOnScreen = function(path, callback) {
      if (this.state !== States.UNLOCKED && this.state !== States.UNDEFINED) {
        Errors["throw"](Errors.DongleLocked, 'Cannot get a public while the key is not unlocked');
      }
      return _btchipQueue.enqueue("getPublicAddress", (function(_this) {
        return function() {
          var d;
          d = ledger.defer(callback);
          _this._btchip.getWalletPublicKey_async(path, true, ledger.config.network.handleSegwit).then(function(result) {
            return _.defer(function() {
              return d.resolve(result);
            });
          }).fail(function(err) {
            return _.defer(function() {
              return d.resolve({});
            });
          }).done();
          return d.promise;
        };
      })(this));
    };

    Dongle.prototype._setupSwappedBip39 = function(_arg) {
      var callback, d, index, indexes, pin, restoreSeed, userEntropy;
      pin = _arg.pin, userEntropy = _arg.userEntropy, restoreSeed = _arg.restoreSeed, callback = _arg.callback;
      if (this.state !== States.BLANK) {
        Errors["throw"](Errors.DongleNotBlank);
      }
      userEntropy || (userEntropy = ledger.bitcoin.bip39.generateEntropy());
      if (restoreSeed != null) {
        indexes = ledger.bitcoin.bip39.mnemonicPhraseToWordIndexes(restoreSeed);
        restoreSeed = ((function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = indexes.length; _i < _len; _i++) {
            index = indexes[_i];
            _results.push(Convert.toHexShort(index));
          }
          return _results;
        })()).join('');
      }
      d = ledger.defer(callback);
      this._btchip.setupNew_async(BTChip.MODE_WALLET, BTChip.FEATURE_DETERMINISTIC_SIGNATURE | BTChip.FEATURE_NO_2FA_P2SH, ledger.config.network.version.regular, ledger.config.network.version.P2SH, new ByteString(pin, ASCII), void 0, void 0, false, new ByteString(restoreSeed || userEntropy, HEX), void 0, restoreSeed == null, restoreSeed != null).then((function(_this) {
        return function(result) {
          var i, mnemonic, wordIndex, _i;
          mnemonic = [];
          for (i = _i = 0; _i < 24; i = ++_i) {
            wordIndex = (result['swappedMnemonic'].byteAt(2 * i) << 8) + (result['swappedMnemonic'].byteAt(2 * i + 1));
            mnemonic.push(ledger.bitcoin.bip39.wordlist[wordIndex]);
          }
          return d.resolve(_.extend(result, {
            mnemonic: mnemonic
          }));
        };
      })(this)).fail((function(_this) {
        return function(error) {
          return d.reject(error);
        };
      })(this)).done();
      return d.promise;
    };

    Dongle.prototype.setupFinalizeBip39 = function(callback) {
      if (callback == null) {
        callback = void 0;
      }
      return ledger.defer(callback).resolve(this._btchip.setupFinalizeBip39_async()).promise;
    };

    Dongle.prototype.restoreFinalizeBip29 = function(callback) {
      if (callback == null) {
        callback = void 0;
      }
      return ledger.defer(callback).resolve(this._btchip.setupRecovery_async()).promise;
    };

    Dongle.prototype.restoreSetup = function(callback) {
      if (callback == null) {
        callback = void 0;
      }
      return this._sendApdu(0xE0, 0x20, 0xFF, 0x00, 0x01, 0x00, [0x9000]).then(callback || _.noop);
    };

    Dongle.prototype.isSwappedBip39FeatureEnabled = function() {
      return this.setupSwappedBip39("0000").then(function() {
        return true;
      }).fail(function() {
        return false;
      });
    };

    Dongle.prototype.getPublicAddress = function(path, callback) {
      if (callback == null) {
        callback = void 0;
      }
      if (this.state !== States.UNLOCKED && this.state !== States.UNDEFINED) {
        Errors["throw"](Errors.DongleLocked, 'Cannot get a public while the key is not unlocked');
      }
      return _btchipQueue.enqueue("getPublicAddress", (function(_this) {
        return function() {
          var d;
          d = ledger.defer(callback);
          _this._btchip.getWalletPublicKey_async(path, false, false).then(function(result) {
            return _.defer(function() {
              return d.resolve(result);
            });
          }).fail(function(err) {
            var error;
            error = _this._handleErrorCode(err);
            return _.defer(function() {
              return d.reject(error);
            });
          })["catch"](function(error) {
            return console.error("Fail to getPublicAddress :", error);
          }).done();
          return d.promise;
        };
      })(this));
    };

    Dongle.prototype.signMessage = function(message, _arg, callback) {
      var path, prefix, pubKey;
      prefix = _arg.prefix, path = _arg.path, pubKey = _arg.pubKey;
      if (callback == null) {
        callback = void 0;
      }
      if (prefix == null) {
        prefix = '\x18Bitcoin Signed Message:\n';
      }
      if (pubKey == null) {
        return this.getPublicAddress(path).then((function(_this) {
          return function(address) {
            console.log("address=", address);
            return _this.signMessage(message, {
              path: path,
              pubKey: address.publicKey
            }, callback);
          };
        })(this));
      } else {
        return _btchipQueue.enqueue("signMessage", (function(_this) {
          return function() {
            var d;
            d = ledger.defer(callback);
            message = new ByteString(message, ASCII);
            _this._btchip.signMessagePrepare_async(path, message).then(function() {
              return _this._btchip.signMessageSign_async((_this._pin != null) ? new ByteString(_this._pin, ASCII) : new ByteString("0000", ASCII));
            }).then(function(sig) {
              var signedMessage;
              signedMessage = _this._convertMessageSignature(pubKey, message, prefix, sig.signature);
              return d.resolve(signedMessage);
            })["catch"](function(error) {
              console.error("Fail to signMessage :", error);
              return d.reject(error);
            }).done();
            return d.promise;
          };
        })(this));
      }
    };

    Dongle.prototype.initiateSecureScreen = function(pubKey, callback) {
      if (callback == null) {
        callback = void 0;
      }
      return _btchipQueue.enqueue("initiateSecureScreen", (function(_this) {
        return function() {
          var d;
          d = ledger.defer(callback);
          if (_this.state !== States.UNLOCKED) {
            d.rejectWithError(Errors.DongleLocked);
          } else if (pubKey.match(/^[0-9A-Fa-f]{130}$/) == null) {
            d.rejectWithError(Errors.InvalidArgument, "Invalid pubKey : " + pubKey);
          } else {
            _this._sendApdu(new ByteString("E0" + "12" + "01" + "00" + "41" + pubKey, HEX), [0x9000]).then(function(c) {
              l('initiateSecureScreen', c);
              return d.resolve(c.toString());
            }).fail(function(error) {
              return d.reject(error);
            }).done();
          }
          return d.promise;
        };
      })(this));
    };

    Dongle.prototype.confirmSecureScreen = function(resp, callback) {
      if (callback == null) {
        callback = void 0;
      }
      return _btchipQueue.enqueue("confirmSecureScreen", (function(_this) {
        return function() {
          var d;
          d = ledger.defer(callback);
          if (_this.state !== States.UNLOCKED) {
            d.rejectWithError(Errors.DongleLocked);
          } else if (resp.match(/^[0-9A-Fa-f]{32}$/) == null) {
            d.rejectWithError(Errors.InvalidArgument, "Invalid challenge resp : " + resp);
          } else {
            _this._sendApdu(new ByteString("E0" + "12" + "02" + "00" + "10" + resp, HEX), [0x9000]).then(function() {
              l('confirmSecureScreen');
              return d.resolve();
            }).fail(function(error) {
              return d.reject(error);
            }).done();
          }
          return d.promise;
        };
      })(this));
    };

    Dongle.prototype.getExtendedPublicKey = function(path, callback) {
      var d, xpub;
      if (callback == null) {
        callback = void 0;
      }
      if (this.state !== States.UNLOCKED) {
        Errors["throw"](Errors.DongleLocked);
      }
      d = ledger.defer(callback);
      if (this._xpubs[path] != null) {
        return d.resolve(this._xpubs[path]).promise;
      }
      xpub = new ledger.wallet.ExtendedPublicKey(this, path);
      xpub.initialize((function(_this) {
        return function() {
          _this._xpubs[path] = xpub;
          return d.resolve(xpub);
        };
      })(this));
      return d.promise;
    };


    /*
    @param [Array<Object>] inputs
    @param [Array] associatedKeysets
    @param changePath
    @param [String] changeAddress
    @param [String] recipientAddress
    @param [Amount] amount
    @param [Amount] fee
    @param [Integer] lockTime
    @param [Integer] sighashType
    @param [String] authorization hex encoded
    @param [Object] resumeData
    @return [Q.Promise] Resolve with resumeData
     */

    Dongle.prototype.createPaymentTransaction = function(inputs, associatedKeysets, changePath, changeAddress, recipientAddress, amount, fees, data, lockTime, sighashType, authorization, resumeData) {
      var publicKey, trustedInput;
      if (resumeData != null) {
        resumeData = _.clone(resumeData);
        resumeData.scriptData = new ByteString(resumeData.scriptData, HEX);
        resumeData.trustedInputs = (function() {
          var _i, _len, _ref, _results;
          _ref = resumeData.trustedInputs;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            trustedInput = _ref[_i];
            _results.push(new ByteString(trustedInput, HEX));
          }
          return _results;
        })();
        resumeData.publicKeys = (function() {
          var _i, _len, _ref, _results;
          _ref = resumeData.publicKeys;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            publicKey = _ref[_i];
            _results.push(new ByteString(publicKey, HEX));
          }
          return _results;
        })();
      }
      if (this.getFirmwareInformation().isUsingInputFinalizeFull()) {
        return this._createPaymentTransactionNew(inputs, associatedKeysets, changePath, changeAddress, recipientAddress, amount, fees, lockTime, sighashType, authorization, data, resumeData);
      } else {
        return this._createPaymentTransaction(inputs, associatedKeysets, changePath, recipientAddress, amount, fees, lockTime, sighashType, authorization, resumeData);
      }
    };

    Dongle.prototype._createPaymentTransaction = function(inputs, associatedKeysets, changePath, recipientAddress, amount, fees, lockTime, sighashType, authorization, resumeData) {
      return _btchipQueue.enqueue("createPaymentTransaction", (function(_this) {
        return function() {
          return _this._btchip.createPaymentTransaction_async(inputs, associatedKeysets, changePath, new ByteString(recipientAddress, ASCII), amount.toByteString(), fees.toByteString(), lockTime && new ByteString(Convert.toHexInt(lockTime), HEX), sighashType && new ByteString(Convert.toHexInt(sighashType), HEX), authorization && new ByteString(authorization, HEX), resumeData).then(function(result) {
            var publicKey, trustedInput;
            if (result instanceof ByteString) {
              result = result.toString(HEX);
            } else {
              result.scriptData = result.scriptData.toString(HEX);
              result.trustedInputs = (function() {
                var _i, _len, _ref, _results;
                _ref = result.trustedInputs;
                _results = [];
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                  trustedInput = _ref[_i];
                  _results.push(trustedInput.toString(HEX));
                }
                return _results;
              })();
              result.publicKeys = (function() {
                var _i, _len, _ref, _results;
                _ref = result.publicKeys;
                _results = [];
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                  publicKey = _ref[_i];
                  _results.push(publicKey.toString(HEX));
                }
                return _results;
              })();
              if (result.authorizationPaired != null) {
                result.authorizationPaired = result.authorizationPaired.toString(HEX);
              }
              if (result.authorizationReference != null) {
                result.authorizationReference = result.authorizationReference.toString(HEX);
              }
            }
            return result;
          });
        };
      })(this));
    };

    Dongle.prototype._createPaymentTransactionNew = function(inputs, associatedKeysets, changePath, changeAddress, recipientAddress, amount, fees, lockTime, sighashType, authorization, data, resumeData) {
      return this.getPublicAddress(changePath).then((function(_this) {
        return function(result) {
          var OP_CHECKSIG, OP_DUP, OP_EQUAL, OP_EQUALVERIFY, OP_HASH160, OP_RETURN, OpReturnScript, P2shScript, PkScript, VI, changeAddress2, changeAmount, inputAmount, inputAmounts, numberOfOutputs, outputScript, task, totalInputAmount, _i, _len;
          changeAddress2 = result.bitcoinAddress.toString(ASCII);
          inputAmounts = (function() {
            var i, index, prevTx, _i, _len, _ref, _results;
            _results = [];
            for (i = _i = 0, _len = inputs.length; _i < _len; i = ++_i) {
              _ref = inputs[i], prevTx = _ref[0], index = _ref[1];
              _results.push(ledger.Amount.fromSatoshi(prevTx.outputs[index].amount));
            }
            return _results;
          })();
          totalInputAmount = ledger.Amount.fromSatoshi(0);
          for (_i = 0, _len = inputAmounts.length; _i < _len; _i++) {
            inputAmount = inputAmounts[_i];
            totalInputAmount = totalInputAmount.add(inputAmount);
          }
          changeAmount = totalInputAmount.subtract(amount).subtract(fees);
          if (changeAmount.lte(0)) {
            changePath = void 0;
          }
          VI = _this._btchip.createVarint.bind(_this._btchip);
          OP_DUP = new ByteString('76', HEX);
          OP_HASH160 = new ByteString('A9', HEX);
          OP_EQUAL = new ByteString('87', HEX);
          OP_EQUALVERIFY = new ByteString('88', HEX);
          OP_CHECKSIG = new ByteString('AC', HEX);
          OP_RETURN = new ByteString('6A', HEX);

          /*
            Create the output script
            Count (VI) | Value (8) | PkScript (var) | ....
           */
          PkScript = function(address) {
            var hash160, hash160WithNetwork, p2pkhNetworkVersionSize, script;
            hash160WithNetwork = ledger.bitcoin.addressToHash160WithNetwork(address);
            p2pkhNetworkVersionSize = hash160WithNetwork.length - 20;
            hash160 = hash160WithNetwork.bytes(p2pkhNetworkVersionSize, hash160WithNetwork.length - p2pkhNetworkVersionSize);
            if (p2pkhNetworkVersionSize === 1) {
              if (hash160WithNetwork.byteAt(0) === ledger.config.network.version.P2SH) {
                return P2shScript(hash160);
              }
            } else {
              if ((hash160WithNetwork.byteAt(0) << 8 + hash160WithNetwork.byteAt(1)) === ledger.config.network.version.P2SH) {
                return P2shScript(hash160);
              }
            }
            script = OP_DUP.concat(OP_HASH160).concat(new ByteString(Convert.toHexByte(hash160.length), HEX)).concat(hash160).concat(OP_EQUALVERIFY).concat(OP_CHECKSIG);
            return VI(script.length).concat(script);
          };
          P2shScript = function(hash160) {
            var script;
            script = OP_HASH160.concat(new ByteString(Convert.toHexByte(hash160.length), HEX)).concat(hash160).concat(OP_EQUAL);
            return VI(script.length).concat(script);
          };
          OpReturnScript = function(data) {
            var script;
            script = OP_RETURN.concat(new ByteString(Convert.toHexByte(data.length / 2), HEX)).concat(new ByteString(data, HEX));
            return VI(script.length).concat(script);
          };
          numberOfOutputs = 1 + (changeAmount.lte(0) ? 0 : 1) + ((data != null) ? 1 : 0);
          outputScript = VI(numberOfOutputs).concat(amount.toScriptByteString()).concat(PkScript(recipientAddress));
          if (changeAmount.gt(0)) {
            outputScript = outputScript.concat(changeAmount.toScriptByteString()).concat(PkScript(changeAddress));
          }
          if (data != null) {
            outputScript = outputScript.concat(ledger.Amount.fromSatoshi(0).toScriptByteString()).concat(OpReturnScript(data));
          }
          task = function() {
            var promise;
            if (ledger.config.network.ticker === 'abc' || (ledger.config.network.ticker === 'btg' && !ledger.config.network.handleSegwit)) {
              promise = _this._btchip.createPaymentTransactionNewBIP143_async(false, false, inputs, associatedKeysets, changePath, outputScript, lockTime && new ByteString(Convert.toHexInt(lockTime), HEX), sighashType && new ByteString(Convert.toHexInt(sighashType), HEX), authorization && new ByteString(authorization, HEX), resumeData);
            } else {
              if (ledger.config.network.handleSegwit) {
                promise = _this._btchip.createPaymentTransactionNewBIP143_async(true, ledger.config.network.ticker === 'btg', inputs, associatedKeysets, changePath, outputScript, lockTime && new ByteString(Convert.toHexInt(lockTime), HEX), sighashType && new ByteString(Convert.toHexInt(sighashType), HEX), authorization && new ByteString(authorization, HEX), resumeData);
              } else {
                promise = _this._btchip.createPaymentTransactionNew_async(inputs, associatedKeysets, changePath, outputScript, lockTime && new ByteString(Convert.toHexInt(lockTime), HEX), sighashType && new ByteString(Convert.toHexInt(sighashType), HEX), authorization && new ByteString(authorization, HEX), resumeData);
              }
            }
            return promise.then(function(result) {
              var publicKey, trustedInput, _ref;
              if (result instanceof ByteString) {
                result = result.toString(HEX);
              } else {
                result.scriptData = result.scriptData.toString(HEX);
                result.trustedInputs = (function() {
                  var _j, _len1, _ref, _results;
                  _ref = result.trustedInputs;
                  _results = [];
                  for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
                    trustedInput = _ref[_j];
                    _results.push(trustedInput.toString(HEX));
                  }
                  return _results;
                })();
                result.publicKeys = (function() {
                  var _j, _len1, _ref, _results;
                  _ref = result.publicKeys;
                  _results = [];
                  for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
                    publicKey = _ref[_j];
                    _results.push(publicKey.toString(HEX));
                  }
                  return _results;
                })();
                if (result.authorizationPaired != null) {
                  result.authorizationPaired = result.authorizationPaired.toString(HEX);
                }
                if (result.authorizationReference != null) {
                  result.authorizationReference = result.authorizationReference.toString(HEX);
                }
                result.encryptedOutputScript = (_ref = result.encryptedOutputScript) != null ? _ref.toString(HEX) : void 0;
              }
              return result;
            });
          };
          return _btchipQueue.enqueue("createPaymentTransaction", task, (_this.getFirmwareInformation().hasScreenAndButton() ? 72000000 : void 0));
        };
      })(this)).fail(function(er) {
        return e(er);
      });
    };

    Dongle.prototype.formatP2SHOutputScript = function(transaction) {
      return this._btchip.formatP2SHOutputScript(transaction);
    };


    /*
    @return [Q.Promise]
     */

    Dongle.prototype.signP2SHTransaction = function(inputs, scripts, numOutputs, output, paths) {
      return _btchipQueue.enqueue("signP2SHTransaction", (function(_this) {
        return function() {
          return _this._btchip.signP2SHTransaction_async(inputs, scripts, numOutputs, output, paths);
        };
      })(this));
    };


    /*
    @param [String] input hex encoded
    @return [Object]
      [Array<Byte>] version length is 4
      [Array<Object>] inputs
        [Array<Byte>] prevout length is 36
        [Array<Byte>] script var length
        [Array<Byte>] sequence length is 4
      [Array<Object>] outputs
        [Array<Byte>] amount length is 4
        [Array<Byte>] script var length
      [Array<Byte>] locktime length is 4
     */

    Dongle.prototype.splitTransaction = function(input, areTransactionTimestamped, isSegwitSupported) {
      return this._btchip.splitTransaction(new ByteString(input.raw, HEX), areTransactionTimestamped, isSegwitSupported);
    };

    Dongle.prototype._sendApdu = function() {
      var apdu, arg, args, index, swCheck, _i, _len;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      apdu = new ByteString('', HEX);
      swCheck = void 0;
      for (index = _i = 0, _len = args.length; _i < _len; index = ++_i) {
        arg = args[index];
        if (arg instanceof ByteString) {
          apdu = apdu.concat(arg);
        } else if (index === args.length - 1 && _.isArray(arg)) {
          swCheck = arg;
        } else {
          apdu = apdu.concat(new ByteString((_.isNumber(arg) ? Convert.toHexByte(arg) : arg.replace(/\s/g, '')), HEX));
        }
      }
      return this._btchip.card.sendApdu_async(apdu, swCheck);
    };

    Dongle.prototype._recoverFirmwareVersion = function() {
      return _btchipQueue.enqueue("recoverFirmwareVersion", (function(_this) {
        return function() {
          return _this._sendApdu('E0 C4 00 00 00 08').then(function(version) {
            var firmware;
            firmware = new ledger.dongle.FirmwareInformation(_this, version);
            if (firmware.isUsingInputFinalizeFull()) {
              _this._btchip.setUntrustedHashTransactionInputFinalizeFull();
            }
            if (firmware.isUsingDeprecatedBip32Derivation()) {
              _this._btchip.setDeprecatedBIP32Derivation();
            }
            if (firmware.isUsingDeprecatedSetupKeymap()) {
              _this._btchip.setDeprecatedSetupKeymap();
            }
            _this._btchip.setCompressedPublicKeys(firmware.hasCompressedPublicKeysSupport());
            return _this._firmwareInformation = firmware;
          }).fail(function(error) {
            e("Firmware version not supported :", error);
            throw error;
          });
        };
      })(this));
    };

    Dongle.prototype._recoverOperationMode = function() {
      return _btchipQueue.enqueue("recoverOperationMode", (function(_this) {
        return function() {
          return _this._btchip.getOperationMode_async().then(function(mode) {
            return _this.operationMode = mode;
          });
        };
      })(this));
    };

    Dongle.prototype._setState = function() {
      var args, newState, oldState, _ref;
      newState = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      _ref = [newState, this.state], this.state = _ref[0], oldState = _ref[1];
      this.emit.apply(this, ["state:" + this.state, this.state].concat(__slice.call(args)));
      return this.emit('state:changed', this.state);
    };

    Dongle.prototype._handleErrorCode = function(errorCode) {
      var error;
      if (errorCode.match("6982")) {
        this._setState(States.LOCKED);
        error = Errors["new"](Errors.DongleLocked, errorCode);
      } else if (errorCode.match("6985")) {
        this._setState(States.BLANK);
        error = Errors["new"](Errors.BlankDongle, errorCode);
      } else if (errorCode.match("6faa")) {
        this._setState(States.ERROR);
        error = Errors["new"](Errors.UnknowError, errorCode);
      } else if (errorCode.match(/63c\d/)) {
        error = Errors["new"](Errors.WrongPinCode, errorCode);
        error.retryCount = parseInt(errorCode.substr(-1));
        if (error.retryCount === 0) {
          this._setState(States.BLANK);
          error.code = Errors.DongleLocked;
        } else {
          this._setState(States.ERROR);
        }
      } else {
        this._setState(States.UnknowError);
        error = Errors["new"](Errors.UnknowError, errorCode);
      }
      return error;
    };

    Dongle.prototype._convertMessageSignature = function(pubKey, message, prefix, signature) {
      var bitcoin, hash, i, recoveredKey, sig, splitSignature, _i;
      bitcoin = new BitcoinExternal();
      hash = bitcoin.getSignedMessageHash(message, prefix);
      pubKey = bitcoin.compressPublicKey(pubKey);
      for (i = _i = 0; _i < 4; i = ++_i) {
        recoveredKey = bitcoin.recoverPublicKey(signature, hash, i);
        recoveredKey = bitcoin.compressPublicKey(recoveredKey);
        if (recoveredKey.equals(pubKey)) {
          splitSignature = bitcoin.splitAsn1Signature(signature);
          sig = new ByteString(Convert.toHexByte(i + 27 + 4), HEX).concat(splitSignature[0]).concat(splitSignature[1]);
          break;
        }
      }
      if (sig == null) {
        throw "Recovery failed";
      }
      return this._convertBase64(sig);
    };

    Dongle.prototype._convertBase64 = function(data) {
      var a, b, codes, i, leven, offset, output, _i;
      codes = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
      output = "";
      leven = 3 * (Math.floor(data.length / 3));
      offset = 0;
      for (i = _i = 0; 0 <= leven ? _i < leven : _i > leven; i = 0 <= leven ? ++_i : --_i) {
        if (!(i % 3 === 0)) {
          continue;
        }
        output += codes.charAt((data.byteAt(offset) >> 2) & 0x3f);
        output += codes.charAt((((data.byteAt(offset) & 3) << 4) + (data.byteAt(offset + 1) >> 4)) & 0x3f);
        output += codes.charAt((((data.byteAt(offset + 1) & 0x0f) << 2) + (data.byteAt(offset + 2) >> 6)) & 0x3f);
        output += codes.charAt(data.byteAt(offset + 2) & 0x3f);
        offset += 3;
      }
      if (i < data.length) {
        a = data.byteAt(offset);
        b = (i + 1) < data.length ? data.byteAt(offset + 1) : 0;
        output += codes.charAt((a >> 2) & 0x3f);
        output += codes.charAt((((a & 3) << 4) + (b >> 4)) & 0x3f);
        output += (i + 1) < data.length ? codes.charAt(((b & 0x0f) << 2) & 0x3f) : '=';
        output += '=';
      }
      return output;
    };

    return Dongle;

  })(EventEmitter);

}).call(this);
