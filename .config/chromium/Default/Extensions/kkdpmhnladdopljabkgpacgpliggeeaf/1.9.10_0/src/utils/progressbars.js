(function() {
  var _base;

  if ((_base = this.ledger).progressbars == null) {
    _base.progressbars = {};
  }

  ledger.progressbars.ProgressBar = (function() {
    ProgressBar.prototype._el = null;

    ProgressBar.prototype._leftEl = null;

    ProgressBar.prototype._progress = null;

    function ProgressBar(node) {
      this._el = $('<div class="progressbar"></div>');
      this._leftEl = $('<div class="left"></div>');
      this._el.append([this._leftEl]);
      this.setProgress(0);
      this.setAnimated(true);
      node.append(this._el);
    }

    ProgressBar.prototype.setAnimated = function(animated) {
      if (animated) {
        return this._leftEl.css('transition', 'width 0.25s ease-in-out');
      } else {
        return this._leftEl.css('transition', 'none');
      }
    };

    ProgressBar.prototype.setProgress = function(progress) {
      var computedProgress;
      if ((this._progress === progress) || progress < 0.0 || progress > 1.0) {
        return;
      }
      this._progress = progress;
      computedProgress = Math.ceil(progress * 100);
      return this._leftEl.css('width', computedProgress + '%');
    };

    ProgressBar.prototype.getProgress = function() {
      return this._progress;
    };

    return ProgressBar;

  })();

}).call(this);
