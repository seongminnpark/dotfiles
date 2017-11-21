(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletSettingsBitcoinConfirmationsSettingViewController = (function(_super) {
    __extends(WalletSettingsBitcoinConfirmationsSettingViewController, _super);

    function WalletSettingsBitcoinConfirmationsSettingViewController() {
      return WalletSettingsBitcoinConfirmationsSettingViewController.__super__.constructor.apply(this, arguments);
    }

    WalletSettingsBitcoinConfirmationsSettingViewController.prototype.renderSelector = "#confirmations_table_container";

    WalletSettingsBitcoinConfirmationsSettingViewController.prototype.view = {
      segmentedControlContainer: "#segmented_control_container"
    };

    WalletSettingsBitcoinConfirmationsSettingViewController.prototype.onAfterRender = function() {
      WalletSettingsBitcoinConfirmationsSettingViewController.__super__.onAfterRender.apply(this, arguments);
      this.view.segmentedControl = new ledger.widgets.SegmentedControl(this.view.segmentedControlContainer, ledger.widgets.SegmentedControl.Styles.Small);
      this._updateConfirmations();
      return this._listenEvents();
    };

    WalletSettingsBitcoinConfirmationsSettingViewController.prototype._updateConfirmations = function() {
      var id, index, indexToSelect, _i, _len, _ref;
      indexToSelect = -1;
      this.view.segmentedControl.removeAllActions();
      _ref = _.keys(ledger.preferences.defaults.Coin.confirmations);
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        id = _ref[index];
        this.view.segmentedControl.addAction(ledger.preferences.defaults.Coin.confirmations[id]);
        if (ledger.preferences.defaults.Coin.confirmations[id] === ledger.preferences.instance.getConfirmationsCount()) {
          indexToSelect = index;
        }
      }
      if (indexToSelect !== -1) {
        return this.view.segmentedControl.setSelectedIndex(indexToSelect);
      }
    };

    WalletSettingsBitcoinConfirmationsSettingViewController.prototype._listenEvents = function() {
      return this.view.segmentedControl.on('selection', (function(_this) {
        return function(event, data) {
          var confirmations, count;
          confirmations = _.keys(ledger.preferences.defaults.Coin.confirmations);
          count = ledger.preferences.defaults.Coin.confirmations[confirmations[data.index]];
          return ledger.preferences.instance.setConfirmationsCount(count);
        };
      })(this));
    };

    return WalletSettingsBitcoinConfirmationsSettingViewController;

  })(WalletSettingsSettingViewController);

}).call(this);
