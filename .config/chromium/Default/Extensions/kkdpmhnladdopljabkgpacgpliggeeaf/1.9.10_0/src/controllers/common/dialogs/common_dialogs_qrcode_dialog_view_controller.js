(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.CommonDialogsQrcodeDialogViewController = (function(_super) {
    __extends(CommonDialogsQrcodeDialogViewController, _super);

    function CommonDialogsQrcodeDialogViewController() {
      return CommonDialogsQrcodeDialogViewController.__super__.constructor.apply(this, arguments);
    }

    CommonDialogsQrcodeDialogViewController.prototype.view = {
      videoCaptureContainer: '#video_capture_container'
    };

    CommonDialogsQrcodeDialogViewController.prototype.qrcodeCheckBlock = null;

    CommonDialogsQrcodeDialogViewController.prototype.onAfterRender = function() {
      CommonDialogsQrcodeDialogViewController.__super__.onAfterRender.apply(this, arguments);
      return _.defer((function(_this) {
        return function() {
          return _this._startScanner();
        };
      })(this));
    };

    CommonDialogsQrcodeDialogViewController.prototype.show = function() {
      return ledger.managers.permissions.request('videoCapture', (function(_this) {
        return function(granted) {
          return _.defer(function() {
            return CommonDialogsQrcodeDialogViewController.__super__.show.apply(_this, arguments);
          });
        };
      })(this));
    };

    CommonDialogsQrcodeDialogViewController.prototype.onDetach = function() {
      CommonDialogsQrcodeDialogViewController.__super__.onDetach.apply(this, arguments);
      return this._stopScanner();
    };

    CommonDialogsQrcodeDialogViewController.prototype.onDismiss = function() {
      CommonDialogsQrcodeDialogViewController.__super__.onDismiss.apply(this, arguments);
      return this._stopScanner();
    };

    CommonDialogsQrcodeDialogViewController.prototype._startScanner = function() {
      if (this.view.qrcodeScanner != null) {
        return;
      }
      this.view.qrcodeScanner = new ledger.qr_codes.Scanner();
      this.view.qrcodeScanner.on('qrcode', (function(_this) {
        return function(event, data) {
          if ((_this.qrcodeCheckBlock != null) && _this.qrcodeCheckBlock(data) === true) {
            _this.emit('qrcode', data);
            return _this.dismiss();
          }
        };
      })(this));
      return this.view.qrcodeScanner.startInNode(this.view.videoCaptureContainer);
    };

    CommonDialogsQrcodeDialogViewController.prototype._stopScanner = function() {
      if (this.view.qrcodeScanner == null) {
        return;
      }
      this.view.qrcodeScanner.off('qrcode');
      this.view.qrcodeScanner.stop();
      return this.view.qrcodeScanner = void 0;
    };

    return CommonDialogsQrcodeDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
