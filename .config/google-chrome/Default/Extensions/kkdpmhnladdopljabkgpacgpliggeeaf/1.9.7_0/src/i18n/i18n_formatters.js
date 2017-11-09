(function() {
  _.extend(ledger.i18n, {

    /*
      Set the locale for Moment.js
     */
    setMomentLocale: function() {
      return moment.locale(this.favLocale.memoryValue);
    },

    /*
      Translate a message id to a localized text
      @param [String] messageId Unique identifier of the message
      @return [String] localized message
     */
    t: function(messageId) {
      var key, res;
      if (this.translations[this.favLang.memoryValue] == null) {
        ledger.i18n.findBestLanguage();
      }
      messageId = _.string.replace(messageId, '.', '_');
      key = this.translations[this.favLang.memoryValue][messageId] || this.translations['en'][messageId];
      if ((key == null) || (key['message'] == null)) {
        return messageId;
      }
      res = key['message'];
      if ((res != null) && res.length > 0) {
        return res;
      }
      return messageId;
    },

    /*
      Formats amounts with currency symbol
      @param [String] amount The amount to format
      @param [String] currency The currency
      @return [String] The formatted amount
     */
    formatAmount: function(amount, currency) {
      var locale, testValue, value;
      locale = _.str.replace(this.favLocale.memoryValue, '_', '-');
      if (amount != null) {
        testValue = amount.toLocaleString(locale, {
          style: "currency",
          currency: "WTF",
          currencyDisplay: "code",
          minimumFractionDigits: 2
        });
        value = amount.toLocaleString(locale, {
          minimumFractionDigits: 2
        });
      } else {
        testValue = 0..toLocaleString(locale, {
          style: "currency",
          currency: "WTF",
          currencyDisplay: "code",
          minimumFractionDigits: 2
        });
        value = '--';
      }
      if (_.isNaN(parseInt(testValue.charAt(0)))) {
        value = currency + ' ' + value;
      } else {
        value = value + ' ' + currency;
      }
      return value.replace("WTF", currency);
    },

    /*
      Formats number
     */
    formatNumber: function(number) {
      return number.toLocaleString(_.str.replace(this.favLocale.memoryValue, '_', '-'), {
        minimumFractionDigits: 2
      });
    },

    /*
      Formats date and time
      @param [Date] dateTime The date and time to format
      @return [String] The formatted date and time
     */
    formatDateTime: function(dateTime) {
      return moment(dateTime).format(this.t('common.date_time_format'));
    },

    /*
      Formats date
      @param [Date] date The date to format
      @return [String] The formatted date
     */
    formatDate: function(date) {
      return moment(date).format(this.t('common.date_format'));
    },

    /*
      Formats time
      @param [Date] time The time to format
      @return [String] The formatted time
     */
    formatTime: function(time) {
      return moment(time).format(this.t('common.time_format'));
    },

    /*
      getAllLocales
     */
    getAllLocales: function(callback) {
      return $.getJSON('../src/i18n/regions.json', function(data) {
        return typeof callback === "function" ? callback(data) : void 0;
      });
    }
  });

  this.t = ledger.i18n.t.bind(ledger.i18n);

}).call(this);
