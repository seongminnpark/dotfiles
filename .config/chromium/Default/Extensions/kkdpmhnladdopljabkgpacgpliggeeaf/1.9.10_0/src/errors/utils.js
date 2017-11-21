(function() {
  if (ledger.errors == null) {
    ledger.errors = {};
  }

  _.extend(ledger.errors, {
    "new": function(code, msg, payload) {
      var defaultMessage, errorName, self, _ref;
      if (_(code).isNumber()) {
        code = +code;
      }
      errorName = _.findKey(ledger.errors, function(c) {
        return +c === code;
      });
      defaultMessage = ledger.errors.DefaultMessages[code] || _.str.humanize(errorName);
      if (_.str.isBlank(defaultMessage)) {
        _ref = [0, code], code = _ref[0], msg = _ref[1];
      }
      self = new Error(msg || defaultMessage);
      self.code = ledger.errors[errorName] || code;
      self.name = _.invert(ledger.errors)[code];
      self.payload = payload;
      self.localizedMessage = function() {
        return t(this._i18nId());
      };
      self._i18nId = function() {
        return "common.errors." + (_.underscore(this.name));
      };
      return self;
    },
    "throw": function(code, msg) {
      throw this["new"](code, msg);
    },
    newHttp: function(xhr) {
      var self;
      self = this["new"](ledger.errors.NetworkError, xhr.statusText);
      self._xhr = xhr;
      self.getXmlHttpRequest = function() {
        return this._xhr;
      };
      self.getStatusCode = function() {
        return this.getXmlHttpRequest().status;
      };
      self.getStatusText = function() {
        return this.getXmlHttpRequest().statusText;
      };
      self.isDueToNoInternetConnectivity = function() {
        return this.getStatusCode() === 0;
      };
      return self;
    },
    init: function() {
      var k, v, _ref, _results;
      _ref = ledger.errors;
      _results = [];
      for (k in _ref) {
        v = _ref[k];
        if (_(v).isNumber()) {
          ledger.errors[k] = new Number(v);
          ledger.errors[k].intValue = function() {
            return +this;
          };
          _results.push(ledger.errors[k]["new"] = function(msgOrXhr) {
            if (msgOrXhr == null) {
              msgOrXhr = void 0;
            }
            if (!msgOrXhr || _(msgOrXhr).isString()) {
              return ledger.errors["new"](+this, msgOrXhr);
            } else {
              return ledger.errors.newHttp(msgOrXhr);
            }
          });
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    }
  });

}).call(this);
