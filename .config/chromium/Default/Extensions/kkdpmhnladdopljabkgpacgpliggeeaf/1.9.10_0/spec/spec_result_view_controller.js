(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.SpecResultViewController = (function(_super) {
    __extends(SpecResultViewController, _super);

    function SpecResultViewController() {
      return SpecResultViewController.__super__.constructor.apply(this, arguments);
    }

    SpecResultViewController.prototype.view = {
      content: '#jasmine-container',
      currentSuiteName: '#current_suite_name',
      currentSpecName: '#current_spec_name'
    };

    SpecResultViewController.prototype.onAfterRender = function() {
      var _ref;
      SpecResultViewController.__super__.onAfterRender.apply(this, arguments);
      this.refreshView();
      if ((_ref = this._observer) != null) {
        _ref.disconnect();
      }
      this._observer = new MutationObserver(this.refreshView);
      this._observer.observe(ledger.specs.renderingNode, {
        attributes: true,
        childList: true,
        characterData: true,
        subtree: true
      });
      return ledger.specs.reporters.events.on('spec:started suite:started jasmine:done', this.refreshHeader);
    };

    SpecResultViewController.prototype.refreshView = function() {
      var reporter;
      this.view.content.html($(ledger.specs.renderingNode).html());
      reporter = this.select('.jasmine_html-reporter');
      reporter.css('background-color', 'transparent');
      return reporter.find('.banner').remove();
    };

    SpecResultViewController.prototype.refreshHeader = function() {
      var _ref, _ref1;
      this.view.currentSuiteName.text(((_ref = ledger.specs.reporters.events.getLastSuite()) != null ? _ref.description : void 0) || "Done!");
      return this.view.currentSpecName.text(" " + (((_ref1 = ledger.specs.reporters.events.getLastSpec()) != null ? _ref1.description : void 0) || ""));
    };

    SpecResultViewController.prototype.onDetach = function() {
      var _ref;
      SpecResultViewController.__super__.onDetach.apply(this, arguments);
      if ((_ref = this._observer) != null) {
        _ref.disconnect();
      }
      this._observer = null;
      return ledger.specs.reporters.events.off('spec:started suite:started', this.refreshHeader);
    };

    return SpecResultViewController;

  })(ledger.specs.ViewController);

}).call(this);
