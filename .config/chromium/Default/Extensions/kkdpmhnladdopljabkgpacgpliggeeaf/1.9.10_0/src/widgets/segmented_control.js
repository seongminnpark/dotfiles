(function() {
  var Styles,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (ledger.widgets == null) {
    ledger.widgets = {};
  }

  Styles = {
    Small: 'small-segmented-control'
  };

  ledger.widgets.SegmentedControl = (function(_super) {
    __extends(SegmentedControl, _super);

    SegmentedControl.Styles = Styles;

    SegmentedControl.prototype._el = null;

    SegmentedControl.prototype._actions = null;

    function SegmentedControl(node, style) {
      SegmentedControl.__super__.constructor.apply(this, arguments);
      this._actions = [];
      this._el = $("<div class='" + style + "'></div>");
      node.append(this._el);
    }

    SegmentedControl.prototype.addAction = function(label) {
      var action;
      action = $("<div class='action'>" + label + "</div>");
      action.on('click', (function(_this) {
        return function() {
          return _this._handleActionClick(action);
        };
      })(this));
      this._el.append(action);
      this._actions.push(action);
      return action;
    };

    SegmentedControl.prototype.removeAllActions = function() {
      this._el.empty();
      return this._actions = [];
    };

    SegmentedControl.prototype.setSelectedIndex = function(index) {
      if (index >= this._actions.length) {
        return;
      }
      if (this.getSelectedIndex() !== -1) {
        this._actions[this.getSelectedIndex()].removeClass('selected');
      }
      return this._actions[index].addClass('selected');
    };

    SegmentedControl.prototype.getSelectedIndex = function() {
      var action, index, _i, _len, _ref;
      _ref = this._actions;
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        action = _ref[index];
        if (action.hasClass('selected')) {
          return index;
        }
      }
      return -1;
    };

    SegmentedControl.prototype._handleActionClick = function(action) {
      var index;
      index = this._actions.indexOf(action);
      if (index === this.getSelectedIndex()) {
        return;
      }
      this.setSelectedIndex(index);
      return this.emit('selection', {
        action: action,
        index: index
      });
    };

    return SegmentedControl;

  })(EventEmitter);

}).call(this);
