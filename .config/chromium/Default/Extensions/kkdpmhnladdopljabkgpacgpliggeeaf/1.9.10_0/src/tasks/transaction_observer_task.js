(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ledger.tasks.TransactionObserverTask = (function(_super) {
    __extends(TransactionObserverTask, _super);

    function TransactionObserverTask() {
      TransactionObserverTask.__super__.constructor.call(this, 'global_transaction_observer');
    }

    TransactionObserverTask.prototype.onStart = function() {
      return this._listenNewTransactions();
    };

    TransactionObserverTask.prototype.onStop = function() {
      var _ref;
      return (_ref = this.newTransactionStream) != null ? _ref.close() : void 0;
    };

    TransactionObserverTask.prototype._listenNewTransactions = function() {
      this.newTransactionStream = new WebSocket("wss://ws.ledgerwallet.com/blockchain/v2/" + ledger.config.network.ticker + "/ws");
      this.newTransactionStream.onmessage = (function(_this) {
        return function(event) {
          var data, _ref;
          data = JSON.parse(event.data);
          if ((data != null ? (_ref = data.payload) != null ? _ref.type : void 0 : void 0) == null) {
            return;
          }
          switch (data.payload.type) {
            case 'new-transaction':
              return ledger.tasks.TransactionConsumerTask.instance.pushTransaction(data.payload.transaction);
            case 'new-block':
              return _this._handleNewBlock(data.payload.block);
          }
        };
      })(this);
      return this.newTransactionStream.onclose = (function(_this) {
        return function() {
          if (_this.isRunning()) {
            return _this._listenNewTransactions();
          }
        };
      })(this);
    };

    TransactionObserverTask.prototype._handleNewBlock = function(block) {
      var found, json, transactionHash, tx, txs, _i, _j, _len, _len1, _ref;
      this.logger().trace('Receive new block');
      json = {
        hash: block['hash'],
        height: block['height'],
        time: new Date(block['time'])
      };
      block = Block.fromJson(json).save();
      found = false;
      _ref = block['txs'] || [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        transactionHash = _ref[_i];
        txs = Transaction.find({
          hash: transactionHash
        }).data();
        if (txs.length > 0) {
          found = true;
          this.logger().trace('Found transaction in block');
          for (_j = 0, _len1 = txs.length; _j < _len1; _j++) {
            tx = txs[_j];
            block.add('transactions', tx);
          }
        }
      }
      block.save();
      if (found) {
        ledger.tasks.WalletLayoutRecoveryTask.instance.startIfNeccessary();
        return ledger.app.emit('wallet:operations:update');
      }
    };

    TransactionObserverTask.instance = new TransactionObserverTask();

    TransactionObserverTask.reset = function() {
      return this.instance = new this;
    };

    return TransactionObserverTask;

  })(ledger.tasks.Task);

}).call(this);
