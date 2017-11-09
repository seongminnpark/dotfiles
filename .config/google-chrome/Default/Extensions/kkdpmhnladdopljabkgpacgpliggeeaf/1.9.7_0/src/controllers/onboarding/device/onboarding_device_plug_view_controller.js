(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.OnboardingDevicePlugViewController = (function(_super) {
    __extends(OnboardingDevicePlugViewController, _super);

    function OnboardingDevicePlugViewController() {
      return OnboardingDevicePlugViewController.__super__.constructor.apply(this, arguments);
    }

    OnboardingDevicePlugViewController.prototype.defaultParams = {
      animateIntro: false
    };

    OnboardingDevicePlugViewController.prototype.view = {
      contentContainer: '#content-container',
      logoContainer: '.logo-container',
      greyedContainer: '.greyed-container',
      actionsContainer: '.actions-container',
      networkSelect: '#networks'
    };

    OnboardingDevicePlugViewController.prototype.onAfterRender = function() {
      OnboardingDevicePlugViewController.__super__.onAfterRender.apply(this, arguments);
      if (this.params.animateIntro === true) {
        return this._animateIntro();
      } else {
        return this._listenEvents();
      }
    };

    OnboardingDevicePlugViewController.prototype.openSupport = function() {
      return window.open(t('application.support_key_not_recognized_url'));
    };

    OnboardingDevicePlugViewController.prototype.openChangeLog = function() {
      return window.open("https://github.com/LedgerHQ/ledger-wallet-chrome/blob/master/CHANGELOG.md");
    };

    OnboardingDevicePlugViewController.prototype._hideContent = function(hidden, animated) {
      if (animated == null) {
        animated = true;
      }
      return this.view.contentContainer.children().each((function(_this) {
        return function(index, node) {
          node = $(node);
          if (hidden === true) {
            return node.fadeOut(animated ? 250 : 0);
          } else {
            return node.fadeIn(animated ? 250 : 0);
          }
        };
      })(this));
    };

    OnboardingDevicePlugViewController.prototype._animateIntro = function() {
      this.view.greyedContainer.hide();
      this.view.actionsContainer.hide();
      this.view.logoContainer.css('z-index', '1000');
      this.view.logoContainer.css('position', 'relative');
      this.view.logoContainer.css('top', (this.view.contentContainer.height() - this.view.logoContainer.outerHeight()) / 2);
      return setTimeout((function(_this) {
        return function() {
          _this._listenEvents();
          _this.view.greyedContainer.fadeIn(750);
          _this.view.actionsContainer.fadeIn(750);
          return _this.view.logoContainer.animate({
            top: 0
          }, 750);
        };
      })(this), 1500);
    };

    OnboardingDevicePlugViewController.prototype.navigateContinue = function() {
      return ledger.app.router.go('/onboarding/device/connecting');
    };

    OnboardingDevicePlugViewController.prototype._listenEvents = function() {
      if ((ledger.app.dongle != null) && !ledger.app.dongle.isInBootloaderMode() || ledger.app.isConnectingDongle()) {
        return this.navigateContinue();
      } else {
        ledger.app.once('dongle:connecting', this._onDongleConnecting.bind(this));
        return ledger.app.once('dongle:connected', this.navigateContinue.bind(this));
      }
    };

    OnboardingDevicePlugViewController.prototype._onDongleConnecting = function() {
      ledger.app.off('dongle:connected', this.navigateContinue.bind(this));
      return this.navigateContinue();
    };

    return OnboardingDevicePlugViewController;

  })(this.OnboardingViewController);

}).call(this);
