(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ledger.api.M2faRestClient = (function(_super) {
    __extends(M2faRestClient, _super);

    function M2faRestClient() {
      return M2faRestClient.__super__.constructor.apply(this, arguments);
    }

    M2faRestClient.instance = new M2faRestClient;

    M2faRestClient.prototype.wakeUpSecureScreens = function(pairingIds, callback) {
      if (callback == null) {
        callback = _.noop;
      }
      return this.http().authenticated().post({
        url: '2fa/pairings/wake_up',
        data: {
          pairing_ids: pairingIds
        },
        onSuccess: callback,
        onError: this.networkErrorCallback(callback)
      });
    };

    return M2faRestClient;

  })(ledger.api.RestClient);

}).call(this);
