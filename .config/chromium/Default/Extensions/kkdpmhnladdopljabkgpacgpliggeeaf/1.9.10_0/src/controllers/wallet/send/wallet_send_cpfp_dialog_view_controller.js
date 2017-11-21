(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletSendCpfpDialogViewController = (function(_super) {
    __extends(WalletSendCpfpDialogViewController, _super);

    function WalletSendCpfpDialogViewController() {
      return WalletSendCpfpDialogViewController.__super__.constructor.apply(this, arguments);
    }

    WalletSendCpfpDialogViewController.prototype.view = {
      feesPerByte: '#fees_per_byte',
      check: '#check',
      message: '#message',
      feesPerByte: '#fees_per_byte',
      sendButton: '#send_button',
      totalLabel: '#total_label',
      counterValueTotalLabel: '#countervalue_total_label',
      feesValidation: '#fees_validation'
    };

    WalletSendCpfpDialogViewController.prototype.initialize = function() {
      WalletSendCpfpDialogViewController.__super__.initialize.apply(this, arguments);
      this.operation = this.params.operation;
      this.account = this.params.account;
      this.feesPerByte = ledger.tasks.FeesComputationTask.instance.getFeesForNumberOfBlocks(1) / 1000;
      this.transaction = this.params.transaction;
      this.amount = ledger.formatters.formatValue(ledger.Amount.fromSatoshi(10000));
      this.address = this.params.account.getWalletAccount().getCurrentPublicAddress();
      this.fees = this.transaction.fees;
      return this.countervalue = ledger.converters.satoshiToCurrencyFormatted(this.fees);
    };

    WalletSendCpfpDialogViewController.prototype.onShow = function() {
      WalletSendCpfpDialogViewController.__super__.onShow.apply(this, arguments);
      return this.view.feesPerByte.focus();
    };

    WalletSendCpfpDialogViewController.prototype.onAfterRender = function() {
      WalletSendCpfpDialogViewController.__super__.onAfterRender.apply(this, arguments);
      this.view.feesValidation.hide();
      this._checkFees();
      this.view.message.text(t('wallet.cpfp.message'));
      this.view.check.text(t('wallet.cpfp.check'));
      this._updateTotalLabel(this.fees, this.countervalue);
      this.view.feesPerByte.keypress((function(_this) {
        return function(e) {
          if (e.which < 48 || 57 < e.which || _this.view.feesPerByte.val() > 99999) {
            return e.preventDefault();
          }
        };
      })(this));
      this.view.feesPerByte.on('paste', (function(_this) {
        return function(e) {
          return e.preventDefault();
        };
      })(this));
      return this.view.feesPerByte.on('keyup', _.debounce(this._checkFees, 500));
    };

    WalletSendCpfpDialogViewController.prototype._checkFees = function() {
      return ledger.bitcoin.cpfp.createTransaction(this.account, this.operation.get("hash"), ledger.Amount.fromSatoshi(this.view.feesPerByte.val())).then((function(_this) {
        return function(transaction) {
          _this.view.check.text(t('wallet.cpfp.check'));
          _this.view.check.removeClass('red');
          _this.view.sendButton.removeClass('disabled');
          _this.view.feesPerByte.removeClass('red');
          _this.transaction = transaction;
          _this.fees = _this.transaction.fees;
          _this.feesPerByte = _this.fees.divide(_this.transaction.size);
          if (_this.feesPerByte.toSatoshiNumber() >= ledger.tasks.FeesComputationTask.instance.getFeesForNumberOfBlocks(1) / 1000) {
            _this.view.feesValidation.text(t('wallet.cpfp.valid_fees'));
            _this.view.feesValidation.removeClass('red');
            _this.view.feesValidation.show();
          } else {
            _this.view.feesValidation.text(t('wallet.cpfp.low_fees'));
            _this.view.feesValidation.addClass('red');
            _this.view.feesValidation.show();
          }
          _this.countervalue = ledger.converters.satoshiToCurrencyFormatted(_this.fees);
          return _this._updateTotalLabel(_this.fees, _this.countervalue);
        };
      })(this))["catch"]((function(_this) {
        return function(err) {
          _this.view.feesValidation.hide();
          _this.view.check.text(err.localizedMessage());
          _this.view.check.addClass('red');
          _this.fees = ledger.Amount.fromSatoshi(_this.view.feesPerByte.val()).multiply(_this.transaction.size);
          _this.countervalue = ledger.converters.satoshiToCurrencyFormatted(_this.fees);
          _this._updateTotalLabel(_this.fees, _this.countervalue);
          _this.view.sendButton.addClass('disabled');
          return _this.view.feesPerByte.addClass('red');
        };
      })(this));
    };

    WalletSendCpfpDialogViewController.prototype.onDismiss = function() {
      WalletSendCpfpDialogViewController.__super__.onDismiss.apply(this, arguments);
      if (this._scheduledRefresh != null) {
        return clearTimeout(this._scheduledRefresh);
      }
    };

    WalletSendCpfpDialogViewController.prototype.cancel = function() {
      Api.callback_cancel('send_payment', t('wallet.send.errors.cancelled'));
      return this.dismiss();
    };

    WalletSendCpfpDialogViewController.prototype.send = function() {
      var preparingDialog;
      preparingDialog = new WalletSendPreparingDialogViewController({
        amount: 10000,
        address: this.account.getWalletAccount().getCurrentPublicAddress(),
        fees: this.transaction.fees,
        account: this.account,
        utxo: this.transaction.inputs
      });
      return this.getDialog().push(preparingDialog);
    };

    WalletSendCpfpDialogViewController.prototype._updateTotalLabel = function(fees, counterValueFee, amount) {
      if (amount == null) {
        amount = ledger.Amount.fromSatoshi(10000);
      }
      this.view.totalLabel.text(ledger.formatters.formatValue(amount.add(fees)) + ' ' + _.str.sprintf(t('wallet.send.index.transaction_fees_text'), ledger.formatters.formatValue(fees)));
      return this.view.counterValueTotalLabel.html(ledger.converters.satoshiToCurrencyFormatted(amount.add(fees)) + ' ' + _.str.sprintf(t('wallet.send.index.transaction_fees_text'), counterValueFee));
    };

    return WalletSendCpfpDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
