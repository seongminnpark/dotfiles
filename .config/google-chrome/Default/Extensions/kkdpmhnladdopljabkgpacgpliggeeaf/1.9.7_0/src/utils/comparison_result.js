(function() {
  if (ledger.utils == null) {
    ledger.utils = {};
  }


  /*
    Utility class for dealing with comparison result.
   */

  ledger.utils.ComparisonResult = (function() {

    /*
      @param [Any] lhs The left hand side object of the comparison.
      @param [Any] rhs The right hand side object of the comparison.
      @param [Function] comparisonHandler The function that performs the comparison. It takes lhs and rhs in parameter and returns
        an integer. The result must be equal to 0 if lhs and rhs are equals, if lhs is greater than rhs it must be positive and non null.
        Finally the result must be negative and non null if lhs is less than rhs.
     */
    function ComparisonResult(lhs, rhs, comparisonHandler) {
      this._handler = comparisonHandler;
      this._lhs = lhs;
      this._rhs = rhs;
    }


    /*
      Performs the comparison by using the comparisonHandler.
      @see ledger.utils.ComparisonResult#constructor
     */

    ComparisonResult.prototype.compare = function() {
      return this._handler(this._lhs, this._rhs);
    };


    /*
      Checks if lhs and rhs are equal
      @return [Boolean] True if lhs and rhs are equal, false otherwise
     */

    ComparisonResult.prototype.eq = function() {
      return this.compare() === 0;
    };


    /*
      Checks if lhs is less than rhs.
      @return [Boolean] True if lhs is less than rhs, false otherwise
     */

    ComparisonResult.prototype.lt = function() {
      return this.compare() < 0;
    };


    /*
      Checks if lhs and rhs are equal or if lhs is less than rhs
      @return [Boolean] True if lhs and rhs are equal or if lhs is less than rhs, false otherwise
     */

    ComparisonResult.prototype.lte = function() {
      return this.compare() <= 0;
    };


    /*
      Checks if lhs is greater than rhs
      @return [Boolean] True if lhs is greater than rhs, false otherwise
     */

    ComparisonResult.prototype.gt = function() {
      return this.compare() > 0;
    };


    /*
      Checks if lhs and rhs are equal or if lhs is greater than rhs
      @return [Boolean] True if lhs and rhs are equal or if lhs is greater than rhs, false otherwise
     */

    ComparisonResult.prototype.gte = function() {
      return this.compare() >= 0;
    };

    return ComparisonResult;

  })();

}).call(this);
