(function() {
  var _base;

  if ((_base = this.ledger).crypto == null) {
    _base.crypto = {};
  }

  this.ledger.crypto.AES = (function() {
    function AES(key, iv, salt) {
      this.key = key;
      if (iv == null) {
        iv = '554f0cafd67ddcaa';
      }
      if (salt == null) {
        salt = '846cea3ae6a33474d6ae2221d8563eaaba73ef9ea20e1803';
      }
      this._params = {
        v: 1,
        iter: 1000,
        ks: 256,
        ts: 128,
        mode: 'ccm',
        adata: '',
        cipher: 'aes',
        iv: sjcl.codec.base64.toBits(iv),
        salt: sjcl.codec.base64.toBits(salt)
      };
    }

    AES.prototype.encrypt = function(data) {
      var encryption;
      encryption = sjcl.json._encrypt(this.key, data, this._params);
      return sjcl.codec.base64.fromBits(encryption.ct, 0);
    };

    AES.prototype.decrypt = function(encryptedData) {
      var params;
      params = _.clone(this._params);
      params.ct = sjcl.codec.base64.toBits(encryptedData);
      return sjcl.json._decrypt(this.key, params);
    };

    return AES;

  })();

}).call(this);
