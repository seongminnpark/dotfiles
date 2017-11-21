(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletDialogsApifailuresDialogViewController = (function(_super) {
    __extends(WalletDialogsApifailuresDialogViewController, _super);

    function WalletDialogsApifailuresDialogViewController() {
      return WalletDialogsApifailuresDialogViewController.__super__.constructor.apply(this, arguments);
    }

    WalletDialogsApifailuresDialogViewController.prototype.openHelpCenter = function() {
      window.open('https://ledger.groovehq.com/knowledge_base/topics/how-to-manage-my-account-if-ledgers-api-is-down');
      return this.dismiss();
    };

    return WalletDialogsApifailuresDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
