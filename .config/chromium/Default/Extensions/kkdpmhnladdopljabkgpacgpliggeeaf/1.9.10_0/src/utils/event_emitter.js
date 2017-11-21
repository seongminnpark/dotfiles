(function() {
  (function(jQuery) {

jQuery.EventEmitter = {
  _JQInit: function() {
    this._JQ = jQuery(this);
  },
  emit: function(evt, data) {
    !this._JQ && this._JQInit();
    this._JQ.trigger(evt, data);
  },
  once: function(evt, handler) {
    !this._JQ && this._JQInit();
    this._JQ.one(evt, handler);
  },
  on: function(evt, handler) {
    !this._JQ && this._JQInit();
    this._JQ.bind(evt, handler);
  },
  off: function(evt, handler) {
    !this._JQ && this._JQInit();
    this._JQ.unbind(evt, handler);
  }
};

}(jQuery));;
  var _EventEmitter;

  _EventEmitter = function() {};

  jQuery.extend(_EventEmitter.prototype, jQuery.EventEmitter);

  this.EventEmitter = (function() {
    var _eventEmitter;

    function EventEmitter() {}

    _eventEmitter = null;

    EventEmitter.prototype._getEventEmitter = function() {
      if (this._eventEmitter == null) {
        this._eventEmitter = new _EventEmitter();
      }
      return this._eventEmitter;
    };

    EventEmitter.prototype.emitAfter = function(event, data, ms) {
      if (ms == null) {
        ms = null;
      }
      if (ms == null) {
        ms = data;
        data = void 0;
      }
      return setTimeout((function(_this) {
        return function() {
          return _this.emit(event, data);
        };
      })(this), ms);
    };

    EventEmitter.prototype.emit = function(event, data) {
      return this._getEventEmitter().emit(event, data);
    };

    EventEmitter.prototype.once = function(event, handler) {
      this.off(event, handler);
      return this._getEventEmitter().once(event, handler);
    };

    EventEmitter.prototype.on = function(event, handler) {
      this.off(event, handler);
      return this._getEventEmitter().on(event, handler);
    };

    EventEmitter.prototype.off = function(event, handler) {
      return this._getEventEmitter().off(event, handler);
    };

    return EventEmitter;

  })();

}).call(this);
