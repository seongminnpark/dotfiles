(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletDialogsXpubDialogViewController = (function(_super) {
    __extends(WalletDialogsXpubDialogViewController, _super);

    function WalletDialogsXpubDialogViewController() {
      return WalletDialogsXpubDialogViewController.__super__.constructor.apply(this, arguments);
    }

    WalletDialogsXpubDialogViewController.prototype.view = {
      codeContainer: '#code_container'
    };

    WalletDialogsXpubDialogViewController.prototype._xpub = null;

    WalletDialogsXpubDialogViewController.prototype.show = function() {
      return this._getAccount().getExtendedPublicKey((function(_this) {
        return function(xpub) {
          _this._xpub = xpub;
          return WalletDialogsXpubDialogViewController.__super__.show.apply(_this, arguments);
        };
      })(this));
    };

    WalletDialogsXpubDialogViewController.prototype.onAfterRender = function() {
      WalletDialogsXpubDialogViewController.__super__.onAfterRender.apply(this, arguments);
      this.view.codeContainer.text(this._xpub);
      return this.view.qrcode = new QRCode("qrcode_container", {
        text: this._xpub,
        width: 196,
        height: 196,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
      });
    };

    WalletDialogsXpubDialogViewController.prototype.email = function() {
      return window.open('mailto:?body=' + this._xpub);
    };

    WalletDialogsXpubDialogViewController.prototype.print = function() {
      return window.print();
    };

    WalletDialogsXpubDialogViewController.prototype._getAccount = function() {
      if (this._account == null) {
        this._account = Account.find({
          index: this.params.account_id
        }).first();
      }
      return this._account;
    };

    return WalletDialogsXpubDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
