(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.CommonDialogsMessageDialogViewController = (function(_super) {
    __extends(CommonDialogsMessageDialogViewController, _super);


    /*
      @param kind [String] The message kind [error|success]
      @param title [String] The message title
      @param subtitle [String] The message subtitle
     */

    function CommonDialogsMessageDialogViewController(_arg) {
      var kind, subtitle, title;
      kind = _arg.kind, title = _arg.title, subtitle = _arg.subtitle;
      if (kind == null) {
        kind = "success";
      }
      if (title == null) {
        title = "";
      }
      if (subtitle == null) {
        subtitle = "";
      }
      CommonDialogsMessageDialogViewController.__super__.constructor.apply(this, arguments);
    }

    return CommonDialogsMessageDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
