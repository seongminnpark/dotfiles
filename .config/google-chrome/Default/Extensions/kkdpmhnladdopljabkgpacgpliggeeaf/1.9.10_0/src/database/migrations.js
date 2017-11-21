(function() {
  var migrate_from_1_0_3_x_to_1_4_x, migrations;

  if (ledger.database == null) {
    ledger.database = {};
  }

  migrations = _;

  ledger.database.MigrationHandler = (function() {
    function MigrationHandler(context) {
      var migration, versionMatcherToRegex;
      this.context = context;
      versionMatcherToRegex = function(versionMatcher) {
        if (_.isRegExp(versionMatcher)) {
          return versionMatcher;
        } else if (!versionMatcher || versionMatcher === 'unknown' || versionMatcher === '*') {
          return /.*/;
        } else {
          return new RegExp("^" + versionMatcher.replace(/\./g, '\\.').replace(/\*/g, '.*') + "$");
        }
      };
      this._migrations = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = migrations.length; _i < _len; _i++) {
          migration = migrations[_i];
          _results.push({
            from: versionMatcherToRegex(migration.from),
            to: versionMatcherToRegex(migration.to),
            apply: migration.apply
          });
        }
        return _results;
      })();
    }

    MigrationHandler.prototype.applyMigrations = function() {
      var configurationVersion, manifestVersion;
      configurationVersion = Configuration.getInstance(this.context).getCurrentApplicationVersion();
      if (configurationVersion == null) {
        configurationVersion = 'unknown';
      }
      manifestVersion = chrome.runtime.getManifest().version;
      this.performMigrations(configurationVersion, manifestVersion);
      return Configuration.getInstance(this.context).setCurrentApplicationVersion(manifestVersion);
    };

    MigrationHandler.prototype.performMigrations = function(fromVersion, toVersion) {
      var migration, _i, _len, _ref, _results;
      _ref = this._migrations;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        migration = _ref[_i];
        if (fromVersion.match(migration.from) && toVersion.match(migration.to)) {
          _results.push(migration.apply(this.context));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    return MigrationHandler;

  })();

  migrations = [
    {
      from: '1.[0-3].[0-5]',
      to: '1.3.*',
      apply: function(context) {
        return migrate_from_1_0_3_x_to_1_4_x(context);
      }
    }
  ];

  migrate_from_1_0_3_x_to_1_4_x = function(context) {
    var Model, account, collection, object, operation, _i, _j, _len, _len1, _ref, _ref1, _results;
    if ((account = Account.findById(0, context)) != null) {
      _ref = Operation.all(context);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        operation = _ref[_i];
        operation.set('account', account).save();
      }
      account.set('wallet', Wallet.findById(1, context)).save();
    }
    _ref1 = ledger.database.Model.AllModelClasses();
    _results = [];
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      Model = _ref1[_j];
      if (Model.hasSynchronizedProperties()) {
        collection = context.getCollection(Model.getCollectionName());
        _results.push((function() {
          var _k, _len2, _ref2, _results1;
          _ref2 = Model.all(context);
          _results1 = [];
          for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
            object = _ref2[_k];
            _results1.push(collection.updateSynchronizedProperties(object));
          }
          return _results1;
        })());
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

}).call(this);
