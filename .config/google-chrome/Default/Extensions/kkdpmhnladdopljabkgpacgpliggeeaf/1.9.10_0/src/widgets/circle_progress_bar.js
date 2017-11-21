(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (ledger.widgets == null) {
    ledger.widgets = {};
  }

  ledger.widgets.CircleProgressBar = (function(_super) {
    __extends(CircleProgressBar, _super);

    function CircleProgressBar(node, _arg) {
      var height, width, _ref;
      _ref = _arg != null ? _arg : {}, width = _ref.width, height = _ref.height;
      if (width != null) {
        node.width(width);
      }
      if (height != null) {
        node.height(height);
      }
      node.addClass("circle-progress-bar-container");
      this._view = new ProgressBar.Circle(node.selector, {
        color: '#999999',
        trailColor: '#CCCCCC',
        strokeWidth: 3,
        trailWidth: 3,
        text: {
          className: 'progress-text',
          style: {
            color: '#000',
            position: 'absolute',
            left: '50%',
            top: '50%',
            padding: 0,
            margin: 0
          },
          transform: {
            prefix: true,
            value: 'translate(-50%, -50%)'
          }
        },
        step: (function(_this) {
          return function(state, bar) {
            return bar.setText((bar.value() * 100).toFixed(0) + '%');
          };
        })(this)
      });
    }

    CircleProgressBar.prototype.setProgress = function(progress, animated) {
      if (animated == null) {
        animated = true;
      }
      if (animated) {
        return this._view.animate(progress);
      }
    };

    return CircleProgressBar;

  })(EventEmitter);

}).call(this);
