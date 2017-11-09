(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.UpdateSeedViewController = (function(_super) {
    __extends(UpdateSeedViewController, _super);

    function UpdateSeedViewController() {
      this._keychardValueIsValid = __bind(this._keychardValueIsValid, this);
      return UpdateSeedViewController.__super__.constructor.apply(this, arguments);
    }

    UpdateSeedViewController.prototype.localizablePageSubtitle = "update.seed.security_card_qrcode";

    UpdateSeedViewController.prototype.navigation = {
      nextRoute: "/update/cardcheck",
      previousRoute: "/update/welcome",
      previousParams: {
        animateIntro: false
      }
    };

    UpdateSeedViewController.prototype.view = {
      seedInput: "#seed_input",
      validCheck: "#valid_check",
      openScannerButton: "#open_scanner_button"
    };

    UpdateSeedViewController.prototype.render = function() {
      UpdateSeedViewController.__super__.render.apply(this, arguments);
      if (this.getRequest().getDongleFirmware().hasSubFirmwareSupport()) {
        return this.navigation.previousRoute = "/update/updating";
      }
    };

    UpdateSeedViewController.prototype.onAfterRender = function() {
      var _ref;
      UpdateSeedViewController.__super__.onAfterRender.apply(this, arguments);
      this._listenEvents();
      if (((_ref = this.params) != null ? _ref.seed : void 0) != null) {
        this.view.seedInput.val(this.params.seed);
      }
      return this._updateValidCheck();
    };

    UpdateSeedViewController.prototype.navigateNext = function() {
      var _ref;
      this.navigation.nextParams = {
        seed: this._seedInputvalue(),
        redirect_to_updating: (_ref = this.params) != null ? _ref.redirect_to_updating : void 0
      };
      return UpdateSeedViewController.__super__.navigateNext.apply(this, arguments);
    };

    UpdateSeedViewController.prototype.shouldEnableNextButton = function() {
      return this._keychardValueIsValid(this._seedInputvalue());
    };

    UpdateSeedViewController.prototype._keychardValueIsValid = function(value) {
      return this.getRequest().checkIfKeyCardSeedIsValid(value);
    };

    UpdateSeedViewController.prototype._listenEvents = function() {
      this.view.seedInput.on('blur', (function(_this) {
        return function() {
          return _this.view.seedInput.focus();
        };
      })(this));
      _.defer((function(_this) {
        return function() {
          return _this.view.seedInput.focus();
        };
      })(this));
      this.view.seedInput.on('input propertychange', (function(_this) {
        return function() {
          _this.parentViewController.updateNavigationItems();
          _this._updateValidCheck();
          return _this._updateInputSize();
        };
      })(this));
      return this.view.openScannerButton.on('click', (function(_this) {
        return function() {
          var dialog;
          dialog = new CommonDialogsQrcodeDialogViewController;
          dialog.qrcodeCheckBlock = function(data) {
            return _this._keychardValueIsValid(data);
          };
          dialog.once('qrcode', function(event, data) {
            _this.view.seedInput.val(data);
            _this.parentViewController.updateNavigationItems();
            _this._updateValidCheck();
            return _this._updateInputSize();
          });
          return dialog.show();
        };
      })(this));
    };

    UpdateSeedViewController.prototype._updateValidCheck = function() {
      if (this._keychardValueIsValid(this._seedInputvalue())) {
        return this.view.validCheck.show();
      } else {
        return this.view.validCheck.hide();
      }
    };

    UpdateSeedViewController.prototype._updateInputSize = function() {
      if (this._seedInputvalue().length > 32) {
        return this.view.seedInput.addClass('large');
      } else {
        return this.view.seedInput.removeClass('large');
      }
    };

    UpdateSeedViewController.prototype._seedInputvalue = function() {
      return _.str.trim(this.view.seedInput.val());
    };

    return UpdateSeedViewController;

  })(UpdateViewController);

}).call(this);
