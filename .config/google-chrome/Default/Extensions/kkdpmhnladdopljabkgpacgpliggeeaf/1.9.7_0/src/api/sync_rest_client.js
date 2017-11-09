(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ledger.api.SyncRestClient = (function(_super) {
    __extends(SyncRestClient, _super);

    SyncRestClient._instances = {};

    SyncRestClient.instance = function(addr) {
      var _base;
      return (_base = this._instances)[addr] || (_base[addr] = new this(addr));
    };

    function SyncRestClient(addr) {
      SyncRestClient.__super__.constructor.apply(this, arguments);
      this.chain = '';
      if (ledger.config.network.name !== 'bitcoin' && ledger.config.network.name !== 'litecoin' && (ledger.config.network.bip44_coin_type === '2' || ledger.config.network.bip44_coin_type === '0' || ledger.config.network.bip44_coin_type === '145')) {
        this.chain = '?chain=' + ledger.config.network.name;
      }
      this.basePath = "accountsettings/" + addr;
    }

    SyncRestClient.prototype.get_settings_md5 = function() {
      return this.http().get({
        url: this.basePath + '/md5' + this.chain
      }).then((function(_this) {
        return function(r) {
          return r.md5;
        };
      })(this));
    };

    SyncRestClient.prototype.get_settings = function() {
      return this.http().get({
        url: this.basePath + this.chain
      }).then((function(_this) {
        return function(r) {
          return JSON.parse(r.settings);
        };
      })(this));
    };

    SyncRestClient.prototype.post_settings = function(settings) {
      return this.http().post({
        url: this.basePath + this.chain,
        data: {
          settings: settings
        }
      }).then((function(_this) {
        return function(r) {
          return r.md5;
        };
      })(this));
    };

    SyncRestClient.prototype.put_settings = function(settings) {
      return this.http().put({
        url: this.basePath + this.chain,
        data: {
          settings: settings
        }
      }).then((function(_this) {
        return function(r) {
          return r.md5;
        };
      })(this));
    };

    SyncRestClient.prototype.delete_settings = function() {
      return this.http()["delete"]({
        url: this.basePath + this.chain
      });
    };

    SyncRestClient.reset = function() {
      return this._instances = {};
    };

    return SyncRestClient;

  })(ledger.api.AuthRestClient);

}).call(this);
