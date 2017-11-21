(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletSettingsBitcoinBlockchainSettingViewController = (function(_super) {
    __extends(WalletSettingsBitcoinBlockchainSettingViewController, _super);

    function WalletSettingsBitcoinBlockchainSettingViewController() {
      return WalletSettingsBitcoinBlockchainSettingViewController.__super__.constructor.apply(this, arguments);
    }

    WalletSettingsBitcoinBlockchainSettingViewController.prototype.renderSelector = "#blockchain_table_container";

    WalletSettingsBitcoinBlockchainSettingViewController.prototype.view = {
      blockchainSelect: "#blockchain_select"
    };

    WalletSettingsBitcoinBlockchainSettingViewController.prototype.onAfterRender = function() {
      WalletSettingsBitcoinBlockchainSettingViewController.__super__.onAfterRender.apply(this, arguments);
      this._updateExplorer();
      return this._listenEvents();
    };

    WalletSettingsBitcoinBlockchainSettingViewController.prototype._updateExplorer = function() {
      var id, node, _i, _len, _ref, _results;
      this.view.blockchainSelect.empty();
      _ref = _.keys(ledger.preferences.defaults.Coin.explorers);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        id = _ref[_i];
        node = $("<option></option>").text(ledger.preferences.defaults.Coin.explorers[id].name).attr('value', id);
        if (id === ledger.preferences.instance.getBlockchainExplorer()) {
          node.attr('selected', true);
        }
        _results.push(this.view.blockchainSelect.append(node));
      }
      return _results;
    };

    WalletSettingsBitcoinBlockchainSettingViewController.prototype._listenEvents = function() {
      return this.view.blockchainSelect.on('change', (function(_this) {
        return function() {
          return ledger.preferences.instance.setBlockchainExplorer(_this.view.blockchainSelect.val());
        };
      })(this));
    };

    return WalletSettingsBitcoinBlockchainSettingViewController;

  })(WalletSettingsSettingViewController);

}).call(this);
