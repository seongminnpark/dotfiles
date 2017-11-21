(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ledger.api.BlockRestClient = (function(_super) {
    __extends(BlockRestClient, _super);

    function BlockRestClient() {
      return BlockRestClient.__super__.constructor.apply(this, arguments);
    }

    BlockRestClient.instance = new BlockRestClient;

    BlockRestClient.prototype.refreshLastBlock = function(callback) {
      return this.http().get({
        url: "blockchain/v2/" + ledger.config.network.ticker + "/blocks/current",
        onSuccess: function(response) {
          var block;
          response['time'] = new Date(response['time'] * 1000);
          block = Block.fromJson(response).save();
          ledger.app.emit('wallet:operations:update');
          return typeof callback === "function" ? callback(block) : void 0;
        },
        onError: this.networkErrorCallback(callback)
      });
    };

    return BlockRestClient;

  })(ledger.api.RestClient);

}).call(this);
