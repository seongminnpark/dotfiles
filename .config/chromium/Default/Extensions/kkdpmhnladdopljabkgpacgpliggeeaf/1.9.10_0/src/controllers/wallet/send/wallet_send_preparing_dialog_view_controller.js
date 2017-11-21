(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletSendPreparingDialogViewController = (function(_super) {
    __extends(WalletSendPreparingDialogViewController, _super);

    function WalletSendPreparingDialogViewController() {
      return WalletSendPreparingDialogViewController.__super__.constructor.apply(this, arguments);
    }

    WalletSendPreparingDialogViewController.prototype.view = {
      contentContainer: '#content_container'
    };

    WalletSendPreparingDialogViewController.prototype.initialize = function() {
      var account;
      WalletSendPreparingDialogViewController.__super__.initialize.apply(this, arguments);
      l("initiliase");
      l(this);
      account = this._getAccount();
      return account.createTransaction({
        amount: this.params.amount,
        fees: this.params.fees,
        address: this.params.address,
        utxo: this.params.utxo,
        data: this.params.data
      }, (function(_this) {
        return function(transaction, error) {
          var reason;
          if (!_this.isShown()) {
            return;
          }
          if (error != null) {
            reason = (function() {
              switch (error.code) {
                case ledger.errors.NetworkError:
                  return 'network_no_response';
                case ledger.errors.NotEnoughFunds:
                  return 'unsufficient_balance';
                case ledger.errors.NotEnoughFundsConfirmed:
                  return 'unsufficient_balance';
                case ledger.errors.DustTransaction:
                  return 'dust_transaction';
                case ledger.errors.ChangeDerivationError:
                  return 'change_derivation_error';
                default:
                  return 'error_occurred';
              }
            })();
            l("reason");
            l(reason);
            return _this.dismiss(function() {
              var dialog, errorMessage;
              l(" dismiss");
              errorMessage = (function() {
                switch (reason) {
                  case 'dust_transaction':
                    return _.str.sprintf(t("common.errors." + reason), ledger.formatters.formatValue(ledger.wallet.Transaction.MINIMUM_OUTPUT_VALUE));
                  default:
                    return t("common.errors." + reason);
                }
              })();
              Api.callback_cancel('send_payment', errorMessage);
              dialog = new CommonDialogsMessageDialogViewController({
                kind: "error",
                title: t("wallet.send.errors.sending_failed"),
                subtitle: errorMessage
              });
              return dialog.show();
            });
          } else {
            return _this._routeToNextDialog(transaction);
          }
        };
      })(this));
    };

    WalletSendPreparingDialogViewController.prototype.cancel = function() {
      Api.callback_cancel('send_payment', t('wallet.send.errors.cancelled'));
      return this.dismiss();
    };

    WalletSendPreparingDialogViewController.prototype.onAfterRender = function() {
      WalletSendPreparingDialogViewController.__super__.onAfterRender.apply(this, arguments);
      return this.view.spinner = ledger.spinners.createLargeSpinner(this.view.contentContainer[0]);
    };

    WalletSendPreparingDialogViewController.prototype._routeToNextDialog = function(transaction) {
      var cardBlock, methodBlock, mobileBlock;
      if (ledger.app.dongle.getFirmwareInformation().hasScreenAndButton()) {
        this.getDialog().push(new WalletSendSignDialogViewController({
          transaction: transaction
        }));
        return;
      }
      cardBlock = (function(_this) {
        return function(transaction) {
          return _this.getDialog().push(new WalletSendValidatingDialogViewController({
            transaction: transaction,
            options: {
              hideOtherValidationMethods: true
            },
            validationMode: 'card'
          }));
        };
      })(this);
      mobileBlock = (function(_this) {
        return function(transaction, secureScreens) {
          return _this.getDialog().push(new WalletSendValidatingDialogViewController({
            transaction: transaction,
            secureScreens: secureScreens,
            validationMode: 'mobile'
          }));
        };
      })(this);
      methodBlock = (function(_this) {
        return function(transaction) {
          return _this.getDialog().push(new WalletSendMethodDialogViewController({
            transaction: transaction
          }));
        };
      })(this);
      if (ledger.app.dongle.getFirmwareInformation().hasSecureScreen2FASupport()) {
        return ledger.m2fa.PairedSecureScreen.getAllGroupedByUuidFromSyncedStore((function(_this) {
          return function(groups, error) {
            if (groups != null) {
              groups = _.values(_.omit(groups, void 0));
            }
            if ((error != null) || (groups == null) || groups.length !== 1) {
              return methodBlock(transaction);
            } else {
              return mobileBlock(transaction, groups[0]);
            }
          };
        })(this));
      } else {
        return cardBlock(transaction);
      }
    };

    WalletSendPreparingDialogViewController.prototype._getAccount = function() {
      return this._account || (this._account = this.params.account);
    };

    return WalletSendPreparingDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
