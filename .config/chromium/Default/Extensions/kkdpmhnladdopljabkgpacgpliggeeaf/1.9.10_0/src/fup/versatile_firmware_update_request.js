
/*
 */

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ledger.fup.VersatileFirmwareUpdateRequest = (function(_super) {
    __extends(VersatileFirmwareUpdateRequest, _super);

    function VersatileFirmwareUpdateRequest(firmwareUpdate) {
      VersatileFirmwareUpdateRequest.__super__.constructor.call(this, firmwareUpdate, 'VERSATILE');
      this._osLoader = 'OS_LOADER';
    }

    VersatileFirmwareUpdateRequest.prototype._getOsLoader = function() {
      return ledger.fup.updates[this._osLoader];
    };

    VersatileFirmwareUpdateRequest.prototype._processInitStageOs = function() {
      return this._getVersion().then((function(_this) {
        return function(version) {
          var firmware;
          firmware = version.getFirmwareInformation();
          if (firmware.hasSubFirmwareSupport() && firmware.hasOperationFirmwareSupport()) {
            _this._osLoader = 'OS_LOADER';
          } else {
            _this._osLoader = 'OS_LOADER';
          }
          return VersatileFirmwareUpdateRequest.__super__._processInitStageOs.apply(_this, arguments);
        };
      })(this));
    };

    VersatileFirmwareUpdateRequest.prototype._setCurrentState = function(state) {
      if (state === ledger.fup.FirmwareUpdateRequest.States.LoadingBootloader || ledger.fup.FirmwareUpdateRequest.States.LoadingBootloaderReloader) {
        this._osLoader || (this._osLoader = 'OS_LOADER');
      }
      return VersatileFirmwareUpdateRequest.__super__._setCurrentState.apply(this, arguments);
    };

    return VersatileFirmwareUpdateRequest;

  })(ledger.fup.FirmwareUpdateRequest);

}).call(this);
