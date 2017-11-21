(function() {
  var _base;

  if (ledger.fup == null) {
    ledger.fup = {};
  }

  if ((_base = ledger.fup).utils == null) {
    _base.utils = {};
  }

  _.extend(ledger.fup.utils, {
    compareVersions: function(v1, v2) {
      return new ledger.utils.ComparisonResult(v1, v2, function(v1, v2) {
        if (v1[0] === v2[0] && v1[1] === v2[1]) {
          return 0;
        } else if (v1[0] < v2[0] || (v1[0] === v2[0] && v1[1] < v2[1])) {
          return -1;
        } else if (v1[0] > v2[0] || (v1[0] === v2[0] && v1[1] > v2[1])) {
          return 1;
        }
      });
    },
    versionToString: function(v) {
      var info, version;
      if (v == null) {
        return null;
      }
      if (_.isKindOf(v, ledger.fup.Card.Version)) {
        return v.toString();
      }
      version = v[1];
      info = v[0] === 0 ? "HW1" : "Ledger OS";
      return "" + info + " " + ((version >> 16) & 0xff) + "." + ((version >> 8) & 0xff) + "." + (version & 0xff);
    }
  });

}).call(this);
