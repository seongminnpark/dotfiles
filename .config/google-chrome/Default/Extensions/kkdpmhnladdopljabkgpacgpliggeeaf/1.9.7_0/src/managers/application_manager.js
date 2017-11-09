(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (ledger.managers == null) {
    ledger.managers = {};
  }

  ledger.managers.Application = (function(_super) {
    __extends(Application, _super);

    function Application() {
      return Application.__super__.constructor.apply(this, arguments);
    }

    Application.prototype.stringVersion = function() {
      return chrome.runtime.getManifest().version;
    };

    Application.prototype.fullStringVersion = function() {
      return t('application.name') + ' Chrome ' + this.stringVersion();
    };

    return Application;

  })(EventEmitter);

  ledger.managers.application = new ledger.managers.Application();

}).call(this);
