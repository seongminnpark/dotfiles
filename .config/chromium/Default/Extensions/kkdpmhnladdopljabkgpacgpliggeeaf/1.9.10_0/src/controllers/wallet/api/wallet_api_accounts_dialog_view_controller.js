(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletApiAccountsDialogViewController = (function(_super) {
    __extends(WalletApiAccountsDialogViewController, _super);

    function WalletApiAccountsDialogViewController() {
      return WalletApiAccountsDialogViewController.__super__.constructor.apply(this, arguments);
    }

    WalletApiAccountsDialogViewController.prototype.cancellable = false;

    WalletApiAccountsDialogViewController.prototype.cancel = function() {
      Api.callback_cancel('get_accounts', t('wallet.api.errors.cancelled'));
      return this.dismiss();
    };

    WalletApiAccountsDialogViewController.prototype.confirm = function() {
      Api.exportAccounts();
      return this.dismiss();
    };

    return WalletApiAccountsDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
