(function() {
  var _base;

  ledger.preferences || (ledger.preferences = {});

  (_base = ledger.preferences).fees || (_base.fees = {});

  _.extend(ledger.preferences.fees, {
    Levels: {
      Fast: {
        id: '20000',
        numberOfBlock: 1,
        defaultValue: 20000
      },
      Normal: {
        id: '10000',
        numberOfBlock: 3,
        defaultValue: 10000
      },
      Slow: {
        id: '1000',
        numberOfBlock: 6,
        defaultValue: 1000
      }
    },
    MaxValue: 50000,
    getLevelFromId: function(id) {
      return _(ledger.preferences.fees.Levels).find(function(l) {
        return l.id === id;
      });
    }
  });

}).call(this);
