(function() {
  describe("Secure Log Writer/Reader", function() {
    var slr, slw;
    slw = null;
    slr = null;
    this._errorHandler = function(e) {
      fail("FileSystem Error. name: " + e.name + " // message: " + e.message);
      return l(new Error().stack);
    };
    beforeEach(function(done) {
      return ledger.utils.Log.deleteAll(TEMPORARY, function() {
        slr = new ledger.utils.SecureLogReader('test_key', '1YnMY5FGugkuzJwdmbue9EtfsAFpQXcZy', 2, TEMPORARY);
        slw = new ledger.utils.SecureLogWriter('test_key', '1YnMY5FGugkuzJwdmbue9EtfsAFpQXcZy', 2, TEMPORARY);
        return done();
      });
    });
    it("should write secure in correct order", function(done) {
      var line, str, _i;
      for (str = _i = 0; _i < 50; str = ++_i) {
        line = "date lorem ipsum blabla msg outing to bla - test " + str;
        slw.write(line);
      }
      return slw.getFlushPromise().then(function() {
        return slr.read(function(logs) {
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
    return it("should encrypt correctly", function(done) {
      slw.write("date lorem ipsum blabla msg outing to bla - test");
      slw.write("nawak nawak double nawak bitcoin will spread the world !");
      return slw.getFlushPromise().then(function() {
        return ledger.utils.Log.getFs(TEMPORARY).then(function(fs) {
          var dirReader;
          dirReader = fs.root.createReader();
          return dirReader.readEntries((function(_this) {
            return function(files) {
              var loopFiles;
              loopFiles = function(index, files) {
                var file;
                file = (files || [])[index];
                if (file == null) {
                  return done();
                }
                return file.file(function(file) {
                  var reader;
                  reader = new FileReader();
                  reader.onloadend = function(e) {
                    var res;
                    res = _.compact(reader.result.split('\n'));
                    expect(res[0]).toBe("nm44bNrVL0WTwQE/dUSPEkKhhIEA9mtsYa8l1tbCh6wmXCN57tZ0LK6YMC7V4s0DwPF6w4QBPTeI/lLrO6icfQ==");
                    expect(res[1]).toBe("lG47aJGZLlaBzUp2YViPHQ6myI4D7WsnLL4rgtrYmqtoTGph7dZlML3dfGqB89YSyQUMJIBJEYIzZK/y82Y6EbhYLDcVOoYg");
                    return loopFiles(index + 1, files);
                  };
                  return reader.readAsText(file);
                });
              };
              return loopFiles(0, files);
            };
          })(this));
        });
      });
    });
  });

}).call(this);
