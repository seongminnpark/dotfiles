(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.CommonDialogsConfirmationDialogViewController = (function(_super) {
    __extends(CommonDialogsConfirmationDialogViewController, _super);

    CommonDialogsConfirmationDialogViewController.prototype.positiveLocalizableKey = 'common.yes';

    CommonDialogsConfirmationDialogViewController.prototype.positiveText = null;

    CommonDialogsConfirmationDialogViewController.prototype.negativeLocalizableKey = 'common.no';

    CommonDialogsConfirmationDialogViewController.prototype.negativeText = null;

    CommonDialogsConfirmationDialogViewController.prototype.cancelLocalizableKey = 'common.cancel';

    CommonDialogsConfirmationDialogViewController.prototype.titleLocalizableKey = 'common.confirmation';

    CommonDialogsConfirmationDialogViewController.prototype.messageLocalizableKey = null;

    CommonDialogsConfirmationDialogViewController.prototype.message = null;

    CommonDialogsConfirmationDialogViewController.prototype.showsCancelButton = false;

    CommonDialogsConfirmationDialogViewController.prototype.restrainsDialogWidth = true;

    CommonDialogsConfirmationDialogViewController.prototype.dismissAfterClick = true;

    function CommonDialogsConfirmationDialogViewController(_arg) {
      var message, negativeText, positiveText, _ref;
      _ref = _arg != null ? _arg : {}, message = _ref.message, positiveText = _ref.positiveText, negativeText = _ref.negativeText;
      CommonDialogsConfirmationDialogViewController.__super__.constructor.apply(this, arguments);
      if (message != null) {
        this.setMessageLocalizableKey(message);
      }
      if (positiveText != null) {
        this.positiveLocalizableKey = positiveText;
      }
      if (negativeText != null) {
        this.negativeLocalizableKey = negativeText;
      }
    }

    CommonDialogsConfirmationDialogViewController.prototype.clickPositive = function() {
      this.emit('click:positive');
      if (this.dismissAfterClick) {
        return this.dismiss();
      }
    };

    CommonDialogsConfirmationDialogViewController.prototype.clickNegative = function() {
      this.emit('click:negative');
      if (this.dismissAfterClick) {
        return this.dismiss();
      }
    };

    CommonDialogsConfirmationDialogViewController.prototype.clickCancel = function() {
      this.emit('click:cancel');
      if (this.dismissAfterClick) {
        return this.dismiss();
      }
    };

    CommonDialogsConfirmationDialogViewController.prototype.setMessageLocalizableKey = function(key) {
      return this.messageLocalizableKey = key;
    };

    return CommonDialogsConfirmationDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
