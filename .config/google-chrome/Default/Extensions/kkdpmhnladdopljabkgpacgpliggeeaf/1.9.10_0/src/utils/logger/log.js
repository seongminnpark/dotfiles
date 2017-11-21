(function() {
  var deferedGetFs, getFs, globalFs, releaseFs, _base;

  if (this.ledger == null) {
    this.ledger = {};
  }

  if ((_base = this.ledger).utils == null) {
    _base.utils = {};
  }

  deferedGetFs = {};

  globalFs = {};

  getFs = function(fsmode) {
    if (globalFs[fsmode] != null) {
      return ledger.defer().resolve(globalFs[fsmode]).promise;
    }
    if (deferedGetFs[fsmode] != null) {
      return deferedGetFs[fsmode].promise;
    }
    deferedGetFs[fsmode] = ledger.defer();
    webkitRequestFileSystem(fsmode, 5 * 1024 * 1024, function(fs) {
      globalFs[fsmode] = fs;
      return deferedGetFs[fsmode].resolve(fs);
    }, function(e) {
      return deferedGetFs[fsmode].reject(e);
    });
    return deferedGetFs[fsmode].promise;
  };

  releaseFs = function() {
    deferedGetFs = {};
    return globalFs = {};
  };

  this.ledger.utils.Log = (function() {

    /*
      Constructor
      @param [Number] _daysMax The maximum number of days the logs are preserved
     */
    function Log(daysMax, fsmode) {
      var unlockWriter;
      if (daysMax == null) {
        daysMax = 2;
      }
      if (fsmode == null) {
        fsmode = PERSISTENT;
      }
      if (this.constructor === ledger.utils.Log) {
        throw new Error('Abstract class');
      }
      this._fsmode = fsmode;
      this._daysMax = daysMax;
      this._daysMax = parseInt(this._daysMax);
      unlockWriter = _.lock(this, ['_getFileWriter', '_flush', 'read']);
      if (isNaN(this._daysMax)) {
        throw 'The first parameter must be a number';
      }
      getFs(fsmode).then((function(_this) {
        return function(fs) {
          _this._fs = fs;
          return _this.checkDate(fsmode).then(function() {
            return unlockWriter();
          }).done();
        };
      })(this)).fail((function(_this) {
        return function(e) {
          return _this._errorHandler(e);
        };
      })(this)).done();
    }


    /*
      Remove old files
     */

    Log.prototype.checkDate = function(fsmode) {
      var d;
      d = ledger.defer();
      this.constructor.listDirFiles(fsmode, (function(_this) {
        return function(files) {
          var loopFiles;
          loopFiles = function(index, files, defer) {
            var days, file, filedate, months, ms, years;
            file = (files || [])[index];
            if (file == null) {
              return defer.resolve();
            }
            filedate = file.name.substr(-14, 10);
            ms = moment(moment().format('YYYY-MM-DD')).diff(moment(_.str.dasherize(filedate)));
            days = moment.duration(ms).days();
            months = moment.duration(ms).months();
            years = moment.duration(ms).years();
            if (days > _this._daysMax || months > 0 || years > 0) {
              return _this.constructor["delete"](fsmode, file.name, function() {
                return loopFiles(index + 1, files, defer);
              });
            } else {
              return loopFiles(index + 1, files, defer);
            }
          };
          return loopFiles(0, files, d);
        };
      })(this));
      return d.promise;
    };


    /*
      Delete a file
      @param [String] filename The name of the file
     */

    Log["delete"] = function(fsmode, filename, callback) {
      if (callback == null) {
        callback = void 0;
      }
      return getFs(fsmode).then((function(_this) {
        return function(fs) {
          return fs.root.getFile(filename, {
            create: false
          }, function(fileEntry) {
            return fileEntry.remove(function() {
              return typeof callback === "function" ? callback() : void 0;
            });
          }, function(e) {
            l("FileSystem Error. name: " + e.name + " // message: " + e.message);
            l(new Error().stack);
            return typeof callback === "function" ? callback() : void 0;
          });
        };
      })(this));
    };


    /*
      Delete all files in the root directory
     */

    Log.deleteAll = function(fsmode, callback) {
      if (fsmode == null) {
        fsmode = PERSISTENT;
      }
      if (callback == null) {
        callback = void 0;
      }
      return getFs(fsmode).then((function(_this) {
        return function(fs) {
          var dirReader;
          dirReader = fs.root.createReader();
          return dirReader.readEntries(function(results) {
            if (results.length === 0) {
              return typeof callback === "function" ? callback() : void 0;
            }
            return _.async.each(results, function(entry, next, hasNext) {
              if ((entry != null ? entry.name : void 0) == null) {
                return;
              }
              return _this["delete"](fsmode, entry.name, function() {
                if (!hasNext) {
                  if (typeof callback === "function") {
                    callback();
                  }
                  return;
                }
                return next();
              });
            });
          }, function(e) {
            l("FileSystem Error. name: " + e.name + " // message: " + e.message);
            l(new Error().stack);
            return typeof callback === "function" ? callback() : void 0;
          });
        };
      })(this));
    };


    /*
      List files in the root directory
      @param [function] callback Callback function to handle an array of file entries
     */

    Log.listDirFiles = function(fsmode, callback) {
      return getFs(fsmode).then((function(_this) {
        return function(fs) {
          var dirReader, entries;
          dirReader = fs.root.createReader();
          entries = [];
          return dirReader.readEntries(function(results) {
            var entry, _i, _len;
            for (_i = 0, _len = results.length; _i < _len; _i++) {
              entry = results[_i];
              entries.push(entry);
            }
            entries = entries.sort();
            return typeof callback === "function" ? callback(entries) : void 0;
          }, function(e) {
            _this._errorHandler(e);
            return typeof callback === "function" ? callback() : void 0;
          });
        };
      })(this));
    };

    Log.getFs = getFs;

    Log.releaseFs = releaseFs;

    Log.prototype._errorHandler = function(e) {
      l("FileSystem Error. name: " + e.name + " // message: " + e.message);
      return l(new Error().stack);
    };

    return Log;

  })();

}).call(this);
