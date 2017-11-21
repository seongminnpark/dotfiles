(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  this.SpecNavigationController = (function(_super) {
    __extends(SpecNavigationController, _super);

    SpecNavigationController.prototype._menuItemBaseUrl = {
      '/specs/index': '#index-item',
      '/specs/result': '#result-item'
    };

    SpecNavigationController.prototype.view = {
      balanceValue: '#balance_value',
      reloadIcon: '#reload_icon',
      currencyContainer: '#currency_container'
    };

    function SpecNavigationController() {
      this._updateReloadIconState = __bind(this._updateReloadIconState, this);
      SpecNavigationController.__super__.constructor.apply(this, arguments);
      ledger.application.router.on('routed', this._onRoutedUrl);
      this._store = new ledger.storage.ChromeStore('specs');
    }

    SpecNavigationController.prototype._onRoutedUrl = function(event, data) {
      var url;
      url = data.url;
      return this.updateMenu(url);
    };

    SpecNavigationController.prototype.renderChild = function() {
      if (window.jasmine != null) {
        return SpecNavigationController.__super__.renderChild.call(this);
      } else {
        return ledger.specs.init().then((function(_this) {
          return function() {
            return SpecNavigationController.__super__.renderChild.call(_this);
          };
        })(this)).done();
      }
    };

    SpecNavigationController.prototype.onAfterRender = function() {
      var url;
      SpecNavigationController.__super__.onAfterRender.apply(this, arguments);
      url = ledger.application.router.currentUrl;
      this.updateMenu(url);
      this._updateReloadIconState();
      return ledger.specs.reporters.events.on('jasmine:started jasmine:done', this._updateReloadIconState);
    };

    SpecNavigationController.prototype.launchSpecs = function() {
      var filters, _ref;
      filters = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (!ledger.specs.reporters.events.isJasmineDone()) {
        return;
      }
      this._store.set({
        lastSpec: filters
      });
      return (_ref = ledger.specs).initAndRun.apply(_ref, filters);
    };

    SpecNavigationController.prototype.runAllSpecs = function() {
      return this.launchSpecs();
    };

    SpecNavigationController.prototype.runLast = function() {
      return this._store.get(['lastSpec'], (function(_this) {
        return function(result) {
          return _this.launchSpecs.apply(_this, result.lastSpec || []);
        };
      })(this));
    };

    SpecNavigationController.prototype.updateMenu = function(url) {
      var baseUrl, color, itemSelector, menuItem, newSelector, previousItem, previousSelector, _ref, _results;
      _ref = this._menuItemBaseUrl;
      _results = [];
      for (baseUrl in _ref) {
        itemSelector = _ref[baseUrl];
        if (_.str.startsWith(url, baseUrl)) {
          menuItem = this.select(itemSelector);
          if (!menuItem.hasClass('selected')) {
            previousItem = this.select('li.selected');
            if (previousItem.length > 0) {
              previousSelector = previousItem.find('.selector');
              color = previousSelector.css('background-color');
              previousItem.removeClass('selected');
              previousSelector.css('background-color', color);
              previousItem.find('.selector').animate({
                bottom: '-10px'
              }, 200, function() {
                previousSelector.css('background-color', '');
                return previousSelector.css('bottom', '0px');
              });
              menuItem.addClass('selected');
              newSelector = menuItem.find('.selector');
              newSelector.css('bottom', '-10px');
              newSelector.animate({
                bottom: '0px'
              }, 200);
            } else {
              menuItem.addClass('selected');
            }
          }
          break;
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    SpecNavigationController.prototype._updateReloadIconState = function() {
      if (!ledger.specs.reporters.events.isJasmineDone()) {
        return this.view.reloadIcon.addClass('spinning');
      } else {
        return this.view.reloadIcon.removeClass('spinning');
      }
    };

    return SpecNavigationController;

  })(ledger.common.NavigationController);

}).call(this);
