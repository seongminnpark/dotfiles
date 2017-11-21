(function() {
  var DebugWebsocket, _base,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_base = this.ledger).m2fa == null) {
    _base.m2fa = {};
  }

  DebugWebsocket = function(message) {
    return ledger.utils.Logger.getLoggerByTag("WebSocket").info(message);
  };

  this.ledger.m2fa.Client = (function(_super) {
    __extends(Client, _super);

    Client.BASE_URL = ledger.config.m2fa.baseUrl;

    function Client(pairingId) {
      Client.__super__.constructor.call(this, pairingId);
      this.start();
      this.pairingId = pairingId;
      this._joinRoom();
    }

    Client.prototype.isConnected = function() {
      return this._connectionPromise && this._connectionPromise.isFullfilled();
    };

    Client.prototype.pairedDongleName = ledger.defer("");

    Client.prototype.sendChallenge = function(challenge) {
      this._send({
        type: 'challenge',
        data: challenge
      });
      return this.emit('m2fa.challenge.sended', challenge);
    };

    Client.prototype.confirmPairing = function(success) {
      if (success == null) {
        success = true;
      }
      this._send({
        type: 'pairing',
        is_successful: success
      });
      return this.emit('m2fa.pairing.confirmed', success);
    };

    Client.prototype.rejectPairing = function() {
      this._send({
        type: 'pairing',
        is_successful: false
      });
      return this.emit('m2fa.pairing.rejected');
    };

    Client.prototype.requestValidation = function(data, output_data) {
      var request;
      request = {
        type: 'request',
        second_factor_data: data
      };
      if (output_data != null) {
        request.output_data = output_data;
      }
      this._lastRequest = request;
      this._send(this._lastRequest);
      return this.emit('m2fa.request.sended', data);
    };

    Client.prototype.onStop = function() {
      ledger.m2fa.clients = _.omit(ledger.m2fa.clients, this.pairingId);
      return this._leaveRoom();
    };

    Client.prototype._joinRoom = function(pairingId) {
      var d;
      if (this._connectionPromise != null) {
        return this._connectionPromise;
      }
      d = Q.defer();
      this._connectionPromise = d.promise;
      this.ws = new WebSocket(this.constructor.BASE_URL);
      if (DebugWebsocket != null) {
        (function(ws) {
          this.ws = ws;
          ws._send = ws.send;
          return ws.send = function(data) {
            if (typeof DebugWebsocket === "function") {
              DebugWebsocket("[WS] ==> " + data);
            }
            return ws._send(data);
          };
        })(this.ws);
      }
      this.ws.onopen = (function(_this) {
        return function(e) {
          _this._onOpen(e);
          return d.resolve();
        };
      })(this);
      this.ws.onmessage = _.bind(this._onMessage, this);
      this.ws.onclose = _.bind(this._onClose, this);
      return this._connectionPromise;
    };

    Client.prototype._leaveRoom = function() {
      var ws, _ref;
      if (this.ws == null) {
        return;
      }
      _ref = [this.ws, void 0, void 0], ws = _ref[0], this.ws = _ref[1], this._connectionPromise = _ref[2];
      ws.onclose = void 0;
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'leave'
        }));
      }
      ws.close();
      return this.emit('m2fa.room.left');
    };

    Client.prototype._onOpen = function(e) {
      if (typeof DebugWebsocket === "function") {
        DebugWebsocket("[WS] Open");
      }
      this.ws.send(JSON.stringify({
        type: 'join',
        room: this.pairingId
      }));
      this.ws.send(JSON.stringify({
        type: 'repeat'
      }));
      return this.emit('m2fa.room.joined');
    };

    Client.prototype._onMessage = function(e) {
      var data;
      if (typeof DebugWebsocket === "function") {
        DebugWebsocket("[WS] <== " + e.data);
      }
      data = JSON.parse(e.data);
      this.emit('m2fa.message', data);
      switch (data.type) {
        case "connect":
          return this._onConnect(data);
        case "disconnect":
          return this._onDisconnect(data);
        case "repeat":
          return this._onRepeat(data);
        case "accept":
          return this._onAccept(data);
        case "response":
          return this._onResponse(data);
        case "identify":
          return this._onIdentify(data);
        case "challenge":
          return this._onChallenge(data);
      }
    };

    Client.prototype._onClose = function(e) {
      var _ref, _ref1;
      if (typeof DebugWebsocket === "function") {
        DebugWebsocket("[WS] Close");
      }
      _ref = [void 0, void 0], this.ws.onclose = _ref[0], this.ws.onmessage = _ref[1];
      _ref1 = [void 0, void 0], this.ws = _ref1[0], this._connectionPromise = _ref1[1];
      return this._joinRoom();
    };

    Client.prototype._send = function(data) {
      if (this._connectionPromise == null) {
        this._joinRoom().then((function(_this) {
          return function() {
            return _this._send(data);
          };
        })(this));
      }
      return this._connectionPromise.then((function(_this) {
        return function() {
          data['attestation'] = ledger.app.dongle.getAttestation().getAttestationId().toString();
          return _this.ws.send(JSON.stringify(data));
        };
      })(this));
    };

    Client.prototype._onConnect = function(data) {
      return this.emit('m2fa.connect');
    };

    Client.prototype._onDisconnect = function(data) {
      return this.emit('m2fa.disconnect');
    };

    Client.prototype._onRepeat = function(data) {
      if (this._lastRequest != null) {
        return this.ws.send(JSON.stringify(this._lastRequest));
      }
    };

    Client.prototype._onAccept = function(data) {
      return this.emit('m2fa.accept');
    };

    Client.prototype._onResponse = function(data) {
      if (data.is_accepted) {
        return this.emit('m2fa.response', data.pin);
      } else {
        return this.emit('m2fa.reject');
      }
    };

    Client.prototype._onIdentify = function(data) {
      this.lastIdentifyData = data;
      return this.emit('m2fa.identify', data.public_key);
    };

    Client.prototype._onChallenge = function(data) {
      return this.emit('m2fa.challenge', data.data);
    };

    return Client;

  })(ledger.tasks.Task);

}).call(this);
