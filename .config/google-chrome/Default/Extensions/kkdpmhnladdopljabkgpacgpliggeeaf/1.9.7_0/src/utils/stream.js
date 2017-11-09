(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ledger.stream = highland;

  this.Stream = (function(_super) {
    __extends(Stream, _super);

    Stream.Type = {
      STRING: 0,
      OBJECT: 1
    };

    function Stream(type) {
      if (type == null) {
        type = Stream.Type.OBJECT;
      }
      this._open = false;
      this._type = type;
      if (type === Stream.Type.OBJECT) {
        this._buffer = [];
      } else {
        this._buffer = '';
      }
    }

    Stream.prototype.open = function() {
      this._open = true;
      this.onOpen();
      this.emit('open');
      return this;
    };

    Stream.prototype.onOpen = function() {};

    Stream.prototype.onClose = function() {};

    Stream.prototype.close = function() {
      this.onClose();
      this._open = false;
      return _.defer((function(_this) {
        return function() {
          _this.emit('close');
          return _.defer(function() {
            return _this.off('data close open');
          });
        };
      })(this));
    };

    Stream.prototype.write = function(data) {
      var _ref;
      if (this._type === Stream.Type.OBJECT) {
        this._buffer.push(data);
      } else {
        this._buffer += data;
      }
      if ((_ref = this._output) != null) {
        _ref.write(this.read());
      }
      if (this._timeout != null) {
        clearTimeout(this._timeout);
      }
      this._timeout = _.defer((function(_this) {
        return function() {
          return _this.emit('data');
        };
      })(this));
      return this;
    };

    Stream.prototype.read = function(n) {
      var c, l, out;
      if (n == null) {
        n = -1;
      }
      if (n < 0) {
        n = this._buffer.length;
      }
      l = n;
      out = (function() {
        var _i, _len, _ref, _results;
        _ref = this._buffer;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          c = _ref[_i];
          if (l-- > 0) {
            _results.push(c);
          }
        }
        return _results;
      }).call(this);
      if (this._type === Stream.Type.OBJECT) {
        this._buffer.splice(0, n);
        return out;
      } else {
        this._buffer = _.str.splice(this._buffer, 0, n);
        return out.join('');
      }
    };

    Stream.prototype.readAndResetError = function() {
      var error;
      error = this._error;
      this._hasError = false;
      this._error = null;
      return error;
    };

    Stream.prototype.readError = function() {
      return this._error;
    };

    Stream.prototype.error = function(msg) {
      this._hasError = true;
      this._error = msg;
      return _.defer((function(_this) {
        return function() {
          return _this.emit('error', msg);
        };
      })(this));
    };

    Stream.prototype.pipe = function(stream) {
      this._output = stream;
      return stream;
    };

    Stream.prototype.isOpen = function() {
      return this._open;
    };

    Stream.prototype.isClosed = function() {
      return !this.isOpen();
    };

    Stream.prototype.hasData = function() {
      return this._buffer.length > 0;
    };

    Stream.prototype.hasError = function() {
      if (this._hasError != null) {
        return this._hasError;
      } else {
        return false;
      }
    };

    return Stream;

  })(EventEmitter);

}).call(this);
