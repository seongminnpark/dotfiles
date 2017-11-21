(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletReceiveIndexDialogViewController = (function(_super) {
    __extends(WalletReceiveIndexDialogViewController, _super);

    function WalletReceiveIndexDialogViewController() {
      return WalletReceiveIndexDialogViewController.__super__.constructor.apply(this, arguments);
    }

    WalletReceiveIndexDialogViewController.prototype.view = {
      amountInput: '#amount_input',
      currencyContainer: '#currency_container',
      receiverAddress: "#receiver_address",
      accountsSelect: '#accounts_select',
      colorSquare: '#color_square',
      verifyButton: '#verify_button'
    };

    WalletReceiveIndexDialogViewController.prototype.onAfterRender = function() {
      WalletReceiveIndexDialogViewController.__super__.onAfterRender.apply(this, arguments);
      if (this.params.amount != null) {
        this.view.amountInput.val(this.params.amount);
      }
      this.view.qrcode = new QRCode("qrcode_frame", {
        text: "",
        width: 196,
        height: 196,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
      });
      this.view.amountInput.amountInput(ledger.preferences.instance.getBitcoinUnitMaximumDecimalDigitsCount());
      this._updateAccountsSelect();
      this._updateColorSquare();
      this._updateQrCode();
      this._updateReceiverAddress();
      this._listenEvents();
      if (!ledger.app.dongle.getFirmwareInformation().hasVerifyAddressOnScreen() || (ledger.app.dongle.getFirmwareInformation().getIntFirmwareVersion() < 0x30010109 && ledger.config.network.handleSegwit)) {
        return this.view.verifyButton.hide();
      }
    };

    WalletReceiveIndexDialogViewController.prototype.onShow = function() {
      WalletReceiveIndexDialogViewController.__super__.onShow.apply(this, arguments);
      return this.view.amountInput.focus();
    };

    WalletReceiveIndexDialogViewController.prototype.mail = function() {
      return window.open('mailto:?body=' + this._receivingAddress());
    };

    WalletReceiveIndexDialogViewController.prototype.print = function() {
      return window.print();
    };

    WalletReceiveIndexDialogViewController.prototype._listenEvents = function() {
      this.view.amountInput.on('keyup', (function(_this) {
        return function(e) {
          return _.defer(function() {
            _this._updateQrCode();
            return _this._updateExchangeValue();
          });
        };
      })(this));
      return this.view.accountsSelect.on('change', (function(_this) {
        return function() {
          _this._updateColorSquare();
          _this._updateQrCode();
          return _this._updateReceiverAddress();
        };
      })(this));
    };

    WalletReceiveIndexDialogViewController.prototype._updateQrCode = function() {
      return this.view.qrcode.makeCode(this._bitcoinAddressUri());
    };

    WalletReceiveIndexDialogViewController.prototype._updateExchangeValue = function() {
      var value, valueSatoshi;
      valueSatoshi = ledger.formatters.fromValueToSatoshi(_.str.trim(this.view.amountInput.val() || "0"));
      value = ledger.Amount.fromSatoshi(valueSatoshi);
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

    WalletReceiveIndexDialogViewController.prototype._updateReceiverAddress = function() {
      return this.view.receiverAddress.text(this._receivingAddress());
    };

    WalletReceiveIndexDialogViewController.prototype._bitcoinAddressUri = function() {
      var uri;
      uri = ledger.config.network.scheme + this._receivingAddress();
      if (this._selectedAmount() !== "0" && this._selectedAmount() !== 0) {
        uri += "?amount=" + (ledger.formatters.fromSatoshiToBTC(this._selectedAmount()).replace(',', '.').replace(" ", ""));
      }
      return uri;
    };

    WalletReceiveIndexDialogViewController.prototype._updateAccountsSelect = function() {
      var account, accounts, option, _i, _len, _results;
      accounts = Account.displayableAccounts();
      _results = [];
      for (_i = 0, _len = accounts.length; _i < _len; _i++) {
        account = accounts[_i];
        option = $('<option></option>').text(account.name + ' (' + ledger.formatters.formatValue(account.balance) + ')').val(account.index);
        if ((this.params.account_id != null) && account.index === +this.params.account_id) {
          option.attr('selected', true);
        }
        _results.push(this.view.accountsSelect.append(option));
      }
      return _results;
    };

    WalletReceiveIndexDialogViewController.prototype._updateColorSquare = function() {
      return this.view.colorSquare.css('color', this._selectedAccount().get('color'));
    };

    WalletReceiveIndexDialogViewController.prototype._selectedAccount = function() {
      return Account.find({
        index: parseInt(this.view.accountsSelect.val())
      }).first();
    };

    WalletReceiveIndexDialogViewController.prototype._selectedAmount = function() {
      return ledger.formatters.fromValueToSatoshi(this.view.amountInput.val() || "0");
    };

    WalletReceiveIndexDialogViewController.prototype._receivingAddress = function() {
      return this._selectedAccount().getWalletAccount().getCurrentPublicAddress();
    };

    WalletReceiveIndexDialogViewController.prototype.verify = function() {
      var _ref;
      if (((_ref = this._verifyQueue) != null ? _ref.inspect().state : void 0) === "pending") {
        return;
      }
      this._verifyQueue = ledger.app.dongle.verifyAddressOnScreen(this._selectedAccount().getWalletAccount().getCurrentPublicAddressPath());
    };

    return WalletReceiveIndexDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
