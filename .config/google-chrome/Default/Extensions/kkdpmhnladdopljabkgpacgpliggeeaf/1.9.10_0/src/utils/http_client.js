(function() {
  this.HttpClient = (function() {
    function HttpClient(baseUrl) {
      if (baseUrl == null) {
        baseUrl = '';
      }
      this.baseUrl = baseUrl;
      this.headers = {};
    }


    /*
     @private This method should not be used outside this class and its descendants.
     @param [Object] See jQuery.ajax() params.
     @return [jqXHR] A jQuery.jqXHR
     */

    HttpClient.prototype.jqAjax = function(r) {
      var _ref;
      if (((_ref = ledger.api.authenticated()) != null ? _ref.getAuthTokenSync() : void 0) != null) {
        this.setHttpHeader('X-LedgerWallet-AuthToken', ledger.api.authenticated().getAuthTokenSync());
      }
      r.headers = _.extend({}, this.headers, r.headers);
      if (r.success == null) {
        r.success = r.onSuccess;
      }
      if (r.error == null) {
        r.error = r.onError;
      }
      if (r.data == null) {
        r.data = r.body;
      }
      if (r.complete == null) {
        r.complete = r.onComplete;
      }
      if (r.contentType === 'application/json') {
        r.data = JSON.stringify(r.data);
      }
      if (r.url.match(/^[a-z0-9A-Z]+:\//) == null) {
        r.url = this.baseUrl + r.url;
      }
      r.crossDomain = true;
      if (r.timeout == null) {
        r.timeout = 30 * 1000;
      }
      return $.ajax(r);
    };


    /*
      Performs a HTTP request. Please prefer shorthand methods as {HttpClient#get} or {HttpClient#post}.
    
      @example Simple Usage with callbacks
        http = new HttpClient("http://paristocrats.com")
        http.do
          type: 'GET'
          data: {what: 'score'}
          onSuccess: (data, statusText, jqXHR) ->
            ... Handle success ...
          onError: (jqXHR, status) ->
            ... Handle error ...
    
      @example Simple Usage with Q.Promise
         http = new HttpClient("http://paristocrats.com")
          http
            .do type: 'GET', data: {what: 'score'}
            .then (data, statusText, jqXHR) ->
              ... Handle success ...
            .fail (jqXHR, statusText) ->
              ... Handle error ...
            .done()
    
      @param [Object] r A jQuery style request {http://api.jquery.com/jquery.ajax/#jQuery-ajax-settings jQuery Ajax Setting}
      @return [Q.Promise] A Q.Promise
     */

    HttpClient.prototype["do"] = function(r) {
      return Q(this.jqAjax(r));
    };


    /*
      Performs a HTTP GET request.
    
      @param [Object] r A jQuery style request {http://api.jquery.com/jquery.ajax/#jQuery-ajax-settings jQuery Ajax Setting}
      @return [Q.Promise] A Q.Promise
      @see {HttpClient#do}
     */

    HttpClient.prototype.get = function(r) {
      return this["do"](_.extend(r, {
        type: 'GET',
        dataType: 'json'
      }));
    };


    /*
      Performs a HTTP POST request.
    
      @param [Object] r A jQuery style request {http://api.jquery.com/jquery.ajax/#jQuery-ajax-settings jQuery Ajax Setting}
      @return [Q.Promise] A Q.Promise
      @see HttpClient#do
     */

    HttpClient.prototype.post = function(r) {
      return this["do"](_.extend(r, {
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json'
      }));
    };


    /*
     Performs a HTTP POST request using a form url encoded body.
    
     @param [Object] r A jQuery style request {http://api.jquery.com/jquery.ajax/#jQuery-ajax-settings jQuery Ajax Setting}
     @return [Q.Promise] A Q.Promise
     @see HttpClient#do
     */

    HttpClient.prototype.postForm = function(r) {
      return this["do"](_.extend(r, {
        type: 'POST',
        dataType: 'text',
        contentType: 'application/x-www-form-urlencoded'
      }));
    };


    /*
     Performs a HTTP POST request using multipart/form-data.
    
     @param [Object] r A jQuery style request {http://api.jquery.com/jquery.ajax/#jQuery-ajax-settings jQuery Ajax Setting}
     @return [Q.Promise] A Q.Promise
     @see HttpClient#do
     */

    HttpClient.prototype.postFile = function(r) {
      var formData, key, value, _ref;
      formData = new FormData();
      _ref = r.data;
      for (key in _ref) {
        value = _ref[key];
        formData.append(key, value);
      }
      r.data = formData;
      return this["do"](_.extend(r, {
        type: 'POST',
        contentType: false,
        processData: false
      }));
    };


    /*
     Performs a HTTP PUT request.
    
     @param [Object] r A jQuery style request {http://api.jquery.com/jquery.ajax/#jQuery-ajax-settings jQuery Ajax Setting}
     @return [Q.Promise] A Q.Promise
     @see HttpClient#do
     */

    HttpClient.prototype.put = function(r) {
      return this["do"](_.extend(r, {
        type: 'PUT',
        dataType: 'json',
        contentType: 'application/json'
      }));
    };


    /*
     Performs a HTTP DELETE request.
    
     @param [Object] r A jQuery style request {http://api.jquery.com/jquery.ajax/#jQuery-ajax-settings jQuery Ajax Setting}
     @return [Q.Promise] A Q.Promise
     @see HttpClient#do
     */

    HttpClient.prototype["delete"] = function(r) {
      return this["do"](_.extend(r, {
        type: 'DELETE',
        dataType: 'json'
      }));
    };


    /*
      Sets custom http header to the client. These headers will be automatically included in each HTTP request.
    
      @param [String] key The name of the HTTP header field
      @param [String] value The value for the HTTP header field
     */

    HttpClient.prototype.setHttpHeader = function(key, value) {
      this.headers[key] = value;
      return this;
    };

    return HttpClient;

  })();

}).call(this);
