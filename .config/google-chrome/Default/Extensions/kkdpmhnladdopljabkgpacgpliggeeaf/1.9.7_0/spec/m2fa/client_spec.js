(function() {
  describe("m2fa.Client", function() {
    beforeEach(function() {
      var _ref;
      spyOn(window, 'WebSocket');
      this.pairingId = "aPairingId";
      this.client = new ledger.m2fa.Client(this.pairingId);
      this.client.ws = this.ws = jasmine.createSpyObj('ws', ['send', 'close']);
      _ref = [ws.onopen, ws.onmessage, ws.onclose], this.ws.onopen = _ref[0], this.ws.onmessage = _ref[1], this.ws.onclose = _ref[2];
      spyOn(this.client, "_send").and.callThrough();
      return this.ws.readyState = WebSocket.OPEN;
    });
    afterEach(function() {
      return this.client.stop();
    });
    it("connect to 2fa on creation and set event callbacks", function() {
      expect(window.WebSocket).toHaveBeenCalledWith(ledger.config.m2fa.baseUrl);
      expect(this.ws.onopen).toBeDefined();
      expect(this.ws.onmessage).toBeDefined();
      return expect(this.ws.onclose).toBeDefined();
    });
    it("send challenge send good stringified message", function() {
      var challenge;
      challenge = "XxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx";
      this.client.sendChallenge(challenge);
      return expect(this.client._send).toHaveBeenCalledWith(JSON.stringify({
        type: "challenge",
        "data": challenge
      }));
    });
    it("confirm pairing send good stringified message", function() {
      this.client.confirmPairing();
      return expect(this.client._send).toHaveBeenCalledWith(JSON.stringify({
        type: 'pairing',
        is_successful: true
      }));
    });
    it("reject pairing send good stringified message", function() {
      this.client.rejectPairing();
      return expect(this.client._send).toHaveBeenCalledWith(JSON.stringify({
        type: 'pairing',
        is_successful: false
      }));
    });
    it("request validation send good stringified message", function() {
      var data;
      data = "11XxXxXxXxXxXx88XxXxXxXxXxXxXxFF";
      this.client.requestValidation(data);
      return expect(this.client._send).toHaveBeenCalledWith(JSON.stringify({
        type: 'request',
        second_factor_data: data
      }));
    });
    it("leave room send message and close connection", function() {
      this.client._leaveRoom();
      expect(this.ws.send).toHaveBeenCalledWith(JSON.stringify({
        type: 'leave'
      }));
      return expect(this.ws.close).toHaveBeenCalled();
    });
    it("join correct room on connection", function() {
      this.client._onOpen();
      return expect(this.ws.send).toHaveBeenCalledWith(JSON.stringify({
        type: 'join',
        room: this.pairingId
      }));
    });
    it("parse message and call correct handler on message", function() {
      var message;
      message = {
        data: '{"type":"challenge","data":"0x1x2x3x"}'
      };
      spyOn(this.client, '_onChallenge');
      this.client._onMessage(message);
      expect(this.client._onChallenge).toHaveBeenCalledWith({
        "type": "challenge",
        "data": "0x1x2x3x"
      });
      spyOn(this.client, '_onConnect');
      message = {
        data: '{"type":"connect"}'
      };
      this.client._onMessage(message);
      return expect(this.client._onConnect).toHaveBeenCalled();
    });
    it("rejoin correct room on connection closed", function() {
      spyOn(this.client, '_joinRoom');
      this.client._onClose();
      return expect(this.client._joinRoom).toHaveBeenCalled();
    });
    it("emit event on most messages", function() {
      spyOn(this.client, 'emit');
      this.client._onConnect({});
      expect(this.client.emit).toHaveBeenCalledWith('m2fa.connect');
      this.client.emit.calls.reset();
      this.client._onDisconnect({});
      expect(this.client.emit).toHaveBeenCalledWith('m2fa.disconnect');
      this.client.emit.calls.reset();
      this.client._onAccept({});
      expect(this.client.emit).toHaveBeenCalledWith('m2fa.accept');
      this.client.emit.calls.reset();
      this.client._onResponse({
        pin: "01020304",
        is_accepted: true
      });
      expect(this.client.emit).toHaveBeenCalledWith('m2fa.response', "01020304");
      this.client.emit.calls.reset();
      this.client._onIdentify({
        public_key: "toto"
      });
      expect(this.client.emit).toHaveBeenCalledWith('m2fa.identify', "toto");
      this.client.emit.calls.reset();
      this.client._onChallenge({
        "data": "data"
      });
      expect(this.client.emit).toHaveBeenCalledWith('m2fa.challenge', "data");
      return this.client.emit.calls.reset();
    });
    return it("resend last request on repeat", function() {
      this.client._lastRequest = '{"type":"challenge","data":"0x1x2x3x"}';
      this.client._onRepeat();
      return expect(this.ws.send).toHaveBeenCalledWith('{"type":"challenge","data":"0x1x2x3x"}');
    });
  });

}).call(this);
