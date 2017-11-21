(function() {
  describe("Log Writer/Reader", function() {
    var lr, lw;
    lw = null;
    lr = null;
    this._errorHandler = function(e) {
      fail("FileSystem Error. name: " + e.name + " // message: " + e.message);
      return l(new Error().stack);
    };
    beforeEach(function(done) {
      return ledger.utils.Log.deleteAll(TEMPORARY, function() {
        lr = new ledger.utils.LogReader(2, TEMPORARY);
        lw = new ledger.utils.LogWriter(2, TEMPORARY);
        return done();
      });
    });
    it("should write in correct order", function(done) {
      var line, str, _i;
      for (str = _i = 0; _i < 50; str = ++_i) {
        line = "date lorem ipsum blabla msg outing to bla - test " + str;
        lw.write(line);
      }
      return lw.getFlushPromise().then(function() {
        return lr.read(function(logs) {
          var i, log, _j, _len;
          for (i = _j = 0, _len = logs.length; _j < _len; i = ++_j) {
            log = logs[i];
            expect(log).toBe("date lorem ipsum blabla msg outing to bla - test " + i);
          }
          expect(logs.length).toBe(50);
          return done();
        });
      });
    });
    return it("should read several sorted log files", function(done) {
      var fileCounter, files, filesIteration, msgCounter, writeLoop, _i;
      files = [];
      for (fileCounter = _i = 0; _i < 10; fileCounter = ++_i) {
        files.push({
          messages: (function() {
            var _j, _results;
            _results = [];
            for (msgCounter = _j = 0; _j < 10; msgCounter = ++_j) {
              _results.push("file " + fileCounter + "_random data " + msgCounter);
            }
            return _results;
          })(),
          filename: "non_secure_" + (moment().subtract(fileCounter, 'day').format('YYYY_MM_DD')) + ".log"
        });
      }
      writeLoop = function(writer, index, arr, callback) {
        var entry;
        entry = arr[index];
        if (entry == null) {
          return typeof callback === "function" ? callback() : void 0;
        }
        writer.onwriteend = function() {
          return writeLoop(writer, index + 1, arr, callback);
        };
        return writer.write(new Blob(['\n' + entry], {
          type: 'text/plain'
        }));
      };
      filesIteration = function(fs, index, arr, callback) {
        var file;
        file = arr[index];
        if (file == null) {
          return typeof callback === "function" ? callback() : void 0;
        }
        return fs.root.getFile(file.filename, {
          create: true
        }, function(fileEntry) {
          return fileEntry.createWriter(function(fileWriter) {
            fileWriter.onerror = function(e) {
              l("Write failed");
              return typeof callback === "function" ? callback(null, new Error) : void 0;
            };
            return writeLoop(fileWriter, 0, file.messages, function() {
              return filesIteration(fs, index + 1, arr, callback);
            });
          });
        });
      };
      return ledger.utils.Log.getFs(TEMPORARY).then(function(fs) {
        return filesIteration(fs, 0, files, function() {
          return lr.read(function(resLogs) {
            var data, file, i, _j, _k;
            expect(resLogs.length).toBe(30);
            i = 0;
            for (file = _j = 2; _j >= 0; file = --_j) {
              for (data = _k = 0; _k < 10; data = ++_k) {
                expect(resLogs[i++]).toBe("file " + file + "_random data " + data);
              }
            }
            return done();
          });
        });
      }).done();
    });
  });

}).call(this);
