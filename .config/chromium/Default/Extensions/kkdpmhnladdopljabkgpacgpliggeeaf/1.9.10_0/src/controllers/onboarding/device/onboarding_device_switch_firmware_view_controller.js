(function() {
  var States,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  States = ledger.fup.FirmwareUpdateRequest.States;

  this.OnboardingDeviceSwitchfirmwareViewController = (function(_super) {
    __extends(OnboardingDeviceSwitchfirmwareViewController, _super);

    OnboardingDeviceSwitchfirmwareViewController.prototype.view = {
      progressLabel: "#progress",
      progressBarContainer: "#bar_container"
    };

    function OnboardingDeviceSwitchfirmwareViewController() {
      OnboardingDeviceSwitchfirmwareViewController.__super__.constructor.apply(this, arguments);
      if (this.params.mode === 'setup') {
        this._request = ledger.app.dongle.getFirmwareUpdater().requestSetupFirmwareUpdate();
      } else {
        this._request = ledger.app.dongle.getFirmwareUpdater().requestOperationFirmwareUpdate();
      }
      this._request.onProgress(this._onProgress.bind(this));
      this._request.on('plug', (function(_this) {
        return function() {
          _this._currentError = null;
          return _this._setUserInterface('plug');
        };
      })(this));
      this._request.on('unplug', (function(_this) {
        return function() {
          if (_this._currentError == null) {
            return _this._setUserInterface('unplug');
          }
        };
      })(this));
      this._request.on('error', (function(_this) {
        return function(event, error) {
          return _this._onError(error.cause);
        };
      })(this));
      this._request.on('needsUserApproval', this._onUpdateNeedsUserApproval.bind(this));
      this._request.on('stateChanged', (function(_this) {
        return function(ev, data) {
          return _this._onStateChanged(data.newState, data.oldState);
        };
      })(this));
      if (this.params.mode === 'setup') {
        this._request.setKeyCardSeed('02294b743102b45323f5588cf8d02703');
      }
      if (this.params.pin != null) {
        this._request.unlockWithPinCode(this.params.pin);
      }
      this._fup = ledger.app.dongle.getFirmwareUpdater();
      this._currentError = null;
    }

    OnboardingDeviceSwitchfirmwareViewController.prototype.onAfterRender = function() {
      var seed, start;
      OnboardingDeviceSwitchfirmwareViewController.__super__.onAfterRender.apply(this, arguments);
      this.view.progressBar = new ledger.progressbars.ProgressBar(this.view.progressBarContainer);
      start = (function(_this) {
        return function() {
          ledger.app.setExecutionMode(ledger.app.Modes.FirmwareUpdate);
          return _this._fup.load(function() {
            return _this._request.startUpdate();
          });
        };
      })(this);
      if (this.params.mode === 'operation' && (this.params.mnemonicPhrase != null) && this.params.swapped_bip39 !== true) {
        seed = ledger.bitcoin.bip39.mnemonicPhraseToSeed(this.params.mnemonicPhrase);
        return ledger.app.dongle.setup(this.params.pin, seed).then((function(_this) {
          return function() {
            return start();
          };
        })(this)).fail((function(_this) {
          return function() {
            return ledger.app.router.go('/onboarding/management/done', {
              wallet_mode: _this.params.wallet_mode,
              error: 1
            });
          };
        })(this));
      } else {
        return start();
      }
    };

    OnboardingDeviceSwitchfirmwareViewController.prototype.onDetach = function() {
      OnboardingDeviceSwitchfirmwareViewController.__super__.onDetach.apply(this, arguments);
      this._request.cancel();
      this._fup.unload();
      return ledger.app.setExecutionMode(ledger.app.Modes.Wallet);
    };

    OnboardingDeviceSwitchfirmwareViewController.prototype.openSupport = function() {
      return window.open(t('application.support_key_not_recognized_url'));
    };

    OnboardingDeviceSwitchfirmwareViewController.prototype._setUserInterface = function(interfaceName) {
      var node, _i, _len, _ref, _results;
      _ref = this.select(".greyed-container");
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node = _ref[_i];
        if (node.id === ("" + interfaceName + "_container")) {
          _results.push($(node).show());
        } else {
          _results.push($(node).hide());
        }
      }
      return _results;
    };

    OnboardingDeviceSwitchfirmwareViewController.prototype._onFirmwareSwitchDone = function() {
      this._request.cancel();
      return ledger.app.reconnectDongleAndEnterWalletMode().then((function(_this) {
        return function() {
          var er;
          try {
            if (_this.params.mode === 'setup') {
              return _this._navigateNextSetup();
            } else if (_this.params.mode === 'operation_and_open') {
              return _this._navigateOpen();
            } else {
              return _this._navigateNextOperation();
            }
          } catch (_error) {
            er = _error;
            return e(er);
          }
        };
      })(this));
    };

    OnboardingDeviceSwitchfirmwareViewController.prototype._onRequireUserPin = function() {};

    OnboardingDeviceSwitchfirmwareViewController.prototype._onError = function(error) {
      return this._currentError = error;
    };

    OnboardingDeviceSwitchfirmwareViewController.prototype._onProgress = function(state, current, total) {
      var loadingBlProgress, loadingOsProgress, progress;
      this._setUserInterface('progress');
      loadingBlProgress = state === States.ReloadingBootloaderFromOs ? current / total : 1;
      loadingOsProgress = state === States.LoadingOs ? current / total : (state === States.InitializingOs ? 1 : 0);
      progress = (loadingBlProgress + loadingOsProgress) / 2;
      this.view.progressLabel.text("" + (Math.ceil(progress * 100)) + "%");
      return this.view.progressBar.setProgress(progress);
    };

    OnboardingDeviceSwitchfirmwareViewController.prototype._onUpdateNeedsUserApproval = function() {
      return this._request.approveCurrentState();
    };

    OnboardingDeviceSwitchfirmwareViewController.prototype._onStateChanged = function(newState, oldState) {
      switch (newState) {
        case States.Done:
          return this._onFirmwareSwitchDone();
      }
    };

    OnboardingDeviceSwitchfirmwareViewController.prototype._navigateNextSetup = function() {
      return ledger.app.dongle.isSwappedBip39FeatureEnabled().then((function(_this) {
        return function(enabled) {
          var params, url;
          if (_this.params.wallet_mode === 'create') {
            url = enabled ? '/onboarding/management/pin' : '/onboarding/management/security';
          } else {
            url = enabled ? '/onboarding/management/recovery_mode' : '/onboarding/management/security';
          }
          params = _.clone(_this.params);
          return _this.navigateContinue(url, _.extend(params, {
            swapped_bip39: enabled
          }));
        };
      })(this)).done();
    };

    OnboardingDeviceSwitchfirmwareViewController.prototype._navigateNextOperation = function() {
      return Q((function(_this) {
        return function() {
          var seed;
          if (_this.params.swapped_bip39 !== true) {
            seed = ledger.bitcoin.bip39.mnemonicPhraseToSeed(_this.params.mnemonicPhrase);
            return ledger.wallet.checkSetup(ledger.app.dongle, seed, _this.params.pin);
          }
        };
      })(this)).then((function(_this) {
        return function() {
          return _this.navigateContinue('/onboarding/management/done', {
            wallet_mode: _this.params.wallet_mode
          });
        };
      })(this)).fail((function(_this) {
        return function(err) {
          return _this.navigateContinue('/onboarding/management/done', {
            wallet_mode: _this.params.wallet_mode,
            error: 1
          });
        };
      })(this));
    };

    OnboardingDeviceSwitchfirmwareViewController.prototype._navigateOpen = function() {
      return ledger.app.dongle.unlockWithPinCode(this.params.pin, (function(_this) {
        return function() {
          ledger.app.notifyDongleIsUnlocked();
          ledger.utils.Logger.setPrivateModeEnabled(true);
          return ledger.app.router.go('/onboarding/device/opening');
        };
      })(this));
    };

    return OnboardingDeviceSwitchfirmwareViewController;

  })(this.OnboardingViewController);

}).call(this);
