(function() {
  var Errors, ExchangeTimeout, Modes, States,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (ledger.fup == null) {
    ledger.fup = {};
  }

  States = {
    Undefined: 0,
    Erasing: 1,
    Unlocking: 2,
    SeedingKeycard: 3,
    LoadingOldApplication: 4,
    ReloadingBootloaderFromOs: 5,
    LoadingBootloader: 6,
    LoadingReloader: 7,
    LoadingBootloaderReloader: 8,
    LoadingOs: 9,
    InitializingOs: 10,
    Done: 11
  };

  Modes = {
    Os: 0,
    Bootloader: 1
  };

  Errors = {
    UnableToRetrieveVersion: ledger.errors.UnableToRetrieveVersion,
    InvalidSeedSize: ledger.errors.InvalidSeedSize,
    InvalidSeedFormat: ledger.errors.InvalidSeedFormat,
    InconsistentState: ledger.errors.InconsistentState,
    FailedToInitOs: ledger.errors.FailedToInitOs,
    CommunicationError: ledger.errors.CommunicationError,
    UnsupportedFirmware: ledger.errors.UnsupportedFirmware,
    ErrorDongleMayHaveASeed: ledger.errors.ErrorDongleMayHaveASeed,
    ErrorDueToCardPersonalization: ledger.errors.ErrorDueToCardPersonalization,
    HigherVersion: ledger.errors.HigherVersion,
    WrongPinCode: ledger.errors.WrongPinCode
  };

  ExchangeTimeout = 200;


  /*
    FirmwareUpdateRequest performs dongle firmware updates. Once started it will listen the {DonglesManager} in order to catch
    connected dongles and update them. Only one instance of FirmwareUpdateRequest should be alive at the same time. (This is
    ensured by the {ledger.fup.FirmwareUpdater})
  
    @event plug Emitted when the user must plug its dongle in
    @event unplug Emitted when the user must unplug its dongle
    @event stateChanged Emitted when the current state has changed. The event holds a data formatted like this: {oldState: ..., newState: ...}
    @event setKeyCardSeed Emitted once the key card seed is provided
    @event needsUserApproval Emitted once the request needs a user input to continue
    @event erasureStep Emitted each time the erasure step is trying to reset the dongle. The event holds the number of remaining steps before erasing is done.
    @event error Emitted once an error is throw. The event holds a data formatted like this: {cause: ...}
   */

  ledger.fup.FirmwareUpdateRequest = (function(_super) {
    __extends(FirmwareUpdateRequest, _super);

    FirmwareUpdateRequest.States = States;

    FirmwareUpdateRequest.Modes = Modes;

    FirmwareUpdateRequest.Errors = Errors;

    FirmwareUpdateRequest.ExchangeTimeout = ExchangeTimeout;

    function FirmwareUpdateRequest(firmwareUpdater, osLoader) {
      this._id = _.uniqueId("fup");
      this._fup = firmwareUpdater;
      this._getOsLoader || (this._getOsLoader = function() {
        return ledger.fup.updates[osLoader];
      });
      this._keyCardSeed = null;
      this._isRunning = false;
      this._currentState = States.Undefined;
      this._isNeedingUserApproval = false;
      this._lastMode = Modes.Os;
      this._dongleVersion = null;
      this._isOsLoaded = false;
      this._approvedStates = [];
      this._stateCache = {};
      this._exchangeNeedsExtraTimeout = false;
      this._isWaitForDongleSilent = false;
      this._isCancelled = false;
      this._logger = ledger.utils.Logger.getLoggerByTag('FirmwareUpdateRequest');
      this._lastOriginalKey = void 0;
      this._pinCode = void 0;
      this._forceDongleErasure = false;
      this._cardManager = new ledger.fup.CardManager();
    }


    /*
      Stops all current tasks and listened events.
     */

    FirmwareUpdateRequest.prototype.cancel = function() {
      var _ref;
      if (!this._isCancelled) {
        this.off();
        this._isRunning = false;
        this._onProgress = null;
        this._isCancelled = true;
        if ((_ref = this._getCard()) != null) {
          _ref.disconnect();
        }
        this._fup._cancelRequest(this);
        return this._cardManager.stopWaiting();
      }
    };

    FirmwareUpdateRequest.prototype.onProgress = function(callback) {
      return this._onProgress = callback;
    };

    FirmwareUpdateRequest.prototype.hasGrantedErasurePermission = function() {
      return _.contains(this._approvedStates, "erasure");
    };


    /*
      Approves the current request state and continue its execution.
     */

    FirmwareUpdateRequest.prototype.approveDongleErasure = function() {
      return this._approve('erasure');
    };

    FirmwareUpdateRequest.prototype.approveCurrentState = function() {
      return this._setIsNeedingUserApproval(false);
    };

    FirmwareUpdateRequest.prototype.isNeedingUserApproval = function() {
      return this._isNeedingUserApproval;
    };


    /*
     */

    FirmwareUpdateRequest.prototype.unlockWithPinCode = function(pin) {
      this._pinCode = pin;
      return this._approve('pincode');
    };

    FirmwareUpdateRequest.prototype.forceDongleErasure = function() {
      if (this._currentState === States.Unlocking) {
        this._forceDongleErasure = true;
        return this._approve('pincode');
      }
    };


    /*
      Gets the current dongle version
      @return [String] The current dongle version
     */

    FirmwareUpdateRequest.prototype.getDongleVersion = function() {
      return ledger.fup.utils.versionToString(this._dongleVersion);
    };


    /*
      Gets the version to update
      @return [String] The target version
     */

    FirmwareUpdateRequest.prototype.getTargetVersion = function() {
      return ledger.fup.utils.versionToString(ledger.fup.versions.Nano.CurrentVersion.Os);
    };

    FirmwareUpdateRequest.prototype.getDongleFirmware = function() {
      return this._dongleVersion.getFirmwareInformation();
    };


    /*
      Sets the key card seed used during the firmware update process. The seed must be a 32 characters string formatted as
      an hexadecimal value.
    
      @param [String] keyCardSeed A 32 characters string formatted as an hexadecimal value (i.e. '01294b7431234b5323f5588ce7d02703'
      @throw If the seed length is not 32 or if it is malformed
     */

    FirmwareUpdateRequest.prototype.setKeyCardSeed = function(keyCardSeed) {
      var seed;
      seed = this._keyCardSeedToByteString(keyCardSeed);
      if (seed.isFailure()) {
        throw seed.getError();
      }
      this._keyCardSeed = seed.getValue();
      this._approve('keycard');
      return this.emit("setKeyCardSeed");
    };


    /*
     */

    FirmwareUpdateRequest.prototype.startUpdate = function() {
      if (this._isRunning) {
        return;
      }
      this._isRunning = true;
      this._currentState = States.Undefined;
      return this._handleCurrentState();
    };

    FirmwareUpdateRequest.prototype.isRunning = function() {
      return this._isRunning;
    };


    /*
      Checks if a given keycard seed is valid or not. The seed must be a 32 characters string formatted as
      an hexadecimal value.
    
      @param [String] keyCardSeed A 32 characters string formatted as an hexadecimal value (i.e. '01294b7431234b5323f5588ce7d02703'
     */

    FirmwareUpdateRequest.prototype.checkIfKeyCardSeedIsValid = function(keyCardSeed) {
      return this._keyCardSeedToByteString(keyCardSeed).isSuccess();
    };

    FirmwareUpdateRequest.prototype._keyCardSeedToByteString = function(keyCardSeed) {
      return Try((function(_this) {
        return function() {
          var seed;
          if ((keyCardSeed == null) || !(keyCardSeed.length === 32 || keyCardSeed.length === 80)) {
            throw new Error(Errors.InvalidSeedSize);
          }
          seed = new ByteString(keyCardSeed, HEX);
          if ((seed == null) || !(seed.length === 16 || (seed != null ? seed.length : void 0) === 40)) {
            throw new Error(Errors.InvalidSeedFormat);
          }
          return seed;
        };
      })(this));
    };


    /*
      Gets the current state.
    
      @return [ledger.fup.FirmwareUpdateRequest.States] The current request state
     */

    FirmwareUpdateRequest.prototype.getCurrentState = function() {
      return this._currentState;
    };


    /*
      Checks if the current request has a key card seed or not.
    
      @return [Boolean] Yes if the key card seed has been setup
     */

    FirmwareUpdateRequest.prototype.hasKeyCardSeed = function() {
      if (this._keyCardSeed != null) {
        return true;
      } else {
        return false;
      }
    };

    FirmwareUpdateRequest.prototype._waitForConnectedDongle = function(silent) {
      var timeout;
      if (silent == null) {
        silent = false;
      }
      timeout = this.emitAfter('plug', !silent ? 0 : 200);
      return this._cardManager.waitForInsertion(silent).then((function(_this) {
        return function(_arg) {
          var card, mode;
          card = _arg.card, mode = _arg.mode;
          clearTimeout(timeout);
          _this._resetOriginalKey();
          _this._lastMode = mode;
          _this._card = new ledger.fup.Card(card);
          _this._setCurrentState(States.Undefined);
          _this._handleCurrentState();
          return card;
        };
      })(this)).done();
    };

    FirmwareUpdateRequest.prototype._waitForDisconnectDongle = function(silent) {
      var timeout;
      if (silent == null) {
        silent = false;
      }
      timeout = this.emitAfter('unplug', !silent ? 0 : 500);
      return this._cardManager.waitForDisconnection(silent).then((function(_this) {
        return function() {
          clearTimeout(timeout);
          return _this._card = null;
        };
      })(this));
    };

    FirmwareUpdateRequest.prototype._waitForPowerCycle = function(callback, silent) {
      if (callback == null) {
        callback = void 0;
      }
      if (silent == null) {
        silent = false;
      }
      return this._waitForDisconnectDongle(silent).then((function(_this) {
        return function() {
          return _this._waitForConnectedDongle(silent);
        };
      })(this));
    };

    FirmwareUpdateRequest.prototype._handleCurrentState = function() {
      if (this._card == null) {
        return this._waitForConnectedDongle(true);
      }
      this._logger.info("Handle current state", {
        lastMode: this._lastMode,
        currentState: this._currentState
      });
      if (this._currentState === States.Undefined) {
        this._dongleVersion = null;
      }
      if (this._lastMode === Modes.Os) {
        switch (this._currentState) {
          case States.Undefined:
            return this._findOriginalKey().then((function(_this) {
              return function() {
                return _this._processInitStageOs();
              };
            })(this)).fail((function(_this) {
              return function(error) {
                return _this._logger.error(error);
              };
            })(this)).done();
          case States.ReloadingBootloaderFromOs:
            return this._processReloadBootloaderFromOs();
          case States.InitializingOs:
            return this._processInitOs();
          case States.Erasing:
            return this._processErasing();
          case States.Unlocking:
            return this._processUnlocking();
          case States.SeedingKeycard:
            return this._processSeedingKeycard();
          default:
            return this._failure(Errors.InconsistentState);
        }
      } else {
        switch (this._currentState) {
          case States.Undefined:
            return this._findOriginalKey().then((function(_this) {
              return function() {
                return _this._processInitStageBootloader();
              };
            })(this)).fail((function(_this) {
              return function() {
                return _this._failure(Errors.CommunicationError);
              };
            })(this)).done();
          case States.LoadingOs:
            return this._processLoadOs();
          case States.LoadingBootloader:
            return this._processLoadBootloader();
          case States.LoadingBootloaderReloader:
            return this._processLoadBootloaderReloader();
          default:
            return this._failure(Errors.InconsistentState);
        }
      }
    };

    FirmwareUpdateRequest.prototype._processInitStageOs = function() {
      this._logger.info("Process init stage OS");
      if (this._isApproved('erase')) {
        this._setCurrentState(States.Erasing);
        this._handleCurrentState();
        return;
      }
      return this._getVersion().then((function(_this) {
        return function(version) {
          var checkVersion, firmware;
          _this._dongleVersion = version;
          firmware = version.getFirmwareInformation();
          checkVersion = function() {
            var index;
            if (version.equals(ledger.fup.versions.Nano.CurrentVersion.Os)) {
              if (_this._isOsLoaded) {
                _this._setCurrentState(States.InitializingOs);
                return _this._handleCurrentState();
              } else {
                return _this._checkReloadRecoveryAndHandleState(firmware);
              }
            } else if (version.gt(ledger.fup.versions.Nano.CurrentVersion.Os)) {
              return _this._failure(Errors.HigherVersion);
            } else {
              index = 0;
              while (index < ledger.fup.updates.OS_INIT.length && !version.equals(ledger.fup.updates.OS_INIT[index][0])) {
                index += 1;
              }
              if (index !== ledger.fup.updates.OS_INIT.length) {
                return _this._processLoadingScript(ledger.fup.updates.OS_INIT[index][1], States.LoadingOldApplication, true).then(function() {
                  return _this._checkReloadRecoveryAndHandleState(firmware);
                }).fail(function(ex) {
                  switch (ex.message) {
                    case 'timeout':
                      return _this._waitForPowerCycle();
                    default:
                      return _this._failure(Errors.CommunicationError);
                  }
                });
              } else {
                return _this._checkReloadRecoveryAndHandleState(firmware);
              }
            }
          };
          if (!firmware.hasSubFirmwareSupport() && (_this._keyCardSeed == null)) {
            _this._setCurrentState(States.SeedingKeycard);
            return _this._handleCurrentState();
          } else if (!firmware.hasSubFirmwareSupport()) {
            return _this._card.getRemainingPinAttempt().then(function() {
              _this._setCurrentState(States.Erasing);
              return _this._handleCurrentState();
            }).fail(function() {
              return checkVersion();
            });
          } else {
            return checkVersion();
          }
        };
      })(this)).fail((function(_this) {
        return function() {
          return _this._failure(Errors.UnableToRetrieveVersion);
        };
      })(this)).done();
    };

    FirmwareUpdateRequest.prototype._checkReloadRecoveryAndHandleState = function(firmware) {
      var handleState;
      handleState = (function(_this) {
        return function(state) {
          _this._setCurrentState(state);
          _this._handleCurrentState();
        };
      })(this);
      if (firmware.hasRecoveryFlashingSupport()) {
        this._getCard().exchange_async(new ByteString("E02280000100", HEX)).then((function(_this) {
          return function() {
            if (((_this._getCard().SW & 0xFFF0) === 0x63C0) && (_this._getCard().SW !== 0x63C0)) {
              return handleState(States.Unlocking);
            } else {
              return handleState(States.ReloadingBootloaderFromOs);
            }
          };
        })(this));
      } else {
        handleState(States.ReloadingBootloaderFromOs);
      }
    };

    FirmwareUpdateRequest.prototype._processErasing = function() {
      return this._waitForUserApproval('erasure').then((function(_this) {
        return function() {
          var getRandomChar, pincode;
          if (_this._stateCache.pincode == null) {
            getRandomChar = function() {
              return "0123456789".charAt(_.random(10));
            };
            _this._stateCache.pincode = getRandomChar() + getRandomChar();
          }
          pincode = _this._stateCache.pincode;
          return _this._card.unlockWithPinCode(pincode).then(function() {
            _this.emit("erasureStep", 3);
            return _this._waitForPowerCycle();
          }).fail(function(error) {
            _this.emit("erasureStep", (error != null ? error.remaining : void 0) != null ? error.remaining : 3);
            return _this._waitForPowerCycle();
          }).done();
        };
      })(this)).fail((function(_this) {
        return function(err) {
          return _this._failure(Errors.CommunicationError);
        };
      })(this)).done();
    };

    FirmwareUpdateRequest.prototype._processUnlocking = function() {
      this._provisioned = false;
      return this._waitForUserApproval('pincode').then((function(_this) {
        return function() {
          var pin;
          if (_this._forceDongleErasure) {
            _this._setCurrentState(States.Erasing);
            return _this._handleCurrentState();
          } else {
            if (_this._pinCode.length === 0) {
              _this._setCurrentState(States.ReloadingBootloaderFromOs);
              _this._handleCurrentState();
              return;
            }
            pin = new ByteString(_this._pinCode, ASCII);
            return _this._getCard().exchange_async(new ByteString("E0220000" + Convert.toHexByte(pin.length), HEX).concat(pin)).then(function(result) {
              if (_this._getCard().SW === 0x9000) {
                _this._provisioned = true;
                _this._setCurrentState(States.ReloadingBootloaderFromOs);
                _this._handleCurrentState();
              } else {
                throw Errors.WrongPinCode;
              }
            });
          }
        };
      })(this)).fail((function(_this) {
        return function() {
          _this._removeUserApproval('pincode');
          return _this._failure(Errors.WrongPinCode);
        };
      })(this)).done();
    };

    FirmwareUpdateRequest.prototype._processSeedingKeycard = function() {
      return this._waitForUserApproval('keycard').then((function(_this) {
        return function() {
          _this._setCurrentState(States.Undefined);
          return _this._handleCurrentState();
        };
      })(this)).done();
    };

    FirmwareUpdateRequest.prototype._tryToInitializeOs = function() {
      var continueInitOs;
      continueInitOs = (function(_this) {
        return function() {
          _this._setCurrentState(States.InitializingOs);
          return _this._handleCurrentState();
        };
      })(this);
      if (this._keyCardSeed == null) {
        this._setCurrentState(States.SeedingKeycard);
        return this._waitForUserApproval('keycard').then((function(_this) {
          return function() {
            _this._setCurrentState(States.Undefined);
            return continueInitOs();
          };
        })(this)).done();
      } else {
        return continueInitOs();
      }
    };

    FirmwareUpdateRequest.prototype._processInitOs = function() {
      var currentInitScript, i, index, moddedInitScript, _i, _ref;
      index = 0;
      while (index < ledger.fup.updates.OS_INIT.length && !ledger.fup.utils.compareVersions(ledger.fup.versions.Nano.CurrentVersion.Os, ledger.fup.updates.OS_INIT[index][0]).eq()) {
        index += 1;
      }
      currentInitScript = INIT_LW_1104;
      moddedInitScript = [];
      for (i = _i = 0, _ref = currentInitScript.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        moddedInitScript.push(currentInitScript[i]);
        if (i === currentInitScript.length - 2 && (this._keyCardSeed != null)) {
          moddedInitScript.push("D026000011" + "04" + this._keyCardSeed.bytes(0, 16).toString(HEX));
          if (this._keyCardSeed.length > 16) {
            moddedInitScript.push("D02A000018" + this._keyCardSeed.bytes(16).toString(HEX));
          }
        }
      }
      return this._processLoadingScript(moddedInitScript, States.InitializingOs, true).then((function(_this) {
        return function() {
          _this._success();
          return _this._isOsLoaded = false;
        };
      })(this)).fail((function(_this) {
        return function(ex) {
          if (!_this._handleLoadingScriptError(ex)) {
            return _this._failure(Errors.FailedToInitOs);
          }
        };
      })(this));
    };

    FirmwareUpdateRequest.prototype._processReloadBootloaderFromOs = function() {
      this._removeUserApproval('erasure');
      this._removeUserApproval('pincode');
      return this._waitForUserApproval('reloadbootloader').then((function(_this) {
        return function() {
          var index;
          _this._removeUserApproval('reloadbootloader');
          index = 0;
          while (index < ledger.fup.updates.BL_RELOADER.length && !_this._dongleVersion.equals(ledger.fup.updates.BL_RELOADER[index][0])) {
            index += 1;
          }
          if (index === ledger.fup.updates.BL_RELOADER.length) {
            _this._failure(Errors.UnsupportedFirmware);
            return;
          }
          _this._isWaitForDongleSilent = true;
          return _this._processLoadingScript(ledger.fup.updates.BL_RELOADER[index][1], States.ReloadingBootloaderFromOs).then(function() {
            return _this._waitForPowerCycle(null, true);
          }).fail(function(e) {
            if (!_this._handleLoadingScriptError(e)) {
              switch (_this._getCard().SW) {
                case 0x6985:
                  l("Failed procces RELOAD BL FROM OS");
                  _this._processInitOs();
                  return;
                case 0x6faa:
                  _this._failure(Errors.ErrorDueToCardPersonalization);
                  break;
                default:
                  _this._failure(Errors.CommunicationError);
              }
              return _this._waitForDisconnectDongle();
            }
          });
        };
      })(this)).fail(function(err) {
        return console.error(err);
      });
    };

    FirmwareUpdateRequest.prototype._processInitStageBootloader = function() {
      this._logger.info("Process init stage BL");
      this._lastVersion = null;
      return this._getVersion().then((function(_this) {
        return function(version) {
          var continueInitStageBootloader;
          if (version.equals(ledger.fup.versions.Nano.CurrentVersion.Bootloader)) {
            _this._setCurrentState(States.LoadingOs);
            return _this._handleCurrentState();
          } else {
            continueInitStageBootloader = function() {
              var SEND_RACE_BL;
              if (version.equals(ledger.fup.versions.Nano.CurrentVersion.Reloader)) {
                _this._setCurrentState(States.LoadingBootloader);
                return _this._handleCurrentState();
              } else {
                SEND_RACE_BL = (1 << 16) + (3 << 8) + 11.;
                _this._exchangeNeedsExtraTimeout = version[1] < SEND_RACE_BL;
                _this._setCurrentState(States.LoadingBootloaderReloader);
                return _this._handleCurrentState();
              }
            };
            if (_this._keyCardSeed == null) {
              _this._setCurrentState(States.SeedingKeycard);
              return _this._waitForUserApproval('keycard').then(function() {
                _this._setCurrentState(States.Undefined);
                return continueInitStageBootloader();
              }).done();
            } else {
              return continueInitStageBootloader();
            }
          }
        };
      })(this)).fail((function(_this) {
        return function() {
          return _this._failure(Errors.UnableToRetrieveVersion);
        };
      })(this)).done();
    };

    FirmwareUpdateRequest.prototype._processLoadOs = function() {
      this._isOsLoaded = false;
      return this._findOriginalKey().then((function(_this) {
        return function(offset) {
          _this._isWaitForDongleSilent = true;
          return _this._processLoadingScript(_this._getOsLoader()[offset], States.LoadingOs).then(function(result) {
            _this._isOsLoaded = true;
            return _.delay((function() {
              return _this._waitForPowerCycle(null, true);
            }), 200);
          }).fail(function(ex) {
            return _this._handleLoadingScriptError(ex);
          });
        };
      })(this)).fail((function(_this) {
        return function(e) {
          _this._isWaitForDongleSilent = false;
          return _this._setCurrentState(States.Undefined);
        };
      })(this));
    };

    FirmwareUpdateRequest.prototype._processLoadBootloader = function() {
      return this._findOriginalKey().then((function(_this) {
        return function(offset) {
          return _this._processLoadingScript(ledger.fup.updates.BL_LOADER[offset], States.LoadingBootloader);
        };
      })(this)).then((function(_this) {
        return function() {
          return _this._waitForPowerCycle(null, true);
        };
      })(this)).fail((function(_this) {
        return function(ex) {
          return _this._handleLoadingScriptError(ex);
        };
      })(this));
    };

    FirmwareUpdateRequest.prototype._processLoadBootloaderReloader = function() {
      return this._findOriginalKey().then((function(_this) {
        return function(offset) {
          return _this._processLoadingScript(ledger.fup.updates.RELOADER_FROM_BL[offset], States.LoadingBootloaderReloader);
        };
      })(this)).then((function(_this) {
        return function() {
          return _this._waitForPowerCycle(null, true);
        };
      })(this)).fail((function(_this) {
        return function(ex) {
          return _this._handleLoadingScriptError(ex);
        };
      })(this));
    };

    FirmwareUpdateRequest.prototype._failure = function(reason) {
      this.emit("error", {
        cause: ledger.errors["new"](reason)
      });
      this._waitForPowerCycle();
    };

    FirmwareUpdateRequest.prototype._success = function() {
      this._setCurrentState(States.Done, {
        provisioned: this._provisioned
      });
      return _.defer((function(_this) {
        return function() {
          return _this.cancel();
        };
      })(this));
    };

    FirmwareUpdateRequest.prototype._attemptToFailDonglePinCode = function(pincode) {
      var deferred;
      deferred = Q.defer();
      this._card.unlockWithPinCode(pincode, (function(_this) {
        return function(isUnlocked, error) {
          if (isUnlocked || error.code !== ledger.errors.WrongPinCode) {
            _this.emit("erasureStep", 3);
            return _this._waitForPowerCycle().then(function() {
              return deferred.reject();
            });
          } else {
            _this.emit("erasureStep", error.retryCount);
            return _this._waitForPowerCycle().then(function() {
              return _this._dongle.getState(function(state) {
                return deferred.resolve(state === ledger.dongle.States.BLANK || state === ledger.dongle.States.FROZEN);
              });
            });
          }
        };
      })(this));
      return deferred.promise;
    };

    FirmwareUpdateRequest.prototype._setCurrentState = function(newState, data) {
      var oldState;
      if (data == null) {
        data = {};
      }
      oldState = this._currentState;
      this._currentState = newState;
      return this.emit('stateChanged', _({
        oldState: oldState,
        newState: newState
      }).extend(data));
    };

    FirmwareUpdateRequest.prototype._setIsNeedingUserApproval = function(value) {
      var defferedApproval;
      if (this._isNeedingUserApproval !== value) {
        this._isNeedingUserApproval = value;
        if (this._isNeedingUserApproval === true) {
          this._deferredApproval = Q.defer();
          _.defer((function(_this) {
            return function() {
              return _this.emit('needsUserApproval');
            };
          })(this));
        } else {
          defferedApproval = this._deferredApproval;
          this._deferredApproval = null;
          defferedApproval.resolve();
        }
      }
    };

    FirmwareUpdateRequest.prototype._approve = function(approvalName) {
      var _ref, _ref1;
      l("Approve ", approvalName, " waiting for ", (_ref = this._deferredApproval) != null ? _ref.approvalName : void 0);
      if (((_ref1 = this._deferredApproval) != null ? _ref1.approvalName : void 0) === approvalName) {
        return this._setIsNeedingUserApproval(false);
      } else {
        return this._approvedStates.push(approvalName);
      }
    };

    FirmwareUpdateRequest.prototype._cancelApproval = function() {
      var defferedApproval;
      if (this._isNeedingUserApproval) {
        this._isNeedingUserApproval = false;
        defferedApproval = this._deferredApproval;
        this._deferredApproval = null;
        return defferedApproval.reject("cancelled");
      }
    };

    FirmwareUpdateRequest.prototype._waitForUserApproval = function(approvalName) {
      if (_.contains(this._approvedStates, approvalName)) {
        return Q();
      } else {
        this._setIsNeedingUserApproval(true);
        this._deferredApproval.approvalName = approvalName;
        return this._deferredApproval.promise.then((function(_this) {
          return function() {
            return _this._approvedStates.push(approvalName);
          };
        })(this));
      }
    };

    FirmwareUpdateRequest.prototype._isApproved = function(approvalName) {
      return _.contains(this._approvedStates, approvalName);
    };

    FirmwareUpdateRequest.prototype._removeUserApproval = function(approvalName) {
      this._approvedStates = _(this._approvedStates).without(approvalName);
    };

    FirmwareUpdateRequest.prototype._processLoadingScript = function(adpus, state, ignoreSW, offset) {
      var d;
      if (offset == null) {
        offset = 0;
      }
      d = ledger.defer();
      this._doProcessLoadingScript(adpus, state, ignoreSW, offset).then(function() {
        return d.resolve();
      }).fail(function(ex) {
        return d.reject(ex);
      });
      return d.promise;
    };

    FirmwareUpdateRequest.prototype._doProcessLoadingScript = function(adpus, state, ignoreSW, offset, forceTimeout) {
      var ex;
      if (forceTimeout == null) {
        forceTimeout = false;
      }
      this._notifyProgress(state, offset, adpus.length);
      if (offset >= adpus.length) {
        this._exchangeNeedsExtraTimeout = false;
        return;
      }
      try {
        if (state === States.ReloadingBootloaderFromOs && offset === adpus.length - 1) {
          this._getCard().exchange_async(new ByteString(adpus[offset], HEX));
          return ledger.delay(1000).then((function(_this) {
            return function() {
              return _this._doProcessLoadingScript(adpus, state, ignoreSW, offset + 1);
            };
          })(this));
        } else {
          return _(this._getCard().exchange_async(new ByteString(adpus[offset], HEX))).smartTimeout(500, 'timeout').then((function(_this) {
            return function() {
              var deferred;
              if (ignoreSW || _this._getCard().SW === 0x9000) {
                if (_this._exchangeNeedsExtraTimeout || forceTimeout) {
                  deferred = Q.defer();
                  _.delay((function() {
                    return deferred.resolve(_this._doProcessLoadingScript(adpus, state, ignoreSW, offset + 1));
                  }), ExchangeTimeout);
                  return deferred.promise;
                } else {
                  return _this._doProcessLoadingScript(adpus, state, ignoreSW, offset + 1);
                }
              } else {
                _this._exchangeNeedsExtraTimeout = false;
                if (forceTimeout === false) {
                  return _this._doProcessLoadingScript(adpus, state, ignoreSW, offset, true);
                } else {
                  throw new Error('Unexpected status ' + _this._getCard().SW);
                }
              }
            };
          })(this)).fail((function(_this) {
            return function(ex) {
              if ((ex != null ? ex.message : void 0) === 'timeout') {
                throw ex;
              }
              if (offset === adpus.length - 1) {
                return _this._doProcessLoadingScript(adpus, state, ignoreSW, offset + 1);
              }
              _this._exchangeNeedsExtraTimeout = false;
              if (forceTimeout === false) {
                return _this._doProcessLoadingScript(adpus, state, ignoreSW, offset, true);
              } else {
                throw new Error("ADPU sending failed " + ex);
              }
            };
          })(this));
        }
      } catch (_error) {
        ex = _error;
        return e(ex);
      }
    };

    FirmwareUpdateRequest.prototype._handleLoadingScriptError = function(ex) {
      switch (ex.message) {
        case 'timeout':
          this._waitForPowerCycle();
          break;
        default:
          this._failure(Errors.CommunicationError);
      }
    };

    FirmwareUpdateRequest.prototype._findOriginalKey = function() {
      if (this._lastOriginalKey != null) {
        return ledger.defer().resolve(this._lastOriginalKey).promise;
      } else {
        return _(this._getCard().exchange_async(new ByteString("F001010000", HEX), [0x9000])).smartTimeout(500).then((function(_this) {
          return function(result) {
            var blCustomerId, offset, _i, _len, _ref;
            if ((result != null ? result.toString : void 0) != null) {
              l("CUST ID IS ", result.toString(HEX));
            }
            if (_this._getCard().SW !== 0x9000 || (result == null)) {
              return;
            }
            _ref = ledger.fup.updates.BL_CUSTOMER_ID;
            for (offset = _i = 0, _len = _ref.length; _i < _len; offset = ++_i) {
              blCustomerId = _ref[offset];
              if (!(result.equals(blCustomerId))) {
                continue;
              }
              l("OFFSET IS", offset);
              _this._lastOriginalKey = offset;
              return offset;
            }
            _this._lastOriginalKey = void 0;
          };
        })(this)).fail((function(_this) {
          return function(er) {
            e("Failed findOriginalKey", er);
            _this._lastOriginalKey = void 0;
          };
        })(this));
      }
    };

    FirmwareUpdateRequest.prototype._resetOriginalKey = function() {
      return this._lastOriginalKey = void 0;
    };

    FirmwareUpdateRequest.prototype._getCard = function() {
      var _ref;
      return (_ref = this._card) != null ? _ref.getCard() : void 0;
    };

    FirmwareUpdateRequest.prototype._getVersion = function() {
      if (this._dongleVersion != null) {
        return ledger.defer().resolve(this._dongleVersion).promise;
      }
      return (this._lastMode === Modes.Bootloader ? this._card.getVersion(Modes.Bootloader, true) : this._card.getVersion(Modes.Os, false)).then((function(_this) {
        return function(version) {
          return _this._dongleVersion = version;
        };
      })(this));
    };

    FirmwareUpdateRequest.prototype._notifyProgress = function(state, offset, total) {
      return _.defer((function(_this) {
        return function() {
          return typeof _this._onProgress === "function" ? _this._onProgress(state, offset, total) : void 0;
        };
      })(this));
    };

    return FirmwareUpdateRequest;

  })(this.EventEmitter);

}).call(this);
