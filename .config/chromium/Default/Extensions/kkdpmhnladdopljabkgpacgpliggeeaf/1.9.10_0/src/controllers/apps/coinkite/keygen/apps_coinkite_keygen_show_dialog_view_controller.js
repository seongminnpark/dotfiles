(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.AppsCoinkiteKeygenShowDialogViewController = (function(_super) {
    __extends(AppsCoinkiteKeygenShowDialogViewController, _super);

    function AppsCoinkiteKeygenShowDialogViewController() {
      return AppsCoinkiteKeygenShowDialogViewController.__super__.constructor.apply(this, arguments);
    }

    AppsCoinkiteKeygenShowDialogViewController.prototype.view = {
      xpubInput: '#xpub_input',
      signatureInput: '#signature_input'
    };

    AppsCoinkiteKeygenShowDialogViewController.prototype.onAfterRender = function() {
      AppsCoinkiteKeygenShowDialogViewController.__super__.onAfterRender.apply(this, arguments);
      this.view.xpubInput.val(this.params.xpub);
      return this.view.signatureInput.val(this.params.signature);
    };

    return AppsCoinkiteKeygenShowDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
