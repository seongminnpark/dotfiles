(function() {
  var key, value, _base, _ref;

  if (ledger.bitcoin == null) {
    ledger.bitcoin = {};
  }

  if ((_base = ledger.bitcoin).bitid == null) {
    _base.bitid = {};
  }

  _.extend(ledger.bitcoin.bitid, {
    ROOT_PATH: "0'/0xb11e'",
    CALLBACK_PROXY_URL: "http://www.ledgerwallet.com/api/bitid",
    isValidUri: function(uri) {
      return uri.indexOf("bitid") === 0;
    },
    _cache: {},
    uriToDerivationUrl: function(uri) {
      var url;
      url = uri.match(/^bitid:\/\/([^?]+)(?:\?.*)?$/);
      if (url == null) {
        ledger.errors["throw"]("Invalid BitId URI");
      }
      return url[1];
    },
    reset: function() {
      return this._cache = {};
    },

    /*
    @param [String] uri
    @param [String] address
    @param [String] signature
    @param [Function] success
    @param [Function] error
    @return [Q.Promise]
     */
    callback: function(uri, address, signature) {
      return Q($.ajax({
        type: 'POST',
        url: this.CALLBACK_PROXY_URL,
        dataType: 'json',
        data: {
          uri: uri,
          address: address,
          signature: signature
        }
      }));
    },

    /*
    @overload getAddress(subpath=undefined, callback=undefined)
      @param [Object] optPath @see getPath
      @param [Function] callback Optional argument
      @return [Q.Promise]
    
    @overload getAddress(callback)
      @param [Function] callback
      @return [Q.Promise]
     */
    getAddress: function(opts, callback) {
      var path, _ref;
      if (opts == null) {
        opts = {};
      }
      if (callback == null) {
        callback = void 0;
      }
      if (!callback && typeof opts === 'function') {
        _ref = [{}, opts], opts = _ref[0], callback = _ref[1];
      }
      path = this.getPath(opts);
      if (this._cache[path] != null) {
        return ledger.defer(callback).resolve(this._cache[path]).promise;
      }
      return ledger.app.dongle.getPublicAddress(path, callback).then((function(_this) {
        return function(address) {
          _this._cache[path] = address;
          return address;
        };
      })(this));
    },

    /*
    @overload signMessage(message, callback=undefined)
      @param [String] message
      @param [Function] callback Optional argument
      @return [Q.Promise]
    
    @overload signMessage(message, opts={}, callback=undefined)
      @param [String] message
      @param [Object] optPath @see getPath
      @param [Function] callback Optional argument
      @return [Q.Promise]
     */
    signMessage: function(message, opts, callback) {
      var path, pubKey, _ref, _ref1;
      if (opts == null) {
        opts = {};
      }
      if (callback == null) {
        callback = void 0;
      }
      if (!callback && typeof opts === 'function') {
        _ref = [{}, opts], opts = _ref[0], callback = _ref[1];
      }
      path = this.getPath(opts);
      pubKey = (_ref1 = this._cache[path]) != null ? _ref1.publicKey : void 0;
      return ledger.app.dongle.signMessage(message, {
        path: path,
        pubKey: pubKey,
        prefix: ledger.config.network.bitcoinjs.magicPrefix
      }, callback);
    },

    /*
    @overload getPath(opts)
      @param [Object] opts
      @option opts [String, Integer] subpath ex: 0x5fd1
      @return [String]
    
    @overload getPath(opts)
      @param [Object] opts
      @option opts [String] uri ex: bitid:1btidfR1qF9arjASvKqMooGmnT3mzTZGP
      @return [String]
    
    @overload getPath(opts)
      @param [Object] opts
      @option opts [String] url ex: 1btidfR1qF9arjASvKqMooGmnT3mzTZGP
      @return [String]
    
    @overload getPath(opts)
      @param [Object] opts
      @option opts [String] path ex: 0'/0/0xb11e/0x5fd1
      @return [String]
     */
    getPath: function(_arg) {
      var path, subpath, uri, url;
      subpath = _arg.subpath, uri = _arg.uri, url = _arg.url, path = _arg.path;
      if (path != null) {
        return path;
      } else if (subpath != null) {
        return this.ROOT_PATH + ("/" + subpath);
      } else if (uri != null) {
        return this.getPath({
          url: this.uriToDerivationUrl(uri)
        });
      } else if (url != null) {
        return this.getPath({
          subpath: "0x" + sha256_digest(url).substring(0, 8) + "/0"
        });
      } else {
        return this.ROOT_PATH;
      }
    },
    randomAddress: function(callback) {
      var i;
      if (callback == null) {
        callback = void 0;
      }
      i = sjcl.random.randomWords(1) & 0xffff;
      return this.getAddress(i, callback);
    }
  });

  _ref = ledger.bitcoin.bitid;
  for (key in _ref) {
    value = _ref[key];
    if (_(value).isFunction()) {
      ledger.bitcoin.bitid[key] = ledger.bitcoin.bitid[key].bind(ledger.bitcoin.bitid);
    }
  }

}).call(this);
