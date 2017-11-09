(function() {
  if (ledger.utils == null) {
    ledger.utils = {};
  }


  /*
    Utility class for creating and exporting CSV files.
  
    Note: Only the save call will persist the data on disk. Any other methods will only update a content buffer
   */

  ledger.utils.CsvExporter = (function() {

    /*
      @param [String] The default filename without the extension.
     */
    function CsvExporter(defaultFileName) {
      this._defaultFileName = defaultFileName;
      this._content = [];
    }


    /*
      Sets file content. The content is represented as an array of objects. The keys of the first are used as the header line.
    
      @param [Array<Object>] content An array of object used as content.
     */

    CsvExporter.prototype.setContent = function(content) {
      var index, line, _i, _len, _results;
      _results = [];
      for (index = _i = 0, _len = content.length; _i < _len; index = ++_i) {
        line = content[index];
        if (index === 0) {
          this.setHeaderLine(_.keys(line));
        }
        _results.push(this.pushLine(_.values(line)));
      }
      return _results;
    };


    /*
      Pushes a line in the file content
    
      @param [Array[Any]] line A line
     */

    CsvExporter.prototype.pushLine = function(line) {
      return (this._lines || (this._lines = [])).push(line.join(','));
    };


    /*
      Sets the header line of the file content
     */

    CsvExporter.prototype.setHeaderLine = function(line) {
      return this._headerLine = line.join(',');
    };

    CsvExporter.prototype.save = function(callback) {
      var deferred;
      if (callback == null) {
        callback = void 0;
      }
      deferred = ledger.defer(callback);
      this._performSave(deferred);
      return deferred.promise;
    };

    CsvExporter.prototype._performSave = function(deferred) {
      return chrome.fileSystem.chooseEntry({
        type: 'saveFile',
        suggestedName: "" + this._defaultFileName + ".csv",
        accepts: [
          {
            mimeTypes: ['text/csv']
          }
        ]
      }, (function(_this) {
        return function(entry) {
          if ((entry == null) || entry.length === 0) {
            chrome.runtime.lastError;
            return deferred.rejectWithError(ledger.errors.OperationCanceledError);
          } else {
            return entry.createWriter(function(writer) {
              var er, fileContent;
              try {
                writer.onerror = function() {
                  chrome.runtime.lastError;
                  return deferred.rejectWithError(ledger.errors.WriteError);
                };
                writer.onwriteend = function() {
                  return deferred.resolve(this);
                };
                fileContent = (_this._headerLine != null ? [_this._headerLine].concat(_this._lines) : _this._lines).join("\n");
                return writer.write(new Blob([fileContent], {
                  type: "text/csv"
                }));
              } catch (_error) {
                er = _error;
                chrome.runtime.lastError;
                return deferred.rejectWithError(ledger.errors.WriteError);
              }
            }, function() {
              chrome.runtime.lastError;
              return deferred.rejectWithError(ledger.errors.WriteError);
            });
          }
        };
      })(this));
    };

    CsvExporter.prototype.url = function() {
      return URL.createObjectURL(this.blob());
    };

    CsvExporter.prototype.blob = function() {
      var fileContent;
      fileContent = (this._headerLine != null ? [this._headerLine].concat(this._lines) : this._lines).join("\n");
      return new Blob([fileContent], {
        type: 'text/csv;charset=utf8;'
      });
    };

    CsvExporter.prototype.zip = function(callback) {
      var suggestedName;
      suggestedName = "" + this._defaultFileName + ".csv";
      return zip.createWriter(new zip.BlobWriter("application/zip"), (function(_this) {
        return function(zipWriter) {
          return zipWriter.add(suggestedName, new zip.BlobReader(_this.blob()), function() {
            return zipWriter.close(callback);
          });
        };
      })(this), (function(_this) {
        return function(e) {
          return typeof callback === "function" ? callback(null) : void 0;
        };
      })(this));
    };

    CsvExporter.prototype.beginZip = function(callback) {
      return zip.createWriter(new zip.BlobWriter("application/zip"), (function(_this) {
        return function(zipWriter) {
          _this._zipWriter = zipWriter;
          return _this.addToZip(zipWriter, callback);
        };
      })(this));
    };

    CsvExporter.prototype.endZip = function(callback) {
      return this._zipWriter.close(function(blob) {
        blob.url = function() {
          return URL.createObjectURL(this);
        };
        return typeof callback === "function" ? callback(blob) : void 0;
      });
    };

    CsvExporter.prototype.addToZip = function(zipWriter, callback) {
      var suggestedName;
      suggestedName = "" + this._defaultFileName + ".csv";
      return zipWriter.add(suggestedName, new zip.BlobReader(this.blob()), (function(_this) {
        return function() {
          return typeof callback === "function" ? callback(zipWriter) : void 0;
        };
      })(this));
    };

    CsvExporter.prototype.zipUrl = function(callback) {
      return this.zip(function(zip) {
        return typeof callback === "function" ? callback(zip != null ? URL.createObjectURL(zip) : null) : void 0;
      });
    };

    return CsvExporter;

  })();

}).call(this);
