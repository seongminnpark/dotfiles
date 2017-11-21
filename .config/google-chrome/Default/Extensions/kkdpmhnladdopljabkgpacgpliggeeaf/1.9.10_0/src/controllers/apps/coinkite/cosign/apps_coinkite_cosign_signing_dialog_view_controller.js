(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.AppsCoinkiteCosignSigningDialogViewController = (function(_super) {
    __extends(AppsCoinkiteCosignSigningDialogViewController, _super);

    function AppsCoinkiteCosignSigningDialogViewController() {
      return AppsCoinkiteCosignSigningDialogViewController.__super__.constructor.apply(this, arguments);
    }

    AppsCoinkiteCosignSigningDialogViewController.prototype.cancellable = false;

    AppsCoinkiteCosignSigningDialogViewController.prototype.view = {
      contentContainer: '#content_container'
    };

    AppsCoinkiteCosignSigningDialogViewController.prototype.cancel = function() {
      return this.dismiss((function(_this) {
        return function() {
          if (_this.params.request.api) {
            return Api.callback_cancel('coinkite_sign_json', t("apps.coinkite.cosign.errors.request_cancelled"));
          }
        };
      })(this));
    };

    AppsCoinkiteCosignSigningDialogViewController.prototype.onAfterRender = function() {
      var json;
      AppsCoinkiteCosignSigningDialogViewController.__super__.onAfterRender.apply(this, arguments);
      this.view.spinner = ledger.spinners.createLargeSpinner(this.view.contentContainer[0]);
      if (this.params.request.api) {
        return json = this.params.ck.buildSignedJSON(this.params.request, (function(_this) {
          return function(data, error) {
            if (!_this.isShown()) {
              return;
            }
            if (error != null) {
              Api.callback_cancel('coinkite_sign_json', error);
              return _this.dismiss(function() {
                var dialog;
                dialog = new CommonDialogsMessageDialogViewController({
                  kind: "error",
                  title: t("apps.coinkite.cosign.errors.signature_failed"),
                  subtitle: error
                });
                return dialog.show();
              });
            } else {
              if (_this.params.request.post) {
                return _this.params.ck.postSignedJSON(data, function(data, error) {
                  if (error != null) {
                    Api.callback_cancel('coinkite_sign_json', error);
                    return _this.dismiss(function() {
                      var dialog;
                      dialog = new CommonDialogsMessageDialogViewController({
                        kind: "error",
                        title: t("apps.coinkite.cosign.errors.signature_failed"),
                        subtitle: error
                      });
                      return dialog.show();
                    });
                  } else {
                    return _this.dismiss(function() {
                      var dialog;
                      if (data === "DONE") {
                        Api.callback_success('coinkite_sign_json', {
                          message: t("apps.coinkite.cosign.signing.success_info")
                        });
                        dialog = new CommonDialogsMessageDialogViewController({
                          kind: "success",
                          title: t("apps.coinkite.cosign.signing.success"),
                          subtitle: t("apps.coinkite.cosign.signing.success_info")
                        });
                      } else {
                        Api.callback_cancel('coinkite_sign_json', data);
                        dialog = new CommonDialogsMessageDialogViewController({
                          kind: "error",
                          title: t("apps.coinkite.cosign.errors.signature_failed"),
                          subtitle: data
                        });
                      }
                      return dialog.show();
                    });
                  }
                });
              } else {
                return _this.dismiss(function() {
                  var dialog;
                  Api.callback_success('coinkite_sign_json', {
                    json: data
                  });
                  dialog = new CommonDialogsMessageDialogViewController({
                    kind: "success",
                    title: t("apps.coinkite.cosign.signing.success"),
                    subtitle: t("apps.coinkite.cosign.signing.success_info")
                  });
                  return dialog.show();
                });
              }
            }
          };
        })(this));
      } else {
        return this.params.ck.cosignRequest(this.params.request, (function(_this) {
          return function(data, error) {
            if (error != null) {
              return _this.dismiss(function() {
                var dialog;
                dialog = new CommonDialogsMessageDialogViewController({
                  kind: "error",
                  title: t("apps.coinkite.cosign.errors.signature_failed"),
                  subtitle: error
                });
                return dialog.show();
              });
            } else {
              return _this.dismiss(function() {
                var dialog;
                dialog = new CommonDialogsMessageDialogViewController({
                  kind: "success",
                  title: t("apps.coinkite.cosign.signing.success"),
                  subtitle: data.message
                });
                return dialog.show();
              });
            }
          };
        })(this));
      }
    };

    return AppsCoinkiteCosignSigningDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
