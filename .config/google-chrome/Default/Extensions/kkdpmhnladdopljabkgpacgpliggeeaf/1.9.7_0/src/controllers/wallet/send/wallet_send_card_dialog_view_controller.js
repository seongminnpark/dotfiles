(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletSendCardDialogViewController = (function(_super) {
    __extends(WalletSendCardDialogViewController, _super);

    function WalletSendCardDialogViewController() {
      return WalletSendCardDialogViewController.__super__.constructor.apply(this, arguments);
    }

    WalletSendCardDialogViewController.prototype.view = {
      cardContainer: "#card_container",
      enteredCode: "#validation_code",
      validationIndication: "#validation_indication",
      validationSubtitle: "#validation_subtitle",
      otherValidationMethodsLabel: "#other_validation_methods",
      keycard: void 0,
      tinyPincode: void 0
    };

    WalletSendCardDialogViewController.prototype._validationDetails = void 0;

    WalletSendCardDialogViewController.prototype.cancel = function() {
      Api.callback_cancel('send_payment', t('wallet.send.errors.cancelled'));
      return this.dismiss();
    };

    WalletSendCardDialogViewController.prototype.onAfterRender = function() {
      WalletSendCardDialogViewController.__super__.onAfterRender.apply(this, arguments);
      this._setupUI();
      this._updateUI();
      return _.defer((function(_this) {
        return function() {
          return _this.view.keycard.stealFocus();
        };
      })(this));
    };

    WalletSendCardDialogViewController.prototype.otherValidationMethods = function() {
      var dialog, _ref;
      if ((((_ref = this.params.options) != null ? _ref.hideOtherValidationMethods : void 0) != null) === true) {
        return;
      }
      dialog = new WalletSendMethodDialogViewController({
        transaction: this.params.transaction
      });
      return this.getDialog().push(dialog);
    };

    WalletSendCardDialogViewController.prototype._setupUI = function() {
      var _ref;
      this.view.keycard = new ledger.pin_codes.KeyCard();
      this.view.tinyPincode = new ledger.pin_codes.TinyPinCode();
      this.view.keycard.insertIn(this.view.cardContainer[0]);
      this.view.tinyPincode.insertIn(this.view.enteredCode[0]);
      if ((((_ref = this.params.options) != null ? _ref.hideOtherValidationMethods : void 0) != null) === true) {
        this.view.otherValidationMethodsLabel.hide();
      }
      return this._listenEvents();
    };

    WalletSendCardDialogViewController.prototype._listenEvents = function() {
      this.view.keycard.once('completed', (function(_this) {
        return function(event, value) {
          return _this.dismiss(function() {
            var dialog;
            dialog = new WalletSendProcessingDialogViewController({
              transaction: _this.params.transaction,
              keycode: value
            });
            return dialog.show();
          });
        };
      })(this));
      this.view.keycard.on('character:input', (function(_this) {
        return function(event, value) {
          _this.view.tinyPincode.setValuesCount(_this.view.keycard.value().length);
          return _this._validationDetails.localizedIndexes.splice(0, 1);
        };
      })(this));
      return this.view.keycard.on('character:waiting', (function(_this) {
        return function(event, value) {
          return _this._updateValidableIndication();
        };
      })(this));
    };

    WalletSendCardDialogViewController.prototype._updateUI = function() {
      this._validationDetails = this.params.transaction.getValidationDetails();
      this._validationDetails = _.extend(this._validationDetails, this._buildValidableSettings(this._validationDetails));
      this.view.keycard.setValidableValues(this._validationDetails.validationCharacters);
      this.view.tinyPincode.setInputsCount(this._validationDetails.validationCharacters.length);
      if (this._validationDetails.needsAmountValidation) {
        return this.view.validationSubtitle.text(_.str.sprintf(t('wallet.send.card.amount_and_address_to_validate'), _.str.capitalize(ledger.config.network.display_name)));
      } else {
        return this.view.validationSubtitle.text(_.str.sprintf(t('wallet.send.card.address_to_validate'), _.str.capitalize(ledger.config.network.display_name)));
      }
    };

    WalletSendCardDialogViewController.prototype._updateValidableIndication = function() {
      var index, remainingIndex, value;
      if (this._validationDetails.localizedIndexes.length === 0) {
        return;
      }
      index = this._validationDetails.localizedIndexes[0];
      value = this._validationDetails.localizedString.slice(0, index);
      value += '<mark>';
      value += this._validationDetails.localizedString[index];
      value += '</mark>';
      remainingIndex = this._validationDetails.localizedString.length - index - 1;
      if (remainingIndex > 0) {
        value += this._validationDetails.localizedString.slice(-remainingIndex);
      }
      return this.view.validationIndication.html(value);
    };

    WalletSendCardDialogViewController.prototype._buildValidableSettings = function(validationDetails) {
      var decal, dotIndex, indexes, numDecimalDigits, r, string, value;
      string = '';
      indexes = [];
      decal = 0;
      if (validationDetails.needsAmountValidation) {
        value = ledger.formatters.fromValue(validationDetails.amount.text);
        dotIndex = value.indexOf('.');
        if (dotIndex === -1) {
          value += '.000';
        } else {
          numDecimalDigits = value.length - 1 - dotIndex;
          value += _.str.repeat('0', 3 - numDecimalDigits);
        }
        string += value + ' BTC';
        indexes = indexes.concat(validationDetails.amount.indexes[0]);
        indexes = indexes.concat(_.map(validationDetails.amount.indexes.slice(1), (function(_this) {
          return function(num) {
            return num + 1;
          };
        })(this)));
        string += ' ' + t('wallet.send.card.to') + ' ';
      }
      decal += string.length;
      string += validationDetails.recipientsAddress.text;
      indexes = indexes.concat(_.map(validationDetails.recipientsAddress.indexes, (function(_this) {
        return function(num) {
          return num + decal;
        };
      })(this)));
      r = {
        localizedString: string,
        localizedIndexes: indexes
      };
      return r;
    };

    return WalletSendCardDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
