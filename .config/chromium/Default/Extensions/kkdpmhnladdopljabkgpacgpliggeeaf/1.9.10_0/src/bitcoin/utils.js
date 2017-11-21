(function() {
  if (ledger.bitcoin == null) {
    ledger.bitcoin = {};
  }

  _.extend(ledger.bitcoin, {
    decodeTransaction: function(hexTransaction) {
      var Transaction, TransactionIn, TransactionOut, byte, bytes, in_count, io, out_count, parse_int, tx, u16, u32, u64, u8, varchar, varint, ver, _i, _j, _k, _len, _ref, _ref1;
      _ref = window.Bitcoin, Transaction = _ref.Transaction, TransactionIn = _ref.TransactionIn, TransactionOut = _ref.TransactionOut;
      parse_int = function(size) {
        return function(bytes) {
          var i, n, _i;
          n = 0;
          for (i = _i = 0; 0 <= size ? _i < size : _i > size; i = 0 <= size ? ++_i : --_i) {
            n += (bytes.shift() & 0xff) << (8 * i);
          }
          return n;
        };
      };
      u8 = function(bytes) {
        return bytes.shift();
      };
      u16 = parse_int(2);
      u32 = parse_int(4);
      u64 = function(bytes) {
        return bytes.splice(0, 8);
      };
      varint = function(bytes) {
        var n;
        switch (n = u8(bytes)) {
          case 0xfd:
            return u16(bytes);
          case 0xfe:
            return u32(bytes);
          case 0xff:
            return u64(bytes);
          default:
            return n;
        }
      };
      varchar = function(bytes) {
        return bytes.splice(0, varint(bytes));
      };
      bytes = (function() {
        var _i, _len, _ref1, _results;
        _ref1 = hexTransaction.match(/\w\w/g);
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          byte = _ref1[_i];
          _results.push(parseInt(byte, 16));
        }
        return _results;
      })();
      bytes = bytes.slice();
      ver = u32(bytes);
      if (ver !== 0x01) {
        throw new Error('Unsupported version');
      }
      tx = new Transaction;
      in_count = varint(bytes);
      for (_i = 0; 0 <= in_count ? _i < in_count : _i > in_count; 0 <= in_count ? _i++ : _i--) {
        tx.addInput(new TransactionIn({
          outpoint: {
            hash: base64ArrayBuffer(bytes.splice(0, 32)),
            index: u32(bytes)
          },
          script: varchar(bytes),
          seq: u32(bytes)
        }));
      }
      out_count = varint(bytes);
      for (_j = 0; 0 <= out_count ? _j < out_count : _j > out_count; 0 <= out_count ? _j++ : _j--) {
        tx.addOutput(new TransactionOut({
          value: u64(bytes),
          script: varchar(bytes)
        }));
      }
      tx.lock_time = u32(bytes);
      _ref1 = tx.outs;
      for (_k = 0, _len = _ref1.length; _k < _len; _k++) {
        io = _ref1[_k];
        if (io.address != null) {
          io.address.version = io.address.version === 0 ? ledger.config.network.version.regular : ledger.config.network.version.P2SH;
        }
      }
      return tx;
    },
    verifyRawTx: function(tx, inputs, amount, fees, recipientAddress, changeAddress) {
      return Try((function(_this) {
        return function() {
          var er;
          try {
            return true;
          } catch (_error) {
            er = _error;
            e(er);
            throw er;
          }
        };
      })(this));
    },
    addressToHash160: function(address) {
      var byte, bytes, hash160String;
      bytes = ledger.crypto.Base58.decode(address);
      bytes = bytes.slice(1, bytes.length - 4);
      hash160String = ((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = bytes.length; _i < _len; _i++) {
          byte = bytes[_i];
          _results.push(Convert.toHexByte(byte));
        }
        return _results;
      })()).join('');
      return new ByteString(hash160String, HEX);
    },
    addressToHash160WithNetwork: function(address) {
      var byte, bytes, hash160String;
      bytes = ledger.crypto.Base58.decode(address);
      bytes = bytes.slice(0, bytes.length - 4);
      hash160String = ((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = bytes.length; _i < _len; _i++) {
          byte = bytes[_i];
          _results.push(Convert.toHexByte(byte));
        }
        return _results;
      })()).join('');
      return new ByteString(hash160String, HEX);
    }
  });

}).call(this);
