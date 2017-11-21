(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletDialogsOperationdetailDialogViewController = (function(_super) {
    __extends(WalletDialogsOperationdetailDialogViewController, _super);

    function WalletDialogsOperationdetailDialogViewController() {
      return WalletDialogsOperationdetailDialogViewController.__super__.constructor.apply(this, arguments);
    }

    WalletDialogsOperationdetailDialogViewController.prototype.view = {
      cpfpButton: "#cpfp_button"
    };

    WalletDialogsOperationdetailDialogViewController.prototype.show = function() {
      this.operation = Operation.findById(parseInt(this.params['operationId']));
      return WalletDialogsOperationdetailDialogViewController.__super__.show.apply(this, arguments);
    };

    WalletDialogsOperationdetailDialogViewController.prototype.onAfterRender = function() {
      WalletDialogsOperationdetailDialogViewController.__super__.onAfterRender.apply(this, arguments);
      if (this.operation.get("confirmations") > 0 || !ledger.bitcoin.cpfp.isEligibleToCpfp(this.operation.get("hash")) || !["0", "1", "145"].includes(ledger.config.network.bip44_coin_type)) {
        return this.view.cpfpButton.hide();
      }
    };

    WalletDialogsOperationdetailDialogViewController.prototype.openBlockchain = function() {
      var exploreURL;
      exploreURL = ledger.preferences.instance.getBlockchainExplorerAddress();
      return window.open(_.str.sprintf(exploreURL, this.operation.get('hash')));
    };

    WalletDialogsOperationdetailDialogViewController.prototype.cpfp = function() {
      var account;
      this.view.cpfpButton.addClass('disabled');
      account = this.operation.get("account");
      return this._createTransaction = ledger.bitcoin.cpfp.createTransaction(account, this.operation.get("hash")).then((function(_this) {
        return function(transaction) {
          var dialog;
          _this.view.cpfpButton.removeClass('disabled');
          if (!_this.isShown()) {
            return;
          }
          dialog = new WalletSendCpfpDialogViewController({
            transaction: transaction,
            account: account,
            operation: _this.operation
          });
          return dialog.show();
        };
      })(this)).fail((function(_this) {
        return function(error) {
          var dialog, errorMessage, reason;
          if (!_this.isShown()) {
            return;
          }
          e(error);
          if (error != null) {
            if (error.code === ledger.errors.FeesTooLow) {
              _this.view.cpfpButton.removeClass('disabled');
              if (!_this.isShown()) {
                return;
              }
              dialog = new WalletSendCpfpDialogViewController({
                transaction: error.payload,
                account: account,
                operation: _this.operation
              });
              return dialog.show();
            } else {
              reason = (function() {
                switch (error.code) {
                  case ledger.errors.NetworkError:
                    return 'network_no_response';
                  case ledger.errors.NotEnoughFunds:
                    return 'unsufficient_balance';
                  case ledger.errors.NotEnoughFundsConfirmed:
                    return 'unsufficient_balance';
                  case ledger.errors.TransactionAlreadyConfirmed:
                    return 'transaction_already_confirmed';
                  case ledger.errors.DustTransaction:
                    return 'dust_transaction';
                  case ledger.errors.TransactionNotEligible:
                    return 'transaction_not_eligible';
                  case ledger.errors.ChangeDerivationError:
                    return 'change_derivation_error';
                  default:
                    return 'error_occurred';
                }
              })();
              errorMessage = (function() {
                switch (reason) {
                  case 'dust_transaction':
                    return _.str.sprintf(t("common.errors." + reason), ledger.formatters.formatValue(ledger.wallet.Transaction.MINIMUM_OUTPUT_VALUE));
                  default:
                    return t("common.errors." + reason);
                }
              })();
              dialog = new CommonDialogsMessageDialogViewController({
                kind: "error",
                title: t("wallet.send.errors.cpfp_failed"),
                subtitle: errorMessage
              });
              return dialog.show();
            }
          }
        };
      })(this));
    };

    return WalletDialogsOperationdetailDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
