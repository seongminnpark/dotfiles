(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.AppsCoinkiteSettingsIndexDialogViewController = (function(_super) {
    __extends(AppsCoinkiteSettingsIndexDialogViewController, _super);

    function AppsCoinkiteSettingsIndexDialogViewController() {
      return AppsCoinkiteSettingsIndexDialogViewController.__super__.constructor.apply(this, arguments);
    }

    AppsCoinkiteSettingsIndexDialogViewController.prototype.view = {
      apiKeyInput: '#api_key_input',
      apiSecretInput: '#api_secret_input',
      saveButton: '#save_button'
    };

    AppsCoinkiteSettingsIndexDialogViewController.prototype.onAfterRender = function() {
      AppsCoinkiteSettingsIndexDialogViewController.__super__.onAfterRender.apply(this, arguments);
      ledger.storage.sync.get("__apps_coinkite_api_key", (function(_this) {
        return function(r) {
          return _this.view.apiKeyInput.val(r.__apps_coinkite_api_key);
        };
      })(this));
      return ledger.storage.sync.get("__apps_coinkite_api_secret", (function(_this) {
        return function(r) {
          return _this.view.apiSecretInput.val(r.__apps_coinkite_api_secret);
        };
      })(this));
    };

    AppsCoinkiteSettingsIndexDialogViewController.prototype.onShow = function() {
      AppsCoinkiteSettingsIndexDialogViewController.__super__.onShow.apply(this, arguments);
      return this.view.apiKeyInput.focus();
    };

    AppsCoinkiteSettingsIndexDialogViewController.prototype.save = function() {
      ledger.storage.sync.set({
        "__apps_coinkite_api_key": this.view.apiKeyInput.val(),
        "__apps_coinkite_api_secret": this.view.apiSecretInput.val()
      });
      return this.dismiss();
    };

    return AppsCoinkiteSettingsIndexDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
