(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ledger.api.GrooveRestClient = (function(_super) {
    __extends(GrooveRestClient, _super);

    function GrooveRestClient() {
      return GrooveRestClient.__super__.constructor.apply(this, arguments);
    }

    GrooveRestClient.prototype.sendTicket = function(data, callback) {
      if (callback == null) {
        callback = void 0;
      }
      return this._createTicket(data, (function(_this) {
        return function(ticket, error) {
          if (error != null) {
            return typeof callback === "function" ? callback(false) : void 0;
          } else {
            if (data.zip != null) {
              return _this._attachLogs(data, ticket, function(response, error) {
                return callback(error == null);
              });
            } else {
              return typeof callback === "function" ? callback(true) : void 0;
            }
          }
        };
      })(this));
    };

    GrooveRestClient.prototype._createTicket = function(data, callback) {
      if (callback == null) {
        callback = void 0;
      }
      return this.http().post({
        url: "support/ticket",
        data: {
          "body": data.message,
          "email": data.email,
          "name": data.name,
          "subject": data.subject,
          "tags": [data.tag],
          "metadata": data.metadata,
          "has_logs": data.zip != null
        },
        onSuccess: (function(_this) {
          return function(response) {
            return typeof callback === "function" ? callback(response) : void 0;
          };
        })(this),
        onError: this.networkErrorCallback(callback)
      });
    };

    GrooveRestClient.prototype._attachLogs = function(data, ticket, callback) {
      if (callback == null) {
        callback = void 0;
      }
      return this.http().postFile({
        url: "support/ticket/" + ticket.id,
        data: {
          "logFile": data.zip
        },
        onSuccess: (function(_this) {
          return function(response) {
            return typeof callback === "function" ? callback(response) : void 0;
          };
        })(this),
        onError: this.networkErrorCallback(callback)
      });
    };

    return GrooveRestClient;

  })(ledger.api.RestClient);

}).call(this);
