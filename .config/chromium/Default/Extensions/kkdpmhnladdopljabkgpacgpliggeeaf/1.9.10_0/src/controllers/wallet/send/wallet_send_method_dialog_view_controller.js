(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletSendMethodDialogViewController = (function(_super) {
    __extends(WalletSendMethodDialogViewController, _super);

    function WalletSendMethodDialogViewController() {
      return WalletSendMethodDialogViewController.__super__.constructor.apply(this, arguments);
    }

    WalletSendMethodDialogViewController.prototype.view = {
      mobileTableContainer: "#mobile_table_container"
    };

    WalletSendMethodDialogViewController.prototype.initialize = function() {
      WalletSendMethodDialogViewController.__super__.initialize.apply(this, arguments);
      return this.mobilesGroups = [];
    };

    WalletSendMethodDialogViewController.prototype.cancel = function() {
      Api.callback_cancel('send_payment', t('wallet.send.errors.cancelled'));
      return this.dismiss();
    };

    WalletSendMethodDialogViewController.prototype.onAfterRender = function() {
      WalletSendMethodDialogViewController.__super__.onAfterRender.apply(this, arguments);
      return this._refreshMobilesList();
    };

    WalletSendMethodDialogViewController.prototype.pairMobilePhone = function() {
      var dialog;
      dialog = new WalletPairingIndexDialogViewController();
      dialog.show();
      return dialog.getDialog().once('dismiss', (function(_this) {
        return function() {
          return _this._refreshMobilesList();
        };
      })(this));
    };

    WalletSendMethodDialogViewController.prototype.selectMobileGroup = function(params) {
      var dialog, secureScreens;
      secureScreens = this.mobilesGroups[params.index];
      dialog = new WalletSendValidatingDialogViewController({
        secureScreens: secureScreens,
        transaction: this.params.transaction,
        validationMode: 'mobile'
      });
      return this.getDialog().push(dialog);
    };

    WalletSendMethodDialogViewController.prototype.selectSecurityCard = function() {
      var dialog;
      dialog = new WalletSendValidatingDialogViewController({
        transaction: this.params.transaction,
        validationMode: 'card'
      });
      return this.getDialog().push(dialog);
    };

    WalletSendMethodDialogViewController.prototype._refreshMobilesList = function() {
      return ledger.m2fa.PairedSecureScreen.getAllGroupedByUuidFromSyncedStore((function(_this) {
        return function(mobilesGroups, error) {
          if ((error != null) || (mobilesGroups == null)) {
            return;
          }
          mobilesGroups = _.sortBy(_.values(_.omit(mobilesGroups, void 0)), function(item) {
            var _ref;
            return (_ref = item[0]) != null ? _ref.name : void 0;
          });
          return render("wallet/send/_method_mobiles_list", {
            mobilesGroups: mobilesGroups
          }, function(html) {
            if (html == null) {
              return;
            }
            _this.mobilesGroups = mobilesGroups;
            _this.view.mobileTableContainer.empty();
            return _this.view.mobileTableContainer.append(html);
          });
        };
      })(this));
    };

    return WalletSendMethodDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
