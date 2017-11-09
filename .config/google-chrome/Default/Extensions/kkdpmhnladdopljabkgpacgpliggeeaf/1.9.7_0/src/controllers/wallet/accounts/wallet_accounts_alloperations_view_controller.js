(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletAccountsAlloperationsViewController = (function(_super) {
    __extends(WalletAccountsAlloperationsViewController, _super);

    function WalletAccountsAlloperationsViewController() {
      return WalletAccountsAlloperationsViewController.__super__.constructor.apply(this, arguments);
    }

    WalletAccountsAlloperationsViewController.prototype.view = {
      emptyContainer: "#empty_container",
      operationsList: '#operations_list'
    };

    WalletAccountsAlloperationsViewController.prototype.initialize = function() {
      WalletAccountsAlloperationsViewController.__super__.initialize.apply(this, arguments);
      return this._debouncedUpdateOperations = _.debounce(this._updateOperations, 200, true);
    };

    WalletAccountsAlloperationsViewController.prototype.onAfterRender = function() {
      WalletAccountsAlloperationsViewController.__super__.onAfterRender.apply(this, arguments);
      return this._listenEvents();
    };

    WalletAccountsAlloperationsViewController.prototype.onDetach = function() {
      var _ref, _ref1;
      WalletAccountsAlloperationsViewController.__super__.onDetach.apply(this, arguments);
      ledger.app.off('wallet:transactions:new wallet:operations:sync:done', this._debouncedUpdateOperations);
      if ((_ref = ledger.preferences.instance) != null) {
        _ref.off('currencyActive:changed', this._debouncedUpdateOperations);
      }
      return (_ref1 = ledger.database.contexts.main) != null ? _ref1.off('delete:operation', this._debouncedUpdateOperations) : void 0;
    };

    WalletAccountsAlloperationsViewController.prototype.showOperation = function(params) {
      var dialog;
      dialog = new WalletDialogsOperationdetailDialogViewController(params);
      return dialog.show();
    };

    WalletAccountsAlloperationsViewController.prototype._updateOperations = function() {
      var operations;
      operations = Operation.find().where(function(op) {
        return (op['double_spent_priority'] == null) || op['double_spent_priority'] === 0;
      }).sort(Operation.defaultSort).data();
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

    WalletAccountsAlloperationsViewController.prototype._listenEvents = function() {
      this._updateOperations();
      ledger.app.on('wallet:transactions:new wallet:operations:sync:done', this._debouncedUpdateOperations);
      ledger.preferences.instance.on('currencyActive:changed', this._debouncedUpdateOperations);
      return ledger.database.contexts.main.on('delete:operation', this._debouncedUpdateOperations);
    };

    return WalletAccountsAlloperationsViewController;

  })(ledger.common.ActionBarViewController);

}).call(this);
