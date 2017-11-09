(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.OnboardingManagementSummaryViewController = (function(_super) {
    __extends(OnboardingManagementSummaryViewController, _super);

    function OnboardingManagementSummaryViewController() {
      return OnboardingManagementSummaryViewController.__super__.constructor.apply(this, arguments);
    }

    OnboardingManagementSummaryViewController.prototype.navigation = {
      continueUrl: '/onboarding/management/provisioning'
    };

    OnboardingManagementSummaryViewController.prototype.initialize = function() {
      OnboardingManagementSummaryViewController.__super__.initialize.apply(this, arguments);
      if (this.params.swapped_bip39) {
        return this.navigation.continueUrl = '/onboarding/device/swapped_bip39_provisioning';
      } else if (ledger.app.dongle.getFirmwareInformation().hasSubFirmwareSupport()) {
        return this.navigation.continueUrl = '/onboarding/device/switch_firmware';
      }
    };

    OnboardingManagementSummaryViewController.prototype.navigationContinueParams = function() {
      return {
        pin: this.params.pin,
        mnemonicPhrase: this.params.mnemonicPhrase,
        mode: 'operation'
      };
    };

    return OnboardingManagementSummaryViewController;

  })(this.OnboardingViewController);

}).call(this);
