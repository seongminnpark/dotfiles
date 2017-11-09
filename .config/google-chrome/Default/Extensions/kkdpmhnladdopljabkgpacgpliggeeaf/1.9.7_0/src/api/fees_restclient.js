(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ledger.api.FeesRestClient = (function(_super) {
    __extends(FeesRestClient, _super);

    function FeesRestClient() {
      return FeesRestClient.__super__.constructor.apply(this, arguments);
    }

    FeesRestClient.prototype.getEstimatedFees = function(callback) {
      return ledger.defer(callback).resolve(this.http().get({
        url: "blockchain/v2/" + ledger.config.network.ticker + "/fees"
      }));
    };

    return FeesRestClient;

  })(ledger.api.RestClient);

}).call(this);
