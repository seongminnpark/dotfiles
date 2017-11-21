(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ledger.api.UnspentOutputsRestClient = (function(_super) {
    __extends(UnspentOutputsRestClient, _super);

    function UnspentOutputsRestClient() {
      return UnspentOutputsRestClient.__super__.constructor.apply(this, arguments);
    }

    UnspentOutputsRestClient.prototype.getUnspentOutputsFromAddresses = function(addresses, callback) {
      var address, result;
      addresses = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = addresses.length; _i < _len; _i++) {
          address = addresses[_i];
          if (Bitcoin.Address.validate(address) === true) {
            _results.push(address);
          }
        }
        return _results;
      })();
      result = [];
      return _.async.eachBatch(addresses, 20, (function(_this) {
        return function(batch, done, hasNext, batchIndex, batchCount) {
          return _this.http().get({
            url: "blockchain/v2/" + ledger.config.network.ticker + "/addresses/" + (batch.join(',')) + "/unspents",
            onSuccess: function(response) {
              result = result.concat(response);
              if (!hasNext) {
                callback(result);
              }
              return done();
            },
            onError: _this.networkErrorCallback(callback)
          });
        };
      })(this));
    };

    UnspentOutputsRestClient.prototype.getUnspentOutputsFromPaths = function(addressesPaths, callback) {
      return ledger.wallet.pathsToAddresses(addressesPaths, (function(_this) {
        return function(addresses, notFound) {
          if (notFound.length === addressesPaths.length) {
            return typeof callback === "function" ? callback(null, {
              title: 'Missing addresses',
              missings: notFound
            }) : void 0;
          } else {
            return _this.getUnspentOutputsFromAddresses(_.values(addresses), function(outputs, error) {
              var address, output, paths, _i, _j, _len, _len1, _ref;
              if (error != null) {
                return typeof callback === "function" ? callback(null, error) : void 0;
              }
              paths = _.invert(addresses);
              for (_i = 0, _len = outputs.length; _i < _len; _i++) {
                output = outputs[_i];
                output.paths = [];
                _ref = output.addresses;
                for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
                  address = _ref[_j];
                  if (paths[address] != null) {
                    output.paths.push(paths[address]);
                  }
                }
              }
              return typeof callback === "function" ? callback(outputs) : void 0;
            });
          }
        };
      })(this));
    };

    return UnspentOutputsRestClient;

  })(ledger.api.RestClient);

  ledger.api.UnspentOutputsRestClient.instance = new ledger.api.UnspentOutputsRestClient();

}).call(this);
