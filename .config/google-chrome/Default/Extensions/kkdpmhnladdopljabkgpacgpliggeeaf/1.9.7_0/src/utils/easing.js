(function() {
  jQuery.easing['jswing'] = jQuery.easing['swing'];

  $.extend($.easing, {
    "default": 'smooth',
    swing: function(t, b, c, d) {
      return $.easing[$.easing["default"]](t, b, c, d);
    },
    accelerate_deccelerate: function(t, b, c, d) {
      return (Math.cos((t + 1) * Math.PI) / 2.0) + 0.5;
    },
    smooth: function(t, b, c, d) {
      return Math.pow(t - 1, 5) + 1;
    }
  });

}).call(this);
