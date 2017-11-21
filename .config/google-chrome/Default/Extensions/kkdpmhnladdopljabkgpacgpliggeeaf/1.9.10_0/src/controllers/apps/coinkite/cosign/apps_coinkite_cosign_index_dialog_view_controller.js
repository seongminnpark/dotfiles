(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.AppsCoinkiteCosignIndexDialogViewController = (function(_super) {
    __extends(AppsCoinkiteCosignIndexDialogViewController, _super);

    function AppsCoinkiteCosignIndexDialogViewController() {
      return AppsCoinkiteCosignIndexDialogViewController.__super__.constructor.apply(this, arguments);
    }

    AppsCoinkiteCosignIndexDialogViewController.prototype.view = {
      requestInput: '#request_input',
      nextButton: '#next_button',
      errorContainer: '#error_container'
    };

    AppsCoinkiteCosignIndexDialogViewController.prototype.onShow = function() {
      AppsCoinkiteCosignIndexDialogViewController.__super__.onShow.apply(this, arguments);
      return this.view.requestInput.focus();
    };

    AppsCoinkiteCosignIndexDialogViewController.prototype.next = function() {
      var dialog, nextError;
      nextError = this._nextFormError();
      if (nextError != null) {
        this.view.errorContainer.show();
        return this.view.errorContainer.text(nextError);
      } else {
        this.view.errorContainer.hide();
        dialog = new AppsCoinkiteCosignFetchingDialogViewController({
          request: this._request()
        });
        return this.getDialog().push(dialog);
      }
    };

    AppsCoinkiteCosignIndexDialogViewController.prototype._request = function() {
      return _.str.trim(this.view.requestInput.val());
    };

    AppsCoinkiteCosignIndexDialogViewController.prototype._nextFormError = function() {
      if (this._request().length !== 17) {
        return t('apps.coinkite.cosign.errors.invalid_request_ref');
      }
      return void 0;
    };

    return AppsCoinkiteCosignIndexDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
