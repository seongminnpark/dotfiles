(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.Wallet = (function(_super) {
    __extends(Wallet, _super);

    Wallet.init();

    Wallet.has({
      many: 'accounts',
      sortBy: 'index',
      onDelete: 'destroy'
    });

    Wallet.index('id', {
      sync: true
    });

    Wallet.instance = void 0;

    function Wallet() {
      Wallet.__super__.constructor.apply(this, arguments);
      this._onCreateAccount = this._onCreateAccount.bind(this);
    }

    Wallet.prototype.retrieveAccountsBalances = function() {
      var account, _i, _len, _ref, _results;
      _ref = this.get('accounts');
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        account = _ref[_i];
        _results.push(account.retrieveBalance());
      }
      return _results;
    };

    Wallet.prototype.getBalance = function() {
      var account, balance, _i, _len, _ref;
      balance = {
        wallet: {
          total: ledger.Amount.fromSatoshi(0),
          unconfirmed: ledger.Amount.fromSatoshi(0)
        },
        accounts: []
      };
      _ref = this.get('accounts');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        account = _ref[_i];
        if (!(!account.isHidden())) {
          continue;
        }
        if ((account.get('total_balance') == null) || (account.get('unconfirmed_balance') == null)) {
          continue;
        }
        balance.wallet.total = balance.wallet.total.add(account.get('total_balance'));
        balance.wallet.unconfirmed = balance.wallet.unconfirmed.add(account.get('unconfirmed_balance'));
        balance.accounts.push({
          total: account.get('total_balance'),
          unconfirmed: account.get('unconfirmed_balance')
        });
      }
      return balance;
    };

    Wallet.initializeWallet = function(callback) {
      var _ref;
      this.instance = this.findOrCreate(1, {
        id: 1
      }).save();
      this.instance._onCreateAccount();
      if ((_ref = ledger.database.contexts.main) != null) {
        _ref.on('insert:account', this.instance._onCreateAccount);
      }
      return typeof callback === "function" ? callback() : void 0;
    };

    Wallet.releaseWallet = function() {
      var _ref;
      return (_ref = ledger.database.contexts.main) != null ? _ref.off('insert:account', this.instance._onCreateAccount) : void 0;
    };

    Wallet.prototype._onCreateAccount = function() {
      var account, _i, _len, _ref, _results;
      _ref = Account.all();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        account = _ref[_i];
        account.set('wallet', this).save();
        if (account.get('color') == null) {
          _results.push(account.set('color', ledger.preferences.defaults.Accounts.firstAccountColor).save());
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    return Wallet;

  })(ledger.database.Model);

}).call(this);
