(function() {
  var _base;

  if ((_base = this.ledger).storage == null) {
    _base.storage = {};
  }

  this.ledger.storage.openStores = function(bitIdAddress, passphrase) {
    var localStorage;
    localStorage = new ledger.storage.SecureStore('ledger.local.' + bitIdAddress + ledger.config.network.name, passphrase);
    ledger.storage.wallet = new ledger.storage.SecureStore('ledger.wallet.v2' + bitIdAddress + ledger.config.network.name, passphrase);
    ledger.storage.local = new ledger.storage.SecureStore('ledger.local.' + bitIdAddress + ledger.config.network.name, passphrase);
    ledger.storage.databases = new ledger.storage.SecureStore('ledger.database.' + bitIdAddress + ledger.config.network.name, passphrase);
    ledger.storage.logs = new ledger.storage.SecureStore('ledger.logs' + bitIdAddress + ledger.config.network.name, passphrase);
    ledger.storage.sync = new ledger.storage.SyncedStore('ledger.meta.' + bitIdAddress + ledger.config.network.name, bitIdAddress, passphrase);
    ledger.storage.sync.wallet = ledger.storage.sync.substore("wallet_layout" + bitIdAddress + ledger.config.network.name);
    return ledger.storage.logs.clear();
  };

  this.ledger.storage.closeStores = function() {
    var key, storage, _ref, _results;
    _ref = ledger.storage;
    _results = [];
    for (key in _ref) {
      storage = _ref[key];
      if (!(_(storage).isKindOf(ledger.storage.Store))) {
        continue;
      }
      storage.close();
      _results.push(ledger.storage[key] = null);
    }
    return _results;
  };

  this.ledger.storage.global = {};

  this.ledger.storage.global.chainSelector = new ledger.storage.ChromeStore("chainSelector");

}).call(this);
