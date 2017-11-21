(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ledger.common.NavigationController = (function(_super) {
    __extends(NavigationController, _super);

    function NavigationController() {
      return NavigationController.__super__.constructor.apply(this, arguments);
    }

    NavigationController.prototype._historyLength = 1;

    NavigationController.prototype.viewControllers = [];

    NavigationController.prototype.childViewControllerContentId = 'navigation_controller_content';

    NavigationController.prototype.push = function(viewController) {
      if (this.topViewController() != null) {
        this.topViewController().onDetach();
        this.topViewController().parentViewController = void 0;
      }
      if (this.viewControllers.length >= this._historyLength) {
        this.viewControllers.splice(0, 1);
      }
      this.viewControllers.push(viewController);
      viewController.parentViewController = this;
      viewController.onAttach();
      this.renderChild();
      return this.emit('push', {
        sender: this,
        viewController: viewController
      });
    };

    NavigationController.prototype.pop = function() {
      var viewController;
      viewController = this.viewControllers.pop();
      viewController.onDetach();
      viewController.parentViewController = void 0;
      if (this.topViewController() != null) {
        this.topViewController().parentViewController = this;
        this.topViewController().onAttach();
      }
      this.renderChild();
      this.emit('pop', {
        sender: this,
        viewController: viewController
      });
      return viewController;
    };

    NavigationController.prototype.identifier = function() {
      return this.className().replace('NavigationController', '');
    };

    NavigationController.prototype.viewPath = function() {
      return this.assetPath() + this.assetPath();
    };

    NavigationController.prototype.cssPath = function() {
      return this.assetPath() + this.assetPath();
    };

    NavigationController.prototype.render = function(selector) {
      this.renderedSelector = selector;
      this.onBeforeRender();
      this.emit('beforeRender', this);
      return render(this.viewPath(), this, (function(_this) {
        return function(html) {
          return _this.setControllerStylesheet(function() {
            selector.html(html);
            _this.renderChild();
            _this.onAfterRender();
            return _this.emit('afterRender', _this);
          });
        };
      })(this));
    };

    NavigationController.prototype.topViewController = function() {
      return this.viewControllers[this.viewControllers.length - 1];
    };

    NavigationController.prototype.stylesheetIdentifier = function() {
      return "navigation_controller_style";
    };

    NavigationController.prototype.renderChild = function() {
      if (this.viewControllers.length === 0 || (this.renderedSelector == null)) {
        return;
      }
      return this.topViewController().render($('#' + this.childViewControllerContentId));
    };

    NavigationController.prototype.handleAction = function(actionName, params) {
      var _ref;
      if (!NavigationController.__super__.handleAction.apply(this, arguments)) {
        return (_ref = this.topViewController()) != null ? _ref.handleAction(actionName, params) : void 0;
      }
      return true;
    };

    return NavigationController;

  })(ledger.common.ViewController);

}).call(this);
