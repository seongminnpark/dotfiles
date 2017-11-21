(function() {
  var EstimatedTime,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  EstimatedTime = (4 * 60 + 30) * 1000;

  this.OnboardingDeviceSwappedbip39provisioningViewController = (function(_super) {
    __extends(OnboardingDeviceSwappedbip39provisioningViewController, _super);

    function OnboardingDeviceSwappedbip39provisioningViewController() {
      return OnboardingDeviceSwappedbip39provisioningViewController.__super__.constructor.apply(this, arguments);
    }

    OnboardingDeviceSwappedbip39provisioningViewController.prototype.view = {
      progressBar: '#circle_progress_bar',
      carousel: '.carousel'
    };

    OnboardingDeviceSwappedbip39provisioningViewController.prototype.carouselTexts = ["Ledger Nano is a Bitcoin wallet on a smartcard device, small format and low weight.<br /> Comfortable and simple to use, you connect it directly to a USB port to manage your account.", "Extensible Duo from de Super market on a Random device, power format efficient low format.<br /> Comfortable to applaude to car, you unchained it card to a money transport strong management.", "Ledger Nano is a Bitcoin wallet on a smartcard device, small format and low weight.<br /> Comfortable and simple to use, you connect it directly to a USB port to manage your account.", "Ledger Nano is a Bitcoin wallet on a smartcard device, small format and low weight.<br /> Comfortable and simple to use, you connect it directly to a USB port to manage your account."];

    OnboardingDeviceSwappedbip39provisioningViewController.prototype.onAfterRender = function() {
      OnboardingDeviceSwappedbip39provisioningViewController.__super__.onAfterRender.apply(this, arguments);
      this._progressBar = new ledger.widgets.CircleProgressBar(this.view.progressBar, {
        width: 70,
        height: 70
      });
      window.pr = this._progressBar;
      this._startTime = new Date().getTime();
      this._interval = setInterval(this._refreshProgression.bind(this), 1000);
      this._initializeCarousel();
      if (this.params.wallet_mode === 'create') {
        return this._finalizeSetup();
      } else {
        return this._performSetup();
      }
    };

    OnboardingDeviceSwappedbip39provisioningViewController.prototype.onDetach = function() {
      OnboardingDeviceSwappedbip39provisioningViewController.__super__.onDetach.apply(this, arguments);
      return clearInterval(this._interval);
    };

    OnboardingDeviceSwappedbip39provisioningViewController.prototype._initializeCarousel = function() {
      var child, text, _i, _len, _ref;
      this.view.carousel.empty();
      _ref = this.carouselTexts;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        text = _ref[_i];
        child = $("<div class=\"carousel-item \">" + (t(text)) + "</div>");
        this.view.carousel.append(child);
      }
      return this.view.carousel.slick({
        dots: true,
        infinite: true,
        autoplay: true,
        arrows: false,
        accessibility: false,
        draggable: false,
        fade: true,
        speed: 500
      });
    };

    OnboardingDeviceSwappedbip39provisioningViewController.prototype._refreshProgression = function() {
      var diff;
      diff = new Date().getTime() - this._startTime;
      return this._progressBar.setProgress(Math.min(diff / EstimatedTime, 1));
    };

    OnboardingDeviceSwappedbip39provisioningViewController.prototype._finalizeSetup = function() {
      return ledger.app.dongle.setupFinalizeBip39().then((function(_this) {
        return function() {
          return _this.navigateContinue('/onboarding/device/switch_firmware', _.extend(_.clone(_this.params), {
            mode: 'operation'
          }));
        };
      })(this)).fail((function(_this) {
        return function() {
          return _this.navigateContinue('/onboarding/management/done', {
            wallet_mode: _this.params.wallet_mode,
            error: 1
          });
        };
      })(this));
    };

    OnboardingDeviceSwappedbip39provisioningViewController.prototype._performSetup = function() {
      return ledger.app.dongle.restoreSwappedBip39(this.params.pin, this.params.mnemonicPhrase).then((function(_this) {
        return function() {
          return ledger.app.dongle.restoreFinalizeBip29();
        };
      })(this)).then((function(_this) {
        return function() {
          _this.navigateContinue('/onboarding/device/switch_firmware', _.extend(_.clone(_this.params), {
            mode: 'operation'
          }));
        };
      })(this)).fail((function(_this) {
        return function(err) {
          var params;
          if ((_this.params.retrying != null) === false && false) {
            params = _.clone(_this.params);
            _.extend(params, {
              retrying: true
            });
            return _this.navigateContinue('/onboarding/device/switch_firmware', _.extend(_.clone(_this.params), {
              mode: 'setup'
            }));
          } else {
            return ledger.app.router.go('/onboarding/management/done', {
              wallet_mode: _this.params.wallet_mode,
              error: 1
            });
          }
        };
      })(this));
    };

    return OnboardingDeviceSwappedbip39provisioningViewController;

  })(this.OnboardingViewController);

}).call(this);
