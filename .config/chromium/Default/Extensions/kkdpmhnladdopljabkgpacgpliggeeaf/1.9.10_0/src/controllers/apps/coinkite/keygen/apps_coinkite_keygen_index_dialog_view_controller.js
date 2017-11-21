(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.AppsCoinkiteKeygenIndexDialogViewController = (function(_super) {
    __extends(AppsCoinkiteKeygenIndexDialogViewController, _super);

    function AppsCoinkiteKeygenIndexDialogViewController() {
      return AppsCoinkiteKeygenIndexDialogViewController.__super__.constructor.apply(this, arguments);
    }

    AppsCoinkiteKeygenIndexDialogViewController.prototype.cancellable = false;

    AppsCoinkiteKeygenIndexDialogViewController.prototype.view = {
      derivationPath: '#derivation_path'
    };

    AppsCoinkiteKeygenIndexDialogViewController.prototype.onAfterRender = function() {
      AppsCoinkiteKeygenIndexDialogViewController.__super__.onAfterRender.apply(this, arguments);
      return chrome.app.window.current().show();
    };

    AppsCoinkiteKeygenIndexDialogViewController.prototype.cancel = function() {
      Api.callback_cancel('coinkite_get_xpubkey', t("apps.coinkite.keygen.errors.cancelled"));
      return this.dismiss();
    };

    AppsCoinkiteKeygenIndexDialogViewController.prototype.confirm = function() {
      var dialog;
      dialog = new AppsCoinkiteKeygenProcessingDialogViewController({
        index: this.params.index,
        api: true
      });
      return this.getDialog().push(dialog);
    };

    return AppsCoinkiteKeygenIndexDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
