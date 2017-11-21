(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletSettingsSectionDialogViewController = (function(_super) {
    var _childrenRenderCount;

    __extends(WalletSettingsSectionDialogViewController, _super);

    function WalletSettingsSectionDialogViewController() {
      return WalletSettingsSectionDialogViewController.__super__.constructor.apply(this, arguments);
    }

    WalletSettingsSectionDialogViewController.prototype.settingViewControllersClasses = [];

    WalletSettingsSectionDialogViewController.prototype._settingViewControllersInstances = {};

    _childrenRenderCount = 0;

    WalletSettingsSectionDialogViewController.prototype.render = function(selector) {
      this.renderedSelector = selector;
      this.onBeforeRender();
      this.emit('beforeRender', {
        sender: this
      });
      return render(this.viewPath(), this, (function(_this) {
        return function(html) {
          var mainNode;
          mainNode = $(html);
          _this.once('children:rendered', function() {
            return _this.setControllerStylesheet(function() {
              selector.empty().append(mainNode);
              _this._isRendered = true;
              _this.onAfterRender();
              return _this.emit('afterRender', {
                sender: _this
              });
            });
          });
          return _this._reloadSettingViewControllers(mainNode);
        };
      })(this));
    };

    WalletSettingsSectionDialogViewController.prototype.openOtherSettings = function() {
      return this.getDialog().pop();
    };

    WalletSettingsSectionDialogViewController.prototype.identifier = function() {
      return this.className().replace('SectionDialogViewController', '');
    };

    WalletSettingsSectionDialogViewController.prototype.onDetach = function() {
      WalletSettingsSectionDialogViewController.__super__.onDetach.apply(this, arguments);
      return this._killSettingViewControllers();
    };

    WalletSettingsSectionDialogViewController.prototype.handleAction = function(actionName, params) {
      var key, value, _ref;
      _ref = this._settingViewControllersInstances;
      for (key in _ref) {
        value = _ref[key];
        if (value.handleAction(actionName, params) === true) {
          return true;
        }
      }
      return WalletSettingsSectionDialogViewController.__super__.handleAction.call(this, actionName, params);
    };

    WalletSettingsSectionDialogViewController.prototype._killSettingViewControllers = function() {
      var key, value, _ref;
      _ref = this._settingViewControllersInstances;
      for (key in _ref) {
        value = _ref[key];
        value.parentViewController = void 0;
        value.onDetach();
      }
      return this._settingViewControllersInstances = {};
    };

    WalletSettingsSectionDialogViewController.prototype._reloadSettingViewControllers = function(mainNode) {
      var className, instance, renderNode, _i, _len, _ref, _results;
      this._killSettingViewControllers();
      this._childrenRenderCount = 0;
      _ref = this.settingViewControllersClasses;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        className = _ref[_i];
        if (className == null) {
          continue;
        }
        instance = new className;
        renderNode = mainNode.find(instance.renderSelector);
        if (renderNode == null) {
          continue;
        }
        this._settingViewControllersInstances[className] = instance;
        instance.parentViewController = this;
        instance.onAttach();
        instance.render(renderNode);
        _results.push(instance.once('afterRender', this._childrenRenderCallback.bind(this)));
      }
      return _results;
    };

    WalletSettingsSectionDialogViewController.prototype._childrenRenderCallback = function() {
      this._childrenRenderCount++;
      if (this._childrenRenderCount >= this.settingViewControllersClasses.length) {
        return this.emit('children:rendered');
      }
    };

    return WalletSettingsSectionDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
