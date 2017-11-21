(function() {
  var Bip39, _base;

  if (ledger.bitcoin == null) {
    ledger.bitcoin = {};
  }

  if ((_base = ledger.bitcoin).bip39 == null) {
    _base.bip39 = {};
  }

  Bip39 = ledger.bitcoin.bip39;

  _.extend(ledger.bitcoin.bip39, {
    ENTROPY_BIT_LENGTH: 256,
    DEFAULT_PHRASE_LENGTH: 24,
    isMnemonicPhraseValid: function(mnemonicPhrase) {
      var e;
      try {
        return this.utils.checkMnemonicPhraseValid(mnemonicPhrase) && true;
      } catch (_error) {
        e = _error;
        return false;
      }
    },
    generateEntropy: function(entropyBitLength) {
      var entropyBytesArray;
      if (entropyBitLength == null) {
        entropyBitLength = this.ENTROPY_BIT_LENGTH;
      }
      entropyBytesArray = new Uint8Array(entropyBitLength / 8);
      crypto.getRandomValues(entropyBytesArray);
      return this.utils._bytesArrayToHexString(entropyBytesArray);
    },
    entropyToMnemonicPhrase: function(entropy) {
      var binChecksum, binEntropy, binMnemonic, entropyIntegersArray, hashedEntropy, hashedEntropyIntegersArray, mnemonicIndexes, mnemonicWords;
      if (!entropy.match(/^[0-9a-fA-F]+$/)) {
        throw "Invalid entropy format. Wait a hexadecimal string";
      }
      if (entropy.length % 8 !== 0) {
        throw "Invalid entropy length: " + (entropy.length * 4);
      }
      entropyIntegersArray = entropy.match(/[0-9a-fA-F]{8}/g).map(function(h) {
        return parseInt(h, 16);
      });
      hashedEntropyIntegersArray = sjcl.hash.sha256.hash(entropyIntegersArray);
      hashedEntropy = hashedEntropyIntegersArray.map((function(_this) {
        return function(i) {
          return _this.utils._intToBin(i, 32);
        };
      })(this)).join('');
      binChecksum = hashedEntropy.slice(0, entropyIntegersArray.length);
      binEntropy = entropyIntegersArray.map((function(_this) {
        return function(i) {
          return _this.utils._intToBin(i, 32);
        };
      })(this)).join('');
      binMnemonic = binEntropy + binChecksum;
      if (binMnemonic.length % 11 !== 0) {
        throw "Invalid binMnemonic length : " + binMnemonic.length;
      }
      mnemonicIndexes = binMnemonic.match(/[01]{11}/g).map(function(b) {
        return parseInt(b, 2);
      });
      mnemonicWords = mnemonicIndexes.map((function(_this) {
        return function(idx) {
          return _this.wordlist[idx];
        };
      })(this));
      return mnemonicWords.join(' ');
    },
    generateMnemonicPhrase: function(phraseLength) {
      var entropyBitLength;
      if (phraseLength == null) {
        phraseLength = this.DEFAULT_PHRASE_LENGTH;
      }
      entropyBitLength = phraseLength * 32 / 3;
      return this.entropyToMnemonicPhrase(this.generateEntropy(entropyBitLength));
    },
    mnemonicPhraseToSeed: function(mnemonicPhrase, passphrase) {
      var hashHex, hmacSHA512, password, passwordBits, result, salt, saltBits;
      if (passphrase == null) {
        passphrase = "";
      }
      this.utils.checkMnemonicPhraseValid(mnemonicPhrase);
      hmacSHA512 = function(key) {
        var hasher;
        hasher = new sjcl.misc.hmac(key, sjcl.hash.sha512);
        this.encrypt = function() {
          return hasher.encrypt.apply(hasher, arguments);
        };
        return this;
      };
      password = mnemonicPhrase.normalize('NFKD');
      salt = "mnemonic" + passphrase.normalize('NFKD');
      passwordBits = sjcl.codec.utf8String.toBits(password);
      saltBits = sjcl.codec.utf8String.toBits(salt);
      result = sjcl.misc.pbkdf2(passwordBits, saltBits, 2048, 512, hmacSHA512);
      hashHex = sjcl.codec.hex.fromBits(result);
      return hashHex;
    },
    mnemonicPhraseToWordIndexes: function(mnemonicPhrase) {
      var word, _i, _len, _ref, _results;
      _ref = mnemonicPhrase.split(' ');
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        word = _ref[_i];
        _results.push(ledger.bitcoin.bip39.wordlist.indexOf(word));
      }
      return _results;
    },
    utils: {
      BITS_IN_INTEGER: 8 * 4,
      checkMnemonicPhraseValid: function(mnemonicPhrase) {
        var binChecksum, binEntropy, mnemonicBin, mnemonicIndexes, mnemonicWords, word, _ref;
        mnemonicWords = this.mnemonicWordsFromPhrase(mnemonicPhrase);
        if (mnemonicWords.length !== ledger.bitcoin.bip39.DEFAULT_PHRASE_LENGTH) {
          throw "Invalid mnemonic length: " + mnemonicWords.length;
        }
        mnemonicIndexes = this.mnemonicWordsToIndexes(mnemonicWords);
        if (mnemonicIndexes.length % 3 !== 0) {
          throw "Invalid mnemonic length : " + mnemonicIndexes.length;
        }
        if (mnemonicIndexes.indexOf(-1) !== -1) {
          word = mnemonicPhrase.trim().split(' ')[mnemonicIndexes.indexOf(-1)];
          throw "Invalid mnemonic word : " + word;
        }
        mnemonicBin = this.mnemonicIndexesToBin(mnemonicIndexes);
        _ref = this.splitMnemonicBin(mnemonicBin), binEntropy = _ref[0], binChecksum = _ref[1];
        if (!this.checkEntropyChecksum(binEntropy, binChecksum)) {
          throw "Checksum error.";
        }
        return true;
      },
      mnemonicWordsFromPhrase: function(mnemonicPhrase) {
        if (mnemonicPhrase == null) {
          mnemonicPhrase = "";
        }
        mnemonicPhrase = _.str.clean(mnemonicPhrase);
        return mnemonicPhrase.trim().split(/\ /);
      },
      mnemonicWordToIndex: function(mnemonicWord) {
        return Bip39.wordlist.indexOf(mnemonicWord);
      },
      mnemonicWordsToIndexes: function(mnemonicWords) {
        var mnemonicWord, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = mnemonicWords.length; _i < _len; _i++) {
          mnemonicWord = mnemonicWords[_i];
          _results.push(this.mnemonicWordToIndex(mnemonicWord));
        }
        return _results;
      },
      splitMnemonicBin: function(mnemonicBin) {
        return [mnemonicBin.slice(0, -(mnemonicBin.length / 33)), mnemonicBin.slice(-(mnemonicBin.length / 33))];
      },
      checkEntropyChecksum: function(entropyBin, checksumBin) {
        var computedChecksumBin, hashedEntropyBinaryArray, hashedIntegersEntropy, integersEntropy;
        integersEntropy = entropyBin.match(/[01]{32}/g).map(function(s) {
          return parseInt(s, 2);
        });
        hashedIntegersEntropy = sjcl.hash.sha256.hash(integersEntropy);
        hashedEntropyBinaryArray = hashedIntegersEntropy.map((function(_this) {
          return function(s) {
            return _this._intToBin(s, _this.BITS_IN_INTEGER);
          };
        })(this));
        computedChecksumBin = hashedEntropyBinaryArray.join('').slice(0, checksumBin.length);
        return computedChecksumBin === checksumBin;
      },
      mnemonicIndexToBin: function(mnemonicIndex) {
        return this._intToBin(mnemonicIndex, 11);
      },
      mnemonicIndexesToBin: function(mnemonicIndexes) {
        var index;
        return ((function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = mnemonicIndexes.length; _i < _len; _i++) {
            index = mnemonicIndexes[_i];
            _results.push(this.mnemonicIndexToBin(index));
          }
          return _results;
        }).call(this)).join('');
      },
      mnemonicPhraseWordsLength: function(mnemonicPhrase) {
        return this.mnemonicWordsFromPhrase(mnemonicPhrase).length;
      },
      isMnemonicWordValid: function(mnemonicWord) {
        return this.mnemonicWordToIndex(mnemonicWord) !== -1;
      },
      isMnemonicWordsValid: function(mnemonicWords) {
        return _.every(mnemonicWords, (function(_this) {
          return function(word) {
            return _this.isMnemonicWordValid(word);
          };
        })(this));
      },
      _intToBin: function(int, binLength) {
        var str;
        if (int < 0) {
          int += 1;
        }
        str = int.toString(2);
        if (int < 0) {
          str = str.replace("-", "0").replace(/0/g, 'a').replace(/1/g, '0').replace(/a/g, '1');
        }
        while (str.length < binLength) {
          str = (int < 0 ? '1' : '0') + str;
        }
        return str;
      },
      _bytesArrayToHexString: function(bytesArray) {
        var byte;
        return ((function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = bytesArray.length; _i < _len; _i++) {
            byte = bytesArray[_i];
            _results.push(_.str.lpad(byte.toString(16), 2, '0'));
          }
          return _results;
        })()).join('');
      }
    }
  });

}).call(this);
