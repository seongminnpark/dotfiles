(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.UpdateNavigationController = (function(_super) {
    __extends(UpdateNavigationController, _super);

    function UpdateNavigationController() {
      return UpdateNavigationController.__super__.constructor.apply(this, arguments);
    }

    UpdateNavigationController.prototype.view = {
      pageSubtitle: "#page_subtitle",
      previousButton: "#previous_button",
      nextButton: "#next_button"
    };

    UpdateNavigationController.prototype.onAttach = function() {
      this._request = ledger.fup.FirmwareUpdater.instance.requestVersatileFirmwareUpdate();
      this._request.on('plug', (function(_this) {
        return function() {
          return _this._onPlugDongle();
        };
      })(this));
      this._request.on('unplug', (function(_this) {
        return function() {
          return _this._onDongleNeedPowerCycle();
        };
      })(this));
      this._request.on('stateChanged', (function(_this) {
        return function(ev, data) {
          return _this._onStateChanged(data.newState, data.oldState, data);
        };
      })(this));
      this._request.on('needsUserApproval', (function(_this) {
        return function() {
          return _this._onNeedsUserApproval();
        };
      })(this));
      ledger.app.on('dongle:disconnected', (function(_this) {
        return function() {
          if (_(_this.topViewController()).isKindOf(UpdateIndexViewController) || _(_this.topViewController()).isKindOf(UpdateSeedViewController) || _(_this.topViewController()).isKindOf(UpdateDoneViewController) || _(_this.topViewController()).isKindOf(UpdateErrorViewController)) {
            ledger.app.setExecutionMode(ledger.app.Modes.Wallet);
            return ledger.app.router.go('/onboarding/device/plug', {
              animateIntro: false
            });
          }
        };
      })(this));
      this._request.on('error', (function(_this) {
        return function(event, error) {
          return _this._onError(error.cause);
        };
      })(this));
      this._request.onProgress(this._onProgress.bind(this));
      return ledger.fup.FirmwareUpdater.instance.load((function(_this) {
        return function() {};
      })(this));
    };

    UpdateNavigationController.prototype.renderChild = function() {
      UpdateNavigationController.__super__.renderChild.apply(this, arguments);
      return this.topViewController().once('afterRender', (function(_this) {
        return function() {
          _this.view.pageSubtitle.text(t(_this.topViewController().localizablePageSubtitle));
          return _this.updateNavigationItems();
        };
      })(this));
    };

    UpdateNavigationController.prototype.onDetach = function() {
      return this._request.cancel();
    };

    UpdateNavigationController.prototype.updateNavigationItems = function() {
      this.view.previousButton.html('<i class="fa fa-angle-left"></i> ' + t(this.topViewController().localizablePreviousButton));
      this.view.nextButton.html(t(this.topViewController().localizableNextButton) + ' <i class="fa fa-angle-right"></i>');
      if (this.topViewController().shouldShowNextButton()) {
        this.view.nextButton.show();
      } else {
        this.view.nextButton.hide();
      }
      if (this.topViewController().shouldShowPreviousButton()) {
        this.view.previousButton.show();
      } else {
        this.view.previousButton.hide();
      }
      if (this.topViewController().shouldEnableNextButton()) {
        this.view.nextButton.removeClass('disabled');
      } else {
        this.view.nextButton.addClass('disabled');
      }
      if (this.topViewController().shouldEnablePreviousButton()) {
        return this.view.previousButton.removeClass('disabled');
      } else {
        return this.view.previousButton.addClass('disabled');
      }
    };

    UpdateNavigationController.prototype._onPlugDongle = function() {
      this._currentError = null;
      return ledger.app.router.go('/update/plug');
    };

    UpdateNavigationController.prototype._onErasingDongle = function() {
      return ledger.app.router.go('/update/erasing');
    };

    UpdateNavigationController.prototype._onUnlockingDongle = function() {
      return ledger.app.router.go('/update/unlocking');
    };

    UpdateNavigationController.prototype._onSeedingKeycard = function() {
      return ledger.app.router.go('/update/seed');
    };

    UpdateNavigationController.prototype._onDongleNeedPowerCycle = function() {
      if (this._currentError == null) {
        return ledger.app.router.go('/update/unplug');
      }
    };

    UpdateNavigationController.prototype._onReloadingBootloaderFromOs = function() {
      return ledger.app.router.go('/update/updating');
    };

    UpdateNavigationController.prototype._onLoadingOs = function() {
      return ledger.app.router.go('/update/loading');
    };

    UpdateNavigationController.prototype._onDone = function(_arg) {
      var provisioned;
      provisioned = _arg.provisioned;
      return ledger.app.router.go('/update/done', {
        provisioned: provisioned
      });
    };

    UpdateNavigationController.prototype._onError = function(error) {
      this._currentError = error;
      return ledger.app.router.go('/update/error', {
        errorCode: error.code.intValue()
      });
    };

    UpdateNavigationController.prototype._onStateChanged = function(newState, oldState, data) {
      switch (newState) {
        case ledger.fup.FirmwareUpdateRequest.States.Erasing:
          if (!this._request.hasGrantedErasurePermission()) {
            return this._onErasingDongle();
          }
          break;
        case ledger.fup.FirmwareUpdateRequest.States.Unlocking:
          return this._onUnlockingDongle();
        case ledger.fup.FirmwareUpdateRequest.States.SeedingKeycard:
          return this._onSeedingKeycard();
        case ledger.fup.FirmwareUpdateRequest.States.ReloadingBootloaderFromOs:
          return this._onReloadingBootloaderFromOs();
        case ledger.fup.FirmwareUpdateRequest.States.LoadingOs:
          return this._onLoadingOs();
        case ledger.fup.FirmwareUpdateRequest.States.LoadingBootloaderReloader:
          return this._onLoadingOs();
        case ledger.fup.FirmwareUpdateRequest.States.LoadingBootloader:
          return this._onLoadingOs();
        case ledger.fup.FirmwareUpdateRequest.States.Done:
          return this._onDone(data);
      }
    };

    UpdateNavigationController.prototype._onNeedsUserApproval = function() {
      var _ref;
      if ((_ref = this.topViewController()) != null ? _ref.isRendered() : void 0) {
        return this.topViewController().onNeedsUserApproval();
      } else {
        return this.topViewController().once('afterRender', (function(_this) {
          return function() {
            return _this.topViewController().onNeedsUserApproval();
          };
        })(this));
      }
    };

    UpdateNavigationController.prototype._onProgress = function(state, current, total) {
      var _ref;
      if ((_ref = this.topViewController()) != null ? _ref.isRendered() : void 0) {
        return this.topViewController().onProgress(state, current, total);
      } else {
        return this.topViewController().once('afterRender', (function(_this) {
          return function() {
            return _this.topViewController().onProgress(state, current, total);
          };
        })(this));
      }
    };

    return UpdateNavigationController;

  })(ledger.common.NavigationController);

}).call(this);
