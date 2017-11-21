(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (ledger.qr_codes == null) {
    ledger.qr_codes = {};
  }

  ledger.qr_codes.Scanner = (function(_super) {
    __extends(Scanner, _super);

    function Scanner() {
      return Scanner.__super__.constructor.apply(this, arguments);
    }

    Scanner.prototype.localStream = void 0;

    Scanner.prototype.mainEl = void 0;

    Scanner.prototype.videoEl = void 0;

    Scanner.prototype.canvasTagEl = void 0;

    Scanner.prototype.videoTagEl = void 0;

    Scanner.prototype.overlayEl = void 0;

    Scanner.prototype.startInNode = function(node) {
      var height, renderedNode, width;
      if (this.mainEl != null) {
        return;
      }
      renderedNode = $(node);
      height = renderedNode.height();
      width = renderedNode.width();
      this.mainEl = $('<div class="qrcode"></div>');
      this.overlayEl = $('<div class="overlay"></div>');
      this.videoEl = $('<div class="video"></div>');
      this.videoTagEl = $('<video width="' + width + 'px" height="' + height + 'px"></video>');
      this.canvasTagEl = $('<canvas id="qr-canvas" width="' + width + 'px" height="' + height + 'px" style="display:none;"></canvas>');
      this.videoEl.append(this.videoTagEl);
      this.videoEl.append(this.canvasTagEl);
      this.mainEl.append(this.videoEl);
      this.mainEl.append(this.overlayEl);
      renderedNode.append(this.mainEl);
      return navigator.webkitGetUserMedia({
        video: true
      }, (function(_this) {
        return function(stream) {
          _this.localStream = stream;
          _this.videoTagEl.get(0).src = (window.URL && window.URL.createObjectURL(stream)) || stream;
          _this.videoTagEl.get(0).play();
          _.delay(_this._decodeCallback.bind(_this), 1000);
          return _this.emit('success', stream);
        };
      })(this), (function(_this) {
        return function(videoError) {
          _this.overlayEl.addClass('errored');
          _this.overlayEl.text(t('common.qrcode.nowebcam'));
          return _this.emit('error', videoError);
        };
      })(this));
    };

    Scanner.prototype.stop = function() {
      var _ref, _ref1, _ref2, _ref3;
      if (this.mainEl == null) {
        return;
      }
      if ((_ref = this.localStream) != null) {
        if (typeof _ref.getTracks === "function") {
          if ((_ref1 = _ref.getTracks()) != null) {
            if ((_ref2 = _ref1[0]) != null) {
              if (typeof _ref2.stop === "function") {
                _ref2.stop();
              }
            }
          }
        }
      }
      if ((_ref3 = this.videoTagEl) != null) {
        _ref3.get(0).pause();
      }
      this.videoEl = void 0;
      this.canvasTagEl = void 0;
      this.videoTagEl = void 0;
      this.overlayEl = void 0;
      this.localStream = void 0;
      return this.mainEl = void 0;
    };

    Scanner.prototype._decodeCallback = function() {
      var context, qrcode, result;
      if (this.localStream != null) {
        try {
          context = this.canvasTagEl.get(0).getContext('2d');
          context.drawImage(this.videoTagEl.get(0), 0, 0, this.canvasTagEl.width(), this.canvasTagEl.height());
          result = zbarProcessImageData(context.getImageData(0, 0, this.canvasTagEl.width(), this.canvasTagEl.height()));
          if ((result != null ? result.length : void 0) > 0) {
            qrcode = result[0][2];
            if (qrcode != null) {
              this.emit('qrcode', qrcode);
            }
          }
        } catch (_error) {}
        return _.delay(this._decodeCallback.bind(this), 250);
      }
    };

    return Scanner;

  })(EventEmitter);

}).call(this);
