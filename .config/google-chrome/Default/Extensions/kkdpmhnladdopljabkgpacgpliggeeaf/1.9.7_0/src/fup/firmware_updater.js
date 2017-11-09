(function() {
  var FirmwareAvailabilityResult, FirmwareUpdateMode;

  if (ledger.fup == null) {
    ledger.fup = {};
  }

  FirmwareAvailabilityResult = {
    Overwrite: 0,
    Update: 1,
    Higher: 2
  };

  FirmwareUpdateMode = {
    Setup: 0,
    Operation: 1,
    Versatile: 2
  };


  /*
    FirmwareUpdater is a manager responsible of firmware update related features. It is able to check if firmware updates are
    available for connected dongle, and can start firmware update requests.
   */

  ledger.fup.FirmwareUpdater = (function() {
    FirmwareUpdater.FirmwareAvailabilityResult = FirmwareAvailabilityResult;

    FirmwareUpdater.FirmwareUpdateMode = FirmwareUpdateMode;

    FirmwareUpdater.instance = new FirmwareUpdater;

    function FirmwareUpdater() {
      this._scripts = [];
    }


    /*
      Checks if a firmware update is available for the given dongle.
    
      @return [Boolean] True if a firmware update is available, false otherwise.
     */

    FirmwareUpdater.prototype.getFirmwareUpdateAvailability = function(dongle, bootloaderMode, forceBl, callback) {
      var d;
      if (bootloaderMode == null) {
        bootloaderMode = false;
      }
      if (forceBl == null) {
        forceBl = false;
      }
      if (callback == null) {
        callback = void 0;
      }
      d = ledger.defer(callback);
      dongle.getRawFirmwareVersion(bootloaderMode, forceBl, false, (function(_this) {
        return function(version, error) {
          if (error != null) {
            return d.reject(error);
          }
          _this._lastVersion = version;
          if (ledger.fup.utils.compareVersions(_this._lastVersion, ledger.fup.versions.Nano.CurrentVersion.Os).eq()) {
            return d.resolve({
              result: FirmwareAvailabilityResult.Overwrite,
              available: false,
              dongleVersion: version,
              currentVersion: ledger.fup.versions.Nano.CurrentVersion.Os
            });
          } else if (ledger.fup.utils.compareVersions(_this._lastVersion, ledger.fup.versions.Nano.CurrentVersion.Os).gt()) {
            return d.resolve({
              result: FirmwareAvailabilityResult.Higher,
              available: false,
              dongleVersion: version,
              currentVersion: ledger.fup.versions.Nano.CurrentVersion.Os
            });
          } else {
            return d.resolve({
              result: FirmwareAvailabilityResult.Update,
              available: true,
              dongleVersion: version,
              currentVersion: ledger.fup.versions.Nano.CurrentVersion.Os
            });
          }
        };
      })(this));
      return d.promise;
    };


    /*
      Creates and starts a new firmware update request. Once started the firmware update request will catch all connected
      dongle and dongle related events.
    
      @return [ledger.fup.FirmwareUpdateRequest] The newly created firmware update request.
      @see ledger.fup.FirmwareUpdateRequest
      @throw If a request is already running
     */

    FirmwareUpdater.prototype.requestFirmwareUpdate = function(firmwareUpdateMode) {
      if (firmwareUpdateMode == null) {
        firmwareUpdateMode = FirmwareUpdateMode.Setup;
      }
      if (this._request != null) {
        throw "An update request is already running";
      }
      this._request = (function(_this) {
        return function() {
          switch (firmwareUpdateMode) {
            case FirmwareUpdateMode.Setup:
              return new ledger.fup.SetupFirmwareUpdateRequest(_this);
            case FirmwareUpdateMode.Operation:
              return new ledger.fup.OperationFirmwareUpdateRequest(_this);
            case FirmwareUpdateMode.Versatile:
              return new ledger.fup.VersatileFirmwareUpdateRequest(_this);
            default:
              throw new Error("Wrong firmrware update mode ${firmwareUpdateMode}");
          }
        };
      })(this)();
      return this._request;
    };

    FirmwareUpdater.prototype.requestSetupFirmwareUpdate = function() {
      return this.requestFirmwareUpdate(FirmwareUpdateMode.Setup);
    };

    FirmwareUpdater.prototype.requestOperationFirmwareUpdate = function() {
      return this.requestFirmwareUpdate(FirmwareUpdateMode.Operation);
    };

    FirmwareUpdater.prototype.requestVersatileFirmwareUpdate = function() {
      return this.requestFirmwareUpdate(FirmwareUpdateMode.Versatile);
    };

    FirmwareUpdater.prototype._cancelRequest = function(request) {
      if (request === this._request) {
        return this._request = null;
      }
    };

    FirmwareUpdater.prototype.load = function(callback) {
      return require(ledger.fup.imports, (function(_this) {
        return function(scripts) {
          _this._scripts = scripts;
          ledger.fup.setupUpdates();
          return typeof callback === "function" ? callback() : void 0;
        };
      })(this));
    };

    FirmwareUpdater.prototype.unload = function() {
      var script, _i, _len, _ref, _results;
      ledger.fup.clearUpdates();
      l(this._scripts);
      _ref = this._scripts;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        script = _ref[_i];
        _results.push($(script).remove());
      }
      return _results;
    };

    return FirmwareUpdater;

  })();

}).call(this);
