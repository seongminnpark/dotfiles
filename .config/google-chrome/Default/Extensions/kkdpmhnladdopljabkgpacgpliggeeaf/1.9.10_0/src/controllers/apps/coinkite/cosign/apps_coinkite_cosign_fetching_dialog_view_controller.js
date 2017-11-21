(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.AppsCoinkiteCosignFetchingDialogViewController = (function(_super) {
    __extends(AppsCoinkiteCosignFetchingDialogViewController, _super);

    function AppsCoinkiteCosignFetchingDialogViewController() {
      return AppsCoinkiteCosignFetchingDialogViewController.__super__.constructor.apply(this, arguments);
    }

    AppsCoinkiteCosignFetchingDialogViewController.prototype.view = {
      contentContainer: '#content_container'
    };

    AppsCoinkiteCosignFetchingDialogViewController.prototype.onAfterRender = function() {
      var request;
      AppsCoinkiteCosignFetchingDialogViewController.__super__.onAfterRender.apply(this, arguments);
      this.view.spinner = ledger.spinners.createLargeSpinner(this.view.contentContainer[0]);
      request = this.params.request;
      return Coinkite.factory((function(_this) {
        return function(ck) {
          if (ck != null) {
            return ck.getRequestData(request, function(data, error) {
              if (error != null) {
                return _this.dismiss(function() {
                  var dialog;
                  dialog = new CommonDialogsMessageDialogViewController({
                    kind: "error",
                    title: t("apps.coinkite.cosign.errors.coinkite_api"),
                    subtitle: error
                  });
                  return dialog.show();
                });
              } else {
                return setTimeout((function() {
                  return ck.getCosigner(data, function(cosigner, signed) {
                    if (cosigner != null) {
                      if (signed) {
                        return _this.dismiss(function() {
                          var dialog;
                          dialog = new CommonDialogsMessageDialogViewController({
                            kind: "success",
                            title: t("apps.coinkite.cosign.signing.success"),
                            subtitle: t("apps.coinkite.cosign.signing.already_signed")
                          });
                          return dialog.show();
                        });
                      } else {
                        return ck.getCosignData(request, cosigner, function(data, error) {
                          if (error != null) {
                            return _this.dismiss(function() {
                              var dialog;
                              dialog = new CommonDialogsMessageDialogViewController({
                                kind: "error",
                                title: t("apps.coinkite.cosign.errors.coinkite_api"),
                                subtitle: error
                              });
                              return dialog.show();
                            });
                          } else {
                            return _this.dismiss(function() {
                              var dialog;
                              dialog = new AppsCoinkiteCosignShowDialogViewController({
                                request: data,
                                ck: ck
                              });
                              return dialog.show();
                            });
                          }
                        });
                      }
                    } else {
                      return _this.dismiss(function() {
                        var dialog;
                        dialog = new CommonDialogsMessageDialogViewController({
                          kind: "error",
                          title: t("apps.coinkite.cosign.errors.wrong_nano"),
                          subtitle: t("apps.coinkite.cosign.errors.wrong_nano_text")
                        });
                        return dialog.show();
                      });
                    }
                  });
                }), 2000);
              }
            });
          } else {
            return _this.dismiss(function() {
              var dialog;
              dialog = new CommonDialogsMessageDialogViewController({
                kind: "error",
                title: t("apps.coinkite.cosign.errors.missing_api_key"),
                subtitle: t("apps.coinkite.cosign.errors.missing_api_key_text")
              });
              return dialog.show();
            });
          }
        };
      })(this));
    };

    return AppsCoinkiteCosignFetchingDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
