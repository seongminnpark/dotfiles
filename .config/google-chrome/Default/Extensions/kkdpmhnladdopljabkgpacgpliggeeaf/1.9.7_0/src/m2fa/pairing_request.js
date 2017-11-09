(function() {
  var _base,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  if ((_base = this.ledger).m2fa == null) {
    _base.m2fa = {};
  }


  /*
    Wrapper around the pairing API. The pairing request ensures process consistency and will complete with a failure if any
    of the protocol step is broken. The pairing request fire events in order to follow up the current step and provide an
    internal state.
  
    @event 'join' Notifies that a client joined the room and attempts to create a secure channel
    @event 'sendChallenge' Notifies that the dongle is challenging the client
    @event 'answerChallenge' Notifies that a client answered to the dongle challenge
    @event 'finalizing' Notifies that the pairing is successful and the application is about to store the secure screen in the user preferences
    @event 'error' Notifies pairing error. Use 'reason' key in data to retrieve the error reason.
    @event 'success' Notifies pairing success
   */

  this.ledger.m2fa.PairingRequest = (function(_super) {
    __extends(PairingRequest, _super);

    PairingRequest.States = {
      WAITING: 0,
      CHALLENGING: 1,
      FINISHING: 2,
      DEAD: 3
    };

    PairingRequest.Errors = {
      InconsistentState: "inconsistent_state",
      ClientCancelled: "client_cancelled",
      NeedPowerCycle: "dongle_needs_power_cycle",
      InvalidChallengeResponse: "invalid_challenge_response",
      Cancelled: "dongle_cancelled",
      UnknownError: "unknown"
    };

    function PairingRequest(pairindId, promise, client) {
      this.pairingId = pairindId;
      this._client = client;
      this._secureScreenName = ledger.defer();
      this._client.pairedDongleName = this._secureScreenName;
      this._currentState = ledger.m2fa.PairingRequest.States.WAITING;
      this._defer = ledger.defer((function(_this) {
        return function() {
          var args;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          return typeof _this._onComplete === "function" ? _this._onComplete.apply(_this, args) : void 0;
        };
      })(this));
      this._identifyData = {};
      promise.then((function(_this) {
        return function(result) {
          return _this._success(result);
        };
      })(this))["catch"]((function(_this) {
        return function(err) {
          return _.defer(function() {
            var failure;
            failure = (function() {
              switch (err) {
                case 'invalidChallenge':
                  return ledger.m2fa.PairingRequest.Errors.InvalidChallengeResponse;
                case 'cancel':
                  return ledger.m2fa.PairingRequest.Errors.Cancelled;
                case 'initiateFailure':
                  return ledger.m2fa.PairingRequest.Errors.NeedPowerCycle;
                default:
                  return ledger.m2fa.PairingRequest.Errors.UnknownError;
              }
            })();
            return _this._failure(failure);
          });
        };
      })(this)).progress((function(_this) {
        return function(progress) {
          var er;
          try {
            switch (progress) {
              case 'pubKeyReceived':
                _this._identifyData = _.clone(_this._client.lastIdentifyData);
                if (_this._currentState !== ledger.m2fa.PairingRequest.States.WAITING) {
                  return _this._failure(ledger.m2fa.PairingRequest.Errors.InconsistentState);
                }
                _this._currentState = ledger.m2fa.PairingRequest.States.CHALLENGING;
                return _this.emit('join');
              case 'challengeReceived':
                if (_this._currentState !== ledger.m2fa.PairingRequest.States.CHALLENGING) {
                  return _this._failure(ledger.m2fa.PairingRequest.Errors.InconsistentState);
                }
                _this._currentState = ledger.m2fa.PairingRequest.States.FINISHING;
                return _this.emit('answerChallenge');
              case 'secureScreenDisconnect':
                if (_this._currentState !== ledger.m2fa.PairingRequest.States.WAITING) {
                  return _this._failure(ledger.m2fa.PairingRequest.Errors.ClientCancelled);
                }
                break;
              case 'sendChallenge':
                return _this.emit('sendChallenge');
              case 'secureScreenConfirmed':
                return _this.emit('finalizing');
            }
          } catch (_error) {
            er = _error;
            return e(er);
          }
        };
      })(this)).done();
      this._promise = promise;
    }

    PairingRequest.prototype.onComplete = function(cb) {
      return this._onComplete = cb;
    };

    PairingRequest.prototype.setSecureScreenName = function(name) {
      return this._secureScreenName.resolve(name);
    };

    PairingRequest.prototype.getCurrentState = function() {
      return this._currentState;
    };

    PairingRequest.prototype.getSuggestedDeviceName = function() {
      var _ref;
      return (_ref = this._identifyData) != null ? _ref['name'] : void 0;
    };

    PairingRequest.prototype.getDeviceUuid = function() {
      var _ref;
      return (_ref = this._identifyData) != null ? _ref['uuid'] : void 0;
    };

    PairingRequest.prototype.cancel = function() {
      this._promise = null;
      this._secureScreenName.reject('cancel');
      this._client.stopIfNeccessary();
      this._defer = ledger.defer();
      this.emit('cancel');
      return this.off();
    };

    PairingRequest.prototype._failure = function(reason) {
      this._currentState = ledger.m2fa.PairingRequest.States.DEAD;
      if (!this._defer.promise.isFulfilled()) {
        this._defer.reject(reason);
        return this.emit('error', {
          reason: reason
        });
      }
    };

    PairingRequest.prototype._success = function(screen) {
      this._currentState = ledger.m2fa.PairingRequest.States.DEAD;
      if (!this._defer.promise.isFulfilled()) {
        this._defer.resolve(screen);
        return this.emit('success');
      }
    };

    return PairingRequest;

  })(this.EventEmitter);

}).call(this);
