(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletSettingsDisplayUnitsSettingViewController = (function(_super) {
    __extends(WalletSettingsDisplayUnitsSettingViewController, _super);

    function WalletSettingsDisplayUnitsSettingViewController() {
      return WalletSettingsDisplayUnitsSettingViewController.__super__.constructor.apply(this, arguments);
    }

    WalletSettingsDisplayUnitsSettingViewController.prototype.renderSelector = "#units_table_container";

    WalletSettingsDisplayUnitsSettingViewController.prototype.view = {
      segmentedControlContainer: "#segmented_control_container"
    };

    WalletSettingsDisplayUnitsSettingViewController.prototype.onAfterRender = function() {
      WalletSettingsDisplayUnitsSettingViewController.__super__.onAfterRender.apply(this, arguments);
      this.view.segmentedControl = new ledger.widgets.SegmentedControl(this.view.segmentedControlContainer, ledger.widgets.SegmentedControl.Styles.Small);
      this._updateUnits();
      return this._listenEvents();
    };

    WalletSettingsDisplayUnitsSettingViewController.prototype._updateUnits = function() {
      var id, index, indexToSelect, _i, _len, _ref;
      indexToSelect = -1;
      this.view.segmentedControl.removeAllActions();
      _ref = _.keys(ledger.preferences.defaults.Display.units);
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        id = _ref[index];
        this.view.segmentedControl.addAction(ledger.preferences.defaults.Display.units[id].symbol);
        if (ledger.preferences.defaults.Display.units[id].symbol === ledger.preferences.instance.getBtcUnit()) {
          indexToSelect = index;
        }
      }
      if (indexToSelect !== -1) {
        return this.view.segmentedControl.setSelectedIndex(indexToSelect);
      }
    };

    WalletSettingsDisplayUnitsSettingViewController.prototype._listenEvents = function() {
      return this.view.segmentedControl.on('selection', (function(_this) {
        return function(event, data) {
          var symbol;
          symbol = ledger.preferences.defaults.Display.units[_.keys(ledger.preferences.defaults.Display.units)[data.index]].symbol;
          return ledger.preferences.instance.setBtcUnit(symbol);
        };
      })(this));
    };

    return WalletSettingsDisplayUnitsSettingViewController;

  })(WalletSettingsSettingViewController);

}).call(this);
