(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.Transaction = (function(_super) {
    __extends(Transaction, _super);

    function Transaction() {
      return Transaction.__super__.constructor.apply(this, arguments);
    }

    Transaction.init();

    Transaction.index('hash');

    Transaction.has({
      many: 'operations',
      onDelete: 'destroy'
    });

    Transaction.has({
      many: 'outputs',
      onDelete: 'destroy'
    });


    /*
    {
        "hash": "da21f9616fb92a7fbe5e72d1537fe30e9b33603d456af72747baf5e5d28f54e3",
        "received_at": "2015-07-06T15:48:58Z",
        "lock_time": 0,
        "fees": 10000
      }
     */

    Transaction.fromJson = function(tx, context) {
      var base;
      if (context == null) {
        context = ledger.database.contexts.main;
      }
      base = {
        hash: tx['hash'],
        received_at: tx['received_at'],
        lock_time: tx['lock_time'],
        fees: tx['fees']
      };
      return this.findOrCreate({
        hash: base['hash']
      }, base, context);
    };

    Transaction.prototype.get = function(key) {
      var block, _ref;
      block = (function(_this) {
        return function() {
          if (block._block != null) {
            block._block;
          }
          return block._block = _this.get('block');
        };
      })(this);
      switch (key) {
        case 'confirmations':
          if (block() != null) {
            return ((_ref = Block.lastBlock()) != null ? _ref.get('height') : void 0) - block().get('height') + 1;
          } else {
            return 0;
          }
        default:
          return Transaction.__super__.get.call(this, key);
      }
    };

    return Transaction;

  })(ledger.database.Model);

}).call(this);
