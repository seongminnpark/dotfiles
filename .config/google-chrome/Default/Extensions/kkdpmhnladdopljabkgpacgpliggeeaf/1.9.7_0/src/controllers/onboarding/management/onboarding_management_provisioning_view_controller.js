(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.OnboardingManagementProvisioningViewController = (function(_super) {
    __extends(OnboardingManagementProvisioningViewController, _super);

    function OnboardingManagementProvisioningViewController() {
      return OnboardingManagementProvisioningViewController.__super__.constructor.apply(this, arguments);
    }

    OnboardingManagementProvisioningViewController.prototype.bumpsStepCount = false;

    OnboardingManagementProvisioningViewController.prototype.onAfterRender = function() {
      OnboardingManagementProvisioningViewController.__super__.onAfterRender.apply(this, arguments);
      this.view.spinner = ledger.spinners.createLargeSpinner(this.select('div.greyed-container')[0]);
      return this._performSetup();
    };

    OnboardingManagementProvisioningViewController.prototype._performSetup = function() {
      var seed;
      seed = ledger.bitcoin.bip39.mnemonicPhraseToSeed(this.params.mnemonicPhrase);
      return ledger.app.dongle.setup(this.params.pin, seed).then((function(_this) {
        return function() {
          return ledger.wallet.checkSetup(ledger.app.dongle, seed, _this.params.pin);
        };
      })(this)).then((function(_this) {
        return function() {
          return ledger.app.router.go('/onboarding/management/done', {
            wallet_mode: _this.params.wallet_mode
          });
        };
      })(this)).fail((function(_this) {
        return function() {
          return ledger.app.router.go('/onboarding/management/done', {
            wallet_mode: _this.params.wallet_mode,
            error: 1
          });
        };
      })(this));
    };

    return OnboardingManagementProvisioningViewController;

  })(this.OnboardingViewController);

}).call(this);
