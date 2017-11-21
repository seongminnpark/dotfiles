(function() {
  this.Api = (function() {
    function Api() {}

    Api.init = function() {
      this._has_session = false;
      ledger.app.on('wallet:initialized', function() {
        return Api._has_session = true;
      });
      return ledger.app.on('dongle:disconnected', function() {
        return Api._has_session = false;
      });
    };

    Api.listener = function(event) {
      var data;
      data = event.data;
      if (data.command !== 'has_session' && (typeof jsApiReporter !== "undefined" && jsApiReporter !== null ? jsApiReporter.status() : void 0) !== 'started') {
        chrome.app.window.current().show();
      }
      switch (data.command) {
        case 'has_session':
          return this.hasSession(data);
        case 'bitid':
          return this.bitid(data);
        case 'send_payment':
          return this.sendPayment(data);
        case 'sign_message':
          return this.signMessage(data);
        case 'sign_p2sh':
          return this.signP2SH(data);
        case 'get_xpubkey':
          return this.getXPubKey(data);
        case 'get_accounts':
          return this.getAccounts(data);
        case 'get_operations':
          return this.getOperations(data);
        case 'get_new_addresses':
          return this.getNewAddresses(data);
        case 'coinkite_get_xpubkey':
          return this.coinkiteGetXPubKey(data);
        case 'coinkite_sign_json':
          return this.coinkiteSignJSON(data);
      }
    };

    Api.hasSession = function(data) {
      return chrome.runtime.sendMessage({
        command: 'has_session',
        success: this._has_session
      });
    };

    Api.sendPayment = function(data) {
      return ledger.app.router.go('/wallet/send/index', {
        address: data.address,
        amount: data.amount,
        data: data.data
      });
    };

    Api.getAccounts = function(data) {
      return ledger.app.router.go('/wallet/api/accounts');
    };

    Api.exportAccounts = function(data) {
      var account, accounts, _i, _len, _ref;
      accounts = [];
      _ref = Account.all();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        account = _ref[_i];
        accounts.push(account.serialize());
      }
      return this.callback_success('get_accounts', {
        accounts: accounts
      });
    };

    Api.getOperations = function(data) {
      return ledger.app.router.go('/wallet/api/operations', {
        account_id: data.account_id
      });
    };

    Api.exportOperations = function(account_id) {
      var account, operation, operations, _i, _len, _ref;
      account = Account.findById(account_id);
      operations = [];
      _ref = account.get('operations');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        operation = _ref[_i];
        operations.push(operation.serialize());
      }
      return this.callback_success('get_operations', {
        operations: operations
      });
    };

    Api.getNewAddresses = function(data) {
      return ledger.app.router.go('/wallet/api/addresses', {
        account_id: data.account_id,
        count: data.count
      });
    };

    Api.exportNewAddresses = function(account_id, count) {
      var account, current;
      account = Account.findById(account_id).getWalletAccount();
      current = account.getCurrentPublicAddressIndex();
      return ledger.wallet.pathsToAddresses(_(_.range(current, current + count)).map(function(i) {
        return account.getRootDerivationPath() + '/0/' + i;
      }), (function(_this) {
        return function(result) {
          _this.callback_success('get_new_addresses', {
            addresses: result,
            account_id: account_id
          });
        };
      })(this));
    };

    Api.signMessage = function(data) {
      return ledger.app.router.go('/wallet/message/index', {
        path: data.path,
        message: data.message
      });
    };

    Api.cosignTransaction = function(data) {
      var error, transaction;
      try {
        transaction = Bitcoin.Transaction.deserialize(data.transaction);
        return ledger.app.dongle.signP2SHTransaction(data.inputs, transaction, data.scripts, data.path).then((function(_this) {
          return function(result) {
            _this.callback_success('cosign_transaction', {
              signatures: result
            });
          };
        })(this)).fail((function(_this) {
          return function(error) {
            _this.callback_cancel('cosign_transaction', JSON.stringify(error));
          };
        })(this));
      } catch (_error) {
        error = _error;
        return this.callback_cancel('cosign_transaction', JSON.stringify(error));
      }
    };

    Api.signP2SH = function(data) {
      return ledger.app.router.go('/wallet/p2sh/index', {
        inputs: JSON.stringify(data.inputs),
        scripts: JSON.stringify(data.scripts),
        outputs_number: data.outputs_number,
        outputs_script: data.outputs_script,
        paths: JSON.stringify(data.paths)
      });
    };

    Api.getXPubKey = function(data) {
      if (data.path && data.path.indexOf("0xb11e") > -1) {
        return ledger.app.dongle.getExtendedPublicKey(data.path, (function(_this) {
          return function(key, error) {
            if (error != null) {
              return _this.callback_cancel('get_xpubkey', t("wallet.xpubkey.errors.derivation_failed"));
            } else {
              return _this.callback_success('get_xpubkey', {
                xpubkey: key._xpub58
              });
            }
          };
        })(this));
      } else {
        return ledger.app.router.go('/wallet/xpubkey/index', {
          path: data.path
        });
      }
    };

    Api.bitid = function(data) {
      return ledger.app.router.go('/wallet/bitid/index', {
        uri: data.uri,
        silent: data.silent
      });
    };

    Api.coinkiteGetXPubKey = function(data) {
      return ledger.app.router.go('/apps/coinkite/keygen/index', {
        index: data.index
      });
    };

    Api.coinkiteSignJSON = function(data) {
      return ledger.app.router.go('/apps/coinkite/cosign/show', {
        json: JSON.stringify(data.json)
      });
    };

    Api.callback_cancel = function(command, message) {
      return chrome.runtime.sendMessage({
        command: command,
        success: false,
        message: message
      });
    };

    Api.callback_success = function(command, data) {
      return chrome.runtime.sendMessage($.extend({
        command: command,
        success: true
      }, data));
    };

    Api.cleanPath = function(path) {
      return path.replace("m/", "");
    };

    return Api;

  })();

}).call(this);
