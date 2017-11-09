(function() {
  describe("Internationalization and Localization -", function() {
    var chromeStore, i18n, originalTimeout;
    i18n = ledger.i18n;
    chromeStore = {};
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    beforeAll(function() {
      return jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;
    });
    beforeEach(function() {
      ledger.storage.sync = new ledger.storage.MemoryStore('i18n');
      return chromeStore = i18n.chromeStore;
    });
    describe("Test setFavLangByUI() - ", function() {
      it("should change the language", function(done) {
        return i18n.setFavLangByUI('en').then(function() {
          expect(i18n.favLang.memoryValue).toBe('en');
          return done();
        });
      });
      it("should sync the language to chrome store", function(done) {
        return i18n.setFavLangByUI('en').then(function() {
          var res;
          res = '';
          return chromeStore.get(['__i18n_favLang'], function(r) {
            if (Array.isArray(r.__i18n_favLang)) {
              res = r.__i18n_favLang[0];
            } else {
              res = r.__i18n_favLang;
            }
            expect(res).toBe('en');
            return done();
          });
        });
      });
      return it("should sync the language to synced store", function(done) {
        return i18n.setFavLangByUI('fr').then(function() {
          var res;
          res = '';
          return ledger.storage.sync.get('__i18n_favLang', function(r) {
            if (Array.isArray(r.__i18n_favLang)) {
              res = r.__i18n_favLang[0];
            } else {
              res = r.__i18n_favLang;
            }
            expect(res).toBe('fr');
            return done();
          });
        });
      });
    });
    describe("Test setLocaleByUI() - ", function() {
      it("should change the locale", function(done) {
        return i18n.setLocaleByUI('en-GB').then(function() {
          expect(i18n.favLocale.memoryValue).toBe('en-GB');
          expect(moment.locale()).toBe('en-gb');
          return done();
        });
      });
      it("should sync the locale to chrome store", function(done) {
        return i18n.setLocaleByUI('zh-tw').then(function() {
          var res;
          res = '';
          return chromeStore.get(['__i18n_favLocale'], function(r) {
            if (Array.isArray(r.__i18n_favLocale)) {
              res = r.__i18n_favLocale[0];
            } else {
              res = r.__i18n_favLocale;
            }
            expect(res).toBe('zh-tw');
            return done();
          });
        });
      });
      return it("should sync the locale to synced store", function(done) {
        return i18n.setLocaleByUI('fr-CA').then(function() {
          var res;
          res = '';
          return ledger.storage.sync.get(['__i18n_favLocale'], function(r) {
            if (Array.isArray(r.__i18n_favLocale)) {
              res = r.__i18n_favLocale[0];
            } else {
              res = r.__i18n_favLocale;
            }
            expect(res).toBe('fr-CA');
            return done();
          });
        });
      });
    });
    return describe("Check values after full init (chromeStore + syncStore)", function() {
      beforeEach(function() {
        chromeStore.remove(['__i18n_favLang']);
        chromeStore.remove(['__i18n_favLocale']);
        ledger.storage.sync.remove(['__i18n_favLang']);
        return ledger.storage.sync.remove(['__i18n_favLocale']);
      });
      it("should set two chars tag lang and four chars tag locale", function(done) {
        spyOn(i18n, 'initBrowserAcceptLanguages').and.callFake(function() {
          i18n.browserAcceptLanguages = ['be', 'fr-CA', 'zh-tw', 'fr'];
          return ledger.defer().resolve().promise;
        });
        return i18n.init(function() {
          expect(i18n.favLang.memoryValue).toBe('fr');
          expect(i18n.favLang.chromeStoreValue).toBe('fr');
          expect(i18n.favLang.syncStoreValue).toBe('fr');
          expect(i18n.favLocale.memoryValue).toBe('fr-CA');
          expect(i18n.favLocale.chromeStoreValue).toBe('fr-CA');
          expect(i18n.favLocale.syncStoreValue).toBe('fr-CA');
          return done();
        });
      });
      it("should set two chars tag lang and locale", function(done) {
        spyOn(i18n, 'initBrowserAcceptLanguages').and.callFake(function() {
          i18n.browserAcceptLanguages = ['zh', 'fr', 'en-GB', 'it'];
          return ledger.defer().resolve().promise;
        });
        return i18n.init(function() {
          expect(i18n.favLang.memoryValue).toBe('fr');
          expect(i18n.favLang.chromeStoreValue).toBe('fr');
          expect(i18n.favLang.syncStoreValue).toBe('fr');
          expect(i18n.favLocale.memoryValue).toBe('fr');
          expect(i18n.favLocale.chromeStoreValue).toBe('fr');
          expect(i18n.favLocale.syncStoreValue).toBe('fr');
          return done();
        });
      });
      it("should fallback to browser UI lang - chrome.i18n.getUILanguage()", function(done) {
        spyOn(i18n, 'initBrowserAcceptLanguages').and.callFake(function() {
          i18n.browserAcceptLanguages = ['dfr', 'huj', 'jla', 'dede', 'lp'];
          return ledger.defer().resolve().promise;
        });
        return i18n.init(function() {
          expect(i18n.favLang.memoryValue).toBe(chrome.i18n.getUILanguage());
          expect(i18n.favLang.chromeStoreValue).toBe(chrome.i18n.getUILanguage());
          expect(i18n.favLang.syncStoreValue).toBe(chrome.i18n.getUILanguage());
          expect(i18n.favLocale.memoryValue).toBe(chrome.i18n.getUILanguage());
          expect(i18n.favLocale.chromeStoreValue).toBe(chrome.i18n.getUILanguage());
          expect(i18n.favLocale.syncStoreValue).toBe(chrome.i18n.getUILanguage());
          return done();
        });
      });
      it("should have sync store set", function(done) {
        spyOn(i18n, 'initBrowserAcceptLanguages').and.callFake(function() {
          i18n.browserAcceptLanguages = ['be', 'fr-CA', 'zh-tw', 'fr'];
          return ledger.defer().resolve().promise;
        });
        return i18n.init(function() {
          expect(i18n.favLang.syncStoreIsSet).toBe(true);
          expect(i18n.favLocale.syncStoreIsSet).toBe(true);
          return done();
        });
      });
      afterEach(function() {
        return chrome.storage.local.clear();
      });
      return jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });
  });

}).call(this);
