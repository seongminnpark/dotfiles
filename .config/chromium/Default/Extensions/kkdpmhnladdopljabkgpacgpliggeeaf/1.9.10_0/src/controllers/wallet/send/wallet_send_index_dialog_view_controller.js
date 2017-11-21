(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletSendIndexDialogViewController = (function(_super) {
    var blogLink;

    __extends(WalletSendIndexDialogViewController, _super);

    function WalletSendIndexDialogViewController() {
      return WalletSendIndexDialogViewController.__super__.constructor.apply(this, arguments);
    }

    WalletSendIndexDialogViewController.prototype.view = {
      amountInput: '#amount_input',
      currencyContainer: '#currency_container',
      sendButton: '#send_button',
      totalLabel: '#total_label',
      counterValueTotalLabel: '#countervalue_total_label',
      errorContainer: '#error_container',
      receiverInput: '#receiver_input',
      dataInput: '#data_input',
      dataRow: '#data_row',
      openScannerButton: '#open_scanner_button',
      feesSelect: '#fees_select',
      accountsSelect: '#accounts_select',
      colorSquare: '#color_square',
      maxButton: '#max_button',
      customFeesRow: '#custom_fees_row',
      warning: '#warning',
      link: '#link'
    };

    blogLink = "";

    WalletSendIndexDialogViewController.prototype.RefreshWalletInterval = 15 * 60 * 1000;

    WalletSendIndexDialogViewController.prototype.onAfterRender = function() {
      WalletSendIndexDialogViewController.__super__.onAfterRender.apply(this, arguments);
      this.view.dataRow.hide();
      l(ledger.config.network);
      ledger.api.WarningRestClient.instance.getWarning().then((function(_this) {
        return function(json) {
          if (json[ledger.config.network.ticker] != null) {
            if (json[ledger.config.network.ticker].message != null) {
              _this.view.warning.css('visibility', 'visible');
              _this.view.warning.text(json[ledger.config.network.ticker].message);
            }
            if (json[ledger.config.network.ticker].link != null) {
              _this.blogLink = json[ledger.config.network.ticker].link;
              return _this.view.link.css('visibility', 'visible');
            }
          }
        };
      })(this));
      this.view.warning.show();
      if (this.params.amount != null) {
        this.view.amountInput.val(this.params.amount);
      }
      if (this.params.address != null) {
        this.view.receiverInput.val(this.params.address);
      }
      if ((this.params.data != null) && this.params.data.length > 0) {
        this.view.dataInput.val(this.params.data);
        this.view.dataRow.show();
      }
      this.view.customFeesRow.hide();
      this.view.amountInput.amountInput(ledger.preferences.instance.getBitcoinUnitMaximumDecimalDigitsCount());
      this.view.errorContainer.hide();
      this._utxo = [];
      this._updateFeesSelect();
      this._updateAccountsSelect();
      this._updateCurrentAccount();
      this._updateTotalLabel();
      this._listenEvents();
      this._ensureDatabaseUpToDate();
      this._updateSendButton();
      return this._updateTotalLabel = _.debounce(this._updateTotalLabel.bind(this), 500);
    };

    WalletSendIndexDialogViewController.prototype.openLink = function() {
      return open(this.blogLink);
    };

    WalletSendIndexDialogViewController.prototype.onShow = function() {
      WalletSendIndexDialogViewController.__super__.onShow.apply(this, arguments);
      return this.view.amountInput.focus();
    };

    WalletSendIndexDialogViewController.prototype.onDismiss = function() {
      WalletSendIndexDialogViewController.__super__.onDismiss.apply(this, arguments);
      if (this._scheduledRefresh != null) {
        return clearTimeout(this._scheduledRefresh);
      }
    };

    WalletSendIndexDialogViewController.prototype.cancel = function() {
      Api.callback_cancel('send_payment', t('wallet.send.errors.cancelled'));
      return this.dismiss();
    };

    WalletSendIndexDialogViewController.prototype.send = function() {
      var amount, fees, nextError, pushDialogBlock, _ref;
      nextError = this._nextFormError();
      if (nextError != null) {
        this.view.errorContainer.show();
        return this.view.errorContainer.text(nextError);
      } else {
        this.view.errorContainer.hide();
        pushDialogBlock = (function(_this) {
          return function(fees) {
            var data, dialog, utxo, _ref;
            _ref = _this._computeAmount(ledger.Amount.fromSatoshi(fees).divide(1000)), utxo = _ref.utxo, fees = _ref.fees;
            data = _this._dataValue().length > 0 ? _this._dataValue() : void 0;
            dialog = new WalletSendPreparingDialogViewController({
              amount: _this._transactionAmount(),
              address: _this._receiverBitcoinAddress(),
              fees: fees,
              account: _this._selectedAccount(),
              utxo: utxo,
              data: data
            });
            return _this.getDialog().push(dialog);
          };
        })(this);
        _ref = this._computeAmount(), amount = _ref.amount, fees = _ref.fees;
        return pushDialogBlock(this.view.feesSelect.val());
      }
    };

    WalletSendIndexDialogViewController.prototype.max = function() {
      var amount, feePerByte, fees, output, total, utxo, _i, _len;
      feePerByte = ledger.Amount.fromSatoshi(this.view.feesSelect.val()).divide(1000);
      utxo = this._utxo;
      total = ledger.Amount.fromSatoshi(0);
      for (_i = 0, _len = utxo.length; _i < _len; _i++) {
        output = utxo[_i];
        total = total.add(output.get('value'));
      }
      fees = this._computeAmount(feePerByte, total).fees;
      amount = total.subtract(fees);
      if (amount.lte(0)) {
        amount = ledger.Amount.fromSatoshi(0);
      }
      this.view.amountInput.val(ledger.formatters.fromValue(amount, -1, false));
      return _.defer((function(_this) {
        return function() {
          _this._updateTotalLabel();
          return _this._updateExchangeValue();
        };
      })(this));
    };

    WalletSendIndexDialogViewController.prototype.openScanner = function() {
      var dialog;
      dialog = new CommonDialogsQrcodeDialogViewController;
      dialog.qrcodeCheckBlock = (function(_this) {
        return function(data) {
          var params;
          if (Bitcoin.Address.validate(data)) {
            return true;
          }
          params = ledger.managers.schemes.bitcoin.parseURI(data);
          return params != null;
        };
      })(this);
      dialog.once('qrcode', (function(_this) {
        return function(event, data) {
          var params, separator;
          if (Bitcoin.Address.validate(data)) {
            params = {
              address: data
            };
          } else {
            params = ledger.managers.schemes.bitcoin.parseURI(data);
          }
          if ((params != null ? params.amount : void 0) != null) {
            separator = ledger.number.getLocaleDecimalSeparator(ledger.preferences.instance.getLocale().replace('_', '-'));
            _this.view.amountInput.val(ledger.formatters.formatUnit(ledger.formatters.fromBtcToSatoshi(params.amount), ledger.preferences.instance.getBtcUnit()).replace(separator, '.'));
          }
          if ((params != null ? params.address : void 0) != null) {
            _this.view.receiverInput.val(params.address);
          }
          return _this._updateTotalLabel();
        };
      })(this));
      return dialog.show();
    };

    WalletSendIndexDialogViewController.prototype._listenEvents = function() {
      this.view.amountInput.on('keyup', (function(_this) {
        return function() {
          return _.defer(function() {
            _this._updateTotalLabel();
            return _this._updateExchangeValue();
          });
        };
      })(this));
      this.view.openScannerButton.on('click', (function(_this) {
        return function() {
          return _this.openScanner();
        };
      })(this));
      this.view.customFeesRow.find('input').keypress((function(_this) {
        return function(e) {
          if (e.which < 48 || 57 < e.which) {
            return e.preventDefault();
          }
        };
      })(this));
      this.view.customFeesRow.find('input').on('keyup', (function(_this) {
        return function() {
          return _.defer(function() {
            _this.view.feesSelect.find(":selected").attr('value', parseInt(_this.view.customFeesRow.find('input').val()) * 1000);
            return _this._updateTotalLabel();
          });
        };
      })(this));
      this.view.feesSelect.on('change', (function(_this) {
        return function() {
          if (_this.view.feesSelect.find(":selected").text() === t("wallet.send.index.custom_fees")) {
            _this.view.customFeesRow.show();
          } else {
            _this.view.customFeesRow.hide();
          }
          return _this._updateTotalLabel();
        };
      })(this));
      this.view.accountsSelect.on('change', (function(_this) {
        return function() {
          _this._updateCurrentAccount();
          return _this._updateTotalLabel();
        };
      })(this));
      return ledger.app.on('wallet:operations:changed', (function(_this) {
        return function() {
          _this._updateUtxo();
          return _this._updateTotalLabel();
        };
      })(this));
    };

    WalletSendIndexDialogViewController.prototype._updateCustomFees = function() {};

    WalletSendIndexDialogViewController.prototype._receiverBitcoinAddress = function() {
      return _.str.trim(this.view.receiverInput.val());
    };

    WalletSendIndexDialogViewController.prototype._transactionAmount = function() {
      return ledger.formatters.fromValueToSatoshi(_.str.trim(this.view.amountInput.val()));
    };

    WalletSendIndexDialogViewController.prototype._dataValue = function() {
      return this.view.dataInput.val();
    };

    WalletSendIndexDialogViewController.prototype._isDataValid = function() {
      var s;
      s = this._dataValue();
      return s.match(/^[a-f0-9]+$/i) !== null && s.length % 2 === 0 && s.length <= 160;
    };

    WalletSendIndexDialogViewController.prototype._nextFormError = function() {
      if (this._transactionAmount().length === 0 || !ledger.Amount.fromSatoshi(this._transactionAmount()).gt(0)) {
        return t('common.errors.invalid_amount');
      } else if (!ledger.bitcoin.checkAddress(this._receiverBitcoinAddress() || this._receiverBitcoinAddress().startsWith("z"))) {
        return _.str.sprintf(t('common.errors.invalid_receiver_address'), ledger.config.network.display_name);
      } else if (this._dataValue().length > 0 && !this._isDataValid()) {
        return t('common.errors.invalid_op_return_data');
      } else if (ledger.Amount.fromSatoshi(this.view.feesSelect.val()).divide(1000).lt(0) && this.view.customFeesRow.is(':visible')) {
        return t('wallet.send.index.satoshi_per_byte_too_low');
      }
      return void 0;
    };

    WalletSendIndexDialogViewController.prototype._updateFeesSelect = function() {
      var fee, id, node, text, _i, _len, _ref;
      this.view.feesSelect.empty();
      _ref = _.sortBy(_.keys(ledger.preferences.defaults.Coin.fees), function(id) {
        return ledger.preferences.defaults.Coin.fees[id].value;
      }).reverse();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        id = _ref[_i];
        fee = ledger.preferences.defaults.Coin.fees[id];
        text = t(fee.localization);
        node = $("<option></option>").text(text).attr('value', ledger.tasks.FeesComputationTask.instance.getFeesForLevelId(fee.value.toString()).value);
        if (fee.value === ledger.preferences.instance.getMiningFee()) {
          node.attr('selected', true);
        }
        this.view.feesSelect.append(node);
      }
      node = $("<option></option>").text(t("wallet.send.index.custom_fees")).attr('value', 0);
      return this.view.feesSelect.append(node);
    };

    WalletSendIndexDialogViewController.prototype._updateTotalLabel = function() {
      var amount, counterValueFee, fees, _ref;
      _ref = this._computeAmount(), amount = _ref.amount, fees = _ref.fees;
      this.view.totalLabel.text(ledger.formatters.formatValue(amount) + ' ' + _.str.sprintf(t('wallet.send.index.transaction_fees_text'), ledger.formatters.formatValue(fees)));
      counterValueFee = ledger.converters.satoshiToCurrencyFormatted(fees);
      if (parseInt(ledger.converters.satoshiToCurrency(fees, "USD")) >= 1) {
        counterValueFee = '<span class="bold-invalid-text">' + counterValueFee + '</span>';
      }
      return this.view.counterValueTotalLabel.html(ledger.converters.satoshiToCurrencyFormatted(amount) + ' ' + _.str.sprintf(t('wallet.send.index.transaction_fees_text'), counterValueFee));
    };

    WalletSendIndexDialogViewController.prototype._updateExchangeValue = function() {
      var value;
      value = ledger.Amount.fromSatoshi(this._transactionAmount());
      if (ledger.preferences.instance.isCurrencyActive()) {
        if (value.toString() !== this.view.currencyContainer.attr('data-countervalue')) {
          this.view.currencyContainer.removeAttr('data-countervalue');
          this.view.currencyContainer.empty();
          return this.view.currencyContainer.attr('data-countervalue', value);
        }
      } else {
        return this.view.currencyContainer.hide();
      }
    };

    WalletSendIndexDialogViewController.prototype._updateAccountsSelect = function() {
      var account, accounts, option, _i, _len;
      accounts = Account.displayableAccounts();
      for (_i = 0, _len = accounts.length; _i < _len; _i++) {
        account = accounts[_i];
        option = $('<option></option>').text(account.name + ' (' + ledger.formatters.formatValue(account.balance) + ')').val(account.index);
        if ((this.params.account_id != null) && account.index === +this.params.account_id) {
          option.attr('selected', true);
        }
        this.view.accountsSelect.append(option);
      }
      return this._updateUtxo();
    };

    WalletSendIndexDialogViewController.prototype._updateCurrentAccount = function() {
      this._updateUtxo();
      return this._updateColorSquare();
    };

    WalletSendIndexDialogViewController.prototype._updateUtxo = function() {
      return this._utxo = _(this._selectedAccount().getUtxo()).sortBy(function(o) {
        return o.get('transaction').get('confirmations');
      });
    };

    WalletSendIndexDialogViewController.prototype._updateColorSquare = function() {
      return this.view.colorSquare.css('color', this._selectedAccount().get('color'));
    };

    WalletSendIndexDialogViewController.prototype._selectedAccount = function() {
      return Account.find({
        index: parseInt(this.view.accountsSelect.val())
      }).first();
    };

    WalletSendIndexDialogViewController.prototype._computeAmount = function(feePerByte, desiredAmount) {
      var account, compute, utxo;
      if (feePerByte == null) {
        feePerByte = ledger.Amount.fromSatoshi(this.view.feesSelect.val()).divide(1000);
      }
      if (desiredAmount == null) {
        desiredAmount = void 0;
      }
      account = this._selectedAccount();
      if (desiredAmount == null) {
        desiredAmount = ledger.Amount.fromSatoshi(this._transactionAmount());
      }
      if (desiredAmount.lte(0)) {
        return {
          total: ledger.Amount.fromSatoshi(0),
          amount: ledger.Amount.fromSatoshi(0),
          fees: ledger.Amount.fromSatoshi(0),
          utxo: [],
          size: 0
        };
      }
      utxo = this._utxo;
      compute = (function(_this) {
        return function(target) {
          var estimatedSize, fees, output, selectedUtxo, total, _i, _len;
          selectedUtxo = [];
          total = ledger.Amount.fromSatoshi(0);
          for (_i = 0, _len = utxo.length; _i < _len; _i++) {
            output = utxo[_i];
            if (!(total.lt(target))) {
              continue;
            }
            selectedUtxo.push(output);
            total = total.add(output.get('value'));
          }
          estimatedSize = ledger.bitcoin.estimateTransactionSize(selectedUtxo.length, 2).max;
          if (_this._dataValue().length > 0) {
            estimatedSize += _this._dataValue().length / 2 + 4 + 1;
          }
          if (ledger.config.network.handleFeePerByte) {
            fees = feePerByte.multiply(estimatedSize);
          } else {
            fees = feePerByte.multiply(1000).multiply(Math.floor(estimatedSize / 1000) + (estimatedSize % 1000 !== 0 ? 1 : 0));
          }
          if (desiredAmount.gt(0) && total.lt(desiredAmount.add(fees)) && selectedUtxo.length === utxo.length) {
            return {
              total: total,
              amount: desiredAmount.add(fees),
              fees: fees,
              utxo: selectedUtxo,
              size: estimatedSize
            };
          } else if (desiredAmount.gt(0) && total.lt(desiredAmount.add(fees))) {
            return compute(desiredAmount.add(fees));
          } else {
            return {
              total: total,
              amount: desiredAmount.add(fees),
              fees: fees,
              utxo: selectedUtxo,
              size: estimatedSize
            };
          }
        };
      })(this);
      return compute(desiredAmount);
    };

    WalletSendIndexDialogViewController.prototype._ensureDatabaseUpToDate = function() {
      var task;
      task = ledger.tasks.WalletLayoutRecoveryTask.instance;
      task.getLastSynchronizationStatus().then((function(_this) {
        return function(status) {
          var d;
          d = ledger.defer();
          if (task.isRunning() || _.isEmpty(status) || status === 'failure') {
            _this._updateSendButton(true);
            task.startIfNeccessary();
            task.once('done', function() {
              return d.resolve();
            });
            task.once('fatal_error', function() {
              return d.reject(new Error("Fatal error during sync"));
            });
          } else {
            d.resolve();
          }
          return d.promise;
        };
      })(this)).fail((function(_this) {
        return function(er) {
          if (!_this.isShown()) {
            return;
          }
          e(er);
          _this._scheduledRefresh = _.delay(_this._ensureDatabaseUpToDate.bind(_this), 30 * 1000);
          throw er;
        };
      })(this)).then((function(_this) {
        return function() {
          return ledger.tasks.FeesComputationTask.instance.update().then(function() {
            _this._updateSendButton(false);
            _this._updateFeesSelect();
            _this._updateTotalLabel();
            if (!_this.isShown()) {

            }
          });
        };
      })(this));
    };

    WalletSendIndexDialogViewController.prototype._updateSendButton = function(syncing) {
      if (syncing == null) {
        syncing = ledger.tasks.WalletLayoutRecoveryTask.instance.isRunning();
      }
      if (syncing) {
        this.view.sendButton.addClass('disabled');
        return this.view.sendButton.text(t('wallet.send.index.syncing'));
      } else {
        this.view.sendButton.removeClass('disabled');
        return this.view.sendButton.text(t('common.send'));
      }
    };

    return WalletSendIndexDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
