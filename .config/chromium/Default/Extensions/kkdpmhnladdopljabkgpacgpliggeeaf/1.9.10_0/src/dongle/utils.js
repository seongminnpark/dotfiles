(function() {
  _.extend(ledger.dongle, {
    isPluggedAndUnlocked: function() {
      return (ledger.app.dongle != null) && ledger.app.dongle.state === ledger.dongle.States.UNLOCKED;
    },
    unlocked: function() {
      if (!this.isPluggedAndUnlocked()) {
        ledger.errors["throw"](ledger.errors.DongleLocked);
      }
      return ledger.app.dongle;
    }
  });

}).call(this);
