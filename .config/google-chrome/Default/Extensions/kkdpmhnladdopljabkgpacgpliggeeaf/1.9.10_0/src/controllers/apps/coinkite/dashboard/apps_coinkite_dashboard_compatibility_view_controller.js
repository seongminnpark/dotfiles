(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.AppsCoinkiteDashboardCompatibilityDialogViewController = (function(_super) {
    __extends(AppsCoinkiteDashboardCompatibilityDialogViewController, _super);

    function AppsCoinkiteDashboardCompatibilityDialogViewController() {
      return AppsCoinkiteDashboardCompatibilityDialogViewController.__super__.constructor.apply(this, arguments);
    }

    AppsCoinkiteDashboardCompatibilityDialogViewController.prototype.view = {
      contentContainer: '#content_container'
    };

    AppsCoinkiteDashboardCompatibilityDialogViewController.prototype.onAfterRender = function() {
      var ck;
      AppsCoinkiteDashboardCompatibilityDialogViewController.__super__.onAfterRender.apply(this, arguments);
      this.view.spinner = ledger.spinners.createLargeSpinner(this.view.contentContainer[0]);
      ck = new Coinkite();
      return ck.testDongleCompatibility((function(_this) {
        return function(success) {
          if (success) {
            return _this.dismiss(function() {
              var dialog;
              dialog = new CommonDialogsMessageDialogViewController({
                kind: "success",
                title: t("apps.coinkite.dashboard.compatibility.success"),
                subtitle: t("apps.coinkite.dashboard.compatibility.success_text")
              });
              return dialog.show();
            });
          } else {
            return _this.dismiss(function() {
              var dialog;
              dialog = new CommonDialogsMessageDialogViewController({
                kind: "error",
                title: t("apps.coinkite.dashboard.compatibility.fail"),
                subtitle: _.str.sprintf(t("apps.coinkite.dashboard.compatibility.fail_text"), ledger.config.network.plural)
              });
              return dialog.show();
            });
          }
        };
      })(this));
    };

    return AppsCoinkiteDashboardCompatibilityDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
