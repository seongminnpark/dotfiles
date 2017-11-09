(function() {
  var logger, _base;

  if ((_base = this.ledger).wallet == null) {
    _base.wallet = {};
  }

  logger = function() {
    return ledger.utils.Logger.getLoggerByTag("WalletLayout");
  };

  ledger.wallet.Wallet = (function() {
    function Wallet() {}

    Wallet.prototype.getAccount = function(accountIndex) {
      return this._accounts[accountIndex];
    };

    Wallet.prototype.getAccountFromDerivationPath = function(derivationPath) {
      return this._getAccountFromDerivationPath(derivationPath, this.getAccount);
    };

    Wallet.prototype.getOrCreateAccountFromDerivationPath = function(derivationPath) {
      return this._getAccountFromDerivationPath(derivationPath, this.getOrCreateAccount);
    };

    Wallet.prototype._getAccountFromDerivationPath = function(derivationPath, getter) {
      var account, accountIndex, match, __, _i, _len, _ref;
      if (derivationPath == null) {
        return null;
      }
      account = null;
      if (match = derivationPath.match("" + (this.getRootDerivationPath()) + "/(\\d+)'/(0|1)/(\\d+)")) {
        __ = match[0], accountIndex = match[1];
        account = getter.call(this, +accountIndex);
      }
      if (account != null) {
        return account;
      }
      _ref = this._accounts;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        account = _ref[_i];
        if (_.contains(account.getAllChangeAddressesPaths(), derivationPath)) {
          return account;
        }
        if (_.contains(account.getAllPublicAddressesPaths(), derivationPath)) {
          return account;
        }
      }
    };

    Wallet.prototype.getAccountFromAddress = function(address) {
      var _ref;
      return this.getAccountFromDerivationPath((_ref = this.cache) != null ? _ref.getDerivationPath(address) : void 0);
    };

    Wallet.prototype.createAccount = function(id) {
      var account;
      if (id == null) {
        id = void 0;
      }
      account = new ledger.wallet.Wallet.Account(this, id || this.getNextAccountIndex(), this._store);
      ledger.tasks.AddressDerivationTask.instance.registerExtendedPublicKeyForPath(account.getRootDerivationPath(), _.noop);
      this._accounts.push(account);
      this.save();
      return account;
    };

    Wallet.prototype.getOrCreateAccount = function(id) {
      if (this.getAccount(id)) {
        return this.getAccount(id);
      }
      return this.createAccount(id);
    };

    Wallet.prototype.getNextAccountIndex = function() {
      return this.getNextAccountIndexes(1)[0];
    };

    Wallet.prototype.getNextAccountIndexes = function(numberOfIndex) {
      var index, _i, _ref, _results;
      _results = [];
      for (index = _i = 0, _ref = this._accounts.length + numberOfIndex; 0 <= _ref ? _i < _ref : _i > _ref; index = 0 <= _ref ? ++_i : --_i) {
        if ((this._accounts[index] != null) === false || this._accounts[index].isEmpty()) {
          _results.push(index);
        }
      }
      return _results;
    };

    Wallet.prototype.getAllObservedAddressesPaths = function() {
      var account, paths, _i, _len, _ref;
      paths = [];
      _ref = this._accounts;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        account = _ref[_i];
        paths = paths.concat(account.getAllObservedAddressesPaths());
      }
      return paths;
    };

    Wallet.prototype.getAllAddresses = function() {
      return this.cache._cache.toJSON();
    };

    Wallet.prototype.initialize = function(store, callback) {
      this._store = store;
      return this._store.get(['accounts'], (function(_this) {
        return function(result) {
          var _i, _ref, _results;
          _this._accounts = [];
          if (result.accounts == null) {
            return typeof callback === "function" ? callback() : void 0;
          }
          return _.async.each((function() {
            _results = [];
            for (var _i = 0, _ref = result.accounts; 0 <= _ref ? _i < _ref : _i > _ref; 0 <= _ref ? _i++ : _i--){ _results.push(_i); }
            return _results;
          }).apply(this), function(accountIndex, done, hasNext) {
            var account, er;
            try {
              account = new ledger.wallet.Wallet.Account(_this, accountIndex, _this._store);
              return account.initialize(function() {
                _this._accounts.push(account);
                if (typeof done === "function") {
                  done();
                }
                if (!hasNext) {
                  return typeof callback === "function" ? callback() : void 0;
                }
              });
            } catch (_error) {
              er = _error;
              return e(er);
            }
          });
        };
      })(this));
    };

    Wallet.prototype.release = function() {
      var account, _i, _len, _ref;
      _ref = this._accounts;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        account = _ref[_i];
        account.release();
      }
      this._accounts = null;
      return this.cache = null;
    };

    Wallet.prototype.isEmpty = function() {
      var _ref;
      return ((_ref = this._accounts) != null ? _ref.length : void 0) === 0;
    };

    Wallet.prototype.isInitialized = false;

    Wallet.prototype.getRootDerivationPath = function() {
      var path;
      if (ledger.config.network.handleSegwit) {
        path = "49'/" + ledger.config.network.bip44_coin_type + "'";
      } else {
        path = "44'/" + ledger.config.network.bip44_coin_type + "'";
      }
      return path;
    };

    Wallet.prototype.getAccountsCount = function() {
      var account, count, _i, _len, _ref;
      count = 0;
      _ref = this._accounts;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        account = _ref[_i];
        if (account != null) {
          count += 1;
        }
      }
      return count;
    };

    Wallet.prototype.getNonEmptyAccountsCount = function() {
      var account, count, _i, _len, _ref;
      count = 0;
      _ref = this._accounts;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        account = _ref[_i];
        if (!(account != null ? account.isEmpty() : void 0)) {
          count += 1;
        }
      }
      return count;
    };

    Wallet.prototype.save = function(callback) {
      if (callback == null) {
        callback = _.noop;
      }
      return this._store.set({
        'accounts': this.getAccountsCount()
      }, callback);
    };

    Wallet.prototype.serialize = function() {
      var account, obj, _i, _len, _ref;
      obj = {
        accounts: this.getAccountsCount()
      };
      _ref = this._accounts;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        account = _ref[_i];
        obj[account._storeId] = account.serialize();
      }
      return obj;
    };

    Wallet.prototype.remove = function(callback) {
      if (callback == null) {
        callback = _.noop;
      }
      return _.async.each(this._accounts, (function(_this) {
        return function(account, done, hasNext) {
          return account.remove(function() {
            if (!hasNext) {
              _this._store.remove(["accounts"], callback);
            }
            return done();
          });
        };
      })(this));
    };

    Wallet.prototype._removeAccount = function(account, callback) {
      if (_(this._accounts).contains(account)) {
        this._accounts = _(this._accounts).without(account);
        this.save();
        return typeof callback === "function" ? callback() : void 0;
      }
    };

    Wallet.instance = void 0;

    return Wallet;

  })();

  ledger.wallet.Wallet.Account = (function() {
    function Account(wallet, index, store) {
      this.wallet = wallet;
      this.index = index;
      this._store = store;
      this._storeId = "account_" + this.index;
      this._initialize();
    }

    Account.prototype._initialize = function() {
      var _base1, _base2;
      if (this._account == null) {
        this._account = {};
      }
      if ((_base1 = this._account).currentChangeIndex == null) {
        _base1.currentChangeIndex = 0;
      }
      return (_base2 = this._account).currentPublicIndex != null ? _base2.currentPublicIndex : _base2.currentPublicIndex = 0;
    };

    Account.prototype.initializeXpub = function(callback) {
      return ledger.app.dongle.getExtendedPublicKey(this.getRootDerivationPath(), (function(_this) {
        return function(xpub) {
          _this._xpub = xpub;
          return typeof callback === "function" ? callback() : void 0;
        };
      })(this));
    };

    Account.prototype.initialize = function(callback) {
      return this._store.get([this._storeId], (function(_this) {
        return function(result) {
          _this._account = result[_this._storeId];
          _this._initialize();
          return typeof callback === "function" ? callback() : void 0;
        };
      })(this));
    };

    Account.prototype.release = function() {
      this.wallet = null;
      this._store = null;
      this._storeId = null;
      return this.index = null;
    };

    Account.prototype.getRootDerivationPath = function() {
      return "" + (this.wallet.getRootDerivationPath()) + "/" + this.index + "'";
    };

    Account.prototype.getAllChangeAddressesPaths = function() {
      var index, paths, _i, _ref;
      paths = [];
      paths = paths.concat(this._account.importedChangePaths);
      for (index = _i = 0, _ref = this._account.currentChangeIndex; 0 <= _ref ? _i <= _ref : _i >= _ref; index = 0 <= _ref ? ++_i : --_i) {
        paths.push("" + (this.wallet.getRootDerivationPath()) + "/" + this.index + "'/1/" + index);
      }
      paths = _.difference(paths, this._account.excludedChangePaths);
      paths;
      return _(paths).without(void 0);
    };

    Account.prototype.getAllPublicAddressesPaths = function() {
      var index, paths, _i, _ref;
      paths = [];
      paths = paths.concat(this._account.importedPublicPaths);
      for (index = _i = 0, _ref = this._account.currentPublicIndex; 0 <= _ref ? _i <= _ref : _i >= _ref; index = 0 <= _ref ? ++_i : --_i) {
        paths.push("" + (this.wallet.getRootDerivationPath()) + "/" + this.index + "'/0/" + index);
      }
      paths = _.difference(paths, this._account.excludedPublicPaths);
      return _(paths).without(void 0);
    };

    Account.prototype.getAllAddressesPaths = function() {
      return this.getAllPublicAddressesPaths().concat(this.getAllChangeAddressesPaths());
    };

    Account.prototype.getObservedPublicAddressesPaths = function(gap) {
      var index, paths, _ref;
      if (gap == null) {
        gap = ((_ref = ledger.preferences.instance) != null ? _ref.getDiscoveryGap() : void 0) || ledger.config.defaultAddressDiscoveryGap;
      }
      paths = (function() {
        var _i, _ref1, _results;
        _results = [];
        for (index = _i = 0, _ref1 = this.getCurrentPublicAddressIndex() + gap + 1; 0 <= _ref1 ? _i < _ref1 : _i > _ref1; index = 0 <= _ref1 ? ++_i : --_i) {
          _results.push("" + (this.getRootDerivationPath()) + "/0/" + index);
        }
        return _results;
      }).call(this);
      return _(paths).compact();
    };

    Account.prototype.getObservedChangeAddressesPaths = function(gap) {
      var index, paths, _ref;
      if (gap == null) {
        gap = ((_ref = ledger.preferences.instance) != null ? _ref.getDiscoveryGap() : void 0) || ledger.config.defaultAddressDiscoveryGap;
      }
      paths = (function() {
        var _i, _ref1, _results;
        _results = [];
        for (index = _i = 0, _ref1 = this.getCurrentChangeAddressIndex() + gap + 1; 0 <= _ref1 ? _i < _ref1 : _i > _ref1; index = 0 <= _ref1 ? ++_i : --_i) {
          _results.push("" + (this.getRootDerivationPath()) + "/1/" + index);
        }
        return _results;
      }).call(this);
      return _(paths).compact();
    };

    Account.prototype.getObservedAddressesPaths = function(type) {
      switch (type) {
        case 'change':
          return this.getObservedChangeAddressesPaths();
        case 'public':
          return this.getObservedPublicAddressesPaths();
      }
    };

    Account.prototype.getAllObservedAddressesPaths = function() {
      return this.getObservedChangeAddressesPaths().concat(this.getObservedPublicAddressesPaths());
    };

    Account.prototype.getCurrentPublicAddressIndex = function() {
      return this._account.currentPublicIndex || 0;
    };

    Account.prototype.getCurrentChangeAddressIndex = function() {
      return this._account.currentChangeIndex || 0;
    };

    Account.prototype.getCurrentAddressIndex = function(type) {
      switch (type) {
        case 'change':
          return this.getChangeAddressPath(index);
        case 'public':
          return this.getPublicAddressPath(index);
      }
    };

    Account.prototype.getCurrentPublicAddressPath = function() {
      return this.getPublicAddressPath(this.getCurrentPublicAddressIndex());
    };

    Account.prototype.getCurrentChangeAddressPath = function() {
      return this.getChangeAddressPath(this.getCurrentChangeAddressIndex());
    };

    Account.prototype.getCurrentAddressPath = function(type) {
      switch (type) {
        case 'change':
          return this.getCurrentChangeAddressPath(index);
        case 'public':
          return this.getCurrentPublicAddressPath(index);
      }
    };

    Account.prototype.getPublicAddressPath = function(index) {
      return "" + (this.wallet.getRootDerivationPath()) + "/" + this.index + "'/0/" + index;
    };

    Account.prototype.getChangeAddressPath = function(index) {
      return "" + (this.wallet.getRootDerivationPath()) + "/" + this.index + "'/1/" + index;
    };

    Account.prototype.getAddressPath = function(index, type) {
      switch (type) {
        case 'change':
          return this.getChangeAddressPath(index);
        case 'public':
          return this.getPublicAddressPath(index);
      }
    };

    Account.prototype.getCurrentChangeAddress = function() {
      var _ref;
      return (_ref = this.wallet.cache) != null ? _ref.get(this.getCurrentChangeAddressPath()) : void 0;
    };

    Account.prototype.getCurrentPublicAddress = function() {
      var _ref;
      return (_ref = this.wallet.cache) != null ? _ref.get(this.getCurrentPublicAddressPath()) : void 0;
    };

    Account.prototype.notifyPathsAsUsed = function(paths) {
      var allPaths, hasDiscoveredNewPaths, path, wasEmpty, _i, _len;
      if (!_.isArray(paths)) {
        paths = [paths];
      }
      allPaths = this.getAllAddressesPaths();
      hasDiscoveredNewPaths = false;
      wasEmpty = this.isEmpty();
      for (_i = 0, _len = paths.length; _i < _len; _i++) {
        path = paths[_i];
        if (_(allPaths).contains(path) && path !== this.getCurrentPublicAddressPath() && path !== this.getCurrentChangeAddressPath()) {
          continue;
        }
        path = path.replace("" + (this.getRootDerivationPath()) + "/", '').split('/');
        switch (path[0]) {
          case '0':
            this._notifyPublicAddressIndexAsUsed(parseInt(path[1]));
            break;
          case '1':
            this._notifyChangeAddressIndexAsUsed(parseInt(path[1]));
        }
        hasDiscoveredNewPaths = true;
      }
      if (wasEmpty === true && this.isEmpty() === false) {
        this.wallet.createAccount();
      }
      return hasDiscoveredNewPaths;
    };

    Account.prototype._notifyPublicAddressIndexAsUsed = function(index) {
      var derivationPath, difference, i, _base1, _i;
      if (index < this._account.currentPublicIndex) {
        logger().info('Index is less than current');
        derivationPath = "" + (this.wallet.getRootDerivationPath()) + "/" + this.index + "'/0/" + index;
        this._account.excludedPublicPaths = _.without(this._account.excludedPublicPaths, derivationPath);
      } else if (index > this._account.currentPublicIndex) {
        logger().info('Index is more than current');
        difference = index - (this._account.currentPublicIndex + 1);
        if ((_base1 = this._account).excludedPublicPaths == null) {
          _base1.excludedPublicPaths = [];
        }
        for (i = _i = 0; 0 <= difference ? _i < difference : _i > difference; i = 0 <= difference ? ++_i : --_i) {
          derivationPath = "" + (this.wallet.getRootDerivationPath()) + "/" + this.index + "'/0/" + (index - i - 1);
          if (!_.contains(this._account.excludedPublicPaths, derivationPath)) {
            this._account.excludedPublicPaths.push(derivationPath);
          }
        }
        this._account.currentPublicIndex = parseInt(index) + 1;
      } else if (index === this._account.currentPublicIndex) {
        logger().info('Index is equal to current');
        this.shiftCurrentPublicAddressPath();
      }
      return this.save();
    };

    Account.prototype._notifyChangeAddressIndexAsUsed = function(index) {
      var derivationPath, difference, i, _base1, _i;
      if (index < this._account.currentChangeIndex) {
        derivationPath = "" + (this.wallet.getRootDerivationPath()) + "/" + this.index + "'/1/" + index;
        this._account.excludedChangePaths = _.without(this._account.excludedChangePaths, derivationPath);
      } else if (index > this._account.currentChangeIndex) {
        difference = index - (this._account.currentChangeIndex + 1);
        if ((_base1 = this._account).excludedChangePaths == null) {
          _base1.excludedChangePaths = [];
        }
        for (i = _i = 0; 0 <= difference ? _i < difference : _i > difference; i = 0 <= difference ? ++_i : --_i) {
          derivationPath = "" + (this.wallet.getRootDerivationPath()) + "/" + this.index + "'/1/" + (index - i - 1);
          if (!_.contains(this._account.excludedChangePaths, derivationPath)) {
            this._account.excludedChangePaths.push(derivationPath);
          }
        }
        this._account.currentChangeIndex = parseInt(index) + 1;
      } else if (index === this._account.currentChangeIndex) {
        this.shiftCurrentChangeAddressPath();
      }
      return this.save();
    };

    Account.prototype.shiftCurrentPublicAddressPath = function(callback) {
      var index;
      logger().info('shift public');
      index = this._account.currentPublicIndex;
      if (index == null) {
        index = 0;
      }
      if (_.isString(index)) {
        index = parseInt(index);
      }
      this._account.currentPublicIndex = index + 1;
      this.save();
      return ledger.wallet.pathsToAddresses([this.getCurrentPublicAddressPath()], callback);
    };

    Account.prototype.shiftCurrentChangeAddressPath = function(callback) {
      var index;
      logger().info('shift change');
      index = this._account.currentChangeIndex;
      if (index == null) {
        index = 0;
      }
      if (_.isString(index)) {
        index = parseInt(index);
      }
      this._account.currentChangeIndex = index + 1;
      this.save();
      return ledger.wallet.pathsToAddresses([this.getCurrentChangeAddressPath()], callback);
    };

    Account.prototype.importPublicAddressPath = function(addressPath) {
      var _base1;
      if ((_base1 = this._account).importedPublicPaths == null) {
        _base1.importedPublicPaths = [];
      }
      return this._account.importedPublicPaths.push(addressPath);
    };

    Account.prototype.importChangeAddressPath = function(addressPath) {
      var _base1;
      if ((_base1 = this._account).importedChangePaths == null) {
        _base1.importedChangePaths = [];
      }
      return this._account.importedChangePaths.push(addressPath);
    };

    Account.prototype.save = function(callback) {
      var saveHash;
      if (callback == null) {
        callback = _.noop;
      }
      saveHash = {};
      saveHash[this._storeId] = this._account;
      return this._store.set(saveHash, callback);
    };

    Account.prototype.serialize = function() {
      return _.clone(this._account);
    };

    Account.prototype.remove = function(callback) {
      if (callback == null) {
        callback = _.noop;
      }
      this.wallet._removeAccount(this);
      return this._store.remove([this._storeId], callback);
    };

    Account.prototype.isEmpty = function() {
      return this.getCurrentChangeAddressIndex() === 0 && this.getCurrentPublicAddressIndex() === 0;
    };

    return Account;

  })();

  _.extend(ledger.wallet, {
    initialize: function(dongle, callback) {
      var hdWallet;
      if (callback == null) {
        callback = void 0;
      }
      hdWallet = new ledger.wallet.Wallet();
      return hdWallet.initialize(ledger.storage.wallet, (function(_this) {
        return function() {
          ledger.wallet.Wallet.instance = hdWallet;
          return typeof callback === "function" ? callback() : void 0;
        };
      })(this));
    },
    release: function(dongle, callback) {
      var _ref;
      if ((_ref = ledger.wallet.Wallet.instance) != null) {
        _ref.release();
      }
      ledger.wallet.Wallet.instance = null;
      return typeof callback === "function" ? callback() : void 0;
    }
  });

}).call(this);
