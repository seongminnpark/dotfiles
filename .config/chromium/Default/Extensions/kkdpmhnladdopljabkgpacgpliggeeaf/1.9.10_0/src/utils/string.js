(function() {
  _.string.escapeRegExp = function(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
  };

  _.string.replace = function(string, pattern, substitute) {
    return string.replace(new RegExp(_.string.escapeRegExp(pattern), 'g'), substitute);
  };

  _.str.parseParamList = function(string) {
    var pair, parameter, parameters, parametersList, _i, _len;
    if (string == null) {
      return {};
    }
    parametersList = string.split(',');
    parameters = {};
    for (_i = 0, _len = parametersList.length; _i < _len; _i++) {
      parameter = parametersList[_i];
      pair = parameter.split('=');
      parameters[pair[0]] = pair[1];
    }
    return parameters;
  };

  _.str.parseObjectPath = function(string) {
    var matcher, matches, path, rootPath;
    matcher = /([a-z0-9]+)(?:\[([0-9]*)\])?(?:\.|$)/ig;
    rootPath = {};
    path = rootPath;
    while ((matches = matcher.exec(string)) != null) {
      path.next = {};
      path = path.next;
      path.name = matches[1];
      path.type = matches[2] != null ? 'array' : 'object';
      path.index = parseInt(_.str.clean(matches[2]));
    }
    path.next = null;
    return rootPath.next;
  };

}).call(this);
