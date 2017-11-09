(function() {
  xdescribe("WalletOpenTask", function() {
    beforeEach(function() {
      return ledger.tasks.WalletOpenTask.instance.start();
    });
    afterEach(function() {
      return ledger.tasks.Task.resetAllSingletonTasks();
    });
    return it("should", function() {});
  });

}).call(this);
