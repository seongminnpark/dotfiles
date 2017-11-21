(function() {
  if (ledger.synchronization == null) {
    ledger.synchronization = {};
  }

  ledger.synchronization.SynchronizedObject = (function() {
    function SynchronizedObject() {}

    SynchronizedObject.prototype.get = function() {};

    SynchronizedObject.prototype.synchronize = function() {};

    return SynchronizedObject;

  })();

}).call(this);
