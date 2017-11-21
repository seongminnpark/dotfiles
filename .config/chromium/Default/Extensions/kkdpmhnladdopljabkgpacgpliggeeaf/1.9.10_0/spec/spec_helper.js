(function() {
  var EventReporter, _base, _base1, _restoreChromeStore,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  (_base = this.ledger).specs || (_base.specs = {});

  EventReporter = (function(_super) {
    __extends(EventReporter, _super);

    function EventReporter() {
      this._isJasmineDone = true;
    }

    EventReporter.prototype.promise = function() {
      return (this._defer = ledger.defer()).promise;
    };

    EventReporter.prototype.jasmineStarted = function(result) {
      this._results = [];
      this._isJasmineDone = false;
      return this.emit('jasmine:started');
    };

    EventReporter.prototype.suiteStarted = function(result) {
      this._lastSuite = result;
      return this.emit('suite:started', result);
    };

    EventReporter.prototype.specStarted = function(result) {
      this._lastSpec = result;
      return this.emit('spec:started');
    };

    EventReporter.prototype.specDone = function(result) {
      this._lastSpec = null;
      this._results.push(result);
      return this.emit('spec:done', result);
    };

    EventReporter.prototype.suiteDone = function(result) {
      this._lastSuite = null;
      this._results.push(result);
      return this.emit('suite:done', result);
    };

    EventReporter.prototype.jasmineDone = function() {
      var failed, failures, result;
      this._isJasmineDone = true;
      failures = (function() {
        var _i, _len, _ref, _results;
        _ref = this._results;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          result = _ref[_i];
          if (result.failedExpectations.length > 0) {
            _results.push(result);
          }
        }
        return _results;
      }).call(this);
      failed = failures.length > 0;
      if (failed) {
        this._defer.reject(failures);
      } else {
        this._defer.resolve(this._results);
      }
      this.emit((failed ? 'jasmine:failed' : 'jasmine:succeed'));
      return this.emit('jasmine:done', failed);
    };

    EventReporter.prototype.isJasmineDone = function() {
      return this._isJasmineDone;
    };

    EventReporter.prototype.getLastSuite = function() {
      return this._lastSuite;
    };

    EventReporter.prototype.getLastSpec = function() {
      return this._lastSpec;
    };

    return EventReporter;

  })(this.EventEmitter);

  ledger.specs.renderingNode = $('<div></div>')[0];


  /*
  @param [Array<String>, String] filter Do a && for each word in each string, do a || between strings
   */

  this.ledger.specs.init = function() {
    var d, filters;
    filters = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    d = Q.defer();
    require(ledger.specs.jasmine, (function(_this) {
      return function() {
        var f, word;
        _this.env = jasmine.getEnv();
        if (filters.length > 0) {
          filters = (function() {
            var _i, _len, _ref, _results;
            _ref = _.flatten(filters);
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              f = _ref[_i];
              _results.push((function() {
                var _j, _len1, _ref1, _results1;
                _ref1 = f.split(" ");
                _results1 = [];
                for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                  word = _ref1[_j];
                  _results1.push(word.toLowerCase());
                }
                return _results1;
              })());
            }
            return _results;
          })();
          _this.env.specFilter = _this.filter(filters);
        }
        _this.htmlReporter = new jasmine.HtmlReporter({
          env: _this.env,
          onRaiseExceptionsClick: function() {
            return queryString.setParam("catch", !env.catchingExceptions());
          },
          getContainer: function() {
            return ledger.specs.renderingNode;
          },
          createElement: function() {
            return document.createElement.apply(document, arguments);
          },
          createTextNode: function() {
            return document.createTextNode.apply(document, arguments);
          },
          timer: new jasmine.Timer()
        });
        _this.env.addReporter(_this.htmlReporter);
        _this.env.addReporter(ledger.specs.reporters.events);
        return require(_this.files, function() {
          return ledger.specs.storage.inject(function() {
            _restoreChromeStore();
            return d.resolve();
          });
        });
      };
    })(this));
    return d.promise;
  };

  this.ledger.specs.run = function(routeToResult) {
    var promise;
    if (routeToResult == null) {
      routeToResult = true;
    }
    promise = ledger.specs.reporters.events.promise();
    this.htmlReporter.initialize();
    this.env.execute();
    if (routeToResult) {
      ledger.app.router.go('/specs/result');
    }
    return promise;
  };

  this.ledger.specs.initAndRun = function() {
    var filters;
    filters = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return this.init.apply(this, filters).then((function(_this) {
      return function() {
        return _this.run();
      };
    })(this));
  };

  this.ledger.specs.initAndRunUntilItFails = function() {
    var d, filters, initAndRun;
    filters = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    d = ledger.defer();
    ledger.specs.initAndRunUntilItFails.iteration = 0;
    initAndRun = (function(_this) {
      return function() {
        return _this.init.apply(_this, filters).then(function() {
          return _this.run();
        }).then(function() {
          ledger.specs.initAndRunUntilItFails.iteration += 1;
          return initAndRun();
        });
      };
    })(this);
    initAndRun().fail(function(failures) {
      return d.resolve(failures);
    });
    return d.promise;
  };

  ledger.specs.go = function() {
    return ledger.app.router.go('/specs/index');
  };

  (_base1 = this.ledger.specs).reporters || (_base1.reporters = {});

  this.ledger.specs.reporters.events = new EventReporter();


  /*
  Do a && for each word in each string, do a || between strings
  @param [Array<Array<String>>] filters
   */

  this.ledger.specs.filter = function(filters) {
    return function(spec) {
      var filter, fullName, match, word, _i, _j, _len, _len1;
      fullName = spec.getFullName().toLowerCase();
      for (_i = 0, _len = filters.length; _i < _len; _i++) {
        filter = filters[_i];
        match = true;
        for (_j = 0, _len1 = filter.length; _j < _len1; _j++) {
          word = filter[_j];
          match = fullName.indexOf(word) !== -1;
          if (!match) {
            break;
          }
        }
        if (match) {
          return true;
        }
      }
      return false;
    };
  };


  /*
    Restore original storage implementation
   */

  _restoreChromeStore = function() {
    var intervalID;
    return intervalID = setInterval(function() {
      if (jsApiReporter.status() === 'done') {
        return ledger.specs.storage.restore(function() {
          return clearInterval(intervalID);
        });
      }
    }, 1000);
  };

}).call(this);
