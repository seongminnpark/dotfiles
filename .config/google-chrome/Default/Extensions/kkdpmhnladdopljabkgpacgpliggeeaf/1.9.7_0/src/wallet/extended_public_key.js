(function() {
  var GlobalContext, _base;

  if (this.ledger == null) {
    this.ledger = {};
  }

  if ((_base = this.ledger).wallet == null) {
    _base.wallet = {};
  }

  GlobalContext = this;

  ledger.wallet.ExtendedPublicKey = (function() {
    function ExtendedPublicKey(wallet, derivationPath, enableCache) {
      if (enableCache == null) {
        enableCache = true;
      }
      this._enableCache = enableCache;
      this._derivationPath = derivationPath;
      if (derivationPath[derivationPath.length - 1] !== '/') {
        this._derivationPath += '/';
      }
      this._wallet = wallet;
    }

    ExtendedPublicKey.prototype.initializeWithBase58 = function(xpub58) {
      this._xpub58 = xpub58;
      this._hdnode = GlobalContext.bitcoin.HDNode.fromBase58(this._xpub58, ledger.config.network.bitcoinjs);
    };

    ExtendedPublicKey.prototype.initialize_legacy = function(callback) {
      return this._initialize(callback, true);
    };

    ExtendedPublicKey.prototype.initialize = function(callback) {
      return this._initialize(callback, false);
    };

    ExtendedPublicKey.prototype._initialize = function(callback, legacyMode) {
      var bitcoin, derivationPath, finalize, path, prevPath;
      derivationPath = this._derivationPath.substring(0, this._derivationPath.length - 1);
      path = derivationPath.split('/');
      bitcoin = new BitcoinExternal();
      finalize = (function(_this) {
        return function(fingerprint) {
          return _this._wallet.getPublicAddress(derivationPath, function(nodeData, error) {
            var childnum, depth, lastChild, publicKey;
            if (error != null) {
              return typeof callback === "function" ? callback(null, error) : void 0;
            }
            publicKey = bitcoin.compressPublicKey(nodeData.publicKey);
            depth = path.length;
            lastChild = path[path.length - 1].split('\'');
            if (legacyMode) {
              childnum = (0x80000000 | parseInt(lastChild)) >>> 0;
            } else if (lastChild.length === 1) {
              childnum = parseInt(lastChild[0]);
            } else {
              childnum = (0x80000000 | parseInt(lastChild[0])) >>> 0;
            }
            _this._xpub = _this._createXPUB(depth, fingerprint, childnum, nodeData.chainCode, publicKey, ledger.config.network.name);
            _this._xpub58 = _this._encodeBase58Check(_this._xpub);
            _this._hdnode = GlobalContext.bitcoin.HDNode.fromBase58(_this._xpub58, ledger.config.network.bitcoinjs);
            return typeof callback === "function" ? callback(_this) : void 0;
          });
        };
      })(this);
      if (path.length > 1) {
        prevPath = path.slice(0, -1).join('/');
        return this._wallet.getPublicAddress(prevPath, (function(_this) {
          return function(nodeData, error) {
            var fingerprint, publicKey, result, ripemd160, sha256;
            if (error != null) {
              return typeof callback === "function" ? callback(null, error) : void 0;
            }
            publicKey = bitcoin.compressPublicKey(nodeData.publicKey);
            ripemd160 = new JSUCrypt.hash.RIPEMD160();
            sha256 = new JSUCrypt.hash.SHA256();
            result = sha256.finalize(publicKey.toString(HEX));
            result = new ByteString(JSUCrypt.utils.byteArrayToHexStr(result), HEX);
            result = ripemd160.finalize(result.toString(HEX));
            fingerprint = ((result[0] << 24) | (result[1] << 16) | (result[2] << 8) | result[3]) >>> 0;
            return finalize(fingerprint);
          };
        })(this));
      } else {
        return finalize(0);
      }
    };

    ExtendedPublicKey.prototype._createXPUB = function(depth, fingerprint, childnum, chainCode, publicKey, network) {
      var magic, xpub;
      magic = Convert.toHexInt(ledger.config.network.version.XPUB);
      xpub = new ByteString(magic, HEX);
      xpub = xpub.concat(new ByteString(_.str.lpad(depth.toString(16), 2, '0'), HEX));
      xpub = xpub.concat(new ByteString(_.str.lpad(fingerprint.toString(16), 8, '0'), HEX));
      xpub = xpub.concat(new ByteString(_.str.lpad(childnum.toString(16), 8, '0'), HEX));
      xpub = xpub.concat(new ByteString(chainCode.toString(HEX), HEX));
      xpub = xpub.concat(new ByteString(publicKey.toString(HEX), HEX));
      return xpub;
    };

    ExtendedPublicKey.prototype._encodeBase58Check = function(vchIn) {
      var hash, sha256;
      sha256 = new JSUCrypt.hash.SHA256();
      hash = sha256.finalize(vchIn.toString(HEX));
      hash = sha256.finalize(JSUCrypt.utils.byteArrayToHexStr(hash));
      hash = new ByteString(JSUCrypt.utils.byteArrayToHexStr(hash), HEX).bytes(0, 4);
      hash = vchIn.concat(hash);
      return this._b58Encode(hash);
    };

    ExtendedPublicKey.prototype.__b58chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

    ExtendedPublicKey.prototype._b58Encode = function(v) {
      var div, i, long_value, mod, result, value256, _i, _ref;
      long_value = ledger.Amount.fromSatoshi(0);
      value256 = ledger.Amount.fromSatoshi(256);
      for (i = _i = _ref = v.length - 1; _ref <= 0 ? _i <= 0 : _i >= 0; i = _ref <= 0 ? ++_i : --_i) {
        long_value = long_value.add(value256.pow(v.length - i - 1).multiply(v.byteAt(i)));
      }
      result = '';
      while (long_value.gte(this.__b58chars.length)) {
        div = long_value.divide(this.__b58chars.length);
        mod = long_value.mod(this.__b58chars.length);
        result = this.__b58chars[mod.toNumber()] + result;
        long_value = div;
      }
      result = this.__b58chars[long_value.toNumber()] + result;
      return result;
    };

    ExtendedPublicKey.prototype._pubKeyToSegwitAddress = function(pubKey) {
      var byte, checkSum, hash160, networkVersion, pk, pkHash160, script;
      pk = (function() {
        var _i, _len, _ref, _results;
        _ref = pubKey.match(/../g);
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          byte = _ref[_i];
          _results.push(parseInt(byte, 16));
        }
        return _results;
      })();
      pkHash160 = Bitcoin.Util.sha256ripe160(pk);
      script = [0x00, 0x14].concat(pkHash160);
      networkVersion = [ledger.config.network.version.P2SH];
      hash160 = networkVersion.concat(Bitcoin.Util.sha256ripe160(script));
      checkSum = Bitcoin.Crypto.SHA256(Bitcoin.Crypto.SHA256(hash160, {
        asBytes: true
      }), {
        asBytes: true
      }).slice(0, 4);
      return Bitcoin.base58.encode(hash160.concat(checkSum));
    };

    ExtendedPublicKey.prototype.getPublicAddress = function(path) {
      var address, hardened, hdnode, index, node, partialPath, _i, _len, _ref;
      if (this._hdnode == null) {
        throw 'Extended public key must initialized before it can perform any derivation';
      }
      if (isNaN(parseInt(path[0]))) {
        throw 'Path should begin by the index of derivation';
      }
      partialPath = path;
      address = this._getPublicAddressFromCache(partialPath);
      if (address != null) {
        return address;
      }
      path = path.split('/');
      hdnode = this._hdnode;
      for (_i = 0, _len = path.length; _i < _len; _i++) {
        node = path[_i];
        _ref = node.split("'"), index = _ref[0], hardened = _ref[1];
        if (hardened != null) {
          hdnode = hdnode.deriveHardened(parseInt(index));
        } else {
          hdnode = hdnode.derive(parseInt(index));
        }
      }
      if (ledger.config.network.handleSegwit) {
        address = this._pubKeyToSegwitAddress(hdnode.pubKey.toHex());
      } else {
        address = hdnode.getAddress().toString();
      }
      this._insertPublicAddressInCache(partialPath, address);
      return address;
    };

    ExtendedPublicKey.prototype._insertPublicAddressInCache = function(partialPath, publicAddress) {
      var completePath, _ref, _ref1, _ref2, _ref3;
      if (!this._enableCache) {
        return;
      }
      completePath = this._derivationPath + partialPath;
      return (_ref = ledger.wallet) != null ? (_ref1 = _ref.Wallet) != null ? (_ref2 = _ref1.instance) != null ? (_ref3 = _ref2.cache) != null ? _ref3.set([[completePath, publicAddress]]) : void 0 : void 0 : void 0 : void 0;
    };

    ExtendedPublicKey.prototype._getPublicAddressFromCache = function(partialPath) {
      var completePath, _ref, _ref1, _ref2, _ref3;
      if (!this._enableCache) {
        return;
      }
      completePath = this._derivationPath + partialPath;
      return (_ref = ledger.wallet) != null ? (_ref1 = _ref.Wallet) != null ? (_ref2 = _ref1.instance) != null ? (_ref3 = _ref2.cache) != null ? _ref3.get(completePath) : void 0 : void 0 : void 0 : void 0;
    };

    ExtendedPublicKey.prototype.toString = function() {
      return this._xpub58;
    };

    return ExtendedPublicKey;

  })();

}).call(this);
