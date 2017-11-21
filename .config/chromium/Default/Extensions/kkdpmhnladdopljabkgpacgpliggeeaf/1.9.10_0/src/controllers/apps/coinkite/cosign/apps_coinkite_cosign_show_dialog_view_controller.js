(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.AppsCoinkiteCosignShowDialogViewController = (function(_super) {
    __extends(AppsCoinkiteCosignShowDialogViewController, _super);

    function AppsCoinkiteCosignShowDialogViewController() {
      return AppsCoinkiteCosignShowDialogViewController.__super__.constructor.apply(this, arguments);
    }

    AppsCoinkiteCosignShowDialogViewController.prototype.cancellable = false;

    AppsCoinkiteCosignShowDialogViewController.prototype.view = {
      changeAmount: '#change_amount',
      changeAddress: '#change_address'
    };

    AppsCoinkiteCosignShowDialogViewController.prototype.onBeforeRender = function() {
      var transaction;
      AppsCoinkiteCosignShowDialogViewController.__super__.onBeforeRender.apply(this, arguments);
      if (this.params.json != null) {
        this.params.ck = new Coinkite();
        this.params.request = this.params.ck.getRequestFromJSON(JSON.parse(this.params.json));
      }
      transaction = Bitcoin.Transaction.deserialize(this.params.request.raw_unsigned_txn);
      this.amount = transaction.outs[0].value;
      this.address = transaction.outs[0].address.toString();
      if (transaction.outs[1] != null) {
        this.amount2 = transaction.outs[1].value;
        return this.address2 = transaction.outs[1].address.toString();
      }
    };

    AppsCoinkiteCosignShowDialogViewController.prototype.onShow = function() {
      AppsCoinkiteCosignShowDialogViewController.__super__.onShow.apply(this, arguments);
      if (this.address2 != null) {
        this.view.changeAmount.show();
        return this.view.changeAddress.show();
      }
    };

    AppsCoinkiteCosignShowDialogViewController.prototype.cancel = function() {
      return this.dismiss((function(_this) {
        return function() {
          if (_this.params.request.api) {
            return Api.callback_cancel('coinkite_sign_json', t("apps.coinkite.cosign.errors.request_cancelled"));
          }
        };
      })(this));
    };

    AppsCoinkiteCosignShowDialogViewController.prototype.confirm = function() {
      var dialog;
      dialog = new AppsCoinkiteCosignSigningDialogViewController({
        request: this.params.request,
        ck: this.params.ck
      });
      return this.getDialog().push(dialog);
    };

    return AppsCoinkiteCosignShowDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
