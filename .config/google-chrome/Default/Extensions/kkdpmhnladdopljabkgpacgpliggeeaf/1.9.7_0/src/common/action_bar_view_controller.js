
/*
  ActionBarViewControllers are able to declare actions and breadcrumbs in their parent navigation controller action bar.
 */

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ledger.common.ActionBarViewController = (function(_super) {
    __extends(ActionBarViewController, _super);

    function ActionBarViewController() {
      return ActionBarViewController.__super__.constructor.apply(this, arguments);
    }

    ActionBarViewController.prototype.breadcrumb = void 0;

    ActionBarViewController.prototype.actions = void 0;

    ActionBarViewController.prototype.getActionBarDeclaration = function() {
      var ModelClass, actions, breadcrumb, i, ids, index, instance, j, modelNames, models, part, parts, previousPart, title, url, _i, _len;
      breadcrumb = this.breadcrumb || [];
      actions = _.clone(this.actions) || [];
      url = this.routedUrl || '';
      models = ledger.database.Model.AllModelClasses();
      modelNames = _(_(models).chain().keys().map(function(i) {
        return _.str.underscored(_.pluralize(i)).toLowerCase();
      }).value());
      if (this.breadcrumb == null) {
        parts = (function() {
          var _i, _len, _ref, _results;
          _ref = url.match(/\/\w+/g);
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            i = _ref[_i];
            _results.push(i.slice(1));
          }
          return _results;
        })();
        ids = _([]);
        for (index = _i = 0, _len = parts.length; _i < _len; index = ++_i) {
          part = parts[index];
          title = null;
          url = null;
          previousPart = parts[index - 1];
          if ((previousPart != null) && (parts[index + 1] != null) && modelNames.contains(previousPart)) {
            ModelClass = models[_.str.capitalize(_.str.camelize(_.singularize(previousPart)))];
            instance = ModelClass.findById(_.isNaN(+part) ? part : +part);
            if (instance != null) {
              title = instance.get('name') || instance.get('title') || instance.get('label');
              ids.push(index);
            }
          }
          if (title == null) {
            title = t(("" + parts[0] + ".breadcrumb") + ((function() {
              var _j, _len1, _ref, _results;
              _ref = parts.slice(1, index + 1);
              _results = [];
              for (j = _j = 0, _len1 = _ref.length; _j < _len1; j = ++_j) {
                i = _ref[j];
                if (!ids.contains(j + 1)) {
                  _results.push('.' + i);
                }
              }
              return _results;
            })()).join(''));
          }
          url = '/' + ((function() {
            var _j, _len1, _ref, _results;
            _ref = parts.slice(0, index + 1);
            _results = [];
            for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
              i = _ref[_j];
              _results.push(i);
            }
            return _results;
          })()).join('/');
          if (index !== 0) {
            breadcrumb.push({
              title: title,
              url: url
            });
          }
        }
      }
      return {
        breadcrumb: breadcrumb,
        actions: actions
      };
    };

    return ActionBarViewController;

  })(ledger.common.ViewController);

}).call(this);
