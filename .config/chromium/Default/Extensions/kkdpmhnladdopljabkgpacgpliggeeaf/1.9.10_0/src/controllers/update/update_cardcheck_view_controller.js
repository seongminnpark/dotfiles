(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.UpdateCardcheckViewController = (function(_super) {
    __extends(UpdateCardcheckViewController, _super);

    function UpdateCardcheckViewController() {
      return UpdateCardcheckViewController.__super__.constructor.apply(this, arguments);
    }

    UpdateCardcheckViewController.prototype.localizablePageSubtitle = "update.cardcheck.security_card_check";

    UpdateCardcheckViewController.prototype.localizablePreviousButton = "common.back";

    UpdateCardcheckViewController.prototype.navigation = {
      nextRoute: "",
      previousRoute: "/update/seed"
    };

    UpdateCardcheckViewController.prototype.view = {
      value1: "#value1",
      value2: "#value2",
      value3: "#value3",
      value4: "#value4"
    };

    UpdateCardcheckViewController.prototype.onAfterRender = function() {
      UpdateCardcheckViewController.__super__.onAfterRender.apply(this, arguments);
      return this._generateCharacters();
    };

    UpdateCardcheckViewController.prototype.navigateNext = function() {
      var _ref;
      l("My params ", this.params);
      this.getRequest().setKeyCardSeed(this.params.seed);
      if (((_ref = this.params) != null ? _ref.redirect_to_updating : void 0) === true) {
        return ledger.app.router.go('/update/updating?no_erase_keycard_seed=true');
      }
    };

    UpdateCardcheckViewController.prototype.navigatePrevious = function() {
      this.navigation.previousParams = {
        seed: this.params.seed
      };
      return UpdateCardcheckViewController.__super__.navigatePrevious.apply(this, arguments);
    };

    UpdateCardcheckViewController.prototype._generateCharacters = function() {
      var keycard, _ref;
      if (((_ref = this.params) != null ? _ref.seed : void 0) == null) {
        return;
      }
      keycard = ledger.keycard.generateKeycardFromSeed(this.params.seed);
      this.view.value1.text(keycard['3'].toUpperCase());
      this.view.value2.text(keycard['4'].toUpperCase());
      this.view.value3.text(keycard['5'].toUpperCase());
      return this.view.value4.text(keycard['6'].toUpperCase());
    };

    return UpdateCardcheckViewController;

  })(UpdateViewController);

}).call(this);
