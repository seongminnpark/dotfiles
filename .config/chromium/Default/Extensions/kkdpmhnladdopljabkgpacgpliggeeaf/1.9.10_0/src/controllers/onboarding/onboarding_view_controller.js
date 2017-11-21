(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.OnboardingViewController = (function(_super) {
    __extends(OnboardingViewController, _super);

    function OnboardingViewController() {
      return OnboardingViewController.__super__.constructor.apply(this, arguments);
    }

    OnboardingViewController.prototype.view = {
      continueButton: '#continue_button'
    };

    OnboardingViewController.prototype.navigation = {
      continueUrl: void 0
    };

    OnboardingViewController.prototype.bumpsStepCount = true;

    OnboardingViewController.prototype.onAfterRender = function() {
      OnboardingViewController.__super__.onAfterRender.apply(this, arguments);
      this.unbindWindow();
      return this.bindWindow();
    };

    OnboardingViewController.prototype.navigationBackParams = function() {
      return void 0;
    };

    OnboardingViewController.prototype.navigationContinueParams = function() {
      return void 0;
    };

    OnboardingViewController.prototype._defaultNavigationBackParams = function() {
      return {};
    };

    OnboardingViewController.prototype._defaultNavigationContinueParams = function() {
      return {
        wallet_mode: this.params.wallet_mode,
        rootUrl: this.params.rootUrl,
        back: this.representativeUrl(),
        step: parseInt(this.params.step) + (this._canBumpNextViewControllerStepCount() ? 1 : 0),
        swapped_bip39: this.params.swapped_bip39
      };
    };

    OnboardingViewController.prototype._finalNavigationBackParams = function() {
      return _.extend(this._defaultNavigationBackParams(), this.navigationBackParams());
    };

    OnboardingViewController.prototype._finalNavigationContinueParams = function() {
      return _.extend(this._defaultNavigationContinueParams(), this.navigationContinueParams());
    };

    OnboardingViewController.prototype._canBumpNextViewControllerStepCount = function() {
      var words;
      words = _.str.words(_.str.underscored(this.identifier()), "_");
      return words.length >= 2 && words[1] === "management" && this.bumpsStepCount;
    };

    OnboardingViewController.prototype.navigateRoot = function() {
      var dialog;
      dialog = new CommonDialogsConfirmationDialogViewController();
      dialog.setMessageLocalizableKey('onboarding.management.cancel_wallet_configuration');
      dialog.positiveLocalizableKey = 'common.no';
      dialog.negativeLocalizableKey = 'common.yes';
      dialog.once('click:negative', (function(_this) {
        return function() {
          return ledger.app.router.go(_this.params.rootUrl);
        };
      })(this));
      return dialog.show();
    };

    OnboardingViewController.prototype.navigateBack = function() {
      return ledger.app.router.go(this.params.back, this._finalNavigationBackParams());
    };

    OnboardingViewController.prototype.navigateContinue = function(url, params) {
      if (!_.isFunction(url != null ? url.parseAsUrl : void 0)) {
        url = void 0;
      }
      if (params != null) {
        params = _.extend(this._defaultNavigationContinueParams(), params);
      }
      return ledger.app.router.go(url || this.navigation.continueUrl, params || this._finalNavigationContinueParams());
    };

    OnboardingViewController.prototype.unbindWindow = function() {
      return $(window).unbind('keyup', null);
    };

    OnboardingViewController.prototype.openHelpCenter = function() {
      return window.open(t('application.support_url'));
    };

    OnboardingViewController.prototype.bindWindow = function() {
      if ((this.view.continueButton != null) && this.view.continueButton.length === 1) {
        return $(window).on('keyup', (function(_this) {
          return function(e) {
            if (e.keyCode === 13) {
              if (!_this.view.continueButton.hasClass('disabled')) {
                return _this.view.continueButton.click();
              }
            }
          };
        })(this));
      }
    };

    return OnboardingViewController;

  })(ledger.common.ViewController);

}).call(this);
