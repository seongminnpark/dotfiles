(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletAccountsShowViewController = (function(_super) {
    __extends(WalletAccountsShowViewController, _super);

    function WalletAccountsShowViewController() {
      return WalletAccountsShowViewController.__super__.constructor.apply(this, arguments);
    }

    WalletAccountsShowViewController.prototype.view = {
      confirmedBalanceSubtitle: '#confirmed_balance_subtitle',
      countervalueBalanceSubtitle: '#countervalue_balance_subtitle',
      confirmedBalance: '#confirmed_balance',
      countervalueBalance: '#countervalue_balance',
      emptyContainer: "#empty_container",
      operationsList: '#operations_list',
      accountName: '#account_name',
      confirmedBalanceContainer: "#confirmed_balance_container",
      countervalueBalanceContainer: "#countervalue_balance_container",
      colorCircle: '#color_circle'
    };

    WalletAccountsShowViewController.prototype.breadcrumb = null;

    WalletAccountsShowViewController.prototype.actions = [
      {
        title: 'wallet.accounts.show.actions.see_all_operations',
        icon: 'fa-reorder',
        url: '/wallet/accounts/:account_id:/operations'
      }, {
        title: 'wallet.accounts.show.actions.account_settings',
        icon: 'fa-cog',
        url: '#openSettings'
      }
    ];

    WalletAccountsShowViewController.prototype.initialize = function() {
      WalletAccountsShowViewController.__super__.initialize.apply(this, arguments);
      this._debouncedUpdateOperations = _.debounce(this._updateOperations, 200);
      this._debouncedUpdateBalances = _.debounce(this._updateBalances, 200);
      this._debouncedUpdateCountervalueVisibility = _.debounce(this._updateCountervalueVisibility, 200);
      this.actions = _.clone(this.actions);
      this.actions[0].url = "/wallet/accounts/" + (this._getAccount().get('index')) + "/operations";
      return this._updateBreadcrumb();
    };

    WalletAccountsShowViewController.prototype.onAfterRender = function() {
      WalletAccountsShowViewController.__super__.onAfterRender.apply(this, arguments);
      this._updateBalancesLayout();
      this._updateAccountName();
      return this._listenEvents();
    };

    WalletAccountsShowViewController.prototype.showOperation = function(params) {
      var dialog;
      dialog = new WalletDialogsOperationdetailDialogViewController(params);
      return dialog.show();
    };

    WalletAccountsShowViewController.prototype.openSettings = function() {
      return (new WalletDialogsAccountsettingsDialogViewController({
        account_id: this._getAccount().get('index')
      })).show();
    };

    WalletAccountsShowViewController.prototype.onDetach = function() {
      var _ref, _ref1;
      ledger.app.off('wallet:balance:changed', this._debouncedUpdateBalances);
      ledger.app.off('wallet:transactions:new wallet:operations:sync:done wallet:operations:new wallet:operations:update', this._debouncedUpdateOperations);
      if ((_ref = ledger.preferences.instance) != null) {
        _ref.off('currencyActive:changed', this._debouncedUpdateOperations);
      }
      ledger.database.contexts.main.off('delete:operation', this._debouncedUpdateOperations);
      if ((_ref1 = ledger.preferences.instance) != null) {
        _ref1.off('currencyActive:changed', this._debouncedUpdateCountervalueVisibility);
      }
      return ledger.database.contexts.main.off('update:account insert:account remove:account', this._updateAccountName);
    };

    WalletAccountsShowViewController.prototype._updateBreadcrumb = function() {
      var _ref;
      this.breadcrumb = [
        {
          title: 'wallet.breadcrumb.accounts',
          url: '/wallet/accounts'
        }
      ];
      this.breadcrumb.push({
        title: this._getAccount().get('name'),
        url: this.routedUrl
      });
      return (_ref = this.parentViewController) != null ? _ref.updateActionBar() : void 0;
    };

    WalletAccountsShowViewController.prototype._updateOperations = function() {
      var operations;
      operations = this._getAccount().get('operations');
      operations = _(operations).filter(function(op) {
        return (op.get('double_spent_priority') == null) || op.get('double_spent_priority') === 0;
      });
      if (operations.length > 0) {
        this.view.emptyContainer.hide();
      }
      return render('wallet/accounts/_operations_table', {
        operations: operations.slice(0, 6),
        showAddresses: true
      }, (function(_this) {
        return function(html) {
          return _this.view.operationsList.html(html);
        };
      })(this));
    };

    WalletAccountsShowViewController.prototype._updateBalances = function() {
      var total;
      total = this._getAccount().get('total_balance');
      this.view.confirmedBalance.text(ledger.formatters.fromValue(total));
      return this.view.countervalueBalance.attr('data-countervalue', total);
    };

    WalletAccountsShowViewController.prototype._listenEvents = function() {
      this._updateBalances();
      ledger.app.on('wallet:balance:changed', this._debouncedUpdateBalances);
      this._updateOperations();
      ledger.app.on('wallet:transactions:new wallet:operations:sync:done wallet:operations:new wallet:operations:update', this._debouncedUpdateOperations);
      ledger.database.contexts.main.on('delete:operation', this._debouncedUpdateOperations);
      ledger.preferences.instance.on('currencyActive:changed', this._debouncedUpdateOperations);
      this._updateCountervalueVisibility();
      ledger.preferences.instance.on('currencyActive:changed', this._debouncedUpdateCountervalueVisibility);
      return ledger.database.contexts.main.on('update:account insert:account remove:account', this._updateAccountName);
    };

    WalletAccountsShowViewController.prototype._updateCountervalueVisibility = function() {
      var hideCountervalue;
      hideCountervalue = !ledger.preferences.instance.isCurrencyActive();
      if (hideCountervalue) {
        this.view.countervalueBalanceContainer.hide();
      } else {
        this.view.countervalueBalanceContainer.show();
      }
      if (hideCountervalue) {
        this.view.countervalueBalanceSubtitle.hide();
      } else {
        this.view.countervalueBalanceSubtitle.show();
      }
      if (hideCountervalue) {
        return this.view.countervalueBalance.removeAttr('data-countervalue');
      }
    };

    WalletAccountsShowViewController.prototype._updateAccountName = function() {
      var account;
      account = this._getAccount();
      this.view.accountName.text(account.get('name'));
      this.view.colorCircle.css('color', account.get('color'));
      return this._updateBreadcrumb();
    };

    WalletAccountsShowViewController.prototype._updateBalancesLayout = function() {
      if (ledger.formatters.symbolIsFirst()) {
        return this.view.confirmedBalanceContainer.addClass('inverted');
      } else {
        return this.view.confirmedBalanceContainer.removeClass('inverted');
      }
    };

    WalletAccountsShowViewController.prototype._getAccount = function() {
      this._accountId || (this._accountId = +this.routedUrl.match(/wallet\/accounts\/(\d+)\/show/)[1]);
      if (this._account == null) {
        this._account = Account.find({
          index: this._accountId
        }).first();
      }
      return this._account;
    };

    return WalletAccountsShowViewController;

  })(ledger.common.ActionBarViewController);

}).call(this);
