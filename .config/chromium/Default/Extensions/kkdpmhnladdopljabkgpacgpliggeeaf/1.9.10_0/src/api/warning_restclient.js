(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ledger.api.WarningRestClient = (function(_super) {
    __extends(WarningRestClient, _super);

    function WarningRestClient() {
      return WarningRestClient.__super__.constructor.apply(this, arguments);
    }

    WarningRestClient.prototype.getWarning = function(callback) {
      return ledger.defer(callback).resolve(this.http().get({
        url: "http://api.ledgerwallet.com/bitcoin/fork/warning"
      })).promise;
    };

    return WarningRestClient;

  })(ledger.api.RestClient);

  ledger.api.WarningRestClient.instance = new ledger.api.WarningRestClient();

}).call(this);
