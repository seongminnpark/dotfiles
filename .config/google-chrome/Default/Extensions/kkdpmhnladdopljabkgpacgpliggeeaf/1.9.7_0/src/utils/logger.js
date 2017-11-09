(function() {
  var Levels, _base,
    __slice = [].slice;

  if (this.ledger == null) {
    this.ledger = {};
  }

  if ((_base = this.ledger).utils == null) {
    _base.utils = {};
  }

  Levels = {
    NONE: 0,
    RAW: 1,
    FATAL: 2,
    ERROR: 3,
    WARN: 4,
    BAD: 5,
    GOOD: 6,
    INFO: 7,
    VERB: 8,
    DEBUG: 9,
    TRACE: 10,
    ALL: 12
  };


  /*
    Utility class for dealing with logs
   */

  this.ledger.utils.Logger = (function() {
    Logger.Levels = Levels;

    Logger._privateMode = false;

    Logger._loggers = {};

    Logger.store = function() {
      if (ledger.storage.logs != null) {
        return ledger.storage.logs;
      } else {
        return this._store != null ? this._store : this._store = new ledger.storage.ChromeStore("logs");
      }
    };

    Logger.publicLogs = function(cb) {
      return this._getLogs(this._publicReader != null ? this._publicReader : this._publicReader = new ledger.utils.LogReader(ledger.config.defaultLoggerDaysMax), cb);
    };

    Logger.privateLogs = function(cb) {
      if (ledger.utils.Logger._secureReader == null) {
        return typeof cb === "function" ? cb([]) : void 0;
      }
      return this._getLogs(ledger.utils.Logger._secureReader, cb);
    };

    Logger._getLogs = function(reader, cb) {
      var d;
      d = ledger.defer(cb);
      reader.read(function(lines) {
        var line;
        return d.resolve((function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = lines.length; _i < _len; _i++) {
            line = lines[_i];
            _results.push(JSON.parse(line));
          }
          return _results;
        })());
      });
      return d.promise;
    };

    Logger.getLoggerByTag = function(tag) {
      var _base1;
      return (_base1 = this._loggers)[tag] != null ? _base1[tag] : _base1[tag] = new this(tag);
    };

    Logger.getLazyLoggerByTag = function(tag) {
      var $debug, $error, $fatal, $info, $logger, $warn;
      $logger = (function(_this) {
        return function() {
          return _this.getLoggerByTag(tag);
        };
      })(this);
      $info = function() {
        var args, _ref;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return (_ref = $logger()).info.apply(_ref, args);
      };
      $error = function() {
        var args, _ref;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return (_ref = $logger()).error.apply(_ref, args);
      };
      $warn = function() {
        var args, _ref;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return (_ref = $logger()).warn.apply(_ref, args);
      };
      $debug = function() {
        var args, _ref;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return (_ref = $logger()).debug.apply(_ref, args);
      };
      $fatal = function() {
        var args, _ref;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return (_ref = $logger()).fatal.apply(_ref, args);
      };
      return {
        $logger: $logger,
        $info: $info,
        $error: $error,
        $warn: $warn,
        $debug: $debug,
        $fatal: $fatal
      };
    };

    Logger._setGlobalLoggersLevel = function(level) {
      var logger, name, _ref, _results;
      _ref = this._loggers;
      _results = [];
      for (name in _ref) {
        logger = _ref[name];
        if (logger.useGlobalSettings) {
          _results.push(logger.setLevel(level));
        }
      }
      return _results;
    };

    Logger.setGlobalLoggersLevel = function(level) {
      return this._setGlobalLoggersLevel(level);
    };

    Logger.setGlobalLoggersPersistentLogsEnabled = function(enable) {
      var logger, name, _ref, _results;
      _ref = this._loggers;
      _results = [];
      for (name in _ref) {
        logger = _ref[name];
        if (logger.useGlobalSettings) {
          _results.push(logger.setPersistentLogsEnabled(enable));
        }
      }
      return _results;
    };

    Logger.getGlobalLoggersLevel = function() {
      var _ref, _ref1;
      if (((_ref = ledger.preferences) != null ? _ref.instance : void 0) != null) {
        if (ledger.preferences.instance.isLogActive()) {
          return ledger.config.defaultLoggingLevel.Connected.Enabled;
        } else {
          return ledger.config.defaultLoggingLevel.Connected.Disabled;
        }
      } else if (((_ref1 = ledger.config) != null ? _ref1.defaultLoggingLevel : void 0) != null) {
        if (ledger.config.enableLogging) {
          return ledger.config.defaultLoggingLevel.Disconnected.Enabled;
        } else {
          return ledger.config.defaultLoggingLevel.Disconnected.Disabled;
        }
      } else {
        return Levels.NONE;
      }
    };

    Logger.updateGlobalLoggersLevel = function() {
      return this._setGlobalLoggersLevel(this.getGlobalLoggersLevel());
    };

    Logger.exportLogsToCsv = function(callback) {
      var csv, now;
      if (callback == null) {
        callback = void 0;
      }
      now = new Date();
      csv = new ledger.utils.CsvExporter("ledger_wallet_logs_" + (now.getFullYear()) + (_.str.lpad(now.getMonth() + 1, 2, '0')) + (now.getDate()));
      return this.publicLogs((function(_this) {
        return function(publicLogs) {
          return _this.privateLogs(function(privateLogs) {
            csv.setContent(_.sortBy((publicLogs || []).concat(privateLogs || []), function(log) {
              return log.date;
            }));
            return csv.save(callback);
          });
        };
      })(this));
    };

    Logger.exportLogsToBlob = function(callback) {
      var csv, now, suggestedName;
      if (callback == null) {
        callback = void 0;
      }
      now = new Date();
      suggestedName = "ledger_wallet_logs_" + (now.getFullYear()) + (_.str.lpad(now.getMonth() + 1, 2, '0')) + (now.getDate());
      csv = new ledger.utils.CsvExporter(suggestedName);
      return this.publicLogs((function(_this) {
        return function(publicLogs) {
          return _this.privateLogs(function(privateLogs) {
            csv.setContent(_.sortBy((publicLogs || []).concat(privateLogs || []), function(log) {
              return log.date;
            }));
            return typeof callback === "function" ? callback({
              name: suggestedName,
              blob: csv.blob()
            }) : void 0;
          });
        };
      })(this));
    };

    Logger.exportLogsToZip = function(callback) {
      var now, privateCsv, privateSuggestedName, publicCsv, publicSuggestedName;
      if (callback == null) {
        callback = void 0;
      }
      now = new Date();
      publicSuggestedName = "ledger_wallet_logs_" + (now.getFullYear()) + (_.str.lpad(now.getMonth() + 1, 2, '0')) + (now.getDate());
      privateSuggestedName = "ledger_wallet_private_logs_" + (now.getFullYear()) + (_.str.lpad(now.getMonth() + 1, 2, '0')) + (now.getDate());
      publicCsv = new ledger.utils.CsvExporter(publicSuggestedName);
      privateCsv = new ledger.utils.CsvExporter(privateSuggestedName);
      return this.publicLogs((function(_this) {
        return function(publicLogs) {
          return _this.privateLogs(function(privateLogs) {
            publicCsv.setContent(publicLogs);
            return publicCsv.beginZip(function(writer) {
              privateCsv.setContent(privateLogs);
              return privateCsv.addToZip(writer, function(writer) {
                return publicCsv.endZip(function(zip) {
                  return typeof callback === "function" ? callback({
                    name: publicSuggestedName,
                    zip: zip
                  }) : void 0;
                });
              });
            });
          });
        };
      })(this));
    };

    Logger.exportLogsWithLink = function(callback) {
      var csv, now, suggestedName;
      if (callback == null) {
        callback = void 0;
      }
      now = new Date();
      suggestedName = "ledger_wallet_logs_" + (now.getFullYear()) + (_.str.lpad(now.getMonth() + 1, 2, '0')) + (now.getDate());
      csv = new ledger.utils.CsvExporter(suggestedName);
      return this.publicLogs((function(_this) {
        return function(publicLogs) {
          return _this.privateLogs(function(privateLogs) {
            csv.setContent(_.sortBy((publicLogs || []).concat(privateLogs || []), function(log) {
              return log.date;
            }));
            return typeof callback === "function" ? callback({
              name: suggestedName,
              url: csv.url()
            }) : void 0;
          });
        };
      })(this));
    };

    Logger.exportLogsWithZipLink = function(callback) {
      if (callback == null) {
        callback = void 0;
      }
      return this.exportLogsToZip(function(_arg) {
        var name, zip;
        name = _arg.name, zip = _arg.zip;
        return typeof callback === "function" ? callback({
          name: name,
          url: zip.url()
        }) : void 0;
      });
    };

    Logger.downloadLogsWithZipLink = function() {
      return this.exportLogsWithZipLink(function(data) {
        var pom;
        pom = document.createElement('a');
        pom.href = data.url;
        pom.setAttribute('download', data.name);
        return pom.click();
      });
    };

    Logger.downloadLogsWithLink = function() {
      return this.exportLogsWithLink(function(data) {
        var pom;
        pom = document.createElement('a');
        pom.href = data.url;
        pom.setAttribute('download', data.name);
        return pom.click();
      });
    };

    Logger.setPrivateModeEnabled = function(enable) {
      if (enable !== this._privateMode) {
        this._privateMode = enable;
        return this._logStream = enable ? this._createStream() : null;
      }
    };

    Logger.isPrivateModeEnabled = function() {
      return this._privateMode;
    };

    Logger._createStream = function() {
      var stream;
      stream = new Stream();
      stream.on("data", (function(_this) {
        return function() {
          var data, entry, key, line, log, logs, _i, _j, _len, _len1;
          stream._writer || (stream._writer = ledger.utils.Logger._secureWriter);
          if (stream._writer == null) {
            return;
          }
          logs = stream.read();
          data = [];
          for (_i = 0, _len = logs.length; _i < _len; _i++) {
            log = logs[_i];
            for (key in log) {
              entry = log[key];
              data.push(entry);
            }
          }
          for (_j = 0, _len1 = data.length; _j < _len1; _j++) {
            line = data[_j];
            stream._writer.write(JSON.stringify(line));
          }
          if (_this._logStream !== stream) {
            return stream.close();
          }
        };
      })(this));
      stream.open();
      return stream;
    };

    function Logger(tag, level, useGlobalSettings) {
      this.level = level != null ? level : ledger.utils.Logger.getGlobalLoggersLevel();
      this.useGlobalSettings = useGlobalSettings != null ? useGlobalSettings : true;
      this._tag = tag;
      if (typeof this.level === "string") {
        this.level = Levels[this.level];
      }
      if (this.level === true) {
        this.level = Levels.ALL;
      }
      if (this.level === false) {
        this.level = Levels.NONE;
      }
      this.setPersistentLogsEnabled(true);
      ledger.utils.Logger._loggers[tag] = this;
    }

    Logger.prototype.setPersistentLogsEnabled = function(enable) {
      return this._areLogsPersistents = enable;
    };

    Logger.prototype.store = function() {
      return ledger.utils.Logger.store();
    };

    Logger.prototype.isPrivateModeEnabled = function() {
      return ledger.utils.Logger.isPrivateModeEnabled();
    };

    Logger.prototype.setLevel = function(level) {
      return this.level = level;
    };

    Logger.prototype.levelName = function(level) {
      if (level == null) {
        level = this.level;
      }
      return _.invert(Levels)[level];
    };

    Logger.prototype.setActive = function(active) {
      return this.level = active ? Levels.INFO : Levels.NONE;
    };

    Logger.prototype.isActive = function() {
      return this.level > Levels.NONE;
    };

    Logger.prototype.isFatal = function() {
      return this.level >= Levels.FATAL;
    };

    Logger.prototype.isError = function() {
      return this.level >= Levels.ERROR;
    };

    Logger.prototype.isErr = Logger.prototype.isError;

    Logger.prototype.isWarn = function() {
      return this.level >= Levels.WARN;
    };

    Logger.prototype.isWarning = Logger.prototype.isWarn;

    Logger.prototype.isBad = function() {
      return this.level >= Levels.BAD;
    };

    Logger.prototype.isGood = function() {
      return this.level >= Levels.GOOD;
    };

    Logger.prototype.isGood = Logger.prototype.isSuccess;

    Logger.prototype.isInfo = function() {
      return this.level >= Levels.INFO;
    };

    Logger.prototype.isVerb = function() {
      return this.level >= Levels.VERB;
    };

    Logger.prototype.isVerbose = Logger.prototype.isVerb;

    Logger.prototype.isDebug = function() {
      return this.level >= Levels.DEBUG;
    };

    Logger.prototype.isTrace = function() {
      return this.level >= Levels.TRACE;
    };

    Logger.prototype.fatal = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this._log.apply(this, [Levels.FATAL].concat(__slice.call(args)));
    };

    Logger.prototype.error = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this._log.apply(this, [Levels.ERROR].concat(__slice.call(args)));
    };

    Logger.prototype.err = Logger.prototype.error;

    Logger.prototype.warn = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this._log.apply(this, [Levels.WARN].concat(__slice.call(args)));
    };

    Logger.prototype.warning = Logger.prototype.warn;

    Logger.prototype.bad = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this._log.apply(this, [Levels.BAD].concat(__slice.call(args)));
    };

    Logger.prototype.good = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this._log.apply(this, [Levels.GOOD].concat(__slice.call(args)));
    };

    Logger.prototype.success = Logger.prototype.good;

    Logger.prototype.info = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this._log.apply(this, [Levels.INFO].concat(__slice.call(args)));
    };

    Logger.prototype.verb = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this._log.apply(this, [Levels.VERB].concat(__slice.call(args)));
    };

    Logger.prototype.verbose = Logger.prototype.verb;

    Logger.prototype.debug = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this._log.apply(this, [Levels.DEBUG].concat(__slice.call(args)));
    };

    Logger.prototype.raw = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this._log.apply(this, [Levels.RAW].concat(__slice.call(args)));
    };

    Logger.prototype.trace = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this._log.apply(this, [Levels.TRACE].concat(__slice.call(args)));
    };

    Logger.prototype.clear = function() {
      return this.constructor._clear(this.store());
    };

    Logger._clear = function(store) {
      return store != null ? store.keys((function(_this) {
        return function(keys) {
          var key, now, _i, _len, _results;
          now = new Date().getTime();
          _results = [];
          for (_i = 0, _len = keys.length; _i < _len; _i++) {
            key = keys[_i];
            if (now - key > 86400000) {
              _results.push(store.remove(key));
            }
          }
          return _results;
        };
      })(this)) : void 0;
    };

    Logger.prototype.logs = function(cb) {
      return this.constructor.logs().then((function(_this) {
        return function(logs) {
          logs = logs.filter(function(l) {
            return l.tag === _this.tag;
          });
          if (typeof cb === "function") {
            cb(logs);
          }
          return logs;
        };
      })(this));
    };

    Logger.prototype._storeLog = function(msg, msgType) {
      var entry, log, now, _base1;
      if (!this._areLogsPersistents) {
        return;
      }
      now = new Date();
      log = {};
      entry = {
        date: now.toUTCString(),
        type: msgType,
        tag: this._tag,
        msg: msg
      };
      log[now.getTime()] = entry;
      if (this.isPrivateModeEnabled()) {
        return this._privateLogStream().write(log);
      } else {
        return ((_base1 = ledger.utils.Logger)._publicWriter || (_base1._publicWriter = new ledger.utils.LogWriter(ledger.config.defaultLoggerDaysMax))).write(JSON.stringify(entry));
      }
    };


    /*
    Generic log function. Add header with usefull informations + log to console + store in DB.
    
    @exemple Simple call 
      @_log(Levels.VERB, "Entering in function with args", arg1, arg2)
    
    @param [Number] level defined in Levels.
    @return undefined
     */

    Logger.prototype._log = function() {
      var args, level;
      level = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (!(level <= this.level)) {
        return;
      }
      this._storeLog(this._stringify.apply(this, args), this.levelName(level));
      if (ledger.isDev) {
        args = (level !== Levels.RAW ? [this._header(level)] : []).concat(args);
        return this._consolify.apply(this, [level].concat(__slice.call(args)));
      }
    };


    /*
    Add usefull informations like level and timestamp.
    @param [Number] level
    @return String
     */

    Logger.prototype._header = function(level, date) {
      return _.str.sprintf('[%s][%s][%s]', this._timestamp(date), this.levelName(level), this._tag);
    };


    /*
    @param [Date] date
    @return String
     */

    Logger.prototype._timestamp = function(date) {
      if (date == null) {
        date = new Date();
      }
      return _.str.sprintf("%s.%03d", date.toLocaleTimeString(), date.getMilliseconds());
    };


    /*
    Convert correctly arguments into string.
    @return String
     */

    Logger.prototype._stringify = function() {
      var arg, args, err, formatter, params, _ref;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      formatter = typeof args[0] === 'string' ? "" + args.shift().replace(/%/g, '%%') : "";
      params = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = args.length; _i < _len; _i++) {
          arg = args[_i];
          formatter += " %s";
          if ((arg == null) || typeof arg === 'string' || typeof arg === 'number' || typeof arg === 'boolean') {
            _results.push(arg);
          } else if (typeof arg === 'object' && (arg instanceof RegExp || arg instanceof Date)) {
            _results.push(arg);
          } else if (typeof arg === 'object' && arg instanceof HTMLElement) {
            _results.push("HTMLElement." + arg.tagName);
          } else {
            try {
              _results.push(JSON.stringify(arg));
            } catch (_error) {
              err = _error;
              _results.push("<< stringify error: " + err + " >>");
            }
          }
        }
        return _results;
      })();
      return (_ref = _.str).sprintf.apply(_ref, [formatter].concat(__slice.call(params)));
    };


    /*
    Add color depending of level.
    @return undefined
     */

    Logger.prototype._consolify = function() {
      var arg, args, level, method, _i, _len, _ref;
      level = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      args = [].concat(args);
      if (typeof args[0] === 'string') {
        args[0] = "%c" + args[0].replace(/%/g, '%%');
      } else {
        args.splice(0, 0, "%c");
      }
      args.splice(1, 0, (function() {
        switch (level) {
          case Levels.FATAL:
          case Levels.ERROR:
          case Levels.BAD:
            return 'color: #f00';
          case Levels.WARN:
            return 'color: #f60';
          case Levels.INFO:
            return 'color: #00f';
          case Levels.GOOD:
            return 'color: #090';
          case Levels.DEBUG:
            return 'color: #444';
          case Levels.TRACE:
            return 'color: #777';
          default:
            return 'color: #000';
        }
      })());
      _ref = args.slice(2);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        arg = _ref[_i];
        args[0] += typeof arg === 'string' ? " %s" : typeof arg === 'number' || typeof arg === 'boolean' ? " %o" : typeof arg === 'object' && arg instanceof RegExp ? " %o" : typeof arg === 'object' && arg instanceof Date ? " %s" : typeof arg === 'object' && arg instanceof window.HTMLElement ? " %o" : " %O";
      }
      method = (function() {
        switch (level) {
          case Levels.FATAL:
          case Levels.ERROR:
            return "error";
          case Levels.WARN:
            return "warn";
          case Levels.INFO:
          case Levels.GOOD:
          case Levels.BAD:
            return "info";
          case Levels.DEBUG:
            return "debug";
          default:
            return "log";
        }
      })();
      return console[method].apply(console, args);
    };

    Logger.prototype._privateLogStream = function() {
      return ledger.utils.Logger._logStream;
    };

    return Logger;

  })();

  if (this.ledger.isDev) {
    this.l = console.log.bind(console);
    this.e = console.error.bind(console);
  } else {
    this.l = function() {};
    this.e = function() {};
  }

}).call(this);
