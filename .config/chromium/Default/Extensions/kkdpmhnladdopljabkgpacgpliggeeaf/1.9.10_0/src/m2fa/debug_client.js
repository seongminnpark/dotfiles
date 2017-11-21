(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.ledger.m2fa.DebugClient = (function(_super) {
    __extends(DebugClient, _super);

    function DebugClient(pairingId, baseUrl) {
      this.constructor.BASE_URL = baseUrl || "ws://192.168.2.107:8080/2fa/channels";
      DebugClient.__super__.constructor.call(this, pairingId || "holymacaroni2");
      this.pubKey = "04" + "78c0837ded209265ea8131283585f71c5bddf7ffafe04ccddb8fe10b3edc7833" + "d6dee70c3b9040e1a1a01c5cc04fcbf9b4de612e688d09245ef5f9135413cc1d";
      this.privKey = "80" + "dbd39adafe3a007706e61a17e0c56849146cfe95849afef7ede15a43a1984491" + "7e960af3";
      this.attestationKey = "04" + "e69fd3c044865200e66f124b5ea237c918503931bee070edfcab79a00a25d6b5" + "a09afbee902b4b763ecf1f9c25f82d6b0cf72bce3faf98523a1066948f1a395f";
      this.bitAddress = "1M2FAtNbADDd3Gib6Ggvt6R7A9GiidrXMS";
      this.cardSeed = "7d0f4cc77408c9e7fb0610aa1c16f117";
      this._generateSessionKey();
      this._computeKeyCard();
      this.on('m2fa.room.joined', (function(_this) {
        return function() {
          return console.log("%c[M2FA][" + _this.pairingId + "] Room joined", "color: #888888");
        };
      })(this));
      this.on('m2fa.room.left', (function(_this) {
        return function() {
          return console.log("%c[M2FA][" + _this.pairingId + "] Room left", "color: #888888");
        };
      })(this));
      this.on('m2fa.connect', (function(_this) {
        return function() {
          return console.log("%c[M2FA][" + _this.pairingId + "] Connection", "color: #888888");
        };
      })(this));
      this.on('m2fa.disconnect', (function(_this) {
        return function() {
          return console.log("%c[M2FA][" + _this.pairingId + "] Diconnection", "color: #888888");
        };
      })(this));
      this.on('m2fa.message', (function(_this) {
        return function(e, data) {
          return console.log("%c[M2FA][" + _this.pairingId + "] " + data.type + " message :", "color: #888888", data, e);
        };
      })(this));
      this.on('m2fa.challenge.sended', (function(_this) {
        return function(e, challenge) {
          console.log("%c[M2FA][" + _this.pairingId + "] challenge :", "color: #888888", challenge, e);
          return _this.lastChallenge = challenge;
        };
      })(this));
      this.on('m2fa.pairing.confirmed', (function(_this) {
        return function(e, success) {
          return console.log("%c[M2FA][" + _this.pairingId + "] pairing.confirmed", "color: #888888", success, e);
        };
      })(this));
      this.on('m2fa.pairing.rejected', (function(_this) {
        return function() {
          return console.log("%c[M2FA][" + _this.pairingId + "] pairing.confirmed", "color: #888888");
        };
      })(this));
      this.on('m2fa.request.sended', (function(_this) {
        return function(e, requestBlob) {
          console.log("%c[M2FA][" + _this.pairingId + "] request :", "color: #888888", requestBlob, e);
          return _this.lastRequest = requestBlob;
        };
      })(this));
    }

    DebugClient.prototype.identify = function() {
      return this._onIdentify({
        public_key: this.pubKey
      });
    };

    DebugClient.prototype.challenge = function(data) {
      return this._onChallenge({
        data: data || this._computeChallenge()
      });
    };

    DebugClient.prototype.accept = function() {
      return this._onAccept();
    };

    DebugClient.prototype.repeat = function() {
      return this._onRepeat();
    };

    DebugClient.prototype.respond = function(pin) {
      return this._onResponse({
        pin: pin || this._computeResponse().pin
      });
    };

    DebugClient.prototype._computeChallenge = function(challenge) {
      var blob, bytes, cardChallenge, cardResp, nonce, pairingKey, resp, _ref, _ref1;
      if (challenge == null) {
        challenge = this.lastChallenge;
      }
      l("%c[_computeChallenge] challenge=", "color: #888888", challenge);
      _ref = [challenge.slice(0, 16), challenge.slice(16)], nonce = _ref[0], blob = _ref[1];
      l("%c[_computeChallenge] nonce=", "color: #888888", nonce, ", blob=", blob);
      bytes = this._decryptChallenge(blob);
      l("%c[_computeChallenge] bytes=", "color: #888888", JSUCrypt.utils.byteArrayToHexStr(bytes));
      _ref1 = [bytes.slice(0, 4), bytes.slice(4, 20)], cardChallenge = _ref1[0], pairingKey = _ref1[1];
      this.pairingKey = JSUCrypt.utils.byteArrayToHexStr(pairingKey);
      l("%c[_computeChallenge] cardChallenge=", "color: #888888", JSUCrypt.utils.byteArrayToHexStr(cardChallenge), ", pairingKey=", this.pairingKey);
      cardResp = JSUCrypt.utils.byteArrayToHexStr(this._prompt(cardChallenge));
      l("%c[_computeChallenge] cardResp=", "color: #888888", cardResp);
      resp = JSUCrypt.utils.byteArrayToHexStr(this._cryptChallenge(nonce + cardResp + "00000000"));
      return [resp, this.pairingKey];
    };

    DebugClient.prototype._decryptChallenge = function(blob) {
      var cipher, key;
      cipher = new JSUCrypt.cipher.DES(JSUCrypt.padder.None, JSUCrypt.cipher.MODE_CBC);
      key = new JSUCrypt.key.DESKey(this.sessionKey);
      cipher.init(key, JSUCrypt.cipher.MODE_DECRYPT);
      return cipher.update(blob);
    };

    DebugClient.prototype._cryptChallenge = function(blob) {
      var cipher, key;
      cipher = new JSUCrypt.cipher.DES(JSUCrypt.padder.None, JSUCrypt.cipher.MODE_CBC);
      key = new JSUCrypt.key.DESKey(this.sessionKey);
      cipher.init(key, JSUCrypt.cipher.MODE_ENCRYPT);
      return cipher.update(blob);
    };

    DebugClient.prototype._prompt = function(chars) {
      var c, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = chars.length; _i < _len; _i++) {
        c = chars[_i];
        _results.push(this._keyCard[c]);
      }
      return _results;
    };

    DebugClient.prototype._computeKeyCard = function() {
      var a, b, cipher, data, i, key, n;
      if (this.cardSeed.length !== 32) {
        throw "Invalid card seed";
      }
      key = new JSUCrypt.key.DESKey(this.cardSeed);
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
      return this._keyCard = (function() {
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
    };

    DebugClient.prototype._generateSessionKey = function() {
      var aKey, ecdh, ecdhdomain, ecdhprivkey, i, secret;
      ecdhdomain = JSUCrypt.ECFp.getEcDomainByName("secp256k1");
      ecdhprivkey = new JSUCrypt.key.EcFpPrivateKey(256, ecdhdomain, this.privKey.match(/^(\w{2})(\w{64})(01)?(\w{8})$/)[2]);
      ecdh = new JSUCrypt.keyagreement.ECDH_SVDP(ecdhprivkey);
      aKey = this.attestationKey.match(/^(\w{2})(\w{64})(\w{64})$/);
      secret = ecdh.generate(new JSUCrypt.ECFp.AffinePoint(aKey[2], aKey[3], ecdhdomain.curve));
      this.sessionKey = ((function() {
        var _i, _results;
        _results = [];
        for (i = _i = 0; _i < 16; i = ++_i) {
          _results.push(Convert.toHexByte(secret[i] ^ secret[16 + i]));
        }
        return _results;
      })()).join('');
      l("%c[M2FA][" + this.pairingId + "] sessionKey=", "color: #888888", this.sessionKey);
      return this.sessionKey;
    };

    DebugClient.prototype._computeResponse = function(request) {
      var c, cipher, data, h, i, key;
      if (request == null) {
        request = this.lastRequest;
      }
      cipher = new JSUCrypt.cipher.DES(JSUCrypt.padder.None, JSUCrypt.cipher.MODE_CBC);
      key = new JSUCrypt.key.DESKey(this.pairingKey);
      cipher.init(key, JSUCrypt.cipher.MODE_DECRYPT);
      data = cipher.update(request);
      h = {
        pin: ((function() {
          var _i, _len, _ref, _results;
          _ref = data.slice(0, 4);
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            c = _ref[_i];
            _results.push(String.fromCharCode(c));
          }
          return _results;
        })()).join(''),
        outputAmount: parseInt(((function() {
          var _i, _len, _ref, _results;
          _ref = data.slice(4, 12);
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            i = _ref[_i];
            _results.push(Convert.toHexByte(i));
          }
          return _results;
        })()).join('')),
        fees: parseInt(((function() {
          var _i, _len, _ref, _results;
          _ref = data.slice(12, 20);
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            i = _ref[_i];
            _results.push(Convert.toHexByte(i));
          }
          return _results;
        })()).join('')),
        change: parseInt(((function() {
          var _i, _len, _ref, _results;
          _ref = data.slice(20, 28);
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            i = _ref[_i];
            _results.push(Convert.toHexByte(i));
          }
          return _results;
        })()).join('')),
        destination: ((function() {
          var _i, _len, _ref, _results;
          _ref = data.slice(29, 29 + data[28]);
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            c = _ref[_i];
            _results.push(String.fromCharCode(c));
          }
          return _results;
        })()).join('')
      };
      l("%c[_computeResponse]", "color: #888888", h);
      return h;
    };

    return DebugClient;

  })(ledger.m2fa.Client);

}).call(this);
