(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.OnboardingManagementPinconfirmationViewController = (function(_super) {
    __extends(OnboardingManagementPinconfirmationViewController, _super);

    function OnboardingManagementPinconfirmationViewController() {
      return OnboardingManagementPinconfirmationViewController.__super__.constructor.apply(this, arguments);
    }

    OnboardingManagementPinconfirmationViewController.prototype.navigation = {
      continueUrl: '/onboarding/management/seed'
    };

    OnboardingManagementPinconfirmationViewController.prototype.view = {
      continueButton: '#continue_button',
      invalidLabel: '#invalid_pins'
    };

    OnboardingManagementPinconfirmationViewController.prototype.initialize = function() {
      return OnboardingManagementPinconfirmationViewController.__super__.initialize.apply(this, arguments);
    };

    OnboardingManagementPinconfirmationViewController.prototype.onAfterRender = function() {
      OnboardingManagementPinconfirmationViewController.__super__.onAfterRender.apply(this, arguments);
      this._insertPinCode();
      this._listenEvents();
      return this._updateUI(false);
    };

    OnboardingManagementPinconfirmationViewController.prototype.navigationContinueParams = function() {
      return {
        pin: this.params.pin
      };
    };

    OnboardingManagementPinconfirmationViewController.prototype._listenEvents = function() {
      return this.view.pinCode.on('change', (function(_this) {
        return function() {
          return _this._updateUI();
        };
      })(this));
    };

    OnboardingManagementPinconfirmationViewController.prototype._insertPinCode = function() {
      this.view.pinCode = new ledger.pin_codes.PinCode();
      this.view.pinCode.insertAfter(this.select('div.page-content-container > div'));
      return this.view.pinCode.setStealsFocus(true);
    };

    OnboardingManagementPinconfirmationViewController.prototype._updateUI = function(animated) {
      if (animated == null) {
        animated = true;
      }
      if (this._isPinValid()) {
        this.view.invalidLabel.fadeOut(animated ? 250 : 0);
        return this.view.continueButton.removeClass('disabled');
      } else {
        if (animated === false) {
          this.view.invalidLabel.fadeOut(0);
        } else {
          if (this.view.pinCode.isComplete()) {
            this.view.invalidLabel.fadeIn(animated ? 250 : 0);
          } else {
            this.view.invalidLabel.fadeOut(animated ? 250 : 0);
          }
        }
        return this.view.continueButton.addClass('disabled');
      }
    };

    OnboardingManagementPinconfirmationViewController.prototype._isPinValid = function() {
      return (this.view.pinCode.value() != null) && (this.params.pin != null) && this.view.pinCode.value() === this.params.pin;
    };

    return OnboardingManagementPinconfirmationViewController;

  })(this.OnboardingViewController);

}).call(this);
