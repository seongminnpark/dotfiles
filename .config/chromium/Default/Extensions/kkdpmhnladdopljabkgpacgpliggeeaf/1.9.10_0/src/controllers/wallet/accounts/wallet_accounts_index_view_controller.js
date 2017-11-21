(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletAccountsIndexViewController = (function(_super) {
    __extends(WalletAccountsIndexViewController, _super);

    function WalletAccountsIndexViewController() {
      return WalletAccountsIndexViewController.__super__.constructor.apply(this, arguments);
    }

    WalletAccountsIndexViewController.prototype.view = {
      emptyContainer: "#empty_container",
      operationsList: '#operations_list',
      accountsList: '#accounts_list'
    };

    WalletAccountsIndexViewController.prototype.actions = [
      {
        title: 'wallet.accounts.index.actions.see_all_operations',
        icon: 'fa-bars',
        url: '/wallet/accounts/alloperations'
      }, {
        title: 'wallet.accounts.index.actions.add_account',
        icon: 'fa-plus',
        url: '#addAccount'
      }
    ];

    WalletAccountsIndexViewController.prototype.initialize = function() {
      WalletAccountsIndexViewController.__super__.initialize.apply(this, arguments);
      this._debouncedUpdateAccounts = _.debounce(this._updateAccounts, 200);
      return this._debouncedUpdateOperations = _.debounce(this._updateOperations, 200);
    };

    WalletAccountsIndexViewController.prototype.onAfterRender = function() {
      WalletAccountsIndexViewController.__super__.onAfterRender.apply(this, arguments);
      this._updateAccounts();
      this._updateOperations();
      return this._listenEvents();
    };

    WalletAccountsIndexViewController.prototype.addAccount = function() {
      if (!Account.isAbleToCreateAccount() && Account.hiddenAccounts().length === 0) {
        return new CommonDialogsMessageDialogViewController({
          kind: 'fail',
          title: t('common.errors.cannot_create_account.title'),
          subtitle: _.str.sprintf(t('common.errors.cannot_create_account.subtitle'), Account.chain().simpleSort('index').last().get('name'))
        }).show();
      } else {
        return (new WalletDialogsAddaccountDialogViewController()).show();
      }
    };

    WalletAccountsIndexViewController.prototype.showOperation = function(params) {
      return (new WalletDialogsOperationdetailDialogViewController(params)).show();
    };

    WalletAccountsIndexViewController.prototype._listenEvents = function() {
      ledger.app.on('wallet:balance:changed', this._debouncedUpdateAccounts);
      ledger.app.on('wallet:transactions:new wallet:operations:sync:done wallet:operations:new wallet:operations:update', this._debouncedUpdateOperations);
      ledger.preferences.instance.on('currencyActive:changed', this._debouncedUpdateOperations);
      ledger.database.contexts.main.on('delete:operation', this._debouncedUpdateOperations);
      ledger.preferences.instance.on('currencyActive:changed', this._debouncedUpdateAccounts);
      ledger.database.contexts.main.on('update:account insert:account remove:account', this._debouncedUpdateAccounts);
      return ledger.database.contexts.main.on('update:account insert:account remove:account', this._debouncedUpdateOperations);
    };

    WalletAccountsIndexViewController.prototype.onDetach = function() {
      var _ref, _ref1, _ref2, _ref3;
      ledger.app.off('wallet:balance:changed', this._debouncedUpdateAccounts);
      ledger.app.off('wallet:transactions:new wallet:operations:sync:done wallet:operations:new wallet:operations:update', this._debouncedUpdateOperations);
      if ((_ref = ledger.preferences.instance) != null) {
        _ref.off('currencyActive:changed', this._debouncedUpdateOperations);
      }
      ledger.database.contexts.main.off('delete:operation', this._debouncedUpdateOperations);
      if ((_ref1 = ledger.preferences.instance) != null) {
        _ref1.off('currencyActive:changed', this._debouncedUpdateAccounts);
      }
      if ((_ref2 = ledger.database.contexts.main) != null) {
        _ref2.off('update:account insert:account remove:account', this._debouncedUpdateAccounts);
      }
      return (_ref3 = ledger.database.contexts.main) != null ? _ref3.off('update:account insert:account remove:account', this._debouncedUpdateOperations) : void 0;
    };

    WalletAccountsIndexViewController.prototype._updateOperations = function() {
      var operations;
      operations = Operation.displayableOperationsChain().limit(6).data();
      if (operations.length > 0) {
        this.view.emptyContainer.hide();
      }
      return render('wallet/accounts/_operations_table', {
        operations: operations,
        showAccounts: true
      }, (function(_this) {
        return function(html) {
          return _this.view.operationsList.html(html);
        };
      })(this));
    };

    WalletAccountsIndexViewController.prototype._updateAccounts = function() {
      var accounts;
      accounts = Account.displayableAccounts();
      return render('wallet/accounts/_accounts_list', {
        accounts: accounts
      }, (function(_this) {
        return function(html) {
          return _this.view.accountsList.html(html);
        };
      })(this));
    };

    return WalletAccountsIndexViewController;

  })(ledger.common.ActionBarViewController);

}).call(this);
