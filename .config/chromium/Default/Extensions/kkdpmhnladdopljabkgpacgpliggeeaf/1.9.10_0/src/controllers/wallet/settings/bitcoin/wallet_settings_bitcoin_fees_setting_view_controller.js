(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletSettingsBitcoinFeesSettingViewController = (function(_super) {
    __extends(WalletSettingsBitcoinFeesSettingViewController, _super);

    function WalletSettingsBitcoinFeesSettingViewController() {
      return WalletSettingsBitcoinFeesSettingViewController.__super__.constructor.apply(this, arguments);
    }

    WalletSettingsBitcoinFeesSettingViewController.prototype.renderSelector = "#fees_table_container";

    WalletSettingsBitcoinFeesSettingViewController.prototype.view = {
      feesSelect: "#fees_select"
    };

    WalletSettingsBitcoinFeesSettingViewController.prototype.onAfterRender = function() {
      WalletSettingsBitcoinFeesSettingViewController.__super__.onAfterRender.apply(this, arguments);
      this._updateFees();
      return this._listenEvents();
    };

    WalletSettingsBitcoinFeesSettingViewController.prototype._updateFees = function() {
      var fee, id, node, text, _i, _len, _ref, _results;
      this.view.feesSelect.empty();
      _ref = _.sortBy(_.keys(ledger.preferences.defaults.Coin.fees), function(id) {
        return ledger.preferences.defaults.Coin.fees[id].value;
      }).reverse();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        id = _ref[_i];
        fee = ledger.preferences.defaults.Coin.fees[id];
        text = t(fee.localization);
        node = $("<option></option>").text(text).attr('value', fee.value);
        if (fee.value === ledger.preferences.instance.getMiningFee()) {
          node.attr('selected', true);
        }
        _results.push(this.view.feesSelect.append(node));
      }
      return _results;
    };

    WalletSettingsBitcoinFeesSettingViewController.prototype._listenEvents = function() {
      return this.view.feesSelect.on('change', (function(_this) {
        return function() {
          return ledger.preferences.instance.setMiningFee(_this.view.feesSelect.val().toString());
        };
      })(this));
    };

    return WalletSettingsBitcoinFeesSettingViewController;

  })(WalletSettingsSettingViewController);

}).call(this);
