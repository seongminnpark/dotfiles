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

  this.ledger.utils.LogReader = (function(_super) {
    __extends(LogReader, _super);

    function LogReader(daysMax, fsmode) {
      if (daysMax == null) {
        daysMax = 2;
      }
      if (fsmode == null) {
        fsmode = PERSISTENT;
      }
      LogReader.__super__.constructor.call(this, this._daysMax, fsmode);
    }


    /*
      Read a file
      @param [String] filename The name of the file
      @return [Text] A text file at a time
     */

    LogReader.prototype.read = function(callback) {
      var last, res;
      res = [];
      last = function() {
        return typeof callback === "function" ? callback(_.flatten(res)) : void 0;
      };
      return this.checkDate(this._fsmode).then((function(_this) {
        return function() {
          var dirReader;
          dirReader = _this._fs.root.createReader();
          return dirReader.readEntries(function(files) {
            var loopFiles;
            files = _.sortBy(files, 'name');
            loopFiles = function(index, files) {
              var file;
              file = (files || [])[index];
              if (file == null) {
                return last();
              }
              if (_this._isFileOfMine(file.name)) {
                return file.file(function(file) {
                  var reader;
                  reader = new FileReader();
                  reader.onloadend = function(e) {
                    res.push(_.compact(reader.result.split('\n')));
                    return loopFiles(index + 1, files);
                  };
                  return reader.readAsText(file);
                });
              } else {
                return loopFiles(index + 1, files);
              }
            };
            return loopFiles(0, files);
          });
        };
      })(this)).done();
    };

    LogReader.prototype._isFileOfMine = function(name) {
      var regex;
      regex = "non_secure_[\\d]{4}_[\\d]{2}_[\\d]{2}\\.log";
      return name.match(new RegExp(regex));
    };

    return LogReader;

  })(this.ledger.utils.Log);

}).call(this);
