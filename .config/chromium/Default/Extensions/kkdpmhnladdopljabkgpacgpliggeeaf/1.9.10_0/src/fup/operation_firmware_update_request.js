
/*
 */

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ledger.fup.OperationFirmwareUpdateRequest = (function(_super) {
    __extends(OperationFirmwareUpdateRequest, _super);

    function OperationFirmwareUpdateRequest(firmwareUpdate) {
      OperationFirmwareUpdateRequest.__super__.constructor.call(this, firmwareUpdate, 'OS_LOADER');
    }

    return OperationFirmwareUpdateRequest;

  })(ledger.fup.FirmwareUpdateRequest);

}).call(this);
