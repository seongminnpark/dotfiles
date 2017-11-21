(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.OnboardingManagementPinViewController = (function(_super) {
    __extends(OnboardingManagementPinViewController, _super);

    function OnboardingManagementPinViewController() {
      return OnboardingManagementPinViewController.__super__.constructor.apply(this, arguments);
    }

    OnboardingManagementPinViewController.prototype.defaultParams = {
      pin_kind: 'auto'
    };

    OnboardingManagementPinViewController.prototype.view = {
      autoRadio: '#auto_radio',
      manualRadio: '#manual_radio',
      weakPinsLabel: '#weak_pins',
      generateLinkButton: '#generate_link',
      continueButton: '#continue_button',
      backButton: '#back_button'
    };

    OnboardingManagementPinViewController.prototype.navigation = {
      continueUrl: '/onboarding/management/pinconfirmation'
    };

    OnboardingManagementPinViewController.prototype.initialize = function() {
      OnboardingManagementPinViewController.__super__.initialize.apply(this, arguments);
      if (this._isPinKindAuto() && (this.params.pin == null)) {
        return this.params.pin = this._randomPinCode();
      }
    };

    OnboardingManagementPinViewController.prototype.onAfterRender = function() {
      OnboardingManagementPinViewController.__super__.onAfterRender.apply(this, arguments);
      this._insertPinCodes();
      this._listenEvents();
      return this._updateUI(false);
    };

    OnboardingManagementPinViewController.prototype.randomizePinCode = function() {
      this.params.pin = this._randomPinCode();
      return this._updateUI();
    };

    OnboardingManagementPinViewController.prototype.navigationContinueParams = function() {
      return {
        pin: this.params.pin
      };
    };

    OnboardingManagementPinViewController.prototype._insertPinCodes = function() {
      this.view.autoPinCode = new ledger.pin_codes.PinCode();
      this.view.autoPinCode.insertAfter(this.select('#choice-auto > label')[0]);
      this.view.autoPinCode.setProtected(false);
      this.view.autoPinCode.setReadonly(true);
      this.view.manualPinCode = new ledger.pin_codes.PinCode();
      return this.view.manualPinCode.insertAfter(this.select('#choice-manual > label')[0]);
    };

    OnboardingManagementPinViewController.prototype._listenEvents = function() {
      this.view.autoRadio.on('change', (function(_this) {
        return function() {
          _this.params.pin_kind = 'auto';
          _this.params.pin = _this._randomPinCode();
          return _this._updateUI();
        };
      })(this));
      this.view.autoPinCode.on('click', (function(_this) {
        return function() {
          return _this.view.autoRadio.change();
        };
      })(this));
      this.view.manualRadio.on('change', (function(_this) {
        return function() {
          _this.params.pin_kind = 'manual';
          _this.params.pin = void 0;
          return _this._updateUI();
        };
      })(this));
      this.view.manualPinCode.on('click', (function(_this) {
        return function() {
          return _this.view.manualRadio.change();
        };
      })(this));
      return this.view.manualPinCode.on('change', (function(_this) {
        return function() {
          _this.params.pin = _this.view.manualPinCode.value();
          return _this._updateUI();
        };
      })(this));
    };

    OnboardingManagementPinViewController.prototype._updateUI = function(animated) {
      if (animated == null) {
        animated = true;
      }
      this.view.autoRadio.prop('checked', this._isPinKindAuto());
      this.view.manualRadio.prop('checked', !this._isPinKindAuto());
      this.view.autoPinCode.setEnabled(this._isPinKindAuto());
      this.view.manualPinCode.setEnabled(!this._isPinKindAuto());
      this.view.manualPinCode.setStealsFocus(this._isPinKindAuto() === false, true);
      if (!this._isPinKindAuto()) {
        this.view.manualPinCode.focus();
      } else {
        this.view.autoRadio.focus();
      }
      if (this._isPinKindAuto()) {
        this.view.weakPinsLabel.fadeOut(animated ? 250 : 0);
        this.view.generateLinkButton.fadeIn(animated ? 250 : 0);
      } else {
        this.view.weakPinsLabel.fadeIn(animated ? 250 : 0);
        this.view.generateLinkButton.fadeOut(animated ? 250 : 0);
      }
      this.view.autoPinCode.clear();
      this.view.manualPinCode.clear();
      if (this.params.pin != null) {
        if (this._isPinKindAuto()) {
          this.view.autoPinCode.setValue(this.params.pin);
        } else {
          this.view.manualPinCode.setValue(this.params.pin);
        }
      }
      if (this._isPinValid()) {
        return this.view.continueButton.removeClass('disabled');
      } else {
        return this.view.continueButton.addClass('disabled');
      }
    };

    OnboardingManagementPinViewController.prototype._isPinKindAuto = function() {
      return this.params.pin_kind === 'auto';
    };

    OnboardingManagementPinViewController.prototype._isPinValid = function() {
      return (this.params.pin != null) && this.params.pin.length === 4;
    };

    OnboardingManagementPinViewController.prototype._randomPinCode = function() {
      var code, i, _i;
      code = '';
      for (i = _i = 1; _i <= 4; i = ++_i) {
        code += Math.floor(Math.random() * 10);
      }
      return code;
    };

    return OnboardingManagementPinViewController;

  })(this.OnboardingViewController);

}).call(this);
