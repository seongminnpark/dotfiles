(function() {
  var _base,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_base = this.ledger).pin_codes == null) {
    _base.pin_codes = {};
  }

  ledger.pin_codes.TinyPinCode = (function() {
    function TinyPinCode() {}

    TinyPinCode.prototype._el = void 0;

    TinyPinCode.prototype.inputsCount = 0;

    TinyPinCode.prototype.valuesCount = 0;

    TinyPinCode.prototype.insertIn = function(parent) {
      return parent.appendChild(this.el());
    };

    TinyPinCode.prototype.remove = function() {
      $(this._el).remove();
      return this._el = void 0;
    };

    TinyPinCode.prototype.el = function() {
      if (this._el == null) {
        this._buildEl();
      }
      return this._el;
    };

    TinyPinCode.prototype.setInputsCount = function(count) {
      if (count === this.inputsCount) {
        return;
      }
      this.inputsCount = count;
      return this._updateInputs();
    };

    TinyPinCode.prototype.setValuesCount = function(count) {
      if (count === this.valuesCount) {
        return;
      }
      this.valuesCount = count;
      return this._updateInputs();
    };

    TinyPinCode.prototype._buildEl = function() {
      this._el = document.createElement('div');
      return this._el.className = 'tiny-pincode';
    };

    TinyPinCode.prototype._updateInputs = function() {
      var i, input, _i, _ref, _results;
      $(this.el()).empty();
      if (this.inputsCount === 0) {
        return;
      }
      _results = [];
      for (i = _i = 0, _ref = this.inputsCount - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        input = document.createElement('div');
        input.className = i === this.valuesCount ? 'input selected' : 'input';
        if (i < this.valuesCount) {
          input.innerText = '•';
        }
        _results.push(this.el().appendChild(input));
      }
      return _results;
    };

    return TinyPinCode;

  })();

  ledger.pin_codes.KeyCard = (function(_super) {
    __extends(KeyCard, _super);

    function KeyCard() {
      return KeyCard.__super__.constructor.apply(this, arguments);
    }

    KeyCard.prototype._el = void 0;

    KeyCard.prototype._input = void 0;

    KeyCard.prototype._valuesNodes = void 0;

    KeyCard.prototype._validableValues = void 0;

    KeyCard.prototype._currentValidableValueNode = void 0;

    KeyCard.values = ['ABCDEFGHJKLMNPQRSTUVWXYZ', 'abcdefghijkmnopqrstuvwxyz', '0123456789'];

    KeyCard.prototype.insertIn = function(parent) {
      if (this._el == null) {
        this._buildEl();
      }
      return parent.appendChild(this._el);
    };

    KeyCard.prototype.remove = function() {
      $(this._el).remove();
      this._el = void 0;
      this._input = void 0;
      this._valuesNodes = void 0;
      this._validableValues = void 0;
      return this._currentValidableValueNode = void 0;
    };

    KeyCard.prototype.value = function() {
      if (this._el == null) {
        return void 0;
      }
      return this._input.value;
    };

    KeyCard.prototype.setValidableValues = function(values) {
      this._validableValues = values != null ? values.slice() : [];
      this._currentValidableValueNode = void 0;
      return this._updateCurrentValidableValue();
    };

    KeyCard.prototype.focus = function() {
      if (this._el == null) {
        this._buildEl();
      }
      return this._input.focus();
    };

    KeyCard.prototype.stealFocus = function() {
      if (this._el == null) {
        this._buildEl();
      }
      this.focus();
      return $(this._input).on('blur', (function(_this) {
        return function() {
          return _this.focus();
        };
      })(this));
    };

    KeyCard.prototype._buildEl = function() {
      var i, j, section, value, values, _i, _j, _ref;
      this._el = document.createElement('div');
      this._el.className = 'keycard';
      this._valuesNodes = [];
      for (i = _i = 0; _i <= 2; i = ++_i) {
        section = document.createElement('div');
        section.className = 'section-title';
        section.innerText = this._sectionTitle(i);
        values = document.createElement('div');
        values.className = 'section-values';
        for (j = _j = 0, _ref = this._sectionValue(i).length - 1; 0 <= _ref ? _j <= _ref : _j >= _ref; j = 0 <= _ref ? ++_j : --_j) {
          value = document.createElement('div');
          value.className = 'value';
          value.innerText = ledger.pin_codes.KeyCard.values[i][j];
          values.appendChild(value);
        }
        this._el.appendChild(section);
        this._el.appendChild(values);
        this._valuesNodes.push(values);
      }
      this._input = document.createElement('input');
      this._input.type = 'password';
      this._el.appendChild(this._input);
      this._updateCurrentValidableValue();
      return this._listenEvents();
    };

    KeyCard.prototype._listenEvents = function(listen) {
      if (listen == null) {
        listen = true;
      }
      if (listen) {
        $(this._input).on('input', (function(_this) {
          return function(e) {
            var reg;
            reg = /^[0-9a-zA-Z]+$/;
            if (reg.test(_this._input.value)) {
              return _this._processNextValidableValue();
            } else {
              return _this._input.value = _this._input.value.replace(/[^0-9a-zA-Z]/g, '');
            }
          };
        })(this));
        return $(this._input).on('keydown', (function(_this) {
          return function(e) {
            if (!((e.which >= 48 && e.which <= 90) || (e.which >= 96 && e.which <= 105))) {
              e.preventDefault();
              return false;
            }
          };
        })(this));
      } else {
        $(this._input).off('input');
        return $(this._input).off('keydown');
      }
    };

    KeyCard.prototype._updateCurrentValidableValue = function() {
      var index, offset, valueNode, _ref;
      if (this._currentValidableValueNode != null) {
        $(this._currentValidableValueNode).removeClass('selected');
        this._currentValidableValueNode = void 0;
      }
      if ((this._el == null) || (this._validableValues == null) || this._validableValues.length === 0) {
        return;
      }
      _ref = this._indexesOfSectionValue(this._validableValues[0]), index = _ref[0], offset = _ref[1];
      if ((index == null) || (offset == null)) {
        return;
      }
      valueNode = this._sectionValueNodeAtIndexes(index, offset);
      if (valueNode == null) {
        return;
      }
      this._currentValidableValueNode = valueNode;
      $(valueNode).addClass('selected');
      return this.emit('character:waiting', this._validableValues[0]);
    };

    KeyCard.prototype._processNextValidableValue = function() {
      if ((this._validableValues == null) || this._validableValues.length === 0) {
        return;
      }
      this._validableValues.splice(0, 1);
      this.emit('character:input', this._input.value[this._input.value.length - 1]);
      this._updateCurrentValidableValue();
      if (this._validableValues.length === 0) {
        this.emit('completed', this._input.value);
        return this._listenEvents(false);
      }
    };

    KeyCard.prototype._sectionTitle = function(index) {
      return t(['common.keycard.uppercase_letters', 'common.keycard.lowercase_letters', 'common.keycard.digits'][index]);
    };

    KeyCard.prototype._sectionValue = function(index, offset) {
      if (offset == null) {
        return ledger.pin_codes.KeyCard.values[index];
      }
      return ledger.pin_codes.KeyCard.values[index][offset];
    };

    KeyCard.prototype._sectionValueNodeAtIndexes = function(index, offset) {
      return $(this._valuesNodes[index]).children()[offset];
    };

    KeyCard.prototype._indexesOfSectionValue = function(char) {
      var i, j, str, _i, _j, _ref, _ref1;
      for (i = _i = 0, _ref = ledger.pin_codes.KeyCard.values.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        str = ledger.pin_codes.KeyCard.values[i];
        for (j = _j = 0, _ref1 = str.length - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; j = 0 <= _ref1 ? ++_j : --_j) {
          if (this._sectionValue(i, j) === char) {
            return [i, j];
          }
        }
      }
      return [void 0, void 0];
    };

    return KeyCard;

  })(EventEmitter);

  ledger.pin_codes.PinCode = (function(_super) {
    __extends(PinCode, _super);

    function PinCode() {
      return PinCode.__super__.constructor.apply(this, arguments);
    }

    PinCode.prototype._el = null;

    PinCode.prototype._isProtected = true;

    PinCode.prototype._stealsFocus = false;

    PinCode.prototype.insertIn = function(parent) {
      if (this._el != null) {
        return;
      }
      this._buildEl();
      return parent.appendChild(this._el);
    };

    PinCode.prototype.insertAfter = function(node) {
      if (this._el != null) {
        return;
      }
      this._buildEl();
      return $(this._el).insertAfter(node);
    };

    PinCode.prototype.removeFromDom = function() {
      if (this._el == null) {
        return;
      }
      this._el.parentNode().removeChild(this._el);
      return this._el = null;
    };

    PinCode.prototype.focus = function() {
      if (!this.isEnabled()) {
        return;
      }
      $(this._input()).focus();
      return this._updateDigits();
    };

    PinCode.prototype.clear = function() {
      $(this._input()).val('');
      return this._updateDigits();
    };

    PinCode.prototype.setValue = function(value) {
      $(this._input()).val(value);
      return this._updateDigits();
    };

    PinCode.prototype.value = function() {
      return this._input().value;
    };

    PinCode.prototype.setEnabled = function(enabled) {
      this._input().disabled = !enabled;
      return this._updateDigits();
    };

    PinCode.prototype.setReadonly = function(readonly) {
      this._input().readOnly = readonly;
      return this._updateDigits();
    };

    PinCode.prototype.setProtected = function(protect) {
      this._isProtected = protect;
      return this._updateDigits();
    };

    PinCode.prototype.setStealsFocus = function(steals) {
      this._stealsFocus = steals;
      if (steals) {
        return this.focus();
      }
    };

    PinCode.prototype.isEnabled = function() {
      return !this._input().disabled;
    };

    PinCode.prototype.isReadonly = function() {
      return this._input().readOnly;
    };

    PinCode.prototype.isProtected = function() {
      return this._isProtected;
    };

    PinCode.prototype.isComplete = function() {
      return this._input().value.length === this._digits().length;
    };

    PinCode.prototype.stealsFocus = function() {
      return this._stealsFocus;
    };

    PinCode.prototype._input = function() {
      if (this._el == null) {
        return void 0;
      }
      return $(this._el).find('input')[0];
    };

    PinCode.prototype._digits = function() {
      if (this._el == null) {
        return void 0;
      }
      return $(this._el).find('div');
    };

    PinCode.prototype._buildEl = function() {
      var digit, index, input, _i;
      this._el = document.createElement('div');
      this._el.className = 'pincode';
      for (index = _i = 1; _i <= 4; index = ++_i) {
        digit = document.createElement('div');
        this._el.appendChild(digit);
      }
      input = document.createElement('input');
      input.maxLength = 4;
      input.type = 'password';
      this._el.appendChild(input);
      return this._listenEvents();
    };

    PinCode.prototype._listenEvents = function() {
      var digit, self, _i, _len, _ref;
      self = this;
      _ref = this._digits();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        digit = _ref[_i];
        $(digit).on('click', function() {
          if (!self.isEnabled() || self.isReadonly()) {
            return;
          }
          return self.focus();
        });
        $(digit).on('mousedown', function(e) {
          if (!self.isEnabled() || self.isReadonly()) {
            return;
          }
          return e.preventDefault();
        });
      }
      $(this._el).on('click', function() {
        if (!self.isEnabled()) {
          return self.emit('click');
        }
      });
      return $(this._input()).on('change keyup keydown focus blur', function(e) {
        if (!self.isEnabled() || self.isReadonly()) {
          return;
        }
        this.value = this.value.replace(/[^0-9]/g, '');
        self._updateDigits();
        if (e.type === 'keyup') {
          if ((this.value.length >= 0 && this.value.length <= 4 && /[0-9]/g.test(this.value)) || (this.value === '')) {
            self.emit('change', this.value);
          }
        }
        if (e.type === 'keyup' && self.isComplete()) {
          if (/[0-9]/g.test(this.value)) {
            self.emit('complete', this.value);
          }
        }
        if (e.type === 'blur') {
          if (self.stealsFocus()) {
            return self.focus();
          }
        }
      });
    };

    PinCode.prototype._updateDigits = function() {
      var digit, index, _i, _ref, _results;
      _results = [];
      for (index = _i = 0, _ref = this._digits().length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; index = 0 <= _ref ? ++_i : --_i) {
        digit = this._digits()[index];
        this._setDigitFilled(digit, index < this._input().value.length && this.isProtected());
        this._setDigitDisabled(digit, !this.isEnabled());
        if ((this._input().value[index] != null) && !this.isProtected()) {
          digit.innerText = this._input().value[index];
        } else {
          digit.innerText = '';
        }
        if (this.isReadonly()) {
          this._setDigitFocused(digit, false);
          _results.push(this._setDigitSelected(digit, false));
        } else {
          if ($(this._input()).is(':focus')) {
            this._setDigitFocused(digit, true);
            if (this._input().value.length >= this._digits().length) {
              _results.push(this._setDigitSelected(digit, false));
            } else {
              _results.push(this._setDigitSelected(digit, index === this._input().value.length));
            }
          } else {
            this._setDigitFocused(digit, false);
            _results.push(this._setDigitSelected(digit, false));
          }
        }
      }
      return _results;
    };

    PinCode.prototype._setDigitFocused = function(digit, focused) {
      return this._setDigitClassEnabled(digit, 'focused', focused);
    };

    PinCode.prototype._setDigitSelected = function(digit, selected) {
      return this._setDigitClassEnabled(digit, 'selected', selected);
    };

    PinCode.prototype._setDigitFilled = function(digit, filled) {
      return this._setDigitClassEnabled(digit, 'filled', filled);
    };

    PinCode.prototype._setDigitDisabled = function(digit, disabled) {
      return this._setDigitClassEnabled(digit, 'disabled', disabled);
    };

    PinCode.prototype._setDigitClassEnabled = function(digit, className, enabled) {
      if (enabled === true) {
        return $(digit).addClass(className);
      } else {
        return $(digit).removeClass(className);
      }
    };

    return PinCode;

  })(EventEmitter);

}).call(this);
