(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  require(this.ledger.imports, function() {
    var Application;
    Application = (function(_super) {
      __extends(Application, _super);

      function Application() {
        return Application.__super__.constructor.apply(this, arguments);
      }

      Application.prototype.chains = {
        currentKey: ""
      };

      Application.prototype.Modes = {
        Wallet: "Wallet",
        FirmwareUpdate: "FirmwareUpdate",
        Setup: "Setup"
      };

      Application.prototype.onStart = function() {
        Api.init();
        ledger.errors.init();
        ledger.utils.Logger.updateGlobalLoggersLevel();
        this._listenAppEvents();
        addEventListener("message", Api.listener.bind(Api), false);
        return ledger.i18n.init((function(_this) {
          return function() {
            return ledger.preferences.common.init(function() {
              if (_this.setExecutionMode(_this.Modes.Wallet)) {
                return _this.router.go('/');
              }
            });
          };
        })(this));
      };


      /*
        Sets the execution mode of the application. In Wallet mode, the application handles the wallets state by starting services,
        emitting specific events. This mode is the normal one, it allows access to accounts, balances...
        In FirmwareUpdate mode, the management of dongles is delegated to an instance of {ledger.fup.FirmwareUpdateRequest}.
      
        Once the execution mode changes, the application will render the corresponding {NavigationController}.
       */

      Application.prototype.setExecutionMode = function(newMode) {
        if (_(_.values(this.Modes)).find(function(m) {
          return m === newMode;
        }).length === 0) {
          throw "Unknown execution mode: " + newMode + ". Available modes are ledger.app.Wallet or ledger.app.FirmwareUpdate.";
        }
        if (newMode === this._currentMode) {
          return false;
        }
        this._currentMode = newMode;
        if (this.isInFirmwareUpdateMode()) {
          this.donglesManager.pause();
          _.defer((function(_this) {
            return function() {
              return _this.releaseWallet(false);
            };
          })(this));
          ledger.utils.Logger.setGlobalLoggersPersistentLogsEnabled(false);
          ledger.utils.Logger.updateGlobalLoggersLevel();
        } else {
          this.donglesManager.resume();
          ledger.utils.Logger.setGlobalLoggersPersistentLogsEnabled(true);
          ledger.utils.Logger.updateGlobalLoggersLevel();
          if (ledger.app.dongle != null) {
            this.connectDongle(ledger.app.dongle);
          }
        }
        return true;
      };


      /*
        Checks if the application is in wallet mode.
      
        @return [Boolean] True if the application is in wallet mode, false otherwise
       */

      Application.prototype.isInWalletMode = function() {
        return this._currentMode === this.Modes.Wallet;
      };


      /*
        Checks if the application is in firmware update mode.
      
        @return [Boolean] True if the application is in firmware update mode, false otherwise.
       */

      Application.prototype.isInFirmwareUpdateMode = function() {
        return this._currentMode === this.Modes.FirmwareUpdate;
      };

      Application.prototype.onConnectingDongle = function(device) {
        if (this.isInWalletMode() && !device.isInBootloaderMode) {
          return this.emit('dongle:connecting', device);
        }
      };

      Application.prototype.onDongleConnected = function(dongle) {
        if (this.isInWalletMode() && !dongle.isInBootloaderMode()) {
          this.performDongleAttestation();
          return ledger.tasks.TickerTask.instance.startIfNeccessary();
        }
      };

      Application.prototype.onDongleCertificationDone = function(dongle, error) {
        if (!this.isInWalletMode()) {
          return;
        }
        if (error == null) {
          return this.emit('dongle:connected', this.dongle);
        } else if (error.code === ledger.errors.DongleNotCertified) {
          return this.emit('dongle:forged', this.dongle);
        } else if (error.code === ledger.errors.CommunicationError) {
          return this.emit('dongle:communication_error', this.dongle);
        }
      };

      Application.prototype.onDongleIsInBootloaderMode = function(dongle) {
        if (this.setExecutionMode(ledger.app.Modes.FirmwareUpdate)) {
          return ledger.app.router.go('/');
        }
      };

      Application.prototype.onDongleNeedsUnplug = function(dongle) {
        if (this.isInWalletMode()) {
          return this.emit('dongle:unplugged', this.dongle);
        }
      };

      Application.prototype.onReconnectingDongle = function() {
        return this._currentMode = ledger.app.Modes.Wallet;
      };

      Application.prototype.onDongleIsUnlocked = function(dongle) {
        if (!this.isInWalletMode()) {
          return;
        }
        return _.defer((function(_this) {
          return function() {
            _this.emit('dongle:unlocked', _this.dongle);
            return ledger.app.dongle.getCoinVersion().then(function(_arg) {
              var P2PKH, P2SH, k, message, networks, v, _ref;
              P2PKH = _arg.P2PKH, P2SH = _arg.P2SH, message = _arg.message;
              l("Looking for " + P2PKH + " " + P2SH);
              networks = [];
              _ref = ledger.bitcoin.Networks;
              for (k in _ref) {
                v = _ref[k];
                if (v.version.regular === P2PKH && v.version.P2SH === P2SH) {
                  networks.push(v);
                }
              }
              if (networks.length > 1) {
                l("many chains available");
                return _.defer(function() {
                  return ledger.app.dongle.getPublicAddress("44'/" + networks[0].bip44_coin_type + "'/0'/0/0", function(addr) {
                    var address;
                    address = ledger.crypto.SHA256.hashString(addr.bitcoinAddress.toString(ASCII));
                    ledger.app.chains.currentKey = address;
                    return ledger.storage.global.chainSelector.get(address, function(result) {
                      var exists, _ref1;
                      l(result);
                      if (result[address] != null) {
                        l("remember my choice found");
                        l(result[address]);
                        exists = false;
                        if (result[address] !== 0) {
                          _ref1 = ledger.bitcoin.Networks;
                          for (k in _ref1) {
                            v = _ref1[k];
                            if (v.name === result[address].name) {
                              exists = k;
                            }
                          }
                        }
                        if (exists) {
                          return _this.onChainChosen(ledger.bitcoin.Networks[exists]);
                        } else {
                          if (networks[0].name === 'litecoin') {
                            return ledger.app.router.go('/onboarding/device/chains/litecoin', {
                              networks: JSON.stringify(networks)
                            });
                          } else if (networks[0].name === 'bitcoin_gold_unsplit') {
                            return ledger.app.router.go('/onboarding/device/chains/btg', {
                              networks: JSON.stringify(networks)
                            });
                          } else {
                            return ledger.app.router.go('/onboarding/device/chains', {
                              networks: JSON.stringify(networks)
                            });
                          }
                        }
                      } else {

                        /*tmp = {}
                        tmp[address]= ledger.bitcoin.Networks.bitcoin
                        ledger.storage.global.chainSelector.set tmp, =>
                          ledger.app.onChainChosen(ledger.bitcoin.Networks.bitcoin)
                         */
                        if (networks[0].name === 'litecoin') {
                          return ledger.app.router.go('/onboarding/device/chains/litecoin', {
                            networks: JSON.stringify(networks)
                          });
                        } else if (networks[0].name === 'bitcoin_gold_unsplit') {
                          return ledger.app.router.go('/onboarding/device/chains/btg', {
                            networks: JSON.stringify(networks)
                          });
                        } else {
                          return ledger.app.router.go('/onboarding/device/chains', {
                            networks: JSON.stringify(networks)
                          });
                        }
                      }
                    });
                  });
                });
              } else {
                ledger.app.chains.currentKey = "";
                return _this.onChainChosen(networks[0]);
              }
            });
          };
        })(this));
      };

      Application.prototype.onChainChosen = function(network) {
        ledger.app.router.go('/onboarding/device/opening');
        return _.defer((function(_this) {
          return function() {
            l(" on chain chosen");
            _this.emit('wallet:initializing');
            ledger.config.network = network;
            l(ledger.config.network);
            return ledger.app.dongle.setCoinVersion(ledger.config.network.version.regular, ledger.config.network.version.P2SH).then(function() {
              ledger.tasks.WalletOpenTask.instance.startIfNeccessary();
              return ledger.tasks.WalletOpenTask.instance.onComplete(function(result, error) {
                if (error != null) {
                  e("Raise", error);
                }
                ledger.tasks.FeesComputationTask.instance.startIfNeccessary();
                _this._listenPreferencesEvents();
                _this._listenCountervalueEvents(true);
                ledger.utils.Logger.updateGlobalLoggersLevel();
                _this.emit('wallet:initialized');
                return _.defer(function() {
                  ledger.tasks.TransactionObserverTask.instance.startIfNeccessary();
                  if (!result.operation_consumption) {
                    return ledger.tasks.OperationsSynchronizationTask.instance.startIfNeccessary();
                  }
                });
              });
            });
          };
        })(this));
      };

      Application.prototype.onDongleIsDisconnected = function(dongle) {
        this.emit('dongle:disconnected');
        ledger.utils.Logger.setPrivateModeEnabled(false);
        if (!this.isInWalletMode()) {
          return;
        }
        return this.releaseWallet();
      };

      Application.prototype.onCommandFirmwareUpdate = function() {
        if (this.setExecutionMode(ledger.app.Modes.FirmwareUpdate)) {
          return this.router.go('/');
        }
      };

      Application.prototype.onCommandExportLogs = function() {
        return ledger.utils.Logger.downloadLogsWithLink();
      };

      Application.prototype._listenAppEvents = function() {
        this.on('wallet:operations:sync:failed', (function(_this) {
          return function() {};
        })(this));
        this.on('wallet:operations:sync:done', (function(_this) {
          return function() {};
        })(this));
        return this.on('wallet:operations:update wallet:operations:new', (function(_this) {
          return function() {
            if (!_this.isInWalletMode()) {
              return;
            }
            return _this._refreshBalance();
          };
        })(this));
      };

      Application.prototype._refreshBalance = _.debounce((function() {
        return Wallet.instance.retrieveAccountsBalances();
      }), 500);

      Application.prototype._listenPreferencesEvents = function() {
        ledger.preferences.instance.on('btcUnit:changed language:changed locale:changed confirmationsCount:changed', (function(_this) {
          return function() {
            return _this.scheduleReloadUi();
          };
        })(this));
        return ledger.preferences.instance.on('logActive:changed', (function(_this) {
          return function() {
            return ledger.utils.Logger.updateGlobalLoggersLevel();
          };
        })(this));
      };

      Application.prototype.releaseWallet = function(removeDongle, reroute) {
        if (removeDongle == null) {
          removeDongle = true;
        }
        if (reroute == null) {
          reroute = true;
        }
        if (reroute) {
          this.emit('dongle:disconnected');
        }
        this._listenCountervalueEvents(false);
        _.defer((function(_this) {
          return function() {
            var _ref, _ref1;
            ledger.api.SyncRestClient.reset();
            ledger.bitcoin.bitid.reset();
            ledger.preferences.close();
            ledger.utils.Logger.updateGlobalLoggersLevel();
            Wallet.releaseWallet();
            ledger.storage.closeStores();
            ledger.wallet.release(_this.dongle);
            ledger.tasks.Task.stopAllRunningTasks();
            ledger.tasks.Task.resetAllSingletonTasks();
            ledger.database.contexts.close();
            ledger.database.close();
            ledger.api.resetAuthentication();
            ledger.utils.Logger._secureWriter = null;
            ledger.utils.Logger._secureReader = null;
            if (removeDongle && reroute) {
              if ((_ref = _this.dongle) != null) {
                _ref.disconnect();
              }
              return _this.dongle = null;
            } else if (reroute) {
              return (_ref1 = _this.dongle) != null ? _ref1.lock() : void 0;
            } else {
              return ledger.tasks.TickerTask.instance.startIfNeccessary();
            }
          };
        })(this));
        ledger.dialogs.manager.dismissAll(false);
        if (this.isInWalletMode() && reroute) {
          return this.router.go('/onboarding/device/plug');
        }
      };

      Application.prototype._listenCountervalueEvents = function(listen) {
        var handleChanges, recomputeCountervalue, _ref, _ref1, _ref2, _ref3;
        if (!listen) {
          if ((_ref = this._countervalueObserver) != null) {
            _ref.disconnect();
          }
          this._countervalueObserver = void 0;
          this._listenedCountervalueNodes = void 0;
          this._reprocessCountervalueNodesCallback = void 0;
          if ((_ref1 = ledger.preferences.instance) != null) {
            _ref1.off('currency:changed', this._reprocessCountervalueNodesCallback);
          }
          if ((_ref2 = ledger.preferences.instance) != null) {
            _ref2.off('locale:changed', this._reprocessCountervalueNodesCallback);
          }
          if ((_ref3 = ledger.tasks.TickerTask.instance) != null) {
            _ref3.off('updated', this._reprocessCountervalueNodesCallback);
          }
          return;
        }
        recomputeCountervalue = (function(_this) {
          return function(node) {
            var currency, qNode, satoshis, sign, text;
            qNode = $(node);
            text = '';
            currency = ledger.preferences.instance.getCurrency();
            if (ledger.formatters.symbolIsFirst()) {
              text += currency + ' ';
            }
            satoshis = qNode.attr('data-countervalue');
            sign = satoshis.charAt(0);
            if ((sign == null) || (sign !== '+' && sign !== '-')) {
              sign = '';
            }
            satoshis = _.str.replace(satoshis, sign, '');
            text += sign;
            text += ledger.converters.satoshiToCurrency(satoshis, currency);
            if (!ledger.formatters.symbolIsFirst()) {
              text += ' ' + currency;
            }
            return qNode.text(text);
          };
        })(this);
        handleChanges = (function(_this) {
          return function(summaries) {
            var index, node, summary, _i, _j, _k, _len, _len1, _len2, _ref4, _ref5, _results;
            _results = [];
            for (_i = 0, _len = summaries.length; _i < _len; _i++) {
              summary = summaries[_i];
              _ref4 = summary.added;
              for (_j = 0, _len1 = _ref4.length; _j < _len1; _j++) {
                node = _ref4[_j];
                _this._listenedCountervalueNodes.push(node);
                recomputeCountervalue(node);
              }
              _ref5 = summary.valueChanged;
              for (_k = 0, _len2 = _ref5.length; _k < _len2; _k++) {
                node = _ref5[_k];
                recomputeCountervalue(node);
              }
              _results.push((function() {
                var _l, _len3, _ref6, _results1;
                _ref6 = summary.removed;
                _results1 = [];
                for (_l = 0, _len3 = _ref6.length; _l < _len3; _l++) {
                  node = _ref6[_l];
                  index = this._listenedCountervalueNodes.indexOf(node);
                  if (index !== -1) {
                    _results1.push(this._listenedCountervalueNodes.splice(index, 1));
                  } else {
                    _results1.push(void 0);
                  }
                }
                return _results1;
              }).call(_this));
            }
            return _results;
          };
        })(this);
        this._reprocessCountervalueNodesCallback = (function(_this) {
          return function() {
            var node, _i, _len, _ref4, _results;
            _ref4 = _this._listenedCountervalueNodes;
            _results = [];
            for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
              node = _ref4[_i];
              _results.push(recomputeCountervalue(node));
            }
            return _results;
          };
        })(this);
        ledger.preferences.instance.on('currency:changed', this._reprocessCountervalueNodesCallback);
        ledger.preferences.instance.on('locale:changed', this._reprocessCountervalueNodesCallback);
        ledger.tasks.TickerTask.instance.on('updated', this._reprocessCountervalueNodesCallback);
        this._listenedCountervalueNodes = [];
        return this._countervalueObserver = new MutationSummary({
          callback: handleChanges,
          rootNode: $('body').get(0),
          observeOwnChanges: false,
          oldPreviousSibling: false,
          queries: [
            {
              attribute: 'data-countervalue'
            }
          ]
        });
      };

      return Application;

    })(ledger.common.application.BaseApplication);
    this.WALLET_LAYOUT = 'WalletNavigationController';
    this.ONBOARDING_LAYOUT = 'OnboardingNavigationController';
    this.UPDATE_LAYOUT = 'UpdateNavigationController';
    this.COINKITE_LAYOUT = 'AppsCoinkiteNavigationController';
    this.SPECS_LAYOUT = 'SpecNavigationController';
    ledger.database.Model.commitRelationship();
    this.ledger.application = new Application();
    this.ledger.app = this.ledger.application;
    return this.ledger.application.start();
  });

}).call(this);
