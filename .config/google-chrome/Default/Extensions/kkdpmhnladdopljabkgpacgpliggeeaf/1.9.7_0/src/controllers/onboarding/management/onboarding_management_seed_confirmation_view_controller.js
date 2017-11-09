(function() {
  var Bip39,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Bip39 = ledger.bitcoin.bip39;

  this.OnboardingManagementSeedconfirmationViewController = (function(_super) {
    __extends(OnboardingManagementSeedconfirmationViewController, _super);

    function OnboardingManagementSeedconfirmationViewController() {
      return OnboardingManagementSeedconfirmationViewController.__super__.constructor.apply(this, arguments);
    }

    OnboardingManagementSeedconfirmationViewController.prototype.view = {
      seedContainer: '#seed_container',
      invalidLabel: '#invalid_label',
      continueButton: '#continue_button'
    };

    OnboardingManagementSeedconfirmationViewController.prototype.navigation = {
      continueUrl: '/onboarding/management/summary'
    };

    OnboardingManagementSeedconfirmationViewController.prototype.initialize = function() {
      var generator, num, numbersToGenerate, randomIndexes;
      OnboardingManagementSeedconfirmationViewController.__super__.initialize.apply(this, arguments);
      numbersToGenerate = 2;
      randomIndexes = [];
      generator = function() {
        return Math.floor(Math.random() * Bip39.DEFAULT_PHRASE_LENGTH);
      };
      while (true) {
        if (randomIndexes.length === numbersToGenerate) {
          break;
        }
        if (randomIndexes.length === 0) {
          randomIndexes.push(generator());
        } else {
          num = generator();
          if (!_.contains(randomIndexes, num)) {
            randomIndexes.push(num);
          }
        }
      }
      return this.params.randomIndexes = _.sortBy(randomIndexes, function(num) {
        return num;
      });
    };

    OnboardingManagementSeedconfirmationViewController.prototype.onAfterRender = function() {
      OnboardingManagementSeedconfirmationViewController.__super__.onAfterRender.apply(this, arguments);
      this._generateInputs();
      this._listenEvents();
      return this._updateUI(false);
    };

    OnboardingManagementSeedconfirmationViewController.prototype.navigateContinue = function() {
      if (this._areWordsValid()) {
        this.view.invalidLabel.fadeOut(0);
        return OnboardingManagementSeedconfirmationViewController.__super__.navigateContinue.apply(this, arguments);
      } else {
        return this.view.invalidLabel.fadeIn(250);
      }
    };

    OnboardingManagementSeedconfirmationViewController.prototype.navigationContinueParams = function() {
      return {
        pin: this.params.pin,
        mnemonicPhrase: this.params.mnemonicPhrase
      };
    };

    OnboardingManagementSeedconfirmationViewController.prototype._generateInputs = function() {
      var div, i, input, span, word, _i, _ref, _ref1, _results;
      this.view.inputs = [];
      _results = [];
      for (i = _i = 0, _ref = Bip39.DEFAULT_PHRASE_LENGTH; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        word = document.createElement("div");
        word.className = 'seed-word';
        span = document.createElement("span");
        span.innerHTML = this.params.swapped_bip39 ? String.fromCharCode(0x41 + i) + '.' : (i + 1) + '.';
        word.appendChild(span);
        div = document.createElement("div");
        word.appendChild(div);
        if (_.contains(this.params.randomIndexes, i)) {
          input = document.createElement("input");
          input.type = 'text';
          div.appendChild(input);
          this.view.inputs.push($(input));
        } else {
          $(word).addClass('disabled');
        }
        this.view.seedContainer.append(word);
        _results.push((_ref1 = this.view.inputs[0]) != null ? _ref1.focus() : void 0);
      }
      return _results;
    };

    OnboardingManagementSeedconfirmationViewController.prototype._listenEvents = function() {
      var input, _i, _len, _ref, _results;
      _ref = this.view.inputs;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        input = _ref[_i];
        _results.push(input.on('keydown paste', (function(_this) {
          return function() {
            return _.defer(function() {
              return _this._updateUI();
            });
          };
        })(this)));
      }
      return _results;
    };

    OnboardingManagementSeedconfirmationViewController.prototype._updateUI = function(animated) {
      if (animated == null) {
        animated = true;
      }
      if (!animated) {
        this.view.invalidLabel.hide();
      }
      if (this._areWordsWritten()) {
        return this.view.continueButton.removeClass('disabled');
      } else {
        return this.view.continueButton.addClass('disabled');
      }
    };

    OnboardingManagementSeedconfirmationViewController.prototype._writtenWord = function(input) {
      return _.str.trim(input.val()).toLowerCase();
    };

    OnboardingManagementSeedconfirmationViewController.prototype._areWordsWritten = function() {
      return _.reduce(this.view.inputs, ((function(_this) {
        return function(bool, input) {
          return bool && _this._writtenWord(input).length > 0;
        };
      })(this)), true);
    };

    OnboardingManagementSeedconfirmationViewController.prototype._areWordsValid = function() {
      var i, input, mnemonic, num, word, _i, _ref;
      mnemonic = this.params.mnemonicPhrase.split(' ');
      for (i = _i = 0, _ref = this.params.randomIndexes.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        num = this.params.randomIndexes[i];
        input = this.view.inputs[i];
        word = mnemonic[num];
        if (word !== this._writtenWord(input)) {
          return false;
        }
      }
      return true;
    };

    return OnboardingManagementSeedconfirmationViewController;

  })(this.OnboardingViewController);

}).call(this);
