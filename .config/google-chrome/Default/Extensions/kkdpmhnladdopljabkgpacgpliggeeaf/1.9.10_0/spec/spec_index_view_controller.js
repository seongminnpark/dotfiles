(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.SpecIndexViewController = (function(_super) {
    __extends(SpecIndexViewController, _super);

    function SpecIndexViewController() {
      return SpecIndexViewController.__super__.constructor.apply(this, arguments);
    }

    SpecIndexViewController.prototype.view = {
      filter: '#filter',
      suitesTree: '#suites_tree'
    };

    SpecIndexViewController.prototype.initialize = function() {
      SpecIndexViewController.__super__.initialize.apply(this, arguments);
      this._selectedSpecs = [];
      return this.renderSuitesNodes = _.debounce(this.renderSuitesNodes, 200);
    };

    SpecIndexViewController.prototype.onBeforeRender = function() {
      SpecIndexViewController.__super__.onBeforeRender.apply(this, arguments);
      return this.topSuite = jasmine.getEnv().topSuite();
    };

    SpecIndexViewController.prototype.onAfterRender = function() {
      SpecIndexViewController.__super__.onAfterRender.apply(this, arguments);
      this._renderSuitesNodes();
      return this.view.filter.on('input', this.renderSuitesNodes);
    };

    SpecIndexViewController.prototype.renderSuitesNodes = function() {
      return this._renderSuitesNodes();
    };

    SpecIndexViewController.prototype._renderSuitesNodes = function() {
      var filter, filteredResult;
      filter = this.view.filter.val();
      filteredResult = this._filterSpecs(filter, this.topSuite) || {
        children: []
      };
      return this._renderNode(filteredResult).then((function(_this) {
        return function(html) {
          return _this.view.suitesTree.html(html);
        };
      })(this));
    };

    SpecIndexViewController.prototype.runSpec = function(_arg) {
      var id, _ref;
      id = _arg.id;
      return this.parentViewController.launchSpecs((_ref = this._findSpecById(id)) != null ? _ref.getFullName() : void 0);
    };

    SpecIndexViewController.prototype.runSelectedSpecs = function() {
      var filters, selectedSpec, _ref;
      filters = (function() {
        var _i, _len, _ref, _results;
        _ref = this._selectedSpecs;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          selectedSpec = _ref[_i];
          _results.push(this._findSpecById(selectedSpec).getFullName());
        }
        return _results;
      }).call(this);
      return (_ref = this.parentViewController).launchSpecs.apply(_ref, filters);
    };

    SpecIndexViewController.prototype._findSpecById = function(id) {
      var findSpecByIdInNode;
      findSpecByIdInNode = function(node) {
        var child, n, _i, _len, _ref;
        if (node.id === id) {
          return node;
        }
        if (node.children == null) {
          return null;
        }
        _ref = node.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          n = findSpecByIdInNode(child, id);
          if (n != null) {
            return n;
          }
        }
      };
      return findSpecByIdInNode(this.topSuite);
    };

    SpecIndexViewController.prototype.toggleSpec = function(_arg) {
      var id;
      id = _arg.id;
      if (_.contains(this._selectedSpecs, id)) {
        return this._selectedSpecs = _.without(this._selectedSpecs, id);
      } else {
        this._selectedSpecs.push(id);
        return this._selectedSpecs = _.uniq(this._selectedSpecs);
      }
    };

    SpecIndexViewController.prototype._filterSpecs = function(filter, root) {
      var child, node, words, _ref;
      if (_.isString(filter) && _.isEmpty(filter)) {
        return root;
      }
      if ((filter != null ? filter.regexp : void 0) == null) {
        words = _.str.clean(filter).split(/\s+/);
        filter = {
          regexp: new RegExp(words.join('|'), 'ig'),
          requiredMatch: words.length
        };
      }
      if (((_ref = root.description.match(filter.regexp)) != null ? _ref.length : void 0) === filter.requiredMatch) {
        return root;
      } else if (root.children != null) {
        node = _.clone(root);
        node.children = _.compact((function() {
          var _i, _len, _ref1, _results;
          _ref1 = root.children;
          _results = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            child = _ref1[_i];
            _results.push(this._filterSpecs(filter, child));
          }
          return _results;
        }).call(this));
        if (node.children.length === 0) {
          return null;
        } else {
          return node;
        }
      } else {
        return null;
      }
    };

    SpecIndexViewController.prototype._renderNode = function(node, depth) {
      var d, onSelfRender;
      if (depth == null) {
        depth = -1;
      }
      d = ledger.defer();
      onSelfRender = (function(_this) {
        return function(html) {
          var child;
          if ((node.children == null) || node.children.length === 0) {
            d.resolve(html);
          }
          return Q.all((function() {
            var _i, _len, _ref, _results;
            _ref = node.children;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              child = _ref[_i];
              _results.push(this._renderNode(child, depth + 1));
            }
            return _results;
          }).call(_this)).then(function(htmls) {
            return d.resolve(html + htmls.join(''));
          }).done();
        };
      })(this);
      if (depth === -1) {
        onSelfRender('');
      } else {
        this._renderPartial(node, depth).then(onSelfRender);
      }
      return d.promise;
    };

    SpecIndexViewController.prototype._renderPartial = function(node, depth) {
      var d, data;
      d = ledger.defer();
      data = {
        id: node.id,
        name: node.description,
        depth: depth,
        isSuite: node.constructor.name === 'Suite',
        isSelected: _.contains(this._selectedSpecs, node.id)
      };
      render('spec/_suite_node', data, function(html) {
        return d.resolve(html);
      });
      return d.promise;
    };

    return SpecIndexViewController;

  })(ledger.specs.ViewController);

}).call(this);
