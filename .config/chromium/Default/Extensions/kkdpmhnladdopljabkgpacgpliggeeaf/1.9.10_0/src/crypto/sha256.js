(function() {
  var _base;

  if ((_base = this.ledger).crypto == null) {
    _base.crypto = {};
  }

  this.ledger.crypto.SHA256 = (function() {
    function SHA256() {}

    SHA256.hashString = function(string) {
      return sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(string));
    };

    return SHA256;

  })();

}).call(this);
