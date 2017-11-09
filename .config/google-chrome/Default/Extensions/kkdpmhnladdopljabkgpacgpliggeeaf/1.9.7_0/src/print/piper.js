(function() {
  if (ledger.print == null) {
    ledger.print = {};
  }

  ledger.print.Piper = (function() {
    function Piper() {}

    Piper.prototype._chromeStore = new ledger.storage.ChromeStore('piper');

    Piper.instance = new Piper();

    Piper.prototype.setIP = function(IP) {
      return this._chromeStore.set({
        __piper_IP: IP
      });
    };

    Piper.prototype.setPubKey = function(pubKey) {
      return this._chromeStore.set({
        __piper_pubKey: pubKey
      });
    };

    Piper.prototype.getIP = function(cb) {
      return this._chromeStore.get('__piper_IP', (function(_this) {
        return function(r) {
          return typeof cb === "function" ? cb(r.__piper_IP) : void 0;
        };
      })(this));
    };

    Piper.prototype.getPubKey = function(cb) {
      return this._chromeStore.get('__piper_pubKey', (function(_this) {
        return function(r) {
          return typeof cb === "function" ? cb(r.__piper_pubKey) : void 0;
        };
      })(this));
    };

    Piper.prototype.printMnemonic = function(mnemonic) {
      return this.getIP((function(_this) {
        return function(IP) {
          return _this.getPubKey(function(pubKey) {
            var address;
            address = _this._getFirstBitcoinAddress(mnemonic);
            return _this._sendRequest(IP, pubKey, address, mnemonic);
          });
        };
      })(this));
    };

    Piper.prototype.canUsePiper = function(cb) {
      return this.getIP((function(_this) {
        return function(IP) {
          return _this.getPubKey(function(pubKey) {
            return typeof cb === "function" ? cb((IP != null) && (pubKey != null)) : void 0;
          });
        };
      })(this));
    };

    Piper.prototype._getFirstBitcoinAddress = function(mnemonic) {
      var hardened, index, item, node, path, seed, _i, _len, _ref;
      seed = ledger.bitcoin.bip39.generateSeed(mnemonic);
      node = bitcoin.HDNode.fromSeedHex(seed, bitcoin.networks.bitcoin);
      path = "44'/0'/0'/0";
      path = path.split('/');
      for (_i = 0, _len = path.length; _i < _len; _i++) {
        item = path[_i];
        _ref = item.split("'"), index = _ref[0], hardened = _ref[1];
        node = hardened != null ? node.deriveHardened(parseInt(index)) : node = node.derive(index).derive(index);
      }
      return node.getAddress().toString();
    };

    Piper.prototype._encryptData = function(text, pubKey) {
      var encrypt, encrypted;
      encrypt = new JSEncrypt();
      encrypt.setPublicKey(pubKey);
      encrypted = encrypt.encrypt(text);
      return encrypted;
    };

    Piper.prototype._splitData = function(data, part) {
      var end, i, space, start, string, words, _i;
      part = part - 1;
      words = data.split(" ");
      start = part * 12;
      end = start + 11;
      string = "";
      space = "";
      for (i = _i = start; start <= end ? _i <= end : _i >= end; i = start <= end ? ++_i : --_i) {
        string = string + space + words[i];
        space = " ";
      }
      return string;
    };

    Piper.prototype._sendRequest = function(IP, pubKey, address, mnemonic) {
      var data, part1, part2, part3;
      part1 = this._encryptData(this._splitData(mnemonic, 1), pubKey);
      part2 = this._encryptData(this._splitData(mnemonic, 2), pubKey);
      part3 = this._encryptData(address, pubKey);
      data = {
        'part1': part1,
        'part2': part2,
        'part3': part3
      };
      return $.post('http://' + IP + '/piper.php', data);
    };

    return Piper;

  })();

}).call(this);
