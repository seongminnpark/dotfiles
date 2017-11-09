(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.OnboardingDeviceChainsLitecoinViewController = (function(_super) {
    __extends(OnboardingDeviceChainsLitecoinViewController, _super);

    function OnboardingDeviceChainsLitecoinViewController() {
      return OnboardingDeviceChainsLitecoinViewController.__super__.constructor.apply(this, arguments);
    }

    OnboardingDeviceChainsLitecoinViewController.prototype.view = {
      chainSelected: ".choice",
      remember: "#remember",
      advanced: "#advanced",
      uasf: "#uasf",
      segwit2x: "#segwit2x",
      openHelpCenter: "#help",
      recoverTool: "#recover",
      link: '#link'
    };

    OnboardingDeviceChainsLitecoinViewController.prototype.networks = [];

    OnboardingDeviceChainsLitecoinViewController.prototype.initialize = function() {
      OnboardingDeviceChainsLitecoinViewController.__super__.initialize.apply(this, arguments);
      this.networks = JSON.parse(this.params.networks);
      return l(this.networks);
    };

    OnboardingDeviceChainsLitecoinViewController.prototype.onAfterRender = function() {
      OnboardingDeviceChainsLitecoinViewController.__super__.onAfterRender.apply(this, arguments);
      this.view.chainSelected.on("click", this.onChainSelected);
      this.view.advanced.change(this.toggleAdvanced.bind(this));
      return this.toggleAdvanced();
    };

    OnboardingDeviceChainsLitecoinViewController.prototype.toggleAdvanced = function() {
      if (this.view.advanced.is(":checked")) {
        this.view.uasf.show();
        this.view.segwit2x.show();
        this.view.openHelpCenter.hide();
        return this.view.recoverTool.show();
      } else {
        this.view.uasf.hide();
        this.view.segwit2x.hide();
        this.view.openHelpCenter.show();
        return this.view.recoverTool.hide();
      }
    };

    OnboardingDeviceChainsLitecoinViewController.prototype.bitcoinCashSelected = function(e) {
      var dialog;
      dialog = new OnboardingDeviceChainsMessageDialogViewController();
      dialog.once('click:split', (function(_this) {
        return function() {
          return _this.chainChoosen(_this.networks[3]);
        };
      })(this));
      dialog.once('click:un_split', (function(_this) {
        return function() {
          return _this.chainChoosen(_this.networks[2]);
        };
      })(this));
      return dialog.show();
    };

    OnboardingDeviceChainsLitecoinViewController.prototype.chooseSegwit = function(e) {
      var dialog;
      dialog = new OnboardingDeviceChainsChoiceDialogViewController({
        title: t("onboarding.device.chains.segwit_title"),
        text: t('onboarding.device.chains.segwit_message'),
        firstChoice: t('onboarding.device.chains.segwit_deactivate'),
        secondChoice: t('onboarding.device.chains.segwit_activate')
      });
      dialog.once('click:first', (function(_this) {
        return function() {
          return _this.chainChoosen(_this.networks[e.target.attributes.value.value]);
        };
      })(this));
      dialog.once('click:second', (function(_this) {
        return function() {
          return _this.chainChoosen(_this.networks[e.target.attributes.value.value + 1]);
        };
      })(this));
      return dialog.show();
    };

    OnboardingDeviceChainsLitecoinViewController.prototype.recoverTool = function(e) {
      var dialog;
      dialog = new OnboardingDeviceChainsRecoverDialogViewController();
      dialog.once('click:recover', (function(_this) {
        return function() {
          return _this.chainChoosen(ledger.bitcoin.Networks.bitcoin_recover);
        };
      })(this));
      return dialog.show();
    };

    OnboardingDeviceChainsLitecoinViewController.prototype.incompatible = function() {
      var dialog;
      dialog = new CommonDialogsMessageDialogViewController({
        kind: "error",
        title: t("onboarding.device.chains.bad_device_title"),
        subtitle: t('onboarding.device.chains.bad_device_message')
      });
      return dialog.show();
    };

    OnboardingDeviceChainsLitecoinViewController.prototype.onChainSelected = function(e) {
      return this.chainChoosen(this.networks[e.target.attributes.value.value]);
    };

    OnboardingDeviceChainsLitecoinViewController.prototype.chainChoosen = function(e) {
      return ledger.app.dongle.getPublicAddress("44'/" + this.networks[0].bip44_coin_type + "'/0'/0/0", (function(_this) {
        return function(addr) {
          var address, tmp;
          address = ledger.crypto.SHA256.hashString(addr.bitcoinAddress.toString(ASCII));
          tmp = {};
          if (_this.view.remember.is(":checked")) {
            tmp[address] = e;
            return ledger.storage.global.chainSelector.set(tmp, function() {
              return ledger.storage.global.chainSelector.get(address, function(result) {
                return ledger.app.onChainChosen(e);
              });
            });
          } else {
            tmp[address] = 0;
            return ledger.storage.global.chainSelector.set(tmp, function() {
              return ledger.storage.global.chainSelector.get(address, function(result) {
                return ledger.app.onChainChosen(e);
              });
            });
          }
        };
      })(this));
    };

    OnboardingDeviceChainsLitecoinViewController.prototype.openSupport = function() {
      return window.open(t('application.support_url'));
    };

    OnboardingDeviceChainsLitecoinViewController.prototype.onDetach = function() {
      return OnboardingDeviceChainsLitecoinViewController.__super__.onDetach.apply(this, arguments);
    };

    OnboardingDeviceChainsLitecoinViewController.prototype.openLink = function() {
      return open("https://bitcoincore.org/en/2016/01/26/segwit-benefits/");
    };

    return OnboardingDeviceChainsLitecoinViewController;

  })(this.OnboardingViewController);

}).call(this);
