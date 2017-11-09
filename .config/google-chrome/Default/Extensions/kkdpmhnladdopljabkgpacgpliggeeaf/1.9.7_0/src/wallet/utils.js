(function() {
  var PREDEFINED_CHANGE_ADDRESSES, PREDEFINED_PUBLIC_ADDRESSES, pathsToPredefinedAddresses, _base;

  if ((_base = this.ledger).wallet == null) {
    _base.wallet = {};
  }

  PREDEFINED_CHANGE_ADDRESSES = [];

  PREDEFINED_PUBLIC_ADDRESSES = ["1KAkAp8Jxan81z72WzDpS27Az1FXB3tmak"];

  pathsToPredefinedAddresses = function(paths, callback) {
    var address, addresses, index, path, _i, _len;
    addresses = {};
    for (_i = 0, _len = paths.length; _i < _len; _i++) {
      path = paths[_i];
      if (path.indexOf("44'/0'/0'/0/") !== -1) {
        index = parseInt(path.replace("44'/0'/0'/0/", ''));
        address = index < PREDEFINED_PUBLIC_ADDRESSES.length ? PREDEFINED_PUBLIC_ADDRESSES[index] : PREDEFINED_PUBLIC_ADDRESSES[PREDEFINED_PUBLIC_ADDRESSES.length - 1];
        if (address != null) {
          addresses[path] = address;
        }
      } else if (path.indexOf("44'/0'/0'/1/") !== -1) {
        index = parseInt(path.replace("44'/0'/0'/1/", ''));
        address = index < PREDEFINED_CHANGE_ADDRESSES.length ? PREDEFINED_CHANGE_ADDRESSES[index] : PREDEFINED_CHANGE_ADDRESSES[PREDEFINED_CHANGE_ADDRESSES.length - 1];
        if (address != null) {
          addresses[path] = address;
        }
      }
    }
    return typeof callback === "function" ? callback(addresses) : void 0;
  };

  _.extend(ledger.wallet, {
    pathsToAddresses: function(paths, callback) {
      if (callback == null) {
        callback = void 0;
      }
      ledger.wallet.pathsToAddressesStream(paths).stopOnError(function(err) {
        return typeof callback === "function" ? callback([], err) : void 0;
      }).toArray(function(array) {
        if (callback != null) {
          return callback(_.object(array), []);
        }
      });
    },

    /*
      Derives the given paths and return a stream of path -> address pairs
      @param (Array|Stream)
     */
    pathsToAddressesStream: function(paths) {
      ledger.dongle.unlocked();
      if (_.isEmpty(paths)) {
        ledger.utils.Logger.getLoggerByTag('WalletUtils').warn("Attempts to derive empty paths ", new Error().stack);
        return highland([]);
      }
      return ledger.stream(paths).consume(function(err, path, push, next) {
        var address, _ref, _ref1;
        if (path === ledger.stream.nil) {
          return push(null, ledger.stream.nil);
        } else {
          address = (_ref = ledger.wallet.Wallet.instance) != null ? (_ref1 = _ref.cache) != null ? _ref1.get(path) : void 0 : void 0;
          if (address != null) {
            push(null, [path, address]);
            return next();
          }
          return ledger.tasks.AddressDerivationTask.instance.getPublicAddress(path, function(result, error) {
            if (error != null) {
              push([path]);
            } else {
              push(null, [path, result]);
            }
            return next();
          });
        }
      });
    },
    checkSetup: function(dongle, seed, pin, callback) {
      if (callback == null) {
        callback = void 0;
      }
      return ledger.defer(callback).resolve((function() {
        dongle.lock();
        return dongle.unlockWithPinCode(pin).then(function() {
          var address, node;
          node = bitcoin.HDNode.fromSeedHex(seed, ledger.config.network.bitcoinjs);
          address = node.deriveHardened(44).deriveHardened(+ledger.config.network.bip44_coin_type).deriveHardened(0).derive(0).derive(0).getAddress().toString();
          return dongle.getPublicAddress("44'/" + ledger.config.network.bip44_coin_type + "'/0'/0/0").then(function(result) {
            if (address !== result.bitcoinAddress.toString(ASCII)) {
              throw new Error("Invalid Seed");
            }
          });
        });
      })()).promise;
    }
  });

}).call(this);
