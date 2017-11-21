(function() {
  var OperatingSystems,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (ledger.managers == null) {
    ledger.managers = {};
  }

  OperatingSystems = {
    Windows: "Windows",
    MacOS: "Mac OS",
    Linux: "Linux",
    Unix: "UNIX",
    Unknown: "Unknown"
  };

  ledger.managers.System = (function(_super) {
    __extends(System, _super);

    function System() {
      return System.__super__.constructor.apply(this, arguments);
    }

    System.OperatingSystems = OperatingSystems;

    System.prototype.operatingSystemName = function() {
      var name;
      name = OperatingSystems.Unknown;
      if (navigator.appVersion.indexOf("Win") !== -1) {
        name = OperatingSystems.Windows;
      } else if (navigator.appVersion.indexOf("Mac") !== -1) {
        name = OperatingSystems.MacOS;
      } else if (navigator.appVersion.indexOf("Linux") !== -1) {
        name = OperatingSystems.Linux;
      } else if (navigator.appVersion.indexOf("X11") !== -1) {
        name = OperatingSystems.Unix;
      }
      return name;
    };

    System.prototype.isWindows = function() {
      return this.operatingSystemName() === OperatingSystems.Windows;
    };

    System.prototype.isMacOS = function() {
      return this.operatingSystemName() === OperatingSystems.MacOS;
    };

    System.prototype.isLinux = function() {
      return this.operatingSystemName() === OperatingSystems.Linux;
    };

    System.prototype.isUnix = function() {
      return this.operatingSystemName() === OperatingSystems.Unix;
    };

    System.prototype.isUnknown = function() {
      return this.operatingSystemName() === OperatingSystems.Unknown;
    };

    return System;

  })(EventEmitter);

  ledger.managers.system = new ledger.managers.System();

}).call(this);
