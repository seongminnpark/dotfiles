(function() {
  var _base,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (ledger.managers == null) {
    ledger.managers = {};
  }

  if ((_base = ledger.managers).schemes == null) {
    _base.schemes = {};
  }

  ledger.managers.schemes.Base = (function(_super) {
    __extends(Base, _super);

    function Base() {
      return Base.__super__.constructor.apply(this, arguments);
    }

    Base.prototype.parseURI = function(uri) {
      return void 0;
    };

    return Base;

  })(EventEmitter);

  ledger.managers.schemes.Bitcoin = (function(_super) {
    __extends(Bitcoin, _super);

    function Bitcoin() {
      return Bitcoin.__super__.constructor.apply(this, arguments);
    }

    Bitcoin.prototype.parseURI = function(uri) {
      var hash, params;
      if (uri == null) {
        return void 0;
      }
      uri = ledger.url.parseAsUrl(uri);
      if (!((uri != null) && uri.protocol === ledger.config.network.scheme && (uri.pathname != null) && uri.pathname.length > 0)) {
        return void 0;
      }
      hash = {};
      params = uri.params();
      hash.address = uri.pathname;
      if ((params.amount != null) && params.amount.length > 0) {
        hash.amount = params.amount;
      }
      return hash;
    };

    return Bitcoin;

  })(ledger.managers.schemes.Base);

  ledger.managers.schemes.bitcoin = new ledger.managers.schemes.Bitcoin();

}).call(this);
