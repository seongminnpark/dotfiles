(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletSettingsDisplayCurrencySettingViewController = (function(_super) {
    __extends(WalletSettingsDisplayCurrencySettingViewController, _super);

    function WalletSettingsDisplayCurrencySettingViewController() {
      return WalletSettingsDisplayCurrencySettingViewController.__super__.constructor.apply(this, arguments);
    }

    WalletSettingsDisplayCurrencySettingViewController.prototype.renderSelector = "#currency_table_container";

    WalletSettingsDisplayCurrencySettingViewController.prototype.view = {
      switchContainer: "#switch_container",
      exchangeRateRow: "#exchange_rate_row",
      currenciesSelect: "#currencies_select"
    };

    WalletSettingsDisplayCurrencySettingViewController.prototype.onAfterRender = function() {
      WalletSettingsDisplayCurrencySettingViewController.__super__.onAfterRender.apply(this, arguments);
      this.view["switch"] = new ledger.widgets.Switch(this.view.switchContainer);
      this._updateCurrencies();
      this._updateSwitchState();
      this._updateExchangeRowAlpha();
      return this._listenEvents();
    };

    WalletSettingsDisplayCurrencySettingViewController.prototype._updateExchangeRowAlpha = function() {
      if (this.view["switch"].isOn()) {
        return this.view.exchangeRateRow.removeClass('disabled');
      } else {
        return this.view.exchangeRateRow.addClass('disabled');
      }
    };

    WalletSettingsDisplayCurrencySettingViewController.prototype._updateCurrencies = function() {
      return ledger.tasks.TickerTask.instance.getCacheAsync((function(_this) {
        return function(data) {
          var id, node, _i, _len, _ref, _results;
          _this.view.currenciesSelect.empty();
          _ref = _.sortBy(_.keys(data), function(id) {
            return data[id].name;
          });
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            id = _ref[_i];
            node = $("<option></option>").text(data[id].name + ' - ' + data[id].ticker + ' (' + data[id].symbol + ')').attr('value', id);
            if (data[id].ticker === ledger.preferences.instance.getCurrency()) {
              node.attr('selected', true);
            }
            _results.push(_this.view.currenciesSelect.append(node));
          }
          return _results;
        };
      })(this));
    };

    WalletSettingsDisplayCurrencySettingViewController.prototype._updateSwitchState = function() {
      return this.view["switch"].setOn(ledger.preferences.instance.isCurrencyActive());
    };

    WalletSettingsDisplayCurrencySettingViewController.prototype._listenEvents = function() {
      this.view["switch"].on('isOn', (function(_this) {
        return function() {
          return _this._handleSwitchChanged(true);
        };
      })(this));
      this.view["switch"].on('isOff', (function(_this) {
        return function() {
          return _this._handleSwitchChanged(false);
        };
      })(this));
      return this.view.currenciesSelect.on('change', (function(_this) {
        return function() {
          return ledger.preferences.instance.setCurrency(_this.view.currenciesSelect.val());
        };
      })(this));
    };

    WalletSettingsDisplayCurrencySettingViewController.prototype._handleSwitchChanged = function(state) {
      ledger.preferences.instance.setCurrencyActive(state);
      return this._updateExchangeRowAlpha();
    };

    return WalletSettingsDisplayCurrencySettingViewController;

  })(WalletSettingsSettingViewController);

}).call(this);
