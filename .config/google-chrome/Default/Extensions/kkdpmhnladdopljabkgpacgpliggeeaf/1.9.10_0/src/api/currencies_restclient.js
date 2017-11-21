(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ledger.api.CurrenciesRestClient = (function(_super) {
    __extends(CurrenciesRestClient, _super);

    function CurrenciesRestClient() {
      return CurrenciesRestClient.__super__.constructor.apply(this, arguments);
    }


    /*
      Get infos for all currencies
    
      @param [Function] cb Callback
     */

    CurrenciesRestClient.prototype.getAllCurrencies = function(cb) {
      var r;
      r = new ledger.api.RestClient();
      return r.http().get({
        url: "currencies/all/exchange_rates",
        onSuccess: function(data) {
          return typeof cb === "function" ? cb(data, null) : void 0;
        },
        onError: this.networkErrorCallback(cb)
      });
    };

    CurrenciesRestClient.prototype.getCurrency = function(currency, cb) {
      var r;
      r = new ledger.api.RestClient();
      return r.http().get({
        url: "currencies/" + currency + "/exchange_rate",
        onSuccess: function(data) {
          return typeof cb === "function" ? cb(data, null) : void 0;
        },
        onError: this.networkErrorCallback(cb)
      });
    };

    return CurrenciesRestClient;

  })(ledger.api.RestClient);

}).call(this);
