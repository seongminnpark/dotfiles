(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletSettingsDisplayLanguageSettingViewController = (function(_super) {
    __extends(WalletSettingsDisplayLanguageSettingViewController, _super);

    function WalletSettingsDisplayLanguageSettingViewController() {
      return WalletSettingsDisplayLanguageSettingViewController.__super__.constructor.apply(this, arguments);
    }

    WalletSettingsDisplayLanguageSettingViewController.prototype.renderSelector = "#language_table_container";

    WalletSettingsDisplayLanguageSettingViewController.prototype.view = {
      languageSelect: "#language_select",
      regionSelect: "#region_select"
    };

    WalletSettingsDisplayLanguageSettingViewController.prototype.onAfterRender = function() {
      WalletSettingsDisplayLanguageSettingViewController.__super__.onAfterRender.apply(this, arguments);
      this._updateLanguages();
      this._updateRegions();
      return this._listenEvents();
    };

    WalletSettingsDisplayLanguageSettingViewController.prototype._updateLanguages = function() {
      var id, node, _i, _len, _ref, _results;
      this.view.languageSelect.empty();
      _ref = _.sortBy(_.keys(ledger.preferences.defaults.Display.languages), function(id) {
        return ledger.preferences.defaults.Display.languages[id];
      });
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        id = _ref[_i];
        node = $("<option></option>").text(ledger.preferences.defaults.Display.languages[id]).attr('value', id);
        if (id === ledger.preferences.instance.getLanguage()) {
          node.attr('selected', true);
        }
        _results.push(this.view.languageSelect.append(node));
      }
      return _results;
    };

    WalletSettingsDisplayLanguageSettingViewController.prototype._updateRegions = function(fromPreferences) {
      var id, languageCode, node, regions, _i, _len, _ref, _results;
      if (fromPreferences == null) {
        fromPreferences = true;
      }
      languageCode = this.view.languageSelect.val();
      this.view.regionSelect.empty();
      regions = ledger.i18n.getRegionsByLanguage(languageCode);
      _ref = _.sortBy(_.keys(regions), function(id) {
        return regions[id];
      });
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        id = _ref[_i];
        node = $("<option></option>").text(regions[id]).attr('value', id);
        if ((fromPreferences === true && id === ledger.preferences.instance.getLocale()) || (fromPreferences === false && id === ledger.i18n.mostAcceptedLanguage())) {
          node.attr('selected', true);
        }
        _results.push(this.view.regionSelect.append(node));
      }
      return _results;
    };

    WalletSettingsDisplayLanguageSettingViewController.prototype._listenEvents = function() {
      this.view.languageSelect.on('change', (function(_this) {
        return function() {
          ledger.preferences.instance.setLanguage(_this.view.languageSelect.val());
          _this._updateRegions(false);
          return ledger.preferences.instance.setLocale(_this.view.regionSelect.val());
        };
      })(this));
      return this.view.regionSelect.on('change', (function(_this) {
        return function() {
          return ledger.preferences.instance.setLocale(_this.view.regionSelect.val());
        };
      })(this));
    };

    return WalletSettingsDisplayLanguageSettingViewController;

  })(WalletSettingsSettingViewController);

}).call(this);
