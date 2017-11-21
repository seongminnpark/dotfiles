
/*
  Internationalization and Localization
 */

(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ledger.i18n = (function() {
    function i18n() {}

    i18n.chromeStore = void 0;

    i18n.translations = {};


    /*
      User Favorite Language object
    
      @favLang
        memoryValue [String] The user favorite language in memory
        syncStoreValue [String] The user favorite language into syncStore
        chromeStoreValue [String] The user favorite language into chromeStore
        syncStoreIsSet [Boolean] If @favLang.syncStoreValue is set into syncStore
        chromeStoreIsSet [Boolean] If @favLang.chromeStoreValue is set into chromeStore
     */

    i18n.favLang = {
      memoryValue: void 0,
      syncStoreValue: void 0,
      chromeStoreValue: void 0,
      syncStoreIsSet: void 0,
      chromeStoreIsSet: void 0,
      storesAreSync: void 0
    };


    /*
      User favorite language and region (Locale)
     */

    i18n.favLocale = {
      memoryValue: void 0,
      syncStoreValue: void 0,
      chromeStoreValue: void 0,
      syncStoreIsSet: void 0,
      chromeStoreIsSet: void 0,
      storesAreSync: void 0
    };

    i18n.browserAcceptLanguages = void 0;

    i18n.Languages = {};

    i18n.init = function(cb) {
      i18n.chromeStore = new ledger.storage.ChromeStore('i18n');
      i18n.loadTranslationFiles().then(function() {
        return i18n.initBrowserAcceptLanguages();
      }).then(function() {
        return Q.all([i18n.initStoreValues('favLang'), i18n.initStoreValues('favLocale')]);
      }).then(function() {
        return i18n.setMomentLocale();
      })["catch"](function(err) {
        return l(err);
      }).then(function() {
        return cb();
      })["catch"](function(err) {
        return l(err);
      }).done();
      return ledger.app.on('wallet:initialized', function() {
        return Q.all([i18n.initStoreValues('favLang'), i18n.initStoreValues('favLocale')]);
      });
    };


    /*
      Init values with stores
     */

    i18n.initStoreValues = function(i18nValueName) {
      return i18n.checkStores(i18nValueName).then(function() {
        return i18n.updateMemoryValueFromStore(i18nValueName);
      })["catch"](function(err) {
        return i18n.initMemoryValueFromBrowser(i18nValueName).then(function() {
          return i18n.setValueToStore(i18nValueName);
        }).then(function() {
          return i18n.checkStores(i18nValueName);
        });
      }).then(function() {
        return i18n.checkSyncStoreEqChromeStore(i18nValueName);
      })["catch"](function(err) {
        return i18n.updateChromeStore(i18nValueName);
      });
    };


    /*
      Know about the supported languages and load the translation files
     */

    i18n.loadTranslationFiles = function() {
      var tag;
      return Q.all((function() {
        var _results;
        _results = [];
        for (tag in this.Languages) {
          _results.push(this._loadTranslationFile(tag));
        }
        return _results;
      }).call(i18n));
    };


    /*
      Fetch translation file
      @param [String] tag Codified language tag
     */

    i18n._loadTranslationFile = function(tag) {
      var d, url;
      d = ledger.defer();
      url = '/_locales/' + tag + '/messages.json';
      if (chrome.runtime.getBackgroundPage(function() {
        return {} === 'electron-wrapper';
      })) {
        url = window.path + url;
      }
      $.ajax({
        dataType: "json",
        url: url,
        success: function(data) {
          ledger.i18n.translations[tag] = data;
          return d.resolve();
        }
      });
      return d.promise;
    };


    /*
       Check if i18nValueName is set into syncStore OR chromeStore and set store value in memory for further checking
       @param [String] i18nValueName Value you want to check if set into store. Must be 'favLocale' or 'favLang'
       @return [Promise]
     */

    i18n.checkStores = function(i18nValueName) {
      var d;
      d = ledger.defer();
      if (ledger.storage.sync != null) {
        ledger.storage.sync.get(["__i18n_" + i18nValueName], function(r) {
          if (r["__i18n_" + i18nValueName] != null) {
            i18n[i18nValueName].syncStoreIsSet = true;
            i18n[i18nValueName].syncStoreValue = Array.isArray(r["__i18n_" + i18nValueName]) ? r["__i18n_" + i18nValueName][0] : r["__i18n_" + i18nValueName];
            return d.resolve(("ledger.storage.sync.get r.__i18n_" + i18nValueName + " ") + r["__i18n_" + i18nValueName] + " is set into synced Store");
          } else {
            i18n[i18nValueName].syncStoreIsSet = false;
            return d.reject(("ledger.storage.sync.get r.__i18n_" + i18nValueName + " ") + r["__i18n_" + i18nValueName] + " is not set into synced Store");
          }
        });
      } else {
        i18n.chromeStore.get(["__i18n_" + i18nValueName], function(r) {
          if (r["__i18n_" + i18nValueName] != null) {
            i18n[i18nValueName].chromeStoreIsSet = true;
            i18n[i18nValueName].chromeStoreValue = Array.isArray(r["__i18n_" + i18nValueName]) ? r["__i18n_" + i18nValueName][0] : r["__i18n_" + i18nValueName];
            return d.resolve(("@chromeStore.get r.__i18n_" + i18nValueName + " ") + r["__i18n_" + i18nValueName] + " is set into chromeStore");
          } else {
            i18n[i18nValueName].chromeStoreIsSet = false;
            return d.reject(("@chromeStore.get r.__i18n_" + i18nValueName + " ") + r["__i18n_" + i18nValueName] + " is not set into chromeStore");
          }
        });
      }
      return d.promise;
    };


    /*
      Load i18n memoryValue from one of the store
      @param [String] i18nValueName Value type to load, 'favLocale' or 'favLang'
      @return [Promise]
     */

    i18n.updateMemoryValueFromStore = function(i18nValueName) {
      var d;
      d = ledger.defer();
      if (ledger.storage.sync != null) {
        ledger.storage.sync.get(["__i18n_" + i18nValueName], function(r) {
          i18n[i18nValueName].memoryValue = Array.isArray(r["__i18n_" + i18nValueName]) ? r["__i18n_" + i18nValueName][0] : r["__i18n_" + i18nValueName];
          return d.resolve();
        });
      } else {
        i18n.chromeStore.get(["__i18n_" + i18nValueName], function(r) {
          i18n[i18nValueName].memoryValue = Array.isArray(r["__i18n_" + i18nValueName]) ? r["__i18n_" + i18nValueName][0] : r["__i18n_" + i18nValueName];
          return d.resolve();
        });
      }
      return d.promise;
    };


    /*
      Update Locale chrome store
      @param [String] i18nValueName Value you want to update. Must be 'favLocale' or 'favLang'
      @param [function] callback Callback
     */

    i18n.updateChromeStore = function(i18nValueName, callback) {
      var d, data;
      if (callback == null) {
        callback = void 0;
      }
      d = ledger.defer(callback);
      data = {};
      if ((ledger.storage.sync != null) && (i18n[i18nValueName].syncStoreValue != null)) {
        i18n[i18nValueName].chromeStoreValue = i18n[i18nValueName].syncStoreValue;
        data["__i18n_" + i18nValueName] = i18n[i18nValueName].chromeStoreValue;
        i18n.chromeStore.set(data, function() {
          return d.resolve();
        });
      } else {
        d.resolve();
      }
      return d.promise;
    };


    /*
      Set i18nValueName into stores from memory
     */

    i18n.setValueToStore = function(i18nValueName) {
      var d, store, _data;
      d = ledger.defer();
      _data = {};
      _data["__i18n_" + i18nValueName] = i18n[i18nValueName].memoryValue;
      store = ledger.storage.sync || i18n.chromeStore;
      return store.set(_data, function() {
        return d.resolve().promise;
      });
    };


    /*
     */

    i18n.initBrowserAcceptLanguages = function() {
      var d;
      d = ledger.defer();
      chrome.i18n.getAcceptLanguages(function(requestedLocales) {
        i18n.browserAcceptLanguages = _.map(requestedLocales, function(obj) {
          return obj;
        });
        return d.resolve();
      });
      return d.promise;
    };


    /*
      Set @favLang.memoryValue with one of the browser accept language (@browserAcceptLanguages), fallback on browser UI language
     */

    i18n.initMemoryValueFromBrowser = function(i18nValueName) {
      var browserUiLang, d, done, lng, tag, _i, _len, _ref;
      d = ledger.defer();
      done = false;
      browserUiLang = chrome.i18n.getUILanguage();
      _ref = i18n.browserAcceptLanguages;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        tag = _ref[_i];
        lng = tag.substr(0, 2);
        if (!done && _.chain().keys(i18n.Languages).some(function(l) {
          return l.startsWith(lng);
        }).value()) {
          i18n[i18nValueName].memoryValue = i18nValueName === 'favLang' && (tag.length > 2) ? tag.substr(0, 2) : tag;
          done = true;
        }
        if (i18n.favLang.memoryValue == null) {
          i18n.favLang.memoryValue = browserUiLang;
        }
        if (i18n.favLocale.memoryValue == null) {
          i18n.favLocale.memoryValue = browserUiLang;
        }
        if (i18n.favLang.memoryValue == null) {
          i18n.favLang.memoryValue = 'en';
        }
        d.resolve();
      }
      return d.promise;
    };

    i18n.mostAcceptedLanguage = function() {
      return i18n.browserAcceptLanguages[0];
    };


    /*
      Check if Chrome store values equals Sync Store values
      @param [String] i18nValueName Value you want to check. Must be 'favLocale' or 'favLang'
     */

    i18n.checkSyncStoreEqChromeStore = function(i18nValueName) {
      var d;
      d = ledger.defer();
      if (ledger.storage.sync != null) {
        if ((i18n[i18nValueName].chromeStoreValue === i18n[i18nValueName].syncStoreValue) && (i18n[i18nValueName].syncStoreValue != null)) {
          i18n[i18nValueName].storesAreSync = true;
          d.resolve();
        } else {
          i18n[i18nValueName].storesAreSync = false;
          d.reject('Stores are not sync');
        }
      } else {
        d.resolve();
      }
      return d.promise;
    };


    /*
      Set user locale (region) into memory and both stores by UI
      @example Set a locale
        ledger.i18n.setLocaleByUI('en-GB')
      @param [String] tag Codified (BCP 47) language tag - Official list here : http://www.iana.org/assignments/language-subtag-registry/language-subtag-registry
     */

    i18n.setLocaleByUI = function(locale) {
      var d, tag;
      d = ledger.defer();
      tag = _.str.replace(locale, '_', '-');
      i18n.chromeStore.set({
        __i18n_favLocale: tag
      }, function() {
        return ledger.storage.sync.set({
          __i18n_favLocale: tag
        }, function() {
          _.extend(i18n.favLocale, i18n.favLocale = {
            memoryValue: tag,
            chromeStoreValue: tag,
            syncStoreValue: tag,
            syncStoreIsSet: true,
            chromeStoreIsSet: true,
            storesAreSync: true
          });
          i18n.setMomentLocale();
          return d.resolve();
        });
      });
      return d.promise;
    };


    /*
      Set user favorite language into memory and both stores By UI
      @param [String] tag Codified (BCP 47) language tag - Official list here : http://www.iana.org/assignments/language-subtag-registry/language-subtag-registry
     */

    i18n.setFavLangByUI = function(tag) {
      var d;
      d = ledger.defer();
      if (__indexOf.call(Object.keys(i18n.Languages), tag) < 0) {
        tag = 'en';
        throw new Error('Language not yet supported! English set as default.');
      }
      i18n.chromeStore.set({
        __i18n_favLang: tag
      }, function() {
        return ledger.storage.sync.set({
          __i18n_favLang: tag
        }, function() {
          _.extend(i18n.favLang, i18n.favLang = {
            memoryValue: tag,
            chromeStoreValue: tag,
            syncStoreValue: tag,
            syncStoreIsSet: true,
            chromeStoreIsSet: true,
            storesAreSync: true
          });
          return d.resolve();
        });
      });
      return d.promise;
    };

    i18n.getRegionsByLanguage = function(language) {
      var lng, name, regions, _ref;
      language = language.indexOf("-") !== -1 ? language.split("-")[0] : language;
      regions = {};
      _ref = ledger.preferences.defaults.Display.regions;
      for (lng in _ref) {
        name = _ref[lng];
        if (!_.str.startsWith(lng, language)) {
          continue;
        }
        regions[lng] = name;
      }
      return regions;
    };

    i18n.findBestLanguage = function() {
      var language;
      language = this.favLang.memoryValue;
      if ((language != null ? language.length : void 0) === 2 && (_(_.keys(this.Languages)).find(function(l) {
        return l.startsWith(language);
      }) != null)) {
        this.favLang.memoryValue = _(_.keys(this.Languages)).find(function(l) {
          return l.startsWith(language);
        });
        return Try((function(_this) {
          return function() {
            return _this.setFavLangByUI(_(_.keys(_this.Languages)).find(function(l) {
              return l.startsWith(language);
            }));
          };
        })(this));
      } else {
        this.favLang.memoryValue = "en";
        return Try((function(_this) {
          return function() {
            return _this.setFavLangByUI("en");
          };
        })(this));
      }
    };

    return i18n;

  })();

}).call(this);
