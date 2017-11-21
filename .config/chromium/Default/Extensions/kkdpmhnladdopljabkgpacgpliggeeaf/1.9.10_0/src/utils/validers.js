(function() {
  if (ledger.validers == null) {
    ledger.validers = {};
  }


  /*
    This class is a namespace and cannot be instantiated
   */

  ledger.validers = (function() {

    /*
      This constructor prevent the class to be instantiated
    
      @throw [Object] error Throw an error when user try to instantiates the class
     */
    function validers() {
      throw new Error('This class cannot be instantiated');
    }


    /*
      This method check if a given string a valid email address
     */

    validers.isValidEmailAddress = function(str) {
      var filter;
      filter = /^([a-zA-Z0-9_.-])+@(([a-zA-Z0-9-])+.)+([a-zA-Z0-9]{2,4})+$/;
      return filter.test(str);
    };

    return validers;

  })();

}).call(this);
