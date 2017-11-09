(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletApiAddressesDialogViewController = (function(_super) {
    __extends(WalletApiAddressesDialogViewController, _super);

    function WalletApiAddressesDialogViewController() {
      return WalletApiAddressesDialogViewController.__super__.constructor.apply(this, arguments);
    }

    WalletApiAddressesDialogViewController.prototype.cancellable = false;

    WalletApiAddressesDialogViewController.prototype.view = {
      accountName: '#account_name',
      count: '#count',
      confirmButton: '#confirmButton'
    };

    WalletApiAddressesDialogViewController.prototype.onAfterRender = function() {
      WalletApiAddressesDialogViewController.__super__.onAfterRender.apply(this, arguments);
      this.account_id = parseInt(this.params.account_id) || 0;
      this.account = Account.findById(this.account_id);
      this.count = parseInt(this.params.count) || 1;
      this.view.count.text(this.count);
      if (this.account) {
        return this.view.accountName.text(this.account.get('name'));
      } else {
        this.view.accountName.text(t('wallet.api.errors.account_not_found'));
        this.view.confirmButton.addClass("disabled");
        return Api.callback_cancel('get_new_addresses', t('wallet.api.errors.account_not_found'));
      }
    };

    WalletApiAddressesDialogViewController.prototype.cancel = function() {
      Api.callback_cancel('get_net_addresses', t('wallet.api.errors.cancelled'));
      return this.dismiss();
    };

    WalletApiAddressesDialogViewController.prototype.confirm = function() {
      Api.exportNewAddresses(this.account_id, this.count);
      return this.dismiss();
    };

    return WalletApiAddressesDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
