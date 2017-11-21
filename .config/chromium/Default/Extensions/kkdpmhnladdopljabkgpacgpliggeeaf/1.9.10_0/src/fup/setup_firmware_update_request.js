
/*
 */

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ledger.fup.SetupFirmwareUpdateRequest = (function(_super) {
    __extends(SetupFirmwareUpdateRequest, _super);

    function SetupFirmwareUpdateRequest(firmwareUpdater) {
      SetupFirmwareUpdateRequest.__super__.constructor.call(this, firmwareUpdater, 'OS_LOADER');
    }

    return SetupFirmwareUpdateRequest;

  })(ledger.fup.FirmwareUpdateRequest);

}).call(this);
