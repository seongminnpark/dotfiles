(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.OnboardingDeviceOpeningViewController = (function(_super) {
    __extends(OnboardingDeviceOpeningViewController, _super);

    function OnboardingDeviceOpeningViewController() {
      return OnboardingDeviceOpeningViewController.__super__.constructor.apply(this, arguments);
    }

    OnboardingDeviceOpeningViewController.prototype.view = {
      currentAction: "#current_action"
    };

    OnboardingDeviceOpeningViewController.prototype.onAfterRender = function() {
      var _ref;
      OnboardingDeviceOpeningViewController.__super__.onAfterRender.apply(this, arguments);
      this.view.spinner = ledger.spinners.createLargeSpinner(this.select('div.greyed-container')[0]);
      if ((_ref = Wallet.instance) != null ? _ref.isInitialized : void 0) {
        return ledger.app.router.go('/wallet/accounts/index');
      } else {
        this.view.currentAction.text(t('onboarding.device.opening.opening'));
        ledger.app.on('wallet:initialized', this.onWalletInitialized);
        return ledger.app.on('wallet:initialization:creation', this.onWalletIsSynchronizing);
      }
    };

    OnboardingDeviceOpeningViewController.prototype.openSupport = function() {
      return window.open(t('application.support_url'));
    };

    OnboardingDeviceOpeningViewController.prototype.onWalletInitialized = function() {
      return ledger.app.router.go('/wallet/accounts/index');
    };

    OnboardingDeviceOpeningViewController.prototype.onWalletIsSynchronizing = function() {
      return this.view.currentAction.text(t('onboarding.device.opening.is_synchronizing'));
    };

    OnboardingDeviceOpeningViewController.prototype.onDetach = function() {
      OnboardingDeviceOpeningViewController.__super__.onDetach.apply(this, arguments);
      ledger.app.off('wallet:initialized', this.onWalletInitialized);
      return ledger.app.off('wallet:initialization:creation', this.onWalletIsSynchronizing);
    };

    return OnboardingDeviceOpeningViewController;

  })(this.OnboardingViewController);

}).call(this);
