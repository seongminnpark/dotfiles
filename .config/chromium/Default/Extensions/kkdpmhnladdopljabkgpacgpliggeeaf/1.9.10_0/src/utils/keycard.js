(function() {
  if (ledger.keycard == null) {
    ledger.keycard = {};
  }

  this.ledger.keycard = (function() {
    function keycard() {}

    keycard.generateKeycardFromSeed = function(seed) {
      var a, alphabet, alphabet1, alphabet2, alphabet3, alphabetContent, b, cipher, data, i, key, keycard, n, result, _i, _j, _len, _ref;
      if (seed.length !== 32 && seed.length !== 80) {
        throw "Invalid card seed";
      }
      seed = seed.substr(0, 32);
      key = new JSUCrypt.key.DESKey(seed);
      cipher = new JSUCrypt.cipher.DES(JSUCrypt.padder.None, JSUCrypt.cipher.MODE_CBC);
      cipher.init(key, JSUCrypt.cipher.MODE_ENCRYPT);
      data = ((function() {
        var _i, _results;
        _results = [];
        for (i = _i = 0; _i <= 80; i = ++_i) {
          _results.push(Convert.toHexByte(i));
        }
        return _results;
      })()).join('');
      keycard = (function() {
        var _i, _len, _ref, _ref1, _results;
        _ref = cipher.update(data);
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          i = _ref[_i];
          _ref1 = (function() {
            var _j, _len1, _ref1, _results1;
            _ref1 = Convert.toHexByte(i).split('');
            _results1 = [];
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              n = _ref1[_j];
              _results1.push(parseInt(n, 16));
            }
            return _results1;
          })(), a = _ref1[0], b = _ref1[1];
          _results.push(a ^ b);
        }
        return _results;
      })();
      alphabet1 = new ByteString(ledger.crypto.Base58.Alphabet.Uppercase, ASCII);
      alphabet2 = new ByteString(ledger.crypto.Base58.Alphabet.Lowercase, ASCII);
      alphabet3 = new ByteString(ledger.crypto.Base58.Alphabet.Digits, ASCII);
      alphabetContent = [alphabet1, alphabet2, alphabet3];
      result = {};
      for (_i = 0, _len = alphabetContent.length; _i < _len; _i++) {
        alphabet = alphabetContent[_i];
        for (i = _j = 0, _ref = alphabet.length - 1; 0 <= _ref ? _j <= _ref : _j >= _ref; i = 0 <= _ref ? ++_j : --_j) {
          result[alphabet.bytes(i, 1).toString(ASCII)] = Convert.toHexByte(keycard[alphabet.byteAt(i) - 0x30])[1];
        }
      }
      return result;
    };

    return keycard;

  })();

}).call(this);
