(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ledger.common.DialogViewController = (function(_super) {
    __extends(DialogViewController, _super);

    function DialogViewController() {
      return DialogViewController.__super__.constructor.apply(this, arguments);
    }

    DialogViewController.prototype.cancellable = true;

    DialogViewController.prototype.show = function(options) {
      if (options == null) {
        options = {};
      }
      this._dialog = ledger.dialogs.manager.create();
      this._dialog.push(this);
      this.parentViewController.show();
      return this;
    };

    DialogViewController.prototype.identifier = function() {
      return this.className().replace('DialogViewController', '');
    };

    DialogViewController.prototype.getDialog = function() {
      return this._dialog;
    };

    DialogViewController.prototype.dismiss = function(callback) {
      if (callback == null) {
        callback = void 0;
      }
      this.once('dismiss', function() {
        return typeof callback === "function" ? callback() : void 0;
      });
      return this._dialog.dismiss();
    };

    DialogViewController.prototype.onShow = function() {
      return this.emit('show');
    };

    DialogViewController.prototype.isShown = function() {
      var _ref;
      return (_ref = this._dialog) != null ? _ref.isShown() : void 0;
    };

    DialogViewController.prototype.stylesheetIdentifier = function() {
      return "dialog_view_controller_style_#" + this.getDialog().getId();
    };

    DialogViewController.prototype.onDismiss = function() {
      $("link[id='dialog_view_controller_style_" + (this.getDialog().getId()) + "']").remove();
      return this.emit('dismiss');
    };

    return DialogViewController;

  })(ledger.common.ViewController);

}).call(this);
