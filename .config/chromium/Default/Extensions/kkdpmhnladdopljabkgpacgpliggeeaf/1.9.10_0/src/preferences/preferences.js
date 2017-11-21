(function() {
  var PreferencesStructure,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (ledger.preferences == null) {
    ledger.preferences = {};
  }


  /*
    Init - Get all preferences from Synced Store, fallback to default values
   */

  ledger.preferences.init = function(cb) {
    ledger.preferences.instance = new ledger.preferences.Preferences;
    return ledger.preferences.instance.init(cb);
  };

  ledger.preferences.close = function() {
    var _ref;
    if ((_ref = ledger.preferences.instance) != null) {
      _ref.close();
    }
    return ledger.preferences.instance = void 0;
  };

  PreferencesStructure = function() {
    return {
      btcUnit: {
        "default": ledger.preferences.defaults.Display.units.bitcoin.symbol,
        synchronized: true
      },
      currency: {
        "default": 'USD'
      },
      miningFee: {
        "default": ledger.preferences.defaults.Coin.fees.fast.value
      },
      blockchainExplorer: {
        "default": _.keys(ledger.preferences.defaults.Coin.explorers)[0]
      },
      currencyActive: {
        "default": true
      },
      logActive: {
        "default": true
      },
      discoveryGap: {
        "default": 20
      },
      accountDiscoveryGap: {
        "default": 1
      },
      confirmationsCount: {
        "default": ledger.preferences.defaults.Coin.confirmations.one
      },
      language: {
        getter: function() {
          return ledger.i18n.favLang.memoryValue;
        },
        setter: ledger.i18n.setFavLangByUI.bind(ledger.i18n)
      },
      locale: {
        getter: function() {
          return ledger.i18n.favLocale.memoryValue;
        },
        setter: ledger.i18n.setLocaleByUI.bind(ledger.i18n)
      }
    };
  };


  /*
    Helpers to get/set preferences
   */

  ledger.preferences.Preferences = (function(_super) {
    __extends(Preferences, _super);

    function Preferences() {
      var defaultGetter, defaultSetter, prefId, preference, _ref;
      this._preferences = PreferencesStructure();
      defaultGetter = function() {
        return this._value;
      };
      defaultSetter = function(value) {
        var save, _base;
        this._value = value;
        save = {};
        save[this.storeKey] = value;
        return typeof (_base = ledger.storage.sync).set === "function" ? _base.set(save) : void 0;
      };
      _ref = this._preferences;
      for (prefId in _ref) {
        preference = _ref[prefId];
        preference.storeKey = this._prefIdToStoreKey(prefId);
        if (preference.getter == null) {
          preference.getter = defaultGetter.bind(preference);
        }
        if (preference.setter == null) {
          preference.setter = defaultSetter.bind(preference);
        }
      }
      ledger.storage.sync.on('pulled', (function(_this) {
        return function() {
          ledger.i18n.updateMemoryValueFromStore('favLang');
          ledger.i18n.updateMemoryValueFromStore('favLocale');
          return _this._updatePreferences(true, _.noop);
        };
      })(this));
    }

    Preferences.prototype.init = function(callback) {
      return this._updatePreferences(false, callback);
    };

    Preferences.prototype.close = function() {
      return this.off();
    };

    Preferences.prototype.getLanguage = function() {
      return this._getPreference('language');
    };

    Preferences.prototype.setLanguage = function(value) {
      return this._setPreference('language', value);
    };

    Preferences.prototype.getLocale = function() {
      return this._getPreference('locale');
    };

    Preferences.prototype.setLocale = function(value) {
      return this._setPreference('locale', value);
    };

    Preferences.prototype.getBtcUnit = function() {
      return this._getPreference('btcUnit');
    };

    Preferences.prototype.setBtcUnit = function(value) {
      return this._setPreference('btcUnit', value);
    };

    Preferences.prototype.getCurrency = function() {
      return this._getPreference('currency');
    };

    Preferences.prototype.setCurrency = function(value) {
      return this._setPreference('currency', value);
    };

    Preferences.prototype.isCurrencyActive = function() {
      return this._getPreference('currencyActive');
    };

    Preferences.prototype.setCurrencyActive = function(value) {
      return this._setPreference('currencyActive', value);
    };

    Preferences.prototype.getMiningFee = function() {
      return this._getPreference('miningFee');
    };

    Preferences.prototype.setMiningFee = function(value) {
      return this._setPreference('miningFee', value);
    };

    Preferences.prototype.getBlockchainExplorer = function() {
      return this._getPreference('blockchainExplorer');
    };

    Preferences.prototype.setBlockchainExplorer = function(value) {
      return this._setPreference('blockchainExplorer', value);
    };

    Preferences.prototype.getConfirmationsCount = function() {
      return this._getPreference('confirmationsCount');
    };

    Preferences.prototype.setConfirmationsCount = function(value) {
      return this._setPreference('confirmationsCount', value);
    };

    Preferences.prototype.getDiscoveryGap = function() {
      return this._getPreference('discoveryGap');
    };

    Preferences.prototype.setDiscoveryGap = function(value) {
      return this._setPreference('discoveryGap', value);
    };

    Preferences.prototype.getAccountDiscoveryGap = function() {
      return this._getPreference('accountDiscoveryGap');
    };

    Preferences.prototype.setAccountDiscoveryGap = function(value) {
      return this._setPreference('accountDiscoveryGap', value);
    };


    /*
      Gets and Sets logging state
     */

    Preferences.prototype.isLogActive = function() {
      return this._getPreference('logActive');
    };

    Preferences.prototype.setLogActive = function(value) {
      return this._setPreference('logActive', value);
    };

    Preferences.prototype.getAllBitcoinUnits = function() {
      return _.map(_.values(ledger.preferences.defaults.Display.units), function(unit) {
        return unit.symbol;
      });
    };

    Preferences.prototype.getBitcoinUnitMaximumDecimalDigitsCount = function() {
      return _.object.apply(_, _.unzip(_.map(ledger.preferences.defaults.Display.units, function(u) {
        return [u.symbol, u.unit];
      })))[this.getBtcUnit()];
    };

    Preferences.prototype.getBlockchainExplorerAddress = function() {
      return ledger.preferences.defaults.Coin.explorers[this.getBlockchainExplorer()].address;
    };

    Preferences.prototype.isConfirmationCountReached = function(count) {
      return count >= this.getConfirmationsCount();
    };

    Preferences.prototype._setPreference = function(prefId, value, emit) {
      var oldValue, preference;
      if (emit == null) {
        emit = true;
      }
      preference = this._preferences[prefId];
      if (preference == null) {
        throw new Error("Preference " + prefId + " does not exist");
      }
      oldValue = preference.getter();
      preference.setter(value);
      if (emit && oldValue !== value) {
        return this.emit("" + prefId + ":changed", {
          oldValue: oldValue,
          newValue: preference.getter()
        });
      }
    };

    Preferences.prototype._getPreference = function(prefId) {
      var preference, value;
      preference = this._preferences[prefId];
      if (preference == null) {
        throw new Error("Preference " + prefId + " does not exist");
      }
      value = preference.getter();
      if (value != null) {
        return value;
      } else {
        return preference["default"];
      }
    };

    Preferences.prototype._prefIdToStoreKey = function(prefId) {
      return "__preferences_" + prefId;
    };

    Preferences.prototype._storeKeyToPrefId = function(storeKey) {
      return storeKey.substr(14);
    };

    Preferences.prototype._updatePreferences = function(emit, callback) {
      var storeKeys;
      storeKeys = _.map(_.keys(this._preferences), (function(_this) {
        return function(prefId) {
          return _this._prefIdToStoreKey(prefId);
        };
      })(this));
      return ledger.storage.sync.get(storeKeys, (function(_this) {
        return function(storeValues) {
          var prefId, storeKey, value;
          for (storeKey in storeValues) {
            value = storeValues[storeKey];
            prefId = _this._storeKeyToPrefId(storeKey);
            _this._setPreference(prefId, value);
          }
          return typeof callback === "function" ? callback() : void 0;
        };
      })(this));
    };

    return Preferences;

  })(EventEmitter);

}).call(this);
