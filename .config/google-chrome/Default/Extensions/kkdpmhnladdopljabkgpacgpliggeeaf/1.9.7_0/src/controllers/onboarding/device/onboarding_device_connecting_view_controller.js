(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.OnboardingDeviceConnectingViewController = (function(_super) {
    __extends(OnboardingDeviceConnectingViewController, _super);

    function OnboardingDeviceConnectingViewController() {
      return OnboardingDeviceConnectingViewController.__super__.constructor.apply(this, arguments);
    }

    OnboardingDeviceConnectingViewController.prototype.defaultParams = {
      animateIntro: false
    };

    OnboardingDeviceConnectingViewController.prototype.view = {
      currentAction: "#current_action"
    };

    OnboardingDeviceConnectingViewController.prototype.timer = null;

    OnboardingDeviceConnectingViewController.prototype.onAfterRender = function() {
      OnboardingDeviceConnectingViewController.__super__.onAfterRender.apply(this, arguments);
      this._listenEvents();
      this.view.spinner = ledger.spinners.createLargeSpinner(this.select('div.greyed-container')[0]);
      this.view.currentAction.text(t('onboarding.device.connecting.is_connecting'));
      return this._launchAttestation();
    };

    OnboardingDeviceConnectingViewController.prototype.openSupport = function() {
      return window.open(t('application.support_url'));
    };

    OnboardingDeviceConnectingViewController.prototype.onDetach = function() {
      OnboardingDeviceConnectingViewController.__super__.onDetach.apply(this, arguments);
      ledger.app.off('dongle:connected');
      ledger.app.off('dongle:forged');
      ledger.app.off('dongle:communication_error');
      return this._stopTimer();
    };

    OnboardingDeviceConnectingViewController.prototype._navigateContinue = function() {
      var _ref;
      this._stopTimer();
      return (_ref = ledger.app.dongle) != null ? _ref.isFirmwareUpdateAvailable((function(_this) {
        return function(isAvailable) {
          if (isAvailable) {
            return ledger.app.router.go('/onboarding/device/update');
          } else {
            return ledger.app.dongle.getState(function(state) {
              if (state === ledger.dongle.States.LOCKED) {
                return ledger.app.router.go('/onboarding/device/pin');
              } else if (state === ledger.dongle.States.UNLOCKED) {
                ledger.app.notifyDongleIsUnlocked();
                return ledger.utils.Logger.setPrivateModeEnabled(true);
              } else {
                return ledger.app.router.go('/onboarding/management/welcome');
              }
            });
          }
        };
      })(this)) : void 0;
    };

    OnboardingDeviceConnectingViewController.prototype._navigateForged = function() {
      var _ref;
      this._stopTimer();
      return (_ref = ledger.app.dongle) != null ? _ref.isBetaCertified((function(_this) {
        return function(__, error) {
          var _ref1;
          if (error != null) {
            return ledger.app.router.go('/onboarding/device/forged');
          } else {
            return (_ref1 = ledger.app.dongle) != null ? _ref1.isFirmwareOverwriteOrUpdateAvailable(function(isAvailable) {
              if (isAvailable && !ledger.fup.versions.Nano.CurrentVersion.Beta) {
                ledger.app.setExecutionMode(ledger.app.Modes.FirmwareUpdate);
                return ledger.app.router.go('/update/welcome', {
                  hidePreviousButton: true
                });
              } else {
                return _this._navigateContinue();
              }
            }) : void 0;
          }
        };
      })(this)) : void 0;
    };

    OnboardingDeviceConnectingViewController.prototype._navigateError = function() {
      this._stopTimer();
      return ledger.app.router.go('/onboarding/device/failed');
    };

    OnboardingDeviceConnectingViewController.prototype._listenEvents = function() {
      ledger.app.once('dongle:connected', (function(_this) {
        return function() {
          return _this._navigateContinue();
        };
      })(this));
      ledger.app.once('dongle:forged', (function(_this) {
        return function() {
          return _this._navigateForged();
        };
      })(this));
      return ledger.app.once('dongle:communication_error', (function(_this) {
        return function() {
          return _this._navigateError();
        };
      })(this));
    };

    OnboardingDeviceConnectingViewController.prototype._stopTimer = function() {
      if (this.timer != null) {
        clearTimeout(this.timer);
        return this.timer = null;
      }
    };

    OnboardingDeviceConnectingViewController.prototype._launchAttestation = function() {
      if (ledger.app.dongle != null) {
        ledger.app.performDongleAttestation();
      }
      return this.timer = setTimeout((function(_this) {
        return function() {
          return _this._navigateError();
        };
      })(this), 30000);
    };

    return OnboardingDeviceConnectingViewController;

  })(this.OnboardingViewController);

}).call(this);
