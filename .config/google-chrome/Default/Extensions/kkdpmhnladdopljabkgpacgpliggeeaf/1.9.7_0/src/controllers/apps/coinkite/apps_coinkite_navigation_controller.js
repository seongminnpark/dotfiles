(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.AppsCoinkiteNavigationController = (function(_super) {
    __extends(AppsCoinkiteNavigationController, _super);

    AppsCoinkiteNavigationController.prototype._menuItemBaseUrl = {
      '/apps/coinkite/dashboard/index': '#dashboard-item',
      '/apps/coinkite/key/': '#key-item',
      '/apps/coinkite/sign/': '#cosign-item',
      '/apps/coinkite/settings/': '#settings-item'
    };

    function AppsCoinkiteNavigationController() {
      ledger.application.router.on('routed', (function(_this) {
        return function(event, data) {
          var url;
          url = data.url;
          return _this.updateMenu(url);
        };
      })(this));
    }

    AppsCoinkiteNavigationController.prototype.onAfterRender = function() {
      var url;
      AppsCoinkiteNavigationController.__super__.onAfterRender.apply(this, arguments);
      url = ledger.application.router.currentUrl;
      return this.updateMenu(url);
    };

    AppsCoinkiteNavigationController.prototype.updateMenu = function(url) {
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

    AppsCoinkiteNavigationController.prototype.viewPath = function() {
      return this.assetPath() + "/coinkite";
    };

    AppsCoinkiteNavigationController.prototype.cssPath = function() {
      return this.assetPath() + "/coinkite";
    };

    return AppsCoinkiteNavigationController;

  })(ledger.common.NavigationController);

}).call(this);
