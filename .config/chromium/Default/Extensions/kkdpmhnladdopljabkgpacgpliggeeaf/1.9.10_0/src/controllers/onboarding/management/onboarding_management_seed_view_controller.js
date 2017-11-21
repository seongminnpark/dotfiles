(function() {
  var Bip39,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Bip39 = ledger.bitcoin.bip39;

  this.OnboardingManagementSeedViewController = (function(_super) {
    __extends(OnboardingManagementSeedViewController, _super);

    function OnboardingManagementSeedViewController() {
      return OnboardingManagementSeedViewController.__super__.constructor.apply(this, arguments);
    }

    OnboardingManagementSeedViewController.prototype.view = {
      seedContainer: '#seed_container',
      invalidLabel: '#invalid_label',
      indicationLabel: '#indication_label',
      continueButton: '#continue_button',
      actionsContainer: "#actions_container"
    };

    OnboardingManagementSeedViewController.prototype.navigation = {
      continueUrl: null
    };

    OnboardingManagementSeedViewController.prototype.navigationContinueParams = function() {
      return {
        pin: this.params.pin,
        mnemonicPhrase: this.params.mnemonicPhrase
      };
    };

    OnboardingManagementSeedViewController.prototype.navigateContinue = function() {
      if (this.params.wallet_mode === 'create') {
        this.navigation.continueUrl = '/onboarding/management/seedconfirmation';
      } else {
        this.navigation.continueUrl = '/onboarding/management/summary';
      }
      return OnboardingManagementSeedViewController.__super__.navigateContinue.apply(this, arguments);
    };

    OnboardingManagementSeedViewController.prototype.onAfterRender = function() {
      OnboardingManagementSeedViewController.__super__.onAfterRender.apply(this, arguments);
      this._generateInputs();
      this._listenEvents();
      this._updateUI(false);
      if (this.params.wallet_mode === 'create' && (this.params.mnemonicPhrase == null)) {
        if (this.params.swapped_bip39) {
          return ledger.app.dongle.setupSwappedBip39(this.params.pin).then((function(_this) {
            return function(result) {
              _this.params.mnemonicPhrase = result.mnemonic.join(' ');
              return _this._updateUI(false);
            };
          })(this)).fail((function(_this) {
            return function(error) {
              return _this.navigateContinue('/onboarding/device/switch_firmware', _.extend(_.clone(_this.params), {
                mode: 'setup'
              }));
            };
          })(this));
        } else {
          this.params.mnemonicPhrase = Bip39.generateMnemonicPhrase(Bip39.DEFAULT_PHRASE_LENGTH);
          return this._updateUI(false);
        }
      }
    };

    OnboardingManagementSeedViewController.prototype.copy = function() {
      var input, text;
      text = this.params.mnemonicPhrase;
      input = document.createElement("textarea");
      input.id = "toClipboard";
      input.value = text;
      document.body.appendChild(input);
      input.focus();
      input.select();
      document.execCommand('copy');
      return input.remove();
    };

    OnboardingManagementSeedViewController.prototype.print = function() {
      return ledger.print.Piper.instance.canUsePiper((function(_this) {
        return function(isPiper) {
          if (isPiper) {
            return ledger.print.Piper.instance.printMnemonic(_this.params.mnemonic);
          } else {
            return window.print();
          }
        };
      })(this));
    };

    OnboardingManagementSeedViewController.prototype._generateInputs = function() {
      var div, i, input, span, _i, _ref, _results;
      this.view.inputs = [];
      _results = [];
      for (i = _i = 0, _ref = Bip39.DEFAULT_PHRASE_LENGTH; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        div = document.createElement("div");
        div.className = 'seed-word';
        span = document.createElement("span");
        span.innerHTML = this.params.swapped_bip39 ? String.fromCharCode(0x41 + i) + '.' : (i + 1) + '.';
        div.appendChild(span);
        input = document.createElement("input");
        input.type = 'text';
        div.appendChild(input);
        this.view.inputs.push($(input));
        this.view.seedContainer.append(div);
        $(input).suggest(Bip39.wordlist);
        if (i === 0) {
          _results.push(input.focus());
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    OnboardingManagementSeedViewController.prototype._listenEvents = function() {
      var input, self, _i, _len, _ref, _results;
      if (this.params.wallet_mode === 'create') {
        return;
      }
      self = this;
      _ref = this.view.inputs;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        input = _ref[_i];
        input.on('keydown', function() {
          $(this).removeClass('seed-invalid');
          return setTimeout(function() {
            self.params.mnemonicPhrase = self._writtenMnemonic();
            return self._updateUI();
          }, 0);
        });
        input.on('blur', function() {
          if (self.params.wallet_mode === 'create') {
            return;
          }
          return self._validateInput($(this));
        });
        _results.push(input.on('paste', function() {
          return setTimeout((function(_this) {
            return function() {
              var beginInput, i, tmp, words, _j, _k, _len1, _ref1, _ref2;
              words = $(_this).val().split(/[^A-Za-z]/);
              words = words.filter(Boolean);
              beginInput = 0;
              _ref1 = self.view.inputs;
              for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                tmp = _ref1[_j];
                if (tmp[0] === $(_this)[0]) {
                  beginInput = self.view.inputs.indexOf(tmp);
                }
              }
              for (i = _k = 0, _ref2 = words.length - 1; 0 <= _ref2 ? _k <= _ref2 : _k >= _ref2; i = 0 <= _ref2 ? ++_k : --_k) {
                if (self.view.inputs[i + beginInput]) {
                  self.view.inputs[i + beginInput].val(words[i]);
                  self._validateInput(self.view.inputs[i + beginInput]);
                }
              }
              self.params.mnemonicPhrase = self._writtenMnemonic();
              return self._updateUI();
            };
          })(this), 0);
        }));
      }
      return _results;
    };

    OnboardingManagementSeedViewController.prototype._updateUI = function(limited) {
      var i, input, valid, words, _i, _j, _k, _len, _len1, _ref, _ref1, _ref2;
      if (limited == null) {
        limited = true;
      }
      if (limited === false) {
        if (this.params.wallet_mode === 'create') {
          this.view.invalidLabel.hide();
          this.view.indicationLabel.show();
        } else {
          this.view.invalidLabel.fadeOut(0);
          this.view.indicationLabel.hide();
        }
        _ref = this.view.inputs;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          input = _ref[_i];
          if (this.params.wallet_mode === 'create') {
            input.prop('readonly', true);
            input.prop('disabled', true);
          } else {
            input.prop('readonly', false);
            input.prop('disabled', false);
          }
        }
        if (this.params.wallet_mode === 'create') {
          this.view.actionsContainer.show();
        } else {
          this.view.actionsContainer.hide();
        }
        if (this.params.mnemonicPhrase != null) {
          words = this.params.mnemonicPhrase.split(' ');
          for (i = _j = 0, _ref1 = words.length - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
            this.view.inputs[i].val(words[i]);
          }
        }
        _ref2 = this.view.inputs;
        for (_k = 0, _len1 = _ref2.length; _k < _len1; _k++) {
          input = _ref2[_k];
          this._validateInput(input);
        }
      }
      if (this.params.wallet_mode === 'create') {
        if (this.params.mnemonicPhrase == null) {
          return this.view.continueButton.addClass('disabled');
        } else {
          return this.view.continueButton.removeClass('disabled');
        }
      } else {
        if (Bip39.utils.mnemonicPhraseWordsLength(this.params.mnemonicPhrase) === Bip39.DEFAULT_PHRASE_LENGTH) {
          if (this.params.swapped_bip39) {
            valid = Bip39.utils.isMnemonicWordsValid(Bip39.utils.mnemonicWordsFromPhrase(this.params.mnemonicPhrase));
          } else {
            valid = Bip39.isMnemonicPhraseValid(this.params.mnemonicPhrase);
          }
          if (valid) {
            this.view.continueButton.removeClass('disabled');
            return this.view.invalidLabel.fadeOut(250);
          } else {
            this.view.continueButton.addClass('disabled');
            return this.view.invalidLabel.fadeIn(250);
          }
        } else {
          this.view.invalidLabel.fadeOut(250);
          return this.view.continueButton.addClass('disabled');
        }
      }
    };

    OnboardingManagementSeedViewController.prototype._writtenMnemonic = function() {
      var input;
      return ((function() {
        var _i, _len, _ref, _results;
        _ref = this.view.inputs;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          input = _ref[_i];
          _results.push(_.string.trim(input.val()).toLowerCase());
        }
        return _results;
      }).call(this)).join(' ');
    };

    OnboardingManagementSeedViewController.prototype._writtenWord = function(input) {
      return _.str.trim(input.val()).toLowerCase();
    };

    OnboardingManagementSeedViewController.prototype._validateInput = function(input) {
      var text;
      if (this.params.wallet_mode === 'create') {
        return;
      }
      text = this._writtenWord(input);
      if (Bip39.utils.isMnemonicWordValid(text)) {
        return input.removeClass('seed-invalid');
      } else {
        return input.addClass('seed-invalid');
      }
    };

    return OnboardingManagementSeedViewController;

  })(this.OnboardingViewController);

}).call(this);
