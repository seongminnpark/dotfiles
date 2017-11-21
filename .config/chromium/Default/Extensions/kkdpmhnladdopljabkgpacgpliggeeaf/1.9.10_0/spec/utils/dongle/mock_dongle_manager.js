(function() {
  var _base,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_base = this.ledger).dongle == null) {
    _base.dongle = {};
  }

  ledger.dongle.MockDongleManager = (function(_super) {
    __extends(MockDongleManager, _super);

    function MockDongleManager() {
      this.dongleInstance = void 0;
      this._dongles = [];
    }

    MockDongleManager.prototype.start = function() {
      return l('start');
    };

    MockDongleManager.prototype.stop = function() {
      return l('stop');
    };

    MockDongleManager.prototype.createDongle = function(pin, seed, pairingKeyHex) {
      this.dongleInstance = new ledger.dongle.MockDongle(pin, seed, pairingKeyHex);
      this.dongleInstance.id = this._dongles.length + 1;
      this.dongleInstance.deviceId = this.dongleInstance.id;
      this._dongles.push(this.dongleInstance);
      if (this.dongleInstance.state === 'locked') {
        this.emit('connected', this.dongleInstance);
      }
      this.dongleInstance.once('state:locked', (function(_this) {
        return function(event) {
          return _this.emit('connected', _this.dongleInstance);
        };
      })(this));
      this.dongleInstance.once('state:blank', (function(_this) {
        return function(event) {
          return _this.emit('connected', _this.dongleInstance);
        };
      })(this));
      this.dongleInstance.once('forged', (function(_this) {
        return function(event) {
          return _this.emit('forged', _this.dongleInstance);
        };
      })(this));
      this.dongleInstance.once('state:disconnected', (function(_this) {
        return function(event) {
          _this._dongles.pop();
          l(_this);
          return _this.emit('disconnected', _this.dongleInstance);
        };
      })(this));
      return this.dongleInstance;
    };

    MockDongleManager.prototype.powerCycle = function(delay, cb) {
      l('powerCycle');
      this.emit('disconnect', this.dongleInstance);
      this.dongleInstance.disconnect();
      ledger.tasks.TickerTask.instance.stop();
      return setTimeout((function(_this) {
        return function() {
          _this.dongleInstance.connect();
          _this.emit('connecting', _this.dongleInstance);
          _this.emit('connected', _this.dongleInstance);
          return typeof cb === "function" ? cb() : void 0;
        };
      })(this), delay);
    };

    MockDongleManager.prototype.dongles = function() {
      return this._dongles;
    };

    return MockDongleManager;

  })(EventEmitter);

}).call(this);
