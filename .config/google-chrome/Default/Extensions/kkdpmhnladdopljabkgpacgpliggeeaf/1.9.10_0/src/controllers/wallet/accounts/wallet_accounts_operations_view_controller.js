(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletAccountsOperationsViewController = (function(_super) {
    __extends(WalletAccountsOperationsViewController, _super);

    function WalletAccountsOperationsViewController() {
      return WalletAccountsOperationsViewController.__super__.constructor.apply(this, arguments);
    }

    WalletAccountsOperationsViewController.prototype.view = {
      emptyContainer: "#empty_container",
      operationsList: '#operations_list',
      accountName: '#account_name',
      colorCircle: "#color_circle"
    };

    WalletAccountsOperationsViewController.prototype.initialize = function() {
      WalletAccountsOperationsViewController.__super__.initialize.apply(this, arguments);
      return this._debouncedUpdateOperations = _.debounce(this._updateOperations, 200, true);
    };

    WalletAccountsOperationsViewController.prototype.onAfterRender = function() {
      WalletAccountsOperationsViewController.__super__.onAfterRender.apply(this, arguments);
      this._updateAccountName();
      return this._listenEvents();
    };

    WalletAccountsOperationsViewController.prototype.onDetach = function() {
      var _ref;
      WalletAccountsOperationsViewController.__super__.onDetach.apply(this, arguments);
      ledger.app.off('wallet:transactions:new wallet:operations:sync:done', this._debouncedUpdateOperations);
      if ((_ref = ledger.preferences.instance) != null) {
        _ref.off('currencyActive:changed', this._debouncedUpdateOperations);
      }
      return ledger.database.contexts.main.off('delete:operation', this._debouncedUpdateOperations);
    };

    WalletAccountsOperationsViewController.prototype.showOperation = function(params) {
      var dialog;
      dialog = new WalletDialogsOperationdetailDialogViewController(params);
      return dialog.show();
    };

    WalletAccountsOperationsViewController.prototype._updateOperations = function() {
      var operations;
      operations = this._getAccount().get('operations');
      if (operations.length > 0) {
        this.view.emptyContainer.hide();
      }
      return render('wallet/accounts/_operations_table', {
        operations: operations,
        showAddresses: true
      }, (function(_this) {
        return function(html) {
          return _this.view.operationsList.html(html);
        };
      })(this));
    };

    WalletAccountsOperationsViewController.prototype._updateAccountName = function() {
      this.view.accountName.text(_.str.sprintf(t('wallet.accounts.operations.all_account_operations'), this._getAccount().get('name')));
      return this.view.colorCircle.css('color', this._getAccount().get('color'));
    };

    WalletAccountsOperationsViewController.prototype._listenEvents = function() {
      this._updateOperations();
      ledger.app.on('wallet:transactions:new wallet:operations:sync:done', this._debouncedUpdateOperations);
      ledger.preferences.instance.on('currencyActive:changed', this._debouncedUpdateOperations);
      return ledger.database.contexts.main.on('delete:operation', this._debouncedUpdateOperations);
    };

    WalletAccountsOperationsViewController.prototype._getAccount = function() {
      return this._account || (this._account = Account.findById(+this.routedUrl.match(/wallet\/accounts\/(\d+)\/operations/)[1]));
    };

    return WalletAccountsOperationsViewController;

  })(ledger.common.ActionBarViewController);

}).call(this);
