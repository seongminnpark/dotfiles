(function() {
  var _base;

  if ((_base = this.ledger).m2fa == null) {
    _base.m2fa = {};
  }

  _.extend(this.ledger.m2fa, {
    clients: {},
    pairDevice: function() {
      var client, d, pairingId;
      d = Q.defer();
      pairingId = this._nextPairingId();
      client = this._clientFactory(pairingId);
      this.clients[pairingId] = client;
      client.on('m2fa.identify', (function(_this) {
        return function(e, pubKey) {
          return _this._onIdentify(client, pubKey, d);
        };
      })(this));
      client.on('m2fa.challenge', (function(_this) {
        return function(e, data) {
          return _this._onChallenge(client, data, d);
        };
      })(this));
      client.on('m2fa.disconnect', (function(_this) {
        return function(e, data) {
          return _this._onDisconnect(client, data, d);
        };
      })(this));
      return [pairingId, d.promise, client];
    },
    requestPairing: function() {
      var client, pairingId, promise, _ref;
      _ref = this.pairDevice(), pairingId = _ref[0], promise = _ref[1], client = _ref[2];
      return new ledger.m2fa.PairingRequest(pairingId, promise, client);
    },
    saveSecureScreen: function(pairingId, screenData) {
      var data;
      data = {
        name: screenData['name'],
        platform: screenData['platform'],
        uuid: screenData['uuid']
      };
      return ledger.m2fa.PairedSecureScreen.create(pairingId, data).toSyncedStore();
    },
    getPairingIds: function() {
      var d;
      d = Q.defer();
      ledger.storage.sync.keys(function(keys) {
        var err;
        try {
          keys = _.filter(keys, function(key) {
            return key.match(/^__m2fa_/);
          });
          return ledger.storage.sync.get(keys, function(items) {
            var key, pairingCuple, value;
            pairingCuple = {};
            for (key in items) {
              value = items[key];
              pairingCuple[key.replace(/^__m2fa_/, '')] = value;
            }
            return d.resolve(pairingCuple);
          });
        } catch (_error) {
          err = _error;
          return d.reject(err);
        }
      });
      return d.promise;
    },
    validateTx: function(tx, pairingId) {
      ledger.api.M2faRestClient.instance.wakeUpSecureScreens([pairingId]);
      return this._validateTx(tx, pairingId);
    },
    _validateTx: function(tx, pairingId) {
      var client, d;
      d = Q.defer();
      client = this._getClientFor(pairingId);
      client.off('m2fa.accept');
      client.off('m2fa.response');
      client.on('m2fa.accept', function() {
        d.notify('accepted');
        return client.off('m2fa.accept');
      });
      client.once('m2fa.disconnect', function() {
        return d.notify('disconnected');
      });
      client.on('m2fa.response', function(e, pin) {
        l("%c[M2FA][" + pairingId + "] request's pin received :", "#888888", pin);
        client.stopIfNeccessary();
        return d.resolve(pin);
      });
      client.once('m2fa.reject', function() {
        client.stopIfNeccessary();
        return d.reject('cancelled');
      });
      client.requestValidation(tx.authorizationPaired, tx.encryptedOutputScript);
      return [client, d.promise];
    },
    validateTxOnAll: function(tx) {
      var clients, d;
      d = Q.defer();
      clients = [];
      this.getPairingIds().then((function(_this) {
        return function(pairingIds) {
          var label, pairingId, _results;
          ledger.api.M2faRestClient.instance.wakeUpSecureScreens(_.keys(pairingIds));
          _results = [];
          for (pairingId in pairingIds) {
            label = pairingIds[pairingId];
            _results.push((function(pairingId) {
              var client, promise, _ref;
              _ref = _this._validateTx(tx, pairingId), client = _ref[0], promise = _ref[1];
              clients.push(client);
              return promise.progress(function(msg) {
                var lbl, pId;
                if (msg === 'accepted') {
                  for (pId in pairingIds) {
                    lbl = pairingIds[pId];
                    if (pId !== pairingId) {
                      this.clients[pId].stopIfNeccessary();
                    }
                  }
                }
                return d.notify(msg);
              }).then(function(transaction) {
                return d.resolve(transaction);
              }).fail(function(er) {
                return d.reject(er);
              }).done();
            })(pairingId));
          }
          return _results;
        };
      })(this)).fail(function(er) {
        e(er);
        throw er;
      });
      return [clients, d.promise];
    },
    validateTxOnMultipleIds: function(tx, pairingIds) {
      var clients, d, pairingId, _fn, _i, _len;
      d = Q.defer();
      clients = [];
      ledger.api.M2faRestClient.instance.wakeUpSecureScreens(pairingIds);
      _fn = (function(_this) {
        return function(pairingId) {
          var client, promise, _ref;
          _ref = _this._validateTx(tx, pairingId), client = _ref[0], promise = _ref[1];
          clients.push(client);
          return promise.progress(function(msg) {
            var pId, _j, _len1;
            if (msg === 'accepted') {
              for (_j = 0, _len1 = pairingIds.length; _j < _len1; _j++) {
                pId = pairingIds[_j];
                if (pId !== pairingId) {
                  _this.clients[pId].stopIfNeccessary();
                }
              }
            }
            return d.notify(msg);
          }).then(function(transaction) {
            return d.resolve(transaction);
          }).fail(function(er) {
            return d.reject(er);
          }).done();
        };
      })(this);
      for (_i = 0, _len = pairingIds.length; _i < _len; _i++) {
        pairingId = pairingIds[_i];
        _fn(pairingId);
      }
      return [clients, d.promise];
    },
    requestValidationOnAll: function(tx) {
      var clients, promise, _ref;
      _ref = this.validateTxOnAll(tx), clients = _ref[0], promise = _ref[1];
      return new ledger.m2fa.TransactionValidationRequest(clients, promise);
    },
    requestValidation: function(tx, screen) {
      var client, clients, promise, _ref, _ref1;
      if (!_(screen).isArray()) {
        _ref = this.validateTx(tx, screen.id), client = _ref[0], promise = _ref[1];
        return new ledger.m2fa.TransactionValidationRequest([client], promise, tx, screen);
      } else {
        _ref1 = this.validateTxOnMultipleIds(tx, _(screen).map(function(e) {
          return e.id;
        })), clients = _ref1[0], promise = _ref1[1];
        return new ledger.m2fa.TransactionValidationRequest(clients, promise);
      }
    },
    requestValidationForLastPairing: function(tx) {
      var client, promise, _ref;
      return _ref = this.validateTx(tx), client = _ref[0], promise = _ref[1], _ref;
    },
    _nextPairingId: function() {
      return this._randomPairingId();
    },
    _randomPairingId: function() {
      var hash, hexaWords, pairingId, w, words;
      words = sjcl.random.randomWords(4);
      hexaWords = ((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = words.length; _i < _len; _i++) {
          w = words[_i];
          _results.push(Convert.toHexInt(w));
        }
        return _results;
      })()).join('');
      hash = sjcl.hash.sha256.hash(words);
      return pairingId = hexaWords + Convert.toHexByte(hash[0] >>> 24);
    },
    _getClientFor: function(pairingId) {
      var _base1;
      return (_base1 = this.clients)[pairingId] || (_base1[pairingId] = this._clientFactory(pairingId));
    },
    _onIdentify: function(client, pubKey, d) {
      d.notify("pubKeyReceived", pubKey);
      l("%c[_onIdentify] pubKeyReceived", "color: #4444cc", pubKey);
      return ledger.app.dongle.initiateSecureScreen(pubKey).then(function(challenge) {
        l("%c[_onIdentify] challenge received:", "color: #4444cc", challenge);
        d.notify("sendChallenge", challenge);
        return client.sendChallenge(challenge);
      }).fail((function(_this) {
        return function(err) {
          e("initiateSecureScreen failure:", err);
          d.reject('initiateFailure');
          return client.stopIfNeccessary();
        };
      })(this)).done();
    },
    _onChallenge: function(client, data, d) {
      var screenData;
      screenData = _.clone(client.lastIdentifyData);
      d.notify("challengeReceived");
      l("%c[_onChallenge] challengeReceived", "color: #4444cc", data);
      return ledger.app.dongle.confirmSecureScreen(data).then((function(_this) {
        return function() {
          l("%c[_onChallenge] SUCCESS !!!", "color: #00ff00", data);
          client.confirmPairing();
          d.notify("secureScreenConfirmed");
          console.log(client.pairedDongleName);
          return client.pairedDongleName.onComplete(function(name, err) {
            var er;
            try {
              console.log("client.pairedDongleName.completed with", name, err);
              if (err != null) {
                return d.reject('cancel');
              }
              screenData['name'] = name;
              return d.resolve(_this.saveSecureScreen(client.pairingId, screenData));
            } catch (_error) {
              er = _error;
              return console.error(er);
            }
          });
        };
      })(this)).fail((function(_this) {
        return function(e) {
          l("%c[_onChallenge] >>>  FAILURE  <<<", "color: #ff0000", e);
          client.rejectPairing();
          return d.reject('invalidChallenge');
        };
      })(this))["finally"]((function(_this) {
        return function() {
          return client.stopIfNeccessary();
        };
      })(this)).done();
    },
    _onDisconnect: function(client, data, d) {
      return d.notify("secureScreenDisconnect");
    },
    _clientFactory: function(pairingId) {
      return new ledger.m2fa.Client(pairingId);
    }
  });

}).call(this);
