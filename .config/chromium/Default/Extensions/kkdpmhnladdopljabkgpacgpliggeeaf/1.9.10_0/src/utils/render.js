(function() {
  var helpers;

  helpers = {
    url: function(url, params) {
      return ledger.url.createUrlWithParams(url, params);
    }
  };

  this.render = (function(_this) {
    return function(template, params, callback) {
      var context, _ref;
      if (_.string.startsWith(template, '/')) {
        template = template.substr(1);
      }
      if (((_ref = window.JST) != null ? _ref[template] : void 0) != null) {
        context = _.extend(params, helpers);
        return _.defer(function() {
          return typeof callback === "function" ? callback(JST[template](context)) : void 0;
        });
      } else {
        return require('../views/' + template, function() {
          context = _.extend(params, helpers);
          return callback(JST[template](context));
        });
      }
    };
  })(this);

}).call(this);
