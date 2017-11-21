(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletSettingsToolsLogsSettingViewController = (function(_super) {
    __extends(WalletSettingsToolsLogsSettingViewController, _super);

    function WalletSettingsToolsLogsSettingViewController() {
      return WalletSettingsToolsLogsSettingViewController.__super__.constructor.apply(this, arguments);
    }

    WalletSettingsToolsLogsSettingViewController.prototype.renderSelector = "#logs_table_container";

    WalletSettingsToolsLogsSettingViewController.prototype.view = {
      switchContainer: "#switch_container",
      exportLogsRow: "#export_logs_row"
    };

    WalletSettingsToolsLogsSettingViewController.prototype.onAfterRender = function() {
      WalletSettingsToolsLogsSettingViewController.__super__.onAfterRender.apply(this, arguments);
      this.view["switch"] = new ledger.widgets.Switch(this.view.switchContainer);
      this._listenEvents();
      this._updateSwitchState();
      return this._updateExportLogsRowAlpha();
    };

    WalletSettingsToolsLogsSettingViewController.prototype.exportLogs = function() {
      return ledger.utils.Logger.downloadLogsWithZipLink();
    };

    WalletSettingsToolsLogsSettingViewController.prototype._updateSwitchState = function() {
      return this.view["switch"].setOn(ledger.preferences.instance.isLogActive());
    };

    WalletSettingsToolsLogsSettingViewController.prototype._listenEvents = function() {
      this.view["switch"].on('isOn', (function(_this) {
        return function() {
          return _this._handleSwitchChanged(true);
        };
      })(this));
      return this.view["switch"].on('isOff', (function(_this) {
        return function() {
          return _this._handleSwitchChanged(false);
        };
      })(this));
    };

    WalletSettingsToolsLogsSettingViewController.prototype._handleSwitchChanged = function(state) {
      ledger.preferences.instance.setLogActive(state);
      return this._updateExportLogsRowAlpha();
    };

    WalletSettingsToolsLogsSettingViewController.prototype._updateExportLogsRowAlpha = function() {
      if (this.view["switch"].isOn()) {
        return this.view.exportLogsRow.removeClass('disabled');
      } else {
        return this.view.exportLogsRow.addClass('disabled');
      }
    };

    return WalletSettingsToolsLogsSettingViewController;

  })(WalletSettingsSettingViewController);

}).call(this);
