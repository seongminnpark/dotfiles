(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.Block = (function(_super) {
    __extends(Block, _super);

    function Block() {
      return Block.__super__.constructor.apply(this, arguments);
    }

    Block.init();

    Block.index('hash');

    Block.has({
      many: 'transactions',
      onDelete: 'destroy'
    });

    Block.fromJson = function(json, context) {
      if (context == null) {
        context = ledger.database.contexts.main;
      }
      if (json == null) {
        return null;
      }
      return this.findOrCreate({
        hash: json['hash']
      }, json, context);
    };

    Block.lastBlock = function(context) {
      if (context == null) {
        context = ledger.database.contexts.main;
      }
      return this.find({}, context).simpleSort('height', true).data()[0];
    };

    Block.prototype.get = function(key) {
      switch (key) {
        case 'time':
          return new Date(Block.__super__.get.call(this, key));
        default:
          return Block.__super__.get.call(this, key);
      }
    };

    return Block;

  })(ledger.database.Model);

}).call(this);
