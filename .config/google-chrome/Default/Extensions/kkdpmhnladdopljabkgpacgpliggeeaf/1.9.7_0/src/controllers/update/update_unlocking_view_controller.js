(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.UpdateUnlockingViewController = (function(_super) {
    __extends(UpdateUnlockingViewController, _super);

    function UpdateUnlockingViewController() {
      return UpdateUnlockingViewController.__super__.constructor.apply(this, arguments);
    }

    UpdateUnlockingViewController.prototype.localizablePageSubtitle = "update.unlocking.pin_code";

    UpdateUnlockingViewController.prototype.navigation = {
      previousRoute: "/onboarding/device/plug",
      previousParams: {
        animateIntro: false
      }
    };

    UpdateUnlockingViewController.prototype.navigatePrevious = function() {
      ledger.app.setExecutionMode(ledger.app.Modes.Wallet);
      return UpdateUnlockingViewController.__super__.navigatePrevious.apply(this, arguments);
    };

    UpdateUnlockingViewController.prototype.onAfterRender = function() {
      UpdateUnlockingViewController.__super__.onAfterRender.apply(this, arguments);
      return this._insertPinCode();
    };

    UpdateUnlockingViewController.prototype._insertPinCode = function() {
      this.view.pinCode = new ledger.pin_codes.PinCode();
      this.view.pinCode.insertIn(this.select('div#pin_container')[0]);
      this.view.pinCode.setStealsFocus(true);
      return this.view.pinCode.once('complete', (function(_this) {
        return function(event, value) {
          return _this.getRequest().unlockWithPinCode(value);
        };
      })(this));
    };

    UpdateUnlockingViewController.prototype.resetWallet = function() {
      return ledger.app.router.go('/update/erasing');
    };

    return UpdateUnlockingViewController;

  })(UpdateViewController);

}).call(this);
