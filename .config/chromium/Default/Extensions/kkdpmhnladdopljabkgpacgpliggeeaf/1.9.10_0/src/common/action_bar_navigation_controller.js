
/*
  ActionBarViewController holds an action bar containing actions buttons and breadcrumbs declared by its child.
 */

(function() {
  var Action, BreadcrumbPart,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ledger.common.ActionBarNavigationController = (function(_super) {
    __extends(ActionBarNavigationController, _super);

    function ActionBarNavigationController() {
      return ActionBarNavigationController.__super__.constructor.apply(this, arguments);
    }

    ActionBarNavigationController.prototype.push = function(viewController) {
      ActionBarNavigationController.__super__.push.call(this, viewController);
      return this.updateActionBar();
    };

    ActionBarNavigationController.prototype.onAfterRender = function() {
      ActionBarNavigationController.__super__.onAfterRender.apply(this, arguments);
      return this.updateActionBar();
    };

    ActionBarNavigationController.prototype.updateActionBar = function() {
      var action, actionBar, breadcrumbPart, declaration, icon, title, url, _i, _j, _len, _len1, _ref, _ref1;
      if (this.topViewController().getActionBarDeclaration == null) {
        this.getActionBar().hide();
        return;
      }
      this.getActionBar().show();
      declaration = this.topViewController().getActionBarDeclaration();
      actionBar = this.getActionBar().edit();
      actionBar.clearAll();
      _ref = declaration.actions;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        action = _ref[_i];
        title = action.title, icon = action.icon, url = action.url;
        actionBar.addAction(title, icon, url);
      }
      _ref1 = declaration.breadcrumb;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        breadcrumbPart = _ref1[_j];
        title = breadcrumbPart.title, url = breadcrumbPart.url;
        actionBar.addBreadcrumbPart(title, url);
      }
      return actionBar.commit();
    };

    ActionBarNavigationController.prototype.getActionBar = function() {
      return this._actionBar || (this._actionBar = new this.constructor.ActionBar(this.getActionBarDrawer()));
    };

    ActionBarNavigationController.prototype.getActionBarDrawer = function() {
      return null;
    };

    return ActionBarNavigationController;

  })(ledger.common.NavigationController);

  Action = (function() {
    function Action(actionBar, title, icon, url) {
      this.actionBar = actionBar;
      this.title = title;
      this.icon = icon;
      this.url = url;
    }

    Action.prototype.remove = function() {
      return this.actionBar.removeAction(this);
    };

    return Action;

  })();

  BreadcrumbPart = (function() {
    function BreadcrumbPart(actionBar, title, url) {
      this.actionBar = actionBar;
      this.title = title;
      this.url = url;
    }

    BreadcrumbPart.prototype.remove = function() {
      return this.actionBar.removeBreadcrumbPart(this);
    };

    return BreadcrumbPart;

  })();


  /*
    ActionBar interface for managing actions and breadcrumbs
   */

  ledger.common.ActionBarNavigationController.ActionBar = (function() {
    function ActionBar(drawer) {
      this._isInEditMode = false;
      this._actions = [];
      this._breadcrumb = [];
      this._drawer = drawer;
      this._invalidate = this._invalidate.bind(this);
    }


    /*
      Create a new action and insert it in the action bar
     */

    ActionBar.prototype.addAction = function(title, icon, url, position) {
      var action;
      if (position == null) {
        position = -1;
      }
      action = new Action(this, title, icon, url);
      if (position !== -1) {
        this._actions = this._actions.slice(0, position).concat([action]).concat(this._actions.slice(position));
      } else {
        this._actions.push(action);
      }
      return this.invalidate();
    };

    ActionBar.prototype.addBreadcrumbPart = function(title, url, position) {
      var part;
      if (position == null) {
        position = -1;
      }
      part = new BreadcrumbPart(this, title, url);
      if (position !== -1) {
        this._breadcrumb = this._breadcrumb.slice(0, position).concat([part]).concat(this._breadcrumb.slice(position));
      } else {
        this._breadcrumb.push(part);
      }
      return this.invalidate();
    };

    ActionBar.prototype.removeAction = function(action) {
      this._actions = _(this._actions).without(action);
      return this.invalidate();
    };

    ActionBar.prototype.removeBreadcrumbPart = function(part) {
      this._breadcrumb = _(this._breadcrumb).without(part);
      return this.invalidate();
    };

    ActionBar.prototype.getActions = function() {
      return this._actions;
    };

    ActionBar.prototype.getBreadcrumb = function() {
      return this._breadcrumb;
    };

    ActionBar.prototype.clearAll = function() {
      this.clearActions();
      this.clearBreadcrumb();
      return this.invalidate();
    };

    ActionBar.prototype.clearActions = function() {
      this._actions = [];
      this.invalidate();
      return this;
    };

    ActionBar.prototype.clearBreadcrumb = function() {
      this._breadcrumb = [];
      this.invalidate();
      return this;
    };

    ActionBar.prototype.invalidate = function() {
      if (this._invalidateTimeout != null) {
        clearTimeout(this._invalidateTimeout);
      }
      if (!this._isInEditMode) {
        this._invalidateTimeout = _.defer(this._invalidate);
      }
      return this;
    };

    ActionBar.prototype._invalidate = function() {
      var _ref;
      return (_ref = this._drawer) != null ? _ref.draw(this._breadcrumb, this._actions) : void 0;
    };

    ActionBar.prototype.edit = function() {
      this._isInEditMode = true;
      return this.invalidate();
    };

    ActionBar.prototype.commit = function() {
      this._isInEditMode = false;
      this._invalidate();
      return this;
    };

    ActionBar.prototype.hide = function() {};

    ActionBar.prototype.show = function() {};

    return ActionBar;

  })();

  ledger.common.ActionBarNavigationController.ActionBar.Drawer = (function() {
    function Drawer() {
      this._breadcrumbNodes = [];
      this._actionsNodes = [];
    }

    Drawer.prototype.createBreadcrumbPartView = function(title, url, position, length) {
      return null;
    };

    Drawer.prototype.createBreadcrumbSeparatorView = function(position) {
      return null;
    };

    Drawer.prototype.createActionView = function(title, icon, url, position, length) {
      return null;
    };

    Drawer.prototype.createActionSeparatorView = function(position) {
      return null;
    };

    Drawer.prototype.getActionBarHolderView = function() {
      return null;
    };

    Drawer.prototype.getBreadCrumbHolderView = function() {
      return null;
    };

    Drawer.prototype.getActionsHolderView = function() {
      return null;
    };

    Drawer.prototype.draw = function(breadcrumb, actions) {
      var action, actionNode, breadcrumbNode, breadcrumbPart, index, node, separatorNode, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
      _ref = this._breadcrumbNodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        breadcrumbNode = _ref[_i];
        breadcrumbNode.remove();
      }
      _ref1 = this._actionsNodes;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        actionNode = _ref1[_j];
        actionNode.remove();
      }
      this._breadcrumbNodes = [];
      this._actionsNodes = [];
      for (index = _k = 0, _len2 = breadcrumb.length; _k < _len2; index = ++_k) {
        breadcrumbPart = breadcrumb[index];
        if (index > 0) {
          separatorNode = this.createBreadcrumbSeparatorView(index);
          if (separatorNode != null) {
            this._breadcrumbNodes.push(separatorNode);
            if ((_ref2 = this.getBreadCrumbHolderView()) != null) {
              _ref2.append(separatorNode);
            }
          }
        }
        node = this.createBreadcrumbPartView(breadcrumbPart.title, breadcrumbPart.url, index, breadcrumb.length);
        if (node != null) {
          this._breadcrumbNodes.push(node);
          if ((_ref3 = this.getBreadCrumbHolderView()) != null) {
            _ref3.append(node);
          }
        }
      }
      for (index = _l = 0, _len3 = actions.length; _l < _len3; index = ++_l) {
        action = actions[index];
        if (index > 0) {
          separatorNode = this.createActionSeparatorView(index);
          if (separatorNode != null) {
            this._actionsNodes.push(separatorNode);
            if ((_ref4 = this.getActionsHolderView()) != null) {
              _ref4.append(separatorNode);
            }
          }
        }
        node = this.createActionView(action.title, action.icon, action.url, index, actions.length);
        if (node != null) {
          this._actionsNodes.push(node);
          if ((_ref5 = this.getActionsHolderView()) != null) {
            _ref5.append(node);
          }
        }
      }
    };

    Drawer.prototype.hide = function() {};

    return Drawer;

  })();

}).call(this);
