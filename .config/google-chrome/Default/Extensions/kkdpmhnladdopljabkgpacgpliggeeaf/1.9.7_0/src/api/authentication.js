(function() {
  var AuthenticatedHttpClient,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (ledger.api == null) {
    ledger.api = {};
  }

  AuthenticatedHttpClient = (function(_super) {
    __extends(AuthenticatedHttpClient, _super);

    function AuthenticatedHttpClient(baseUrl) {
      AuthenticatedHttpClient.__super__.constructor.call(this, baseUrl);
      this._client = new HttpClient(baseUrl);
    }

    AuthenticatedHttpClient.prototype.setHttpHeader = function(key, value) {
      this._client.setHttpHeader(key, value);
      return this;
    };

    AuthenticatedHttpClient.prototype.jqAjax = function(request) {
      var deferred;
      deferred = $.Deferred();
      if (this.isAuthenticated()) {
        this._performUnsafeCall(request).then(_.bind(this._reportSuccess, this, request, deferred)).fail(_.bind(this._recoverUnsafeCallFailure, this, request, deferred));
      } else {
        this._authenticateAndPerfomSafeCall(request, deferred);
      }
      return deferred;
    };

    AuthenticatedHttpClient.prototype._authenticateAndPerfomSafeCall = function(request, deferred) {
      return this._authenticate().then(_.bind(this._performSafeCall, this, request, deferred)).fail(_.bind(this._reportFailure, this, request, deferred));
    };

    AuthenticatedHttpClient.prototype._recoverUnsafeCallFailure = function(request, deferred, error) {
      var errorThrown, jqXHR, textStatus;
      jqXHR = error[0], textStatus = error[1], errorThrown = error[2];
      if (jqXHR.status === 403 || jqXHR.status === 401) {
        return this._authenticateAndPerfomSafeCall(request, deferred);
      } else {
        return this._reportFailure(request, deferred, error);
      }
    };

    AuthenticatedHttpClient.prototype._performSafeCall = function(request, deferred) {
      var r;
      if (this._authToken != null) {
        this._client.setHttpHeader('X-LedgerWallet-AuthToken', this._authToken);
      }
      r = _(request).omit('success', 'error', 'complete');
      return this._client.jqAjax(r).done((function(_this) {
        return function(data, textStatus, jqXHR) {
          return _this._reportSuccess(request, deferred, [data, textStatus, jqXHR]);
        };
      })(this)).fail((function(_this) {
        return function(jqXHR, textStatus, errorThrown) {
          return _this._reportFailure(request, deferred, [jqXHR, textStatus, errorThrown]);
        };
      })(this));
    };

    AuthenticatedHttpClient.prototype._performUnsafeCall = function(request) {
      var deferred, unsafeRequest;
      if (this._authToken != null) {
        this._client.setHttpHeader('X-LedgerWallet-AuthToken', this._authToken);
      }
      deferred = jQuery.Deferred();
      unsafeRequest = _(request).omit('success', 'error', 'complete');
      this._client.jqAjax(unsafeRequest).done(function(data, textStatus, jqXHR) {
        return deferred.resolve([data, textStatus, jqXHR]);
      }).fail(function(jqXHR, textStatus, errorThrown) {
        return deferred.reject([jqXHR, textStatus, errorThrown]);
      });
      return deferred;
    };

    AuthenticatedHttpClient.prototype._reportFailure = function(request, deferred, error) {
      var errorThrown, jqXHR, textStatus;
      jqXHR = error[0], textStatus = error[1], errorThrown = error[2];
      deferred.reject(jqXHR, textStatus, errorThrown);
      if (request != null) {
        if (typeof request.error === "function") {
          request.error(jqXHR, textStatus, errorThrown);
        }
      }
      return request != null ? typeof request.complete === "function" ? request.complete(jqXHR, textStatus) : void 0 : void 0;
    };

    AuthenticatedHttpClient.prototype._reportSuccess = function(request, deferred, success) {
      var data, jqXHR, statusText;
      data = success[0], statusText = success[1], jqXHR = success[2];
      deferred.resolve(data, statusText, jqXHR);
      if (request != null) {
        if (typeof request.success === "function") {
          request.success(data, statusText, jqXHR);
        }
      }
      return request != null ? typeof request.complete === "function" ? request.complete(jqXHR, statusText) : void 0 : void 0;
    };

    AuthenticatedHttpClient.prototype.isAuthenticated = function() {
      if (this._authToken != null) {
        return true;
      } else {
        return false;
      }
    };

    AuthenticatedHttpClient.prototype._authenticate = function() {
      var d;
      if ((this.authenticationPromise != null) && !this.authenticationPromise.isFulfilled()) {
        return this.authenticationPromise;
      }
      d = ledger.defer();
      this.authenticationPromise = d.promise;
      this._performAuthenticate(d);
      return this.authenticationPromise;
    };

    AuthenticatedHttpClient.prototype._performAuthenticate = function(deferred) {
      var bitidAddress;
      bitidAddress = null;
      if (deferred.retryNumber == null) {
        deferred.retryNumber = 3;
      }
      return ledger.bitcoin.bitid.getAddress().fail((function(_this) {
        return function(error) {
          throw [null, "Unable to get bitId address", error];
        };
      })(this)).then((function(_this) {
        return function(address) {
          bitidAddress = address.bitcoinAddress.value;
          return _this._client.jqAjax({
            type: "GET",
            url: "bitid/authenticate/" + bitidAddress,
            dataType: 'json'
          });
        };
      })(this)).then((function(_this) {
        return function(data) {
          return ledger.bitcoin.bitid.signMessage(data['message']);
        };
      })(this)).fail((function(_this) {
        return function(error) {
          if (_.isArray(error) && error.length === 3) {
            throw error;
          }
          throw [null, "Unable to sign message", error];
        };
      })(this)).then((function(_this) {
        return function(signature) {
          return _this._client.jqAjax({
            type: "POST",
            url: 'bitid/authenticate',
            data: {
              address: bitidAddress,
              coin: ledger.config.network.ticker,
              signature: signature
            },
            contentType: 'application/json',
            dataType: 'json'
          });
        };
      })(this)).then((function(_this) {
        return function(data) {
          _this._authToken = data['token'];
          ledger.app.emit('wallet:authenticated');
          return deferred.resolve();
        };
      })(this)).fail((function(_this) {
        return function(error) {
          e("AUTH FAIL", error);
          if (deferred.retryNumber-- > 0) {
            return _this._performAuthenticate(deferred);
          } else {
            return deferred.reject(error);
          }
        };
      })(this)).done();
    };

    AuthenticatedHttpClient.prototype.getAuthToken = function(callback) {
      var d;
      if (callback == null) {
        callback = null;
      }
      d = ledger.defer(callback);
      if (this.isAuthenticated()) {
        d.resolve(this._authToken);
      } else {
        this._authenticate().then(function() {
          return d.resolve(this._authToken);
        }).fail(function(ex) {
          return d.reject(ex);
        });
      }
      return d.promise;
    };

    AuthenticatedHttpClient.prototype.getAuthTokenSync = function() {
      return this._authToken;
    };

    AuthenticatedHttpClient.instance = function(baseUrl) {
      if (baseUrl == null) {
        baseUrl = ledger.config.restClient.baseUrl;
      }
      return this._instance != null ? this._instance : this._instance = new this(baseUrl);
    };

    AuthenticatedHttpClient.reset = function() {
      return this._instance = null;
    };

    return AuthenticatedHttpClient;

  })(this.HttpClient);

  _.extend(ledger.api, {
    authenticated: function(baseUrl) {
      if (baseUrl == null) {
        baseUrl = ledger.config.restClient.baseUrl;
      }
      return AuthenticatedHttpClient.instance(baseUrl);
    },
    resetAuthentication: function() {
      return AuthenticatedHttpClient.reset();
    }
  });

}).call(this);
