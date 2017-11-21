(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (ledger.api == null) {
    ledger.api = {};
  }

  ledger.api.HttpClient = (function(_super) {
    __extends(HttpClient, _super);

    function HttpClient() {
      HttpClient.__super__.constructor.apply(this, arguments);
    }

    HttpClient.prototype.authenticated = function() {
      var authenticatedHttpClient, key, value, _ref;
      authenticatedHttpClient = ledger.api.authenticated(this.baseUrl);
      _ref = this.headers;
      for (key in _ref) {
        value = _ref[key];
        authenticatedHttpClient.setHttpHeader(key, value);
      }
      return authenticatedHttpClient;
    };

    return HttpClient;

  })(this.HttpClient);

  ledger.api.RestClient = (function() {
    function RestClient() {}

    RestClient.API_BASE_URL = ledger.config.restClient.baseUrl;

    RestClient.singleton = function() {
      return this.instance || (this.instance = new this());
    };

    RestClient.prototype.http = function() {
      this._client || (this._client = this._httpClientFactory());
      this._client.setHttpHeader('X-Ledger-Locale', chrome.i18n.getUILanguage());
      this._client.setHttpHeader('X-Ledger-Platform', 'chrome');
      this._client.setHttpHeader('X-Ledger-AppVersion', ledger.managers.application.stringVersion());
      this._client.setHttpHeader('X-Ledger-Environment', ledger.env);
      return this._client;
    };

    RestClient.prototype.networkErrorCallback = function(callback) {
      return function(xhr, status, message) {
        return typeof callback === "function" ? callback(null, ledger.errors.newHttp(xhr)) : void 0;
      };
    };

    RestClient.prototype._httpClientFactory = function() {
      return new ledger.api.HttpClient(ledger.config.restClient.baseUrl);
    };

    return RestClient;

  })();

  ledger.api.AuthRestClient = (function(_super) {
    __extends(AuthRestClient, _super);

    function AuthRestClient() {
      return AuthRestClient.__super__.constructor.apply(this, arguments);
    }

    AuthRestClient.prototype._httpClientFactory = function() {
      return AuthRestClient.__super__._httpClientFactory.call(this).authenticated(this.baseUrl);
    };

    return AuthRestClient;

  })(ledger.api.RestClient);

}).call(this);
