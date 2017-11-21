(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.Router = (function(_super) {
    __extends(Router, _super);

    Router.prototype.currentUrl = null;

    function Router(app) {
      this._logger = new ledger.utils.Logger("Router");
      this._router = crossroads.create();
      this._router.normalizeFn = crossroads.NORM_AS_OBJECT;
      this._router.ignoreState = true;
      this._router.routed.add((function(_this) {
        return function(url, data) {
          var oldUrl;
          oldUrl = _this.currentUrl;
          _this.currentUrl = url;
          return _this.emit('routed', {
            oldUrl: oldUrl,
            url: url,
            data: data
          });
        };
      })(this));
      this._router.bypassed.add((function(_this) {
        return function(url, data) {
          e("No route found for " + url);
          return _this.emit('bypassed', {
            url: url,
            data: data
          });
        };
      })(this));
      declareRoutes(this._addRoute.bind(this), app);
    }

    Router.prototype.go = function(url, params) {
      return setTimeout((function(_this) {
        return function() {
          var loggableUrl, paramsIndex, path;
          path = url.parseAsUrl().pathname;
          loggableUrl = url;
          paramsIndex = loggableUrl.indexOf('?');
          if (paramsIndex !== -1) {
            loggableUrl = loggableUrl.substr(0, paramsIndex);
          }
          _this._logger.info("Routing to [" + loggableUrl + "]");
          if ((ledger.app.dongle != null) || ledger.router.pluggedWalletRoutesExceptions.indexOf(path) !== -1 || ((ledger.router.ignorePluggedWalletForRouting != null) && ledger.router.ignorePluggedWalletForRouting === true)) {
            url = ledger.url.createUrlWithParams(url, params);
            return _this._router.parse(url);
          }
        };
      })(this), 0);
    };

    Router.prototype._addRoute = function(url, callback) {
      var route;
      route = this._router.addRoute(url + ':?params::#action::?params:');
      return route.matched.add(callback.bind(route));
    };

    return Router;

  })(this.EventEmitter);

}).call(this);
