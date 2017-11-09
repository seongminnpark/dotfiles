(function() {
  var require_script;

  require_script = function(url, callback) {
    var script;
    script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '../src/' + url + '.js' + '?' + (new Date().getTime());
    if (callback != null) {
      script.onreadystatechange = callback;
      script.onload = script.onreadystatechange;
    }
    document.getElementsByTagName('head')[0].appendChild(script);
    return script;
  };

  this.require = function(urls, callback) {
    var index, require_array, scripts, self;
    self = this;
    scripts = [];
    if (urls instanceof Array) {
      index = -1;
      require_array = function() {
        if (index + 1 < urls.length) {
          return scripts.push(require_script(urls[++index], require_array));
        } else {
          return callback.bind(self)(scripts);
        }
      };
      return require_array();
    } else {
      return scripts.push(require_script(urls, (function(_this) {
        return function() {
          return typeof callback === "function" ? callback(scripts) : void 0;
        };
      })(this)));
    }
  };

}).call(this);
