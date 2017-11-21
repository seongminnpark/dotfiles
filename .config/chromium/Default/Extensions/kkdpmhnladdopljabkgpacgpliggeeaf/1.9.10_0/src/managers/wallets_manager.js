(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletsManager = (function(_super) {
    __extends(WalletsManager, _super);

    WalletsManager.prototype._wallets = {};

    WalletsManager.prototype._restoreStates = [];

    function WalletsManager(app) {
      this.cardFactory = new ChromeapiPlugupCardTerminalFactory();
      this.factoryDongleBootloader = new ChromeapiPlugupCardTerminalFactory(0x1808);
      this.factoryDongleBootloaderHID = new ChromeapiPlugupCardTerminalFactory(0x1807);
      app.devicesManager.on('plug', (function(_this) {
        return function(e, card) {
          return _this.connectCard(card);
        };
      })(this));
      app.devicesManager.on('unplug', (function(_this) {
        return function(e, card) {
          return _this.disconnectCard(card);
        };
      })(this));
    }

    WalletsManager.prototype.connectCard = function(card) {
      var er, result;
      try {
        card.isInBootloaderMode = card.productId === 0x1808 || card.productId === 0x1807 ? true : false;
        this.emit('connecting', card);
        result = [];
        return this.cardFactory.list_async().then((function(_this) {
          return function(cards) {
            result = result.concat(cards);
            return _this.factoryDongleBootloader.list_async();
          };
        })(this)).then((function(_this) {
          return function(cards) {
            result = result.concat(cards);
            return _this.factoryDongleBootloaderHID.list_async();
          };
        })(this)).then((function(_this) {
          return function(cards) {
            result = result.concat(cards);
            return _.defer(function() {
              if (result.length > 0) {
                return _this.cardFactory.getCardTerminal(result[0]).getCard_async().then(function(lwCard) {
                  return _.defer(function() {
                    _this._wallets[card.id] = new ledger.wallet.HardwareWallet(_this, card, lwCard);
                    _this._wallets[card.id].once('connected', function(event, wallet) {
                      _this.emit('connected', wallet);
                      if (_(ledger.app.devicesManager.devices()).where({
                        id: wallet.id
                      }).length === 0) {
                        return _.defer(function() {
                          return wallet.disconnect();
                        });
                      }
                    });
                    _this._wallets[card.id].once('forged', function(event, wallet) {
                      return _this.emit('forged', wallet);
                    });
                    return _this._wallets[card.id].connect();
                  });
                });
              }
            });
          };
        })(this));
      } catch (_error) {
        er = _error;
        return e(er);
      }
    };

    WalletsManager.prototype.addRestorableState = function(state, expiry) {
      this._restoreStates.push(state);
      if ((expiry != null) >= 0) {
        return setTimeout((function(_this) {
          return function() {
            return _this.removeRestorableState(state);
          };
        })(this), expiry);
      }
    };

    WalletsManager.prototype.removeRestorableState = function(state) {
      return this._restoreStates = _(this._restoreStates).reject(function(item) {
        return item === state;
      });
    };

    WalletsManager.prototype.findRestorableStates = function(predicate) {
      return _(this._restoreStates).where(predicate);
    };

    WalletsManager.prototype.disconnectCard = function(card) {
      var _ref;
      if ((_ref = this._wallets[card.id]) != null) {
        _ref.disconnect();
      }
      return this.emit('disconnect', card);
    };

    WalletsManager.prototype.getConnectedWallets = function() {
      return _(_.values(this._wallets)).filter(function(w) {
        return w._state !== ledger.wallet.States.DISCONNECTED;
      });
    };

    return WalletsManager;

  })(EventEmitter);

}).call(this);
