(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (this.ledger == null) {
    this.ledger = {};
  }

  if (ledger.common == null) {
    ledger.common = {};
  }


  /*
    View controllers are the bridge between models and view. They are responsible of fetching data and injecting them in views.
    View controllers are automatically bound to an eco HTML template depending of the class name. For example an instance of
    'NamespaceHereFoxyViewController' will render the template located at 'views/namespace/here/foxy.eco'.
  
    @example How to use the view property of view controller
      class MyFoxyViewController extends ViewController
        view:
          foxyButton: "#foxy_button"
          foxyInput: "#foxy_input"
  
        onAfterRender: ->
          super
          @view.foxyButton.on 'click', =>
            foxyValue = foxyInput.val()
            ... Do something with the value ...
   */

  ledger.common.ViewController = (function(_super) {
    __extends(ViewController, _super);

    ViewController.prototype.renderedSelector = void 0;

    ViewController.prototype.parentViewController = void 0;


    /*
      A hash of view selectors that will be selected after the view render. (See the example in the class description)
     */

    ViewController.prototype.view = {};

    function ViewController(params, routedUrl) {
      var key, value;
      if (params == null) {
        params = {};
      }
      if (routedUrl == null) {
        routedUrl = "";
      }
      this.params = _.defaults(params, this.defaultParams);
      this.routedUrl = routedUrl;
      this._isRendered = false;
      for (key in this) {
        value = this[key];
        if (_.isFunction(value) && value !== this.constructor) {
          this[key] = value.bind(this);
        }
      }
      this.initialize();
    }

    ViewController.prototype.initialize = function() {};


    /*
      Selects elements in the controller node with {http://api.jquery.com/category/selectors/ jQuery selector}
    
      @return [jQuery.Element] The result of the selector
     */

    ViewController.prototype.select = function(selectorString) {
      return $(this.renderedSelector).find(selectorString);
    };

    ViewController.prototype.render = function(selector) {
      this.renderedSelector = selector;
      this.onBeforeRender();
      this.emit('beforeRender', {
        sender: this
      });
      return render(this.viewPath(), this, (function(_this) {
        return function(html) {
          return _this.setControllerStylesheet(function() {
            selector.html(html);
            _this._isRendered = true;
            _this.onAfterRender();
            return _this.emit('afterRender', {
              sender: _this
            });
          });
        };
      })(this));
    };

    ViewController.prototype.rerender = function() {
      if (this.renderedSelector == null) {
        return;
      }
      return this.render(this.renderedSelector);
    };

    ViewController.prototype.className = function() {
      return this.constructor.name;
    };

    ViewController.prototype.identifier = function() {
      return this.className().replace('ViewController', '');
    };

    ViewController.prototype.assetPath = function() {
      var finalName, segment, segments, _i, _len;
      finalName = '';
      segments = _.string.underscored(this.identifier()).split('_');
      for (_i = 0, _len = segments.length; _i < _len; _i++) {
        segment = segments[_i];
        finalName += '/' + segment;
      }
      return finalName;
    };

    ViewController.prototype.viewPath = function() {
      return this.assetPath();
    };

    ViewController.prototype.cssPath = function() {
      return this.assetPath();
    };

    ViewController.prototype.representativeUrl = function() {
      return ledger.url.createUrlWithParams(this.routedUrl.parseAsUrl().pathname, this.params);
    };

    ViewController.prototype.handleAction = function(actionName, params) {
      if ((this[actionName] != null) && _.isFunction(this[actionName])) {
        this[actionName](params);
        return true;
      }
      return false;
    };

    ViewController.prototype.setControllerStylesheet = function(callback) {
      var currentHref, el, selector;
      if (this.stylesheetIdentifier() == null) {
        if (typeof callback === "function") {
          callback();
        }
        return;
      }
      el = null;
      selector = $("link[id='" + (this.stylesheetIdentifier()) + "']");
      if (selector.length > 0) {
        currentHref = selector.attr('href');
        if ((currentHref != null) && ledger.isProd) {
          currentHref = currentHref.substr(0, currentHref.indexOf('?') !== -1 ? currentHref.indexOf('?') : currentHref.length);
          if (currentHref === ("../assets/css/" + (this.cssPath()) + ".css")) {
            return typeof callback === "function" ? callback() : void 0;
          }
        }
        selector.attr('href', '../assets/css/' + this.cssPath() + '.css?' + (new Date()).getTime());
        el = selector[0];
      } else {
        el = $("<link id='" + (this.stylesheetIdentifier()) + "' href='../assets/css/" + (this.cssPath()) + ".css?" + (new Date().getTime()) + "' rel='stylesheet'>");
        $("head").append(el);
      }
      return _.defer((function(_this) {
        return function() {
          return typeof callback === "function" ? callback() : void 0;
        };
      })(this));
    };

    ViewController.prototype.stylesheetIdentifier = function() {
      return "view_controller_style";
    };

    ViewController.prototype.onBeforeRender = function() {};

    ViewController.prototype.onAfterRender = function() {
      var key, value, view, _results;
      view = this.view;
      this.view = {};
      _results = [];
      for (key in view) {
        value = view[key];
        if (value == null) {
          continue;
        }
        _results.push(this.view[key] = value.selector != null ? $(value.selector) : this.select(value));
      }
      return _results;
    };

    ViewController.prototype.onAttach = function() {};

    ViewController.prototype.onDetach = function() {};

    ViewController.prototype.isRendered = function() {
      return this._isRendered;
    };

    return ViewController;

  })(this.EventEmitter);

}).call(this);
