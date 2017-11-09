(function() {
  var _base;

  if ((_base = this.ledger).spinners == null) {
    _base.spinners = {};
  }

  this.ledger.spinners.createLargeSpinner = function(target) {
    var opts;
    opts = {
      lines: 9,
      length: 0,
      width: 3,
      radius: 16,
      corners: 0,
      rotate: 0,
      direction: 1,
      color: '#000',
      speed: 0.6,
      trail: 20,
      shadow: false,
      hwaccel: true,
      className: 'spinner',
      zIndex: 0,
      position: 'relative'
    };
    return new Spinner(opts).spin(target);
  };

  this.ledger.spinners.createTinySpinner = function(target) {
    var opts;
    opts = {
      lines: 7,
      length: 0,
      width: 2,
      radius: 5,
      corners: 0,
      rotate: 0,
      direction: 1,
      color: '#000',
      speed: 0.8,
      trail: 50,
      shadow: false,
      hwaccel: true,
      className: 'tinySpinner',
      position: 'relative'
    };
    return new Spinner(opts).spin(target);
  };

}).call(this);
