(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.OnboardingManagementWelcomeViewController = (function(_super) {
    __extends(OnboardingManagementWelcomeViewController, _super);

    function OnboardingManagementWelcomeViewController() {
      return OnboardingManagementWelcomeViewController.__super__.constructor.apply(this, arguments);
    }

    OnboardingManagementWelcomeViewController.prototype.bumpsStepCount = false;

    OnboardingManagementWelcomeViewController.prototype.onBeforeRender = function() {
      OnboardingManagementWelcomeViewController.__super__.onBeforeRender.apply(this, arguments);
      if (ledger.app.dongle.getFirmwareInformation().hasSetupFirmwareSupport()) {
        return this._isSwappedBip39FeatureEnabled = ledger.app.dongle.isSwappedBip39FeatureEnabled();
      }
    };

    OnboardingManagementWelcomeViewController.prototype.createNewWallet = function() {
      return this.navigateNextPage('create');
    };

    OnboardingManagementWelcomeViewController.prototype.restoreWallet = function() {
      return this.navigateNextPage('recover');
    };

    OnboardingManagementWelcomeViewController.prototype.navigateNextPage = function(mode) {
      var firmware, navigateToFirstSwappedBip39Page, navigateToSecurityPage, navigateToSwitchFirmwarePage;
      navigateToSecurityPage = (function(_this) {
        return function() {
          return _this.navigateContinue('/onboarding/management/security', {
            wallet_mode: mode,
            back: _this.representativeUrl(),
            rootUrl: _this.representativeUrl(),
            step: 1,
            swapped_bip39: false
          });
        };
      })(this);
      navigateToFirstSwappedBip39Page = (function(_this) {
        return function() {
          return _this.navigateContinue((mode === 'create' ? '/onboarding/management/pin' : '/onboarding/management/recovery_mode'), {
            wallet_mode: mode,
            back: _this.representativeUrl(),
            rootUrl: _this.representativeUrl(),
            step: 1,
            swapped_bip39: true
          });
        };
      })(this);
      navigateToSwitchFirmwarePage = (function(_this) {
        return function() {
          return _this.navigateContinue('/onboarding/device/switch_firmware', {
            mode: 'setup',
            wallet_mode: mode,
            back: _this.representativeUrl(),
            rootUrl: _this.representativeUrl(),
            step: 1,
            swapped_bip39: true
          });
        };
      })(this);
      firmware = ledger.app.dongle.getFirmwareInformation();
      if (!firmware.hasSubFirmwareSupport()) {
        return navigateToSecurityPage();
      } else if (firmware.hasSetupFirmwareSupport()) {
        return this._isSwappedBip39FeatureEnabled.then((function(_this) {
          return function(enabled) {
            if (enabled) {
              return navigateToFirstSwappedBip39Page();
            } else {
              return navigateToSecurityPage();
            }
          };
        })(this)).done();
      } else {
        return navigateToSwitchFirmwarePage();
      }
    };

    return OnboardingManagementWelcomeViewController;

  })(this.OnboardingViewController);

}).call(this);
