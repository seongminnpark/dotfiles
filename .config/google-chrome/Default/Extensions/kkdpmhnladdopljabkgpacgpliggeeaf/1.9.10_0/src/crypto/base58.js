(function() {
  var _base;

  if ((_base = this.ledger).crypto == null) {
    _base.crypto = {};
  }

  this.ledger.crypto.Base58 = (function() {
    function Base58() {}

    Base58.Alphabet = {
      Uppercase: "ABCDEFGHJKLMNPQRSTUVWXYZ",
      Lowercase: "abcdefghijkmnopqrstuvwxyz",
      Digits: "0123456789",
      fullString: "ABCDEFGHJKLMNPQRSTUVWXYZ"
    };

    Base58.encode = function(buffer) {
      return bs58.encode(buffer);
    };

    Base58.decode = function(string) {
      return bs58.decode(string);
    };

    Base58.concatAlphabet = function() {
      return this.Alphabet.Uppercase + this.Alphabet.Lowercase + this.Alphabet.Digits;
    };

    return Base58;

  })();

}).call(this);
