(function() {
  if (this.ledger == null) {
    this.ledger = {};
  }

  this.ledger.url = {
    parseAsUrl: function(str) {
      var parser;
      parser = document.createElement('a');
      parser.href = str;
      parser.params = function() {
        var params;
        if (parser.search === "") {
          return {};
        }
        params = parser.search.substring(1);
        return _.chain(params.split('&')).map(function(params) {
          var p;
          p = params.split('=');
          return [decodeURIComponent(p[0]), ledger.url.parseValue(p[1])];
        }).object().value();
      };
      return parser;
    },
    parseValue: function(str) {
      var val;
      val = decodeURIComponent(str);
      if (val === "true") {
        return true;
      } else if (val === "false") {
        return false;
      } else {
        return val;
      }
    },
    createRelativeUrlWithFragmentedUrl: function(url, fragmentedUrl) {
      var hash, parsedFragmentedUrl, parsedUrl, pathname, search;
      parsedUrl = ledger.url.parseAsUrl(url);
      parsedFragmentedUrl = ledger.url.parseAsUrl(fragmentedUrl);
      pathname = parsedUrl.pathname;
      hash = parsedFragmentedUrl.hash.length > 0 ? parsedFragmentedUrl.hash : parsedUrl.hash;
      search = parsedFragmentedUrl.search.length > 0 ? parsedFragmentedUrl.search : parsedUrl.search;
      return pathname + search + hash;
    },
    parseAction: function(hash) {
      var actionName, matches, parameters, __;
      actionName = _.str.splice(hash, 0, 1);
      matches = /([a-zA-Z0-9-_-]+)\((.*)\)/i.exec(actionName);
      if (matches) {
        __ = matches[0], actionName = matches[1], parameters = matches[2];
      }
      parameters = _.str.parseParamList(parameters);
      return [actionName, parameters];
    },
    createUrlWithParams: function(url, params) {
      var name, value;
      if ((params == null) || _.isEmpty(params)) {
        return url;
      }
      url = url + '?';
      for (name in params) {
        value = params[name];
        url += encodeURIComponent(name) + '=' + encodeURIComponent(value) + "&";
      }
      return url.slice(0, -1);
    }
  };

  String.prototype.parseAsUrl = function() {
    return ledger.url.parseAsUrl(this);
  };

}).call(this);
