(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.AppsCoinkiteKeygenProcessingDialogViewController = (function(_super) {
    __extends(AppsCoinkiteKeygenProcessingDialogViewController, _super);

    function AppsCoinkiteKeygenProcessingDialogViewController() {
      return AppsCoinkiteKeygenProcessingDialogViewController.__super__.constructor.apply(this, arguments);
    }

    AppsCoinkiteKeygenProcessingDialogViewController.prototype.cancellable = false;

    AppsCoinkiteKeygenProcessingDialogViewController.prototype.view = {
      contentContainer: '#content_container'
    };

    AppsCoinkiteKeygenProcessingDialogViewController.prototype.onAfterRender = function() {
      var ck;
      AppsCoinkiteKeygenProcessingDialogViewController.__super__.onAfterRender.apply(this, arguments);
      this.view.spinner = ledger.spinners.createLargeSpinner(this.view.contentContainer[0]);
      ck = new Coinkite();
      return ck.getExtendedPublicKey(this.params.index, (function(_this) {
        return function(result, error) {
          if (!_this.isShown()) {
            return;
          }
          if (error != null) {
            return _this.dismiss(function() {
              var dialog;
              dialog = new CommonDialogsMessageDialogViewController({
                kind: "error",
                title: t("apps.coinkite.keygen.errors.derivation_failed"),
                subtitle: error
              });
              dialog.show();
              if (_this.params.api) {
                return Api.callback_cancel('coinkite_get_xpubkey', t('apps.coinkite.keygen.errors.derivation_failed'));
              }
            });
          } else {
            if (_this.params.api) {
              return _this.dismiss(function() {
                var dialog;
                Api.callback_success('coinkite_get_xpubkey', {
                  xpubkey: result.xpub,
                  signature: result.signature,
                  path: result.path,
                  index: _this.params.index
                });
                dialog = new CommonDialogsMessageDialogViewController({
                  kind: "success",
                  title: t("wallet.xpubkey.errors.derivation_successfull")
                });
                return dialog.show();
              });
            } else {
              return _this.getDialog().push(new AppsCoinkiteKeygenShowDialogViewController({
                xpub: result.xpub,
                signature: result.signature
              }));
            }
          }
        };
      })(this));
    };

    AppsCoinkiteKeygenProcessingDialogViewController.prototype.cancel = function() {
      return this.dismiss((function(_this) {
        return function() {
          if (_this.params.api) {
            return Api.callback_cancel('coinkite_get_xpubkey', t("apps.coinkite.keygen.errors.cancelled"));
          }
        };
      })(this));
    };

    return AppsCoinkiteKeygenProcessingDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
