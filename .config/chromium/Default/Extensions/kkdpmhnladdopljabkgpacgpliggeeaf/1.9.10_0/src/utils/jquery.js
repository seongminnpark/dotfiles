(function() {
  $.fn.extend({
    keepFocus: function() {
      return this.blur((function(_this) {
        return function() {
          return setTimeout(function() {
            return _this.focus();
          }, 0);
        };
      })(this));
    },
    numberInput: function() {
      return this.on('keydown', function(e) {
        if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 || (e.keyCode === 65 && e.ctrlKey === true) || (e.keyCode >= 35 && e.keyCode <= 39)) {
          return;
        }
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
          return e.preventDefault();
        }
      });
    },
    amountInput: function(maximumNumberDigits) {
      if (maximumNumberDigits == null) {
        maximumNumberDigits = 8;
      }
      this.on('keydown', function(e) {
        if ((this.value.indexOf('.') !== -1) && e.keyCode === 110) {
          e.preventDefault;
          return false;
        }
      });
      return this.on('input', function() {
        var decimalPointIndex, parts;
        if (this.value.indexOf(',') !== -1) {
          this.value = _.str.replace(this.value, ',', '.');
        }
        decimalPointIndex = this.value.indexOf('.');
        if (maximumNumberDigits <= 0 && decimalPointIndex !== -1) {
          this.value = this.value.replace('.', '');
        }
        if (decimalPointIndex !== -1 && this.value.length - decimalPointIndex >= maximumNumberDigits) {
          this.value = this.value.substring(0, this.value.indexOf('.') + maximumNumberDigits + 1);
        }
        if (/[^\.0-9]/.test(this.value)) {
          this.value = this.value.replace(/[^\.0-9]/g, '');
        }
        if (this.value.indexOf('.') !== this.value.lastIndexOf('.')) {
          parts = this.value.split('.');
          parts.splice(parts.length - 1, 0, '.');
          this.value = parts.join('');
        }
        if (this.value.indexOf('.') === 0) {
          return this.value = '0.';
        }
      });
    }
  });

}).call(this);
