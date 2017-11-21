(function() {
  var Errors, States,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  States = {
    UNDEFINED: void 0,
    LOCKED: 'locked',
    UNLOCKED: 'unlocked',
    BLANK: 'blank',
    DISCONNECTED: 'disconnected',
    ERROR: 'error'
  };

  Errors = this.ledger.errors;

  ledger.dongle.MockDongle = (function(_super) {
    __extends(MockDongle, _super);

    MockDongle.prototype._xpubs = [];

    MockDongle.prototype._remainingPinAttempt = 2;

    MockDongle.prototype._m2fa = {
      pubKey: "04" + "78c0837ded209265ea8131283585f71c5bddf7ffafe04ccddb8fe10b3edc7833" + "d6dee70c3b9040e1a1a01c5cc04fcbf9b4de612e688d09245ef5f9135413cc1d",
      privKey: "80" + "dbd39adafe3a007706e61a17e0c56849146cfe95849afef7ede15a43a1984491" + "7e960af3",
      sessionKey: '',
      pairingKeyHex: '',
      nonceHex: '',
      challengeIndexes: '',
      challengeResponses: '',
      keycard: ''
    };

    function MockDongle(pin, seed, pairingKeyHex, isInBootloaderMode) {
      if (pairingKeyHex == null) {
        pairingKeyHex = void 0;
      }
      if (isInBootloaderMode == null) {
        isInBootloaderMode = false;
      }
      MockDongle.__super__.constructor.apply(this, arguments);
      this._m2fa = _.clone(this._m2fa);
      this._m2fa.pairingKeyHex = pairingKeyHex;
      this._isInBootloaderMode = isInBootloaderMode;
      this.state = States.UNDEFINED;
      this._setState(States.BLANK);
      if ((pin != null) && (seed != null)) {
        this._setup(pin, seed, true);
      }
    }

    MockDongle.prototype.isInBootloaderMode = function() {
      return this._isInBootloaderMode;
    };

    MockDongle.prototype.disconnect = function() {
      this.emit('disconnected', this);
      return this._setState(States.DISCONNECTED);
    };

    MockDongle.prototype.connect = function() {
      this.emit('connected', this);
      return this._setState(States.LOCKED);
    };

    MockDongle.prototype.getState = function(callback) {
      if (callback == null) {
        callback = void 0;
      }
      return ledger.defer(callback).resolve(this.state).promise;
    };

    MockDongle.prototype.getIntFirmwareVersion = function() {
      return parseInt(0x0001040d.toString(HEX), 16);
    };


    /*
      Gets the raw version {ByteString} of the dongle.
    
      @param [Boolean] isInBootLoaderMode Must be true if the current dongle is in bootloader mode.
      @param [Boolean] forceBl Force the call in BootLoader mode
      @param [Function] callback Called once the version is retrieved. The callback must be prototyped like size `(version, error) ->`
      @return [Q.Promise]
     */

    MockDongle.prototype.getRawFirmwareVersion = function(isInBootLoaderMode, forceBl, checkHiddenReloader, callback) {
      var d;
      if (forceBl == null) {
        forceBl = false;
      }
      if (checkHiddenReloader == null) {
        checkHiddenReloader = false;
      }
      if (callback == null) {
        callback = void 0;
      }
      d = ledger.defer(callback);
      try {
        d.resolve(['00000020', '00010001']);
      } catch (_error) {
        d.rejectWithError(ledger.errors.UnknowError, error);
        console.error("Fail to getRawFirmwareVersion :", error);
      }
      return d.promise;
    };

    MockDongle.prototype.unlockWithPinCode = function(pin, callback) {
      var d, error;
      if (callback == null) {
        callback = void 0;
      }
      if (this.state !== States.LOCKED) {
        Errors["throw"](Errors.DongleAlreadyUnlock);
      }
      d = ledger.defer(callback);
      if (pin === this._pin) {
        this._setState(States.UNLOCKED);
        this._remainingPinAttempt = 3;
        d.resolve();
      } else {
        console.error("Fail to unlockWithPinCode 1 :", '63c' + this._remainingPinAttempt);
        error = this._handleErrorCode('63c' + this._remainingPinAttempt);
        this._remainingPinAttempt -= 1;
        d.reject(error);
      }
      return d.promise;
    };

    MockDongle.prototype.lock = function() {
      if (this.state !== ledger.dongle.States.BLANK && (this.state != null)) {
        return this._setState(States.LOCKED);
      }
    };

    MockDongle.prototype.getRemainingPinAttempt = function(callback) {
      var d;
      if (callback == null) {
        callback = void 0;
      }
      d = ledger.defer(callback);
      if (this._remainingPinAttempt < 0) {
        d.resolve(this._remainingPinAttempt);
      } else {
        d.reject(this._handleErrorCode('6985'));
      }
      return d.promise;
    };

    MockDongle.prototype.setup = function(pin, restoreSeed, callback) {
      if (callback == null) {
        callback = void 0;
      }
      return this._setup(pin, restoreSeed, false, callback);
    };

    MockDongle.prototype.getPublicAddress = function(path, callback) {
      var d, res;
      if (callback == null) {
        callback = void 0;
      }
      d = ledger.defer(callback);
      if (this.state !== States.UNLOCKED && this.state !== States.UNDEFINED) {
        Errors["throw"](Errors.DongleLocked, 'Cannot get a public while the key is not unlocked');
      }
      res = this.getPublicAddressSync(path);
      _.defer(function() {
        return d.resolve(res);
      });
      return d.promise;
    };

    MockDongle.prototype.getPublicAddressSync = function(path) {
      var n, node;
      node = this._getNodeFromPath(path);
      return {
        bitcoinAddress: new ByteString(node.getAddress().toString(), ASCII),
        chainCode: new ByteString(((function() {
          var _i, _len, _ref, _results;
          _ref = node.chainCode;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            n = _ref[_i];
            _results.push(Convert.toHexByte(n));
          }
          return _results;
        })()).join(''), HEX),
        publicKey: new ByteString((function() {
          node.pubKey.compressed = false;
          return node.pubKey.toHex();
        })(), HEX)
      };
    };

    MockDongle.prototype.signMessage = function(message, _arg, callback) {
      var d, node, path, pubKey;
      path = _arg.path, pubKey = _arg.pubKey;
      if (callback == null) {
        callback = void 0;
      }
      d = ledger.defer(callback);
      node = this._getNodeFromPath(path);
      d.resolve(bitcoin.Message.sign(node.privKey, message).toString('base64'));
      return d.promise;
    };

    MockDongle.prototype.getBitIdAddress = function(subpath, callback) {
      var path, _ref;
      if (subpath == null) {
        subpath = void 0;
      }
      if (callback == null) {
        callback = void 0;
      }
      if (this.state !== States.UNLOCKED) {
        Errors["throw"](Errors.DongleLocked);
      }
      if (!callback && typeof subpath === 'function') {
        _ref = [callback, subpath], subpath = _ref[0], callback = _ref[1];
      }
      path = ledger.dongle.BitIdRootPath;
      if (subpath != null) {
        path += "/" + subpath;
      }
      return this.getPublicAddress(path, callback);
    };

    MockDongle.prototype.getExtendedPublicKey = function(path, callback) {
      var d, xpub;
      if (callback == null) {
        callback = void 0;
      }
      if (this.state !== States.UNLOCKED) {
        Errors["throw"](Errors.DongleLocked);
      }
      d = ledger.defer(callback);
      if (this._xpubs[path] != null) {
        return d.resolve(this._xpubs[path]).promise;
      }
      xpub = new ledger.wallet.ExtendedPublicKey(this, path);
      xpub.initialize((function(_this) {
        return function() {
          _this._xpubs[path] = xpub;
          return d.resolve(xpub);
        };
      })(this));
      return d.promise;
    };

    MockDongle.prototype.isCertified = function(callback) {
      var d;
      if (callback == null) {
        callback = void 0;
      }
      d = ledger.defer(callback);
      d.resolve(this);
      return d.promise;
    };

    MockDongle.prototype.isBetaCertified = function(callback) {
      var d;
      if (callback == null) {
        callback = void 0;
      }
      d = ledger.defer(callback);
      d.resolve(this);
      return d.promise;
    };

    MockDongle.prototype.isFirmwareUpdateAvailable = function(callback) {
      if (callback == null) {
        callback = void 0;
      }
      return ledger.defer(callback).resolve(false).promise;
    };


    /*
    @param [Array<Object>] inputs
    @param [Array] associatedKeysets
    @param changePath
    @param [String] recipientAddress
    @param [Amount] amount
    @param [Amount] fee
    @param [Integer] lockTime
    @param [Integer] sighashType
    @param [String] authorization hex encoded
    @param [Object] resumeData
    @return [Q.Promise] Resolve with resumeData
     */

    MockDongle.prototype.createPaymentTransaction = function(inputs, associatedKeysets, changePath, recipientAddress, amount, fees, lockTime, sighashType, authorization, resumeData, network) {
      var balance, change, charsQuestion, charsResponse, cipher, d, i, index, indexes, input, key, keycard, m2faData, m2faDataHex, m2faResponse, output, outputIndex, padding, path, pin, randomNum, rawTx, rawTxBuffer, rawTxs, result, scriptPubKey, scriptPubKeyEnd, scriptPubKeyStart, sizeAddress, splittedTx, tx, txb, v, val, values, _i, _j, _k, _l, _len, _len1, _len2, _ref;
      d = ledger.defer();
      result = {};
      if (_.isEmpty(resumeData)) {
        txb = new bitcoin.TransactionBuilder();
        rawTxs = (function() {
          var _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _results;
          _results = [];
          for (_i = 0, _len = inputs.length; _i < _len; _i++) {
            input = inputs[_i];
            splittedTx = input[0], outputIndex = input[1];
            rawTxBuffer = splittedTx.version;
            rawTxBuffer = rawTxBuffer.concat(new ByteString(Convert.toHexByte(splittedTx.inputs.length), HEX));
            _ref = splittedTx.inputs;
            for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
              input = _ref[_j];
              rawTxBuffer = rawTxBuffer.concat(input.prevout).concat(new ByteString(Convert.toHexByte(input.script.length), HEX)).concat(input.script).concat(input.sequence);
            }
            rawTxBuffer = rawTxBuffer.concat(new ByteString(Convert.toHexByte(splittedTx.outputs.length), HEX));
            _ref1 = splittedTx.outputs;
            for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
              output = _ref1[_k];
              rawTxBuffer = rawTxBuffer.concat(output.amount).concat(new ByteString(Convert.toHexByte(output.script.length), HEX)).concat(output.script);
            }
            rawTxBuffer = rawTxBuffer.concat(splittedTx.locktime);
            _results.push([rawTxBuffer, outputIndex]);
          }
          return _results;
        })();
        values = [];
        balance = Bitcoin.BigInteger.valueOf(0);
        for (_i = 0, _len = rawTxs.length; _i < _len; _i++) {
          _ref = rawTxs[_i], rawTx = _ref[0], outputIndex = _ref[1];
          tx = bitcoin.Transaction.fromHex(rawTx.toString());
          txb.addInput(tx, outputIndex);
          values.push(tx.outs[outputIndex].value);
        }
        for (i = _j = 0, _len1 = values.length; _j < _len1; i = ++_j) {
          val = values[i];
          balance = balance.add(Bitcoin.BigInteger.valueOf(val));
        }
        change = (balance.toString() - fees.toSatoshiNumber()) - amount.toSatoshiNumber();
        scriptPubKeyStart = Convert.toHexByte(bitcoin.opcodes.OP_DUP) + Convert.toHexByte(bitcoin.opcodes.OP_HASH160) + 14;
        scriptPubKeyEnd = Convert.toHexByte(bitcoin.opcodes.OP_EQUALVERIFY) + Convert.toHexByte(bitcoin.opcodes.OP_CHECKSIG);
        scriptPubKey = bitcoin.Script.fromHex(scriptPubKeyStart + this._getPubKeyHashFromBase58(recipientAddress).toString() + scriptPubKeyEnd);
        txb.addOutput(scriptPubKey, amount.toSatoshiNumber());
        scriptPubKey = bitcoin.Script.fromHex(scriptPubKeyStart + this._getPubKeyHashFromBase58(this._getNodeFromPath(changePath).getAddress().toString()).toString() + scriptPubKeyEnd);
        if (change !== 0) {
          txb.addOutput(scriptPubKey, change);
        }
        for (index = _k = 0, _len2 = associatedKeysets.length; _k < _len2; index = ++_k) {
          path = associatedKeysets[index];
          txb.sign(index, this._getNodeFromPath(associatedKeysets[index]).privKey);
        }
        keycard = ledger.keycard.generateKeycardFromSeed('dfaeee53c3d280707bbe27720d522ac1');
        charsQuestion = [];
        indexes = [];
        charsResponse = [];
        for (i = _l = 0; _l <= 3; i = ++_l) {
          randomNum = _.random(recipientAddress.length - 1);
          charsQuestion.push(recipientAddress.charAt(randomNum));
          charsResponse.push(keycard[charsQuestion[i]]);
          indexes.push(Convert.toHexByte(randomNum));
        }
        result.authorizationReference = indexes.join('');
        result.publicKeys = [];
        result.publicKeys.push(recipientAddress);
        result.txb = txb;
        result.charsResponse = "0" + charsResponse.join('0');
        if (this._m2fa.pairingKeyHex != null) {
          amount = '0000000000000000' + amount._value.toRadix(16);
          amount = amount.substr(amount.length - 16, 16);
          fees = '0000000000000000' + fees._value.toRadix(16);
          fees = fees.substr(fees.length - 16, 16);
          change = '0000000000000000' + new BigInteger(change.toString()).toRadix(16);
          change = change.substr(change.length - 16, 16);
          sizeAddress = Convert.toHexByte(recipientAddress.length);
          pin = new ByteString(charsResponse.join(''), ASCII).toString(HEX);
          m2faData = pin + amount + fees + change + sizeAddress + (new ByteString(recipientAddress, ASCII).toString(HEX));
          padding = m2faData.length % 8;
          m2faData = _.str.rpad(m2faData, m2faData.length + (8 - padding), '0');
          cipher = new JSUCrypt.cipher.DES(JSUCrypt.padder.None, JSUCrypt.cipher.MODE_CBC);
          key = new JSUCrypt.key.DESKey(this._m2fa.pairingKeyHex);
          cipher.init(key, JSUCrypt.cipher.MODE_ENCRYPT);
          m2faData = cipher.update(m2faData);
          m2faDataHex = ((function() {
            var _len3, _m, _results;
            _results = [];
            for (_m = 0, _len3 = m2faData.length; _m < _len3; _m++) {
              v = m2faData[_m];
              _results.push(Convert.toHexByte(v));
            }
            return _results;
          })()).join('');
          result.authorizationRequired = 3;
          result.authorizationPaired = m2faDataHex;
          result.indexesKeyCard = '04' + indexes.join('') + m2faDataHex;
        } else {
          result.authorizationRequired = 2;
          result.authorizationPaired = void 0;
          result.indexesKeyCard = indexes.join('');
        }
        l('result', result);
        l('m2fa', this._m2fa);
        result;
      } else {
        l('resumeData', resumeData);
        m2faResponse = new ByteString(((function() {
          var _len3, _m, _ref1, _results;
          _ref1 = resumeData.charsResponse.match(/.{2}/g);
          _results = [];
          for (_m = 0, _len3 = _ref1.length; _m < _len3; _m++) {
            v = _ref1[_m];
            _results.push(v.charAt(1));
          }
          return _results;
        })()).join(''), ASCII).toString(HEX);
        if (resumeData.charsResponse !== authorization && m2faResponse !== authorization) {
          _.delay((function() {
            return d.rejectWithError(Errors.WrongPinCode);
          }), 1000);
        }
        try {
          result = resumeData.txb.build().toHex();
        } catch (_error) {
          _.delay((function() {
            return d.rejectWithError(Errors.SignatureError);
          }), 1000);
        }
      }
      _.delay((function() {
        return d.resolve(result);
      }), 1000);
      return d.promise;
    };

    MockDongle.prototype.splitTransaction = function(input) {
      var bitExt;
      bitExt = new BitcoinExternal();
      return bitExt.splitTransaction(new ByteString(input.raw, HEX));
    };

    MockDongle.prototype.initiateSecureScreen = function(pubKey, callback) {
      var aKey, blob, cipher, cryptedBlob, cryptedBlobHex, d, ecdh, ecdhdomain, ecdhprivkey, i, key, nonce, num, res, secret, v, _i;
      if (callback == null) {
        callback = void 0;
      }
      d = ledger.defer(callback);
      if (this.state !== States.UNLOCKED) {
        d.rejectWithError(Errors.DongleLocked);
      } else if (pubKey.match(/^[0-9A-Fa-f]{130}$/) == null) {
        d.rejectWithError(Errors.InvalidArgument, "Invalid pubKey : " + pubKey);
      } else {

        /*
          The remote screen public key is sent to the dongle, which generates
          a cleartext random 8 bytes nonce,
          a 4 bytes challenge on the printed keycard
          and a random 16 bytes 3DES-2 pairing key, concatenated and encrypted using 3DES CBC and the generated session key
         */
        ecdhdomain = JSUCrypt.ECFp.getEcDomainByName("secp256k1");
        ecdhprivkey = new JSUCrypt.key.EcFpPrivateKey(256, ecdhdomain, this._m2fa.privKey.match(/^(\w{2})(\w{64})(01)?(\w{8})$/)[2]);
        ecdh = new JSUCrypt.keyagreement.ECDH_SVDP(ecdhprivkey);
        aKey = pubKey.match(/^(\w{2})(\w{64})(\w{64})$/);
        secret = ecdh.generate(new JSUCrypt.ECFp.AffinePoint(aKey[2], aKey[3], ecdhdomain.curve));
        this._m2fa.sessionKey = ((function() {
          var _i, _results;
          _results = [];
          for (i = _i = 0; _i < 16; i = ++_i) {
            _results.push(Convert.toHexByte(secret[i] ^ secret[16 + i]));
          }
          return _results;
        })()).join('');
        this._m2fa.keycard = ledger.keycard.generateKeycardFromSeed('dfaeee53c3d280707bbe27720d522ac1');
        this._m2fa.challengeIndexes = '';
        this._m2fa.challengeResponses = '';
        for (i = _i = 0; _i <= 3; i = ++_i) {
          num = _.random(ledger.crypto.Base58.concatAlphabet().length - 1);
          this._m2fa.challengeIndexes += Convert.toHexByte(ledger.crypto.Base58.concatAlphabet().charCodeAt(num) - 0x30);
          this._m2fa.challengeResponses += '0' + this._m2fa.keycard[ledger.crypto.Base58.concatAlphabet().charAt(num)];
        }
        blob = this._m2fa.challengeIndexes + this._m2fa.pairingKeyHex + "00000000";
        cipher = new JSUCrypt.cipher.DES(JSUCrypt.padder.None, JSUCrypt.cipher.MODE_CBC);
        key = new JSUCrypt.key.DESKey(this._m2fa.sessionKey);
        cipher.init(key, JSUCrypt.cipher.MODE_ENCRYPT);
        cryptedBlob = cipher.update(blob);
        cryptedBlobHex = ((function() {
          var _j, _len, _results;
          _results = [];
          for (_j = 0, _len = cryptedBlob.length; _j < _len; _j++) {
            v = cryptedBlob[_j];
            _results.push(Convert.toHexByte(v));
          }
          return _results;
        })()).join('');
        nonce = crypto.getRandomValues(new Uint8Array(8));
        this._m2fa.nonceHex = ((function() {
          var _j, _len, _results;
          _results = [];
          for (_j = 0, _len = nonce.length; _j < _len; _j++) {
            v = nonce[_j];
            _results.push(Convert.toHexByte(v));
          }
          return _results;
        })()).join('');
        res = this._m2fa.nonceHex + cryptedBlobHex;
        d.resolve(res);
      }
      return d.promise;
    };

    MockDongle.prototype.confirmSecureScreen = function(challengeResp, callback) {
      var challenge, challengeRespDecipher, cipher, d, key, nonce, padding, v, _ref;
      if (callback == null) {
        callback = void 0;
      }
      d = ledger.defer(callback);
      if (this.state !== States.UNLOCKED) {
        d.rejectWithError(Errors.DongleLocked);
      } else if (challengeResp.match(/^[0-9A-Fa-f]{32}$/) == null) {
        d.rejectWithError(Errors.InvalidArgument, "Invalid challenge resp : " + challengeResp);
      } else {
        cipher = new JSUCrypt.cipher.DES(JSUCrypt.padder.None, JSUCrypt.cipher.MODE_CBC);
        key = new JSUCrypt.key.DESKey(this._m2fa.sessionKey);
        cipher.init(key, JSUCrypt.cipher.MODE_DECRYPT);
        challengeRespDecipher = cipher.update(challengeResp);
        challengeRespDecipher = ((function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = challengeRespDecipher.length; _i < _len; _i++) {
            v = challengeRespDecipher[_i];
            _results.push(Convert.toHexByte(v));
          }
          return _results;
        })()).join('');
        _ref = [challengeRespDecipher.slice(0, 16), challengeRespDecipher.slice(16, 24), challengeRespDecipher.slice(24)], nonce = _ref[0], challenge = _ref[1], padding = _ref[2];
        if (nonce === this._m2fa.nonceHex && challenge === this._m2fa.challengeResponses) {
          this._clearPairingInfo();
          d.resolve();
        } else {
          this._clearPairingInfo(true);
          d.reject('Pairing fail -  Invalid status 1 - 6a80');
        }
      }
      return d.promise;
    };

    MockDongle.prototype.getStringFirmwareVersion = function() {
      return '1.0.1';
    };

    MockDongle.prototype._generatePairingKeyHex = function() {
      var pairingKey, v;
      pairingKey = crypto.getRandomValues(new Uint8Array(16));
      return this._m2fa.pairingKeyHex = ((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = pairingKey.length; _i < _len; _i++) {
          v = pairingKey[_i];
          _results.push(Convert.toHexByte(v));
        }
        return _results;
      })()).join('');
    };

    MockDongle.prototype._clearPairingInfo = function(isErr) {
      if (isErr) {
        return this._m2fa = _.omit(this._m2fa, ['challengeIndexes', 'sessionKey', 'nonceHex', 'challengeIndexes', 'challengeResponses', 'keycard', 'pairingKeyHex']);
      } else {
        return this._m2fa = _.omit(this._m2fa, ['challengeIndexes', 'sessionKey', 'nonceHex', 'challengeIndexes', 'challengeResponses', 'keycard']);
      }
    };

    MockDongle.prototype._getPubKeyHashFromBase58 = function(addr) {
      var arr, buffer, pubKeyHash, x;
      arr = ledger.crypto.Base58.decode(addr);
      buffer = JSUCrypt.utils.byteArrayToHexStr(arr);
      x = new ByteString(buffer, HEX);
      pubKeyHash = x.bytes(0, x.length - 4).bytes(1);
      return pubKeyHash;
    };

    MockDongle.prototype._setState = function() {
      var args, newState, oldState, _ref;
      newState = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      _ref = [newState, this.state], this.state = _ref[0], oldState = _ref[1];
      this.emit.apply(this, ["state:" + this.state, this.state].concat(__slice.call(args)));
      return this.emit('state:changed', this.state);
    };

    MockDongle.prototype._setup = function(pin, restoreSeed, isPowerCycle, callback) {
      var bytesSeed, d, _ref;
      if (callback == null) {
        callback = void 0;
      }
      d = ledger.defer(callback);
      if (this.state !== States.BLANK) {
        Errors["throw"](Errors.DongleNotBlank);
      }
      if (!callback && typeof restoreSeed === 'function') {
        _ref = [callback, restoreSeed], restoreSeed = _ref[0], callback = _ref[1];
      }
      if (restoreSeed == null) {
        Throw(new Error('Setup need a seed'));
      }
      this._pin = pin;
      this._masterNode = bitcoin.HDNode.fromSeedHex(restoreSeed, ledger.config.network.bitcoinjs);
      if (restoreSeed != null) {
        bytesSeed = new ByteString(restoreSeed, HEX);
        if (bytesSeed.length !== 64) {
          e('Invalid seed :', restoreSeed);
        }
      }
      if (isPowerCycle) {
        this._setState(States.LOCKED);
      } else {
        _.defer((function(_this) {
          return function() {
            return _this._setState(States.DISCONNECTED);
          };
        })(this));
      }
      d.resolve();
      return d.promise;
    };

    MockDongle.prototype._getNodeFromPath = function(path) {
      var hardened, index, item, node, _i, _len, _ref;
      path = path.split('/');
      node = this._masterNode;
      for (_i = 0, _len = path.length; _i < _len; _i++) {
        item = path[_i];
        _ref = item.split("'"), index = _ref[0], hardened = _ref[1];
        node = hardened != null ? node.deriveHardened(parseInt(index)) : node = node.derive(index);
      }
      return node;
    };

    MockDongle.prototype._handleErrorCode = function(errorCode) {
      var error;
      if (errorCode.match("6982")) {
        this._setState(States.LOCKED);
        error = Errors["new"](Errors.DongleLocked, errorCode);
      } else if (errorCode.match("6985")) {
        this._setState(States.BLANK);
        error = Errors["new"](Errors.BlankDongle, errorCode);
      } else if (errorCode.match("6faa")) {
        this._setState(States.ERROR);
        error = Errors["new"](Errors.UnknowError, errorCode);
      } else if (errorCode.match(/63c\d/)) {
        error = Errors["new"](Errors.WrongPinCode, errorCode);
        error.retryCount = parseInt(errorCode.substr(-1));
        if (error.retryCount === 0) {
          this._setState(States.BLANK);
          error.code = Errors.DongleLocked;
        } else {
          this._setState(States.ERROR);
        }
      } else {
        this._setState(States.UnknowError);
        error = Errors["new"](Errors.UnknowError, errorCode);
      }
      l('ERROR', error);
      return error;
    };

    return MockDongle;

  })(EventEmitter);

}).call(this);
