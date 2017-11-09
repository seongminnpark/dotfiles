(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletApiOperationsDialogViewController = (function(_super) {
    __extends(WalletApiOperationsDialogViewController, _super);

    function WalletApiOperationsDialogViewController() {
      return WalletApiOperationsDialogViewController.__super__.constructor.apply(this, arguments);
    }

    WalletApiOperationsDialogViewController.prototype.cancellable = false;

    WalletApiOperationsDialogViewController.prototype.view = {
      accountName: '#account_name',
      confirmButton: '#confirmButton'
    };

    WalletApiOperationsDialogViewController.prototype.onAfterRender = function() {
      WalletApiOperationsDialogViewController.__super__.onAfterRender.apply(this, arguments);
      this.account_id = parseInt(this.params.account_id) || 0;
      this.account = Account.findById(this.account_id);
      if (this.account) {
        return this.view.accountName.text(this.account.get('name'));
      } else {
        this.view.accountName.text(t('wallet.api.errors.account_not_found'));
        this.view.confirmButton.addClass("disabled");
        return Api.callback_cancel('get_operations', t('wallet.api.errors.account_not_found'));
      }
    };

    WalletApiOperationsDialogViewController.prototype.cancel = function() {
      Api.callback_cancel('get_operations', t('wallet.api.errors.cancelled'));
      return this.dismiss();
    };

    WalletApiOperationsDialogViewController.prototype.confirm = function() {
      Api.exportOperations(this.account_id);
      return this.dismiss();
    };

    return WalletApiOperationsDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
