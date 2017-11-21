(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (ledger.widgets == null) {
    ledger.widgets = {};
  }


  /*
    Switch
   */

  ledger.widgets.Switch = (function(_super) {
    __extends(Switch, _super);

    function Switch(node) {
      this._switchEl = $('<div class="switch"><div class="circle"></div></div>');
      this._switchEl.appendTo(node);
      this._switchEl.click((function(_this) {
        return function() {
          _this.setOn(!_this.isOn(), true);
          return _this.emit((_this.isOn() ? "isOn" : "isOff"));
        };
      })(this));
    }


    /*
      Set switch state
      @param [Boolean] state The state of the switch
      @param [Boolean] isAnimated If the switch must be animated
     */

    Switch.prototype.setOn = function(state, isAnimated) {
      if (isAnimated == null) {
        isAnimated = false;
      }
      if (isAnimated) {
        this._switchEl.addClass('animated');
      } else {
        this._switchEl.removeClass('animated');
      }
      if (state === true) {
        this._switchEl.addClass('on');
      } else {
        this._switchEl.removeClass('on');
      }
      return state;
    };

    Switch.prototype.isOn = function() {
      return this._switchEl.hasClass('on');
    };

    return Switch;

  })(EventEmitter);

}).call(this);
