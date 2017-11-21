(function() {
  var Errors, _base,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  if ((_base = this.ledger).m2fa == null) {
    _base.m2fa = {};
  }

  Errors = ledger.errors;

  this.ledger.m2fa.TransactionValidationRequest = (function(_super) {
    __extends(TransactionValidationRequest, _super);

    function TransactionValidationRequest(clients, promise) {
      this._defer = ledger.defer((function(_this) {
        return function() {
          var args;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          return typeof _this._onComplete === "function" ? _this._onComplete.apply(_this, args) : void 0;
        };
      })(this));
      this._clients = clients;
      promise.progress((function(_this) {
        return function(progress) {
          switch (progress) {
            case 'accepted':
              return _this.emit('accepted');
            case 'disconnect':
              return _this.emit('leave');
          }
        };
      })(this)).then((function(_this) {
        return function(result) {
          if (result != null) {
            _this._defer.resolve(result);
            return _this.emit("complete", result);
          } else {
            _this._defer.reject(Errors.InvalidResult);
            return _this.emit("error");
          }
        };
      })(this)).fail((function(_this) {
        return function(error) {
          switch (error) {
            case 'cancelled':
              _this._defer.reject(Errors.TransactionCancelled);
              return _this.emit("error");
            default:
              return console.error("TransactionValidationRequest fail:", error);
          }
        };
      })(this)).done();
    }

    TransactionValidationRequest.prototype.cancel = function() {
      var client, _i, _len, _ref;
      this.off();
      if (!this._defer.promise.isFulfilled()) {
        this._onComplete = void 0;
        this._defer.reject('Operation cancelled');
      }
      _ref = this._clients;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        client = _ref[_i];
        if (client != null) {
          client.off();
        }
        if (client != null) {
          client.stopIfNeccessary();
        }
      }
      return this._clients = [];
    };

    TransactionValidationRequest.prototype.onComplete = function(cb) {
      return this._onComplete = cb;
    };

    return TransactionValidationRequest;

  })(this.EventEmitter);

}).call(this);
