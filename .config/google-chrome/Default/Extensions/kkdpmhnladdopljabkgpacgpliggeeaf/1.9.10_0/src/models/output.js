(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.Output = (function(_super) {
    __extends(Output, _super);

    function Output() {
      return Output.__super__.constructor.apply(this, arguments);
    }

    Output.init();

    Output.index('uid');


    /*
      {
         "output_index": 0,
          "value": 1000000,
          "addresses": [
            "18VLgzpLjLMRB8udaSrs4ha8gwzjzVgHUT"
          ],
          "script_hex": "76a9145224f6a5cbfa97dbe098bd72c1813c60982ff04e88ac"
      }
     */

    Output.fromJson = function(transactionHash, output, context) {
      var base, uid, _ref;
      if (context == null) {
        context = ledger.database.contexts.main;
      }
      uid = "" + transactionHash + "_" + output['output_index'];
      base = {
        uid: uid,
        transaction_hash: transactionHash,
        index: output['output_index'],
        value: output['value'],
        address: (_ref = output['addresses']) != null ? _ref[0] : void 0,
        path: ledger.wallet.Wallet.instance.cache.getDerivationPath(output['addresses'][0]),
        script_hex: output['script_hex']
      };
      return this.findOrCreate({
        uid: uid
      }, base, context);
    };

    Output.utxo = function(context) {
      var output, result;
      if (context == null) {
        context = ledger.database.contexts.main;
      }
      result = (function() {
        var _i, _len, _ref, _results;
        _ref = this.find({
          path: {
            $ne: void 0
          }
        }, context).data();
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          output = _ref[_i];
          if (_.isEmpty(Input.find({
            uid: output.get('uid')
          }, context).data())) {
            _results.push(output);
          }
        }
        return _results;
      }).call(this);
      return result.sort(function(a, b) {
        return b.get('confirmations') - a.get('confirmations');
      });
    };

    Output.prototype.get = function(key) {
      var transaction;
      transaction = (function(_this) {
        return function() {
          if (transaction._tx != null) {
            transaction._tx;
          }
          return transaction._tx = _this.get('transaction');
        };
      })(this);
      switch (key) {
        case 'confirmations':
          return transaction().get('confirmations');
        case 'double_spent_priority':
          return transaction().get('double_spent_priority');
        default:
          return Output.__super__.get.call(this, key);
      }
    };

    return Output;

  })(ledger.database.Model);

}).call(this);
