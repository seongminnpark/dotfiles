(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.CommonDialogsHelpDialogViewController = (function(_super) {
    __extends(CommonDialogsHelpDialogViewController, _super);

    function CommonDialogsHelpDialogViewController() {
      return CommonDialogsHelpDialogViewController.__super__.constructor.apply(this, arguments);
    }

    CommonDialogsHelpDialogViewController.prototype.browseKnowledge = function() {
      window.open(t('application.support_url'));
      return this.dismiss();
    };

    CommonDialogsHelpDialogViewController.prototype.contactSupport = function() {
      return this.getDialog().push(new CommonDialogsTicketDialogViewController());
    };

    return CommonDialogsHelpDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
