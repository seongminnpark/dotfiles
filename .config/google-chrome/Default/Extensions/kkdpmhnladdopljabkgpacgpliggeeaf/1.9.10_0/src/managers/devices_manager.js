(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.DevicesManager = (function(_super) {
    __extends(DevicesManager, _super);

    DevicesManager.prototype._running = false;

    DevicesManager.prototype._devicesList = [];

    DevicesManager.prototype._devices = {};

    function DevicesManager() {}

    DevicesManager.prototype.start = function() {
      var checkIfWalletIsPluggedIn, getDevices;
      if (this._running) {
        return;
      }
      getDevices = function(devicesInfo, cb) {
        var devices;
        devices = [];
        return _.async.each(devicesInfo, function(item, next, hasNext) {
          var info, type;
          type = item.type === "usb" ? chrome.usb : chrome.hid;
          info = {
            productId: item.productId,
            vendorId: item.vendorId
          };
          return type.getDevices(info, function(d) {
            devices = devices.concat(d);
            if (!hasNext) {
              if (typeof cb === "function") {
                cb(devices);
              }
            }
            return next();
          });
        });
      };
      checkIfWalletIsPluggedIn = function() {
        var devicesInfo;
        devicesInfo = [
          {
            productId: 0x1b7c,
            vendorId: 0x2581,
            type: 'usb'
          }, {
            productId: 0x2b7c,
            vendorId: 0x2581,
            type: 'hid'
          }, {
            productId: 0x3b7c,
            vendorId: 0x2581,
            type: 'hid'
          }, {
            productId: 0x1808,
            vendorId: 0x2581,
            type: 'usb'
          }, {
            productId: 0x1807,
            vendorId: 0x2581,
            type: 'hid'
          }
        ];
        return getDevices(devicesInfo, (function(_this) {
          return function(devices) {
            var device, device_id, devicesList, difference, differences, item, newDifferences, oldDevices, oldDevicesList, oldDifferences, _i, _j, _len, _len1, _results;
            oldDevices = _this._devices;
            _this._devices = {};
            for (_i = 0, _len = devices.length; _i < _len; _i++) {
              device = devices[_i];
              if (device.device) {
                device_id = device.device;
              } else {
                device_id = device.deviceId;
              }
              if (oldDevices[device_id] != null) {
                _this._devices[device_id] = oldDevices[device_id];
              } else {
                _this._devices[device_id] = {
                  id: device_id,
                  productId: device['productId'],
                  vendorId: device['vendorId']
                };
              }
            }
            oldDevicesList = _.values(oldDevices);
            devicesList = _.values(_this._devices);
            oldDifferences = (function() {
              var _j, _len1, _results;
              _results = [];
              for (_j = 0, _len1 = devicesList.length; _j < _len1; _j++) {
                item = devicesList[_j];
                if (_.indexOf(oldDevicesList, item) === -1) {
                  _results.push(item);
                }
              }
              return _results;
            })();
            newDifferences = (function() {
              var _j, _len1, _results;
              _results = [];
              for (_j = 0, _len1 = oldDevicesList.length; _j < _len1; _j++) {
                item = oldDevicesList[_j];
                if (_.indexOf(devicesList, item) === -1) {
                  _results.push(item);
                }
              }
              return _results;
            })();
            differences = newDifferences.concat(oldDifferences);
            _results = [];
            for (_j = 0, _len1 = differences.length; _j < _len1; _j++) {
              difference = differences[_j];
              if (_.where(oldDevices, {
                id: difference.id
              }).length > 0) {
                _results.push(_this.emit('unplug', difference));
              } else {
                _results.push(_this.emit('plug', difference));
              }
            }
            return _results;
          };
        })(this));
      };
      return this._interval = setInterval(checkIfWalletIsPluggedIn.bind(this), 200);
    };

    DevicesManager.prototype.stop = function() {
      return clearInterval(this._interval);
    };

    DevicesManager.prototype.devices = function() {
      var device, devices, key, _ref;
      devices = [];
      _ref = this._devices;
      for (key in _ref) {
        device = _ref[key];
        devices.push(device);
      }
      return devices;
    };

    return DevicesManager;

  })(EventEmitter);

}).call(this);
