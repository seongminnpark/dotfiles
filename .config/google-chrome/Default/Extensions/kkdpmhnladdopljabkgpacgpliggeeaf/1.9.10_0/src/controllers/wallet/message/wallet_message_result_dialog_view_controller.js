(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletMessageResultDialogViewController = (function(_super) {
    __extends(WalletMessageResultDialogViewController, _super);

    function WalletMessageResultDialogViewController() {
      return WalletMessageResultDialogViewController.__super__.constructor.apply(this, arguments);
    }

    WalletMessageResultDialogViewController.prototype.view = {
      result: '#result'
    };

    WalletMessageResultDialogViewController.prototype.onAfterRender = function() {
      WalletMessageResultDialogViewController.__super__.onAfterRender.apply(this, arguments);
      return this.view.result.val("-----BEGIN BITCOIN SIGNED MESSAGE-----\n" + ("" + this.params.message + "\n") + "-----BEGIN SIGNATURE-----\n" + ("" + this.params.address + "\n") + ("" + this.params.signature + "\n") + "-----END BITCOIN SIGNED MESSAGE-----\n");
    };

    return WalletMessageResultDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
