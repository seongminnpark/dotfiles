(function() {
  var _base,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (this.ledger == null) {
    this.ledger = {};
  }

  if ((_base = this.ledger).utils == null) {
    _base.utils = {};
  }

  this.ledger.utils.LogWriter = (function(_super) {
    __extends(LogWriter, _super);

    function LogWriter(daysMax, fsmode) {
      if (daysMax == null) {
        daysMax = 2;
      }
      if (fsmode == null) {
        fsmode = PERSISTENT;
      }
      this._blobArr = [];
      this._flush = ledger.utils.promise.throttle(this._flush.bind(this), 2000);
      LogWriter.__super__.constructor.call(this, this._daysMax, fsmode);
    }


    /*
      Write a log file per day
      @param [String] msg The log message to write
     */

    LogWriter.prototype.write = function(msg) {
      this._blobArr.push('\n' + msg);
      this._flushPromise = this._flush();
    };


    /*
     */

    LogWriter.prototype.getFlushPromise = function() {
      return this._flushPromise;
    };


    /*
     */

    LogWriter.prototype._flush = function() {
      var d;
      d = ledger.defer();
      this._getFileWriter((function(_this) {
        return function(fileWriter) {
          var blob;
          fileWriter.onwriteend = function(e) {
            fileWriter.seek(fileWriter.length);
            return d.resolve();
          };
          fileWriter.onerror = function(e) {
            e("Write failed");
            e(arguments);
            return d.resolve();
          };
          blob = new Blob(_this._blobArr, {
            type: 'text/plain'
          });
          _this._blobArr = [];
          return fileWriter.write(blob);
        };
      })(this));
      return d.promise;
    };


    /*
      Get the fileWriter, create a new one if it doesn't exist yet
      @param [function] callback Callback function to get the fileWriter
     */

    LogWriter.prototype._getFileWriter = function(callback) {
      var _ref;
      if (((_ref = this._writer) != null ? _ref.date : void 0) !== moment().format('YYYY-MM-DD')) {
        return this._fs.root.getFile(this._getFileName(), {
          create: true
        }, (function(_this) {
          return function(fileEntry) {
            return fileEntry.createWriter(function(fileWriter) {
              fileWriter.seek(fileWriter.length);
              _this._writer = {
                date: moment().format('YYYY-MM-DD'),
                writer: fileWriter
              };
              return typeof callback === "function" ? callback(_this._writer.writer) : void 0;
            }, function(e) {
              _this._errorHandler(e);
              return typeof callback === "function" ? callback() : void 0;
            });
          };
        })(this), (function(_this) {
          return function(e) {
            _this._errorHandler(e);
            return typeof callback === "function" ? callback() : void 0;
          };
        })(this));
      } else {
        return typeof callback === "function" ? callback(this._writer.writer) : void 0;
      }
    };


    /*
      Set file name with bitIdAdress and date of the day
     */

    LogWriter.prototype._getFileName = function() {
      return "non_secure_" + (moment().format('YYYY_MM_DD')) + ".log";
    };

    return LogWriter;

  })(this.ledger.utils.Log);

}).call(this);
