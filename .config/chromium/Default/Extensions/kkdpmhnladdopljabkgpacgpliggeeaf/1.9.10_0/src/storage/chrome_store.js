(function() {
  var getChromeVersion,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  getChromeVersion = function() {
    return getChromeVersion.version || (getChromeVersion.version = +navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)[2]);
  };

  this.ledger.storage.ChromeStore = (function(_super) {
    __extends(ChromeStore, _super);

    function ChromeStore() {
      return ChromeStore.__super__.constructor.apply(this, arguments);
    }

    ChromeStore.prototype._raw_get = function(keys, cb) {
      var e;
      try {
        if ((keys != null) && keys.length < 1) {
          keys = null;
        }
        return chrome.storage.local.get(keys, cb);
      } catch (_error) {
        e = _error;
        return console.error("chrome.storage.local.get :", e);
      }
    };

    ChromeStore.prototype._raw_set = function(items, cb) {
      var e;
      if (cb == null) {
        cb = function() {};
      }
      try {
        if (getChromeVersion() >= 42) {
          chrome.storage.local.set(items);
          return _.defer(cb);
        } else {
          return chrome.storage.local.set(items, cb);
        }
      } catch (_error) {
        e = _error;
        return console.error("chrome.storage.local.set :", e);
      }
    };

    ChromeStore.prototype._raw_keys = function(cb) {
      var e;
      try {
        return chrome.storage.local.get(null, function(raw_items) {
          return cb(_.keys(raw_items));
        });
      } catch (_error) {
        e = _error;
        return console.error("chrome.storage.local.get :", e);
      }
    };

    ChromeStore.prototype._raw_remove = function(keys, cb) {
      var e;
      if (cb == null) {
        cb = function() {};
      }
      try {
        if (getChromeVersion() >= 42) {
          chrome.storage.local.remove(keys);
          return _.defer(cb);
        } else {
          return chrome.storage.local.remove(keys, cb);
        }
      } catch (_error) {
        e = _error;
        return console.error("chrome.storage.local.remove :", e);
      }
    };

    return ChromeStore;

  })(ledger.storage.Store);

}).call(this);
