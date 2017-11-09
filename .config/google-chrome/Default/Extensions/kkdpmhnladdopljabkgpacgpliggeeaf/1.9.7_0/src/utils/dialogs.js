(function() {
  var _base,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_base = this.ledger).dialogs == null) {
    _base.dialogs = {};
  }

  this.ledger.dialogs.DialogController = (function(_super) {
    __extends(DialogController, _super);

    function DialogController(controller, options) {
      this.options = options;
      this._controller = controller;
      this._shown = false;
      this._backStack = [];
      this._cancellable = true;
    }

    DialogController.prototype.show = function() {
      return this._controller.show(this);
    };

    DialogController.prototype.onShow = function() {
      this._shown = true;
      this._viewController.onShow();
      return this.emit('show');
    };

    DialogController.prototype.isShown = function() {
      return this._shown;
    };

    DialogController.prototype.setCancellable = function(cancellable) {
      return this._cancellable = cancellable;
    };

    DialogController.prototype.isCancellable = function() {
      return this._cancellable;
    };

    DialogController.prototype.getId = function() {
      return this._id;
    };

    DialogController.prototype.onDismiss = function() {
      this._viewController.onDetach();
      this._viewController.onDismiss();
      this.emit('dismiss');
      return this._shown = false;
    };

    DialogController.prototype.render = function(selector, done) {
      this._selector = selector;
      this._viewController.once('afterRender', done);
      return this._viewController.render(selector);
    };

    DialogController.prototype.rerender = function() {
      if (this._selector) {
        return this.render(this._selector);
      }
    };

    DialogController.prototype.handleAction = function(actionName, params) {
      return this._viewController.handleAction(actionName, params);
    };

    DialogController.prototype.push = function(viewController) {
      var _ref, _ref1;
      if (this._viewController != null) {
        this._pushViewController(viewController);
      } else {
        this._viewController = viewController;
        viewController.parentViewController = this;
        viewController.onAttach();
        this.emit('push', {
          sender: this,
          viewController: viewController
        });
      }
      this.setCancellable(viewController.cancellable != null ? viewController.cancellable : true);
      if (this.isCancellable()) {
        return (_ref = this._containerSelector) != null ? _ref.addClass("clickable") : void 0;
      } else {
        return (_ref1 = this._containerSelector) != null ? _ref1.removeClass("clickable") : void 0;
      }
    };

    DialogController.prototype._pushViewController = function(viewController) {
      var _ref;
      if ((_ref = this._viewController) != null) {
        _ref.onDetach();
      }
      if (this._viewController != null) {
        this._backStack.push(this._viewController);
      }
      this._viewController = viewController;
      this._viewController.parentViewController = this;
      this._viewController._dialog = this;
      this._viewController.onAttach();
      this._viewController.render(this._selector);
      return this.emit('push', {
        sender: this,
        viewController: viewController
      });
    };

    DialogController.prototype.pop = function() {
      var viewController;
      if (this._viewController == null) {
        return;
      }
      viewController = this._viewController;
      this._viewController = null;
      viewController.onDetach();
      viewController.parentViewController = void 0;
      this.emit('pop', {
        sender: this,
        viewController: viewController
      });
      if (this._backStack.length > 0) {
        this._pushViewController(this._backStack.splice(this._backStack.length - 1, 1)[0]);
      }
      return viewController;
    };

    DialogController.prototype.dismiss = function(animated) {
      if (animated == null) {
        animated = true;
      }
      return this._controller.dismiss(this, animated);
    };

    return DialogController;

  })(EventEmitter);

  this.ledger.dialogs.DialogsController = (function() {
    function DialogsController() {}

    DialogsController.prototype._dialogs = [];

    DialogsController.prototype.initialize = function(selector) {
      this._selector = selector;
      this._selector.css('visibility', 'visible');
      return this._selector.hide();
    };

    DialogsController.prototype.create = function(options) {
      var dialog;
      if (options == null) {
        options = {};
      }
      dialog = new ledger.dialogs.DialogController(this, options);
      return dialog;
    };

    DialogsController.prototype.show = function(dialog) {
      var container;
      dialog._level = this._dialogs.length;
      dialog._id = _.uniqueId();
      if (this._dialogs.length === 0) {
        this._selector.show(0, (function(_this) {
          return function() {
            return _this._selector.addClass('display');
          };
        })(this));
      }
      this._selector.append(JST['common/dialogs/dialog']({
        dialog_id: dialog._id
      }));
      this._selector.find("#dialog_" + dialog._id).on('click', (function(e) {
        return e.preventDefault();
      }));
      if (this._dialogs.length === 0) {
        this._selector.show();
      }
      dialog._containerSelector = this._selector.find("#dialog_container_" + dialog._id);
      if (dialog.isCancellable()) {
        dialog._containerSelector.addClass("clickable");
      }
      dialog._containerSelector.css('opacity', '0.6');
      dialog._containerSelector.animate({
        opacity: 1
      }, 400, 'smooth');
      container = dialog._containerSelector;
      container.addClass('display');
      container.on('click', (function(_this) {
        return function(e) {
          if (!e.isDefaultPrevented() && dialog.isCancellable()) {
            return dialog.dismiss();
          }
        };
      })(this));
      this._dialogs.push(dialog);
      return dialog.render(this._selector.find("#dialog_" + dialog._id), (function(_this) {
        return function() {
          var dialogSelector;
          dialogSelector = _this._selector.find("#dialog_" + dialog._id);
          dialogSelector.css('visibility', 'visible');
          dialogSelector.css('top', (window.innerHeight + dialogSelector.height()) / 2 + 'px');
          dialogSelector.css('opacity', '1');
          return dialogSelector.animate({
            'top': 0,
            'opacity': 1
          }, 500, 'smooth', function() {
            return dialog.onShow();
          });
        };
      })(this));
    };

    DialogsController.prototype.dismiss = function(dialog, animated) {
      var dialogSelector;
      if (animated == null) {
        animated = true;
      }
      if (!dialog.isShown()) {
        return;
      }
      this._dialogs = _.without(this._dialogs, dialog);
      this._selector.find("#dialog_container_" + dialog._id).removeClass('display');
      dialogSelector = this._selector.find("#dialog_" + dialog._id);
      return dialogSelector.animate({
        top: window.innerHeight / 2 + dialogSelector.height() * 0.8,
        opacity: 0.6
      }, (animated ? 400 : 0), (function(_this) {
        return function() {
          _this._selector.find("#dialog_container_" + dialog._id).remove();
          dialog.onDismiss();
          if (_this._dialogs.length === 0) {
            return _this._selector.hide();
          }
        };
      })(this));
    };

    DialogsController.prototype.dismissAll = function(animated) {
      var _results;
      if (animated == null) {
        animated = true;
      }
      if (this._dialogs.length === 0) {
        return;
      }
      _results = [];
      while (this._dialogs.length > 0) {
        _results.push(this._dialogs[this._dialogs.length - 1].dismiss(animated));
      }
      return _results;
    };

    DialogsController.prototype.getAllDialogs = function() {
      return this._dialogs;
    };

    DialogsController.prototype.displayedDialog = function() {
      return this._dialogs[this._dialogs.length - 1];
    };

    return DialogsController;

  })();

  this.ledger.dialogs.manager = new ledger.dialogs.DialogsController();

}).call(this);
