(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.OnboardingDeviceChainsViewController = (function(_super) {
    __extends(OnboardingDeviceChainsViewController, _super);

    function OnboardingDeviceChainsViewController() {
      return OnboardingDeviceChainsViewController.__super__.constructor.apply(this, arguments);
    }

    OnboardingDeviceChainsViewController.prototype.view = {
      chainSelected: ".choice",
      remember: "#remember",
      advanced: "#advanced",
      uasf: "#uasf",
      segwit2x: "#segwit2x",
      openHelpCenter: "#help",
      recoverTool: "#recover"
    };

    OnboardingDeviceChainsViewController.prototype.networks = [];

    OnboardingDeviceChainsViewController.prototype.initialize = function() {
      OnboardingDeviceChainsViewController.__super__.initialize.apply(this, arguments);
      this.networks = JSON.parse(this.params.networks);
      return l(this.networks);
    };

    OnboardingDeviceChainsViewController.prototype.onAfterRender = function() {
      OnboardingDeviceChainsViewController.__super__.onAfterRender.apply(this, arguments);
      this.view.chainSelected.on("click", this.onChainSelected);
      this.view.advanced.change(this.toggleAdvanced.bind(this));
      return this.toggleAdvanced();
    };

    OnboardingDeviceChainsViewController.prototype.toggleAdvanced = function() {
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

    OnboardingDeviceChainsViewController.prototype.bitcoinCashSelected = function(e) {
      var dialog;
      dialog = new OnboardingDeviceChainsMessageDialogViewController();
      dialog.once('click:split', (function(_this) {
        return function() {
          return _this.chainChoosen(_this.networks[parseInt(e.target.attributes.value.value, 10) + 1]);
        };
      })(this));
      dialog.once('click:un_split', (function(_this) {
        return function() {
          return _this.chainChoosen(_this.networks[e.target.attributes.value.value]);
        };
      })(this));
      return dialog.show();
    };

    OnboardingDeviceChainsViewController.prototype.chooseSegwit = function(e) {
      var dialog;
      dialog = new OnboardingDeviceChainsChoiceDialogViewController({
        title: t("onboarding.device.chains.segwit_title"),
        text: t('onboarding.device.chains.segwit_message'),
        firstChoice: t('onboarding.device.chains.segwit_legacy'),
        secondChoice: t('onboarding.device.chains.segwit_segwit'),
        cancel: t('onboarding.device.chains.segwit_cancel')
      });
      dialog.once('click:first', (function(_this) {
        return function() {
          return _this.chainChoosen(_this.networks[e.target.attributes.value.value]);
        };
      })(this));
      dialog.once('click:second', (function(_this) {
        return function() {
          return _this.chainChoosen(_this.networks[parseInt(e.target.attributes.value.value, 10) + 1]);
        };
      })(this));
      return dialog.show();
    };

    OnboardingDeviceChainsViewController.prototype.recoverTool = function(e) {
      var dialog;
      dialog = new OnboardingDeviceChainsRecoverDialogViewController();
      dialog.once('click:recover', (function(_this) {
        return function() {
          return _this.chainChoosen(ledger.bitcoin.Networks.bitcoin_recover);
        };
      })(this));
      return dialog.show();
    };

    OnboardingDeviceChainsViewController.prototype.incompatible = function() {
      var dialog;
      dialog = new CommonDialogsMessageDialogViewController({
        kind: "error",
        title: t("onboarding.device.chains.bad_device_title"),
        subtitle: t('onboarding.device.chains.bad_device_message')
      });
      return dialog.show();
    };

    OnboardingDeviceChainsViewController.prototype.onChainSelected = function(e) {
      l(e);
      if (this.networks[e.target.attributes.value.value].name !== 'bitcoin_cash_unsplit') {
        if ((ledger.app.dongle.getFirmwareInformation().getIntFirmwareVersion() >= 0x30010105 || (ledger.app.dongle.getFirmwareInformation().getArchitecture() < 0x30 && ledger.app.dongle.getFirmwareInformation().getIntFirmwareVersion() >= 0x20010004)) && (this.networks[e.target.attributes.value.value].name === 'bitcoin' || this.networks[e.target.attributes.value.value].name === 'bitcoin_segwit2x' || this.networks[e.target.attributes.value.value].name === 'litecoin')) {
          return this.chooseSegwit(e);
        } else {
          return this.chainChoosen(this.networks[e.target.attributes.value.value]);
        }
      } else {
        if (!ledger.app.dongle.getFirmwareInformation().isUsingInputFinalizeFull()) {
          return this.incompatible();
        } else {
          return this.bitcoinCashSelected(e);
        }
      }
    };

    OnboardingDeviceChainsViewController.prototype.chainChoosen = function(e) {
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

    OnboardingDeviceChainsViewController.prototype.openSupport = function() {
      return window.open(t('application.support_url'));
    };

    OnboardingDeviceChainsViewController.prototype.onDetach = function() {
      return OnboardingDeviceChainsViewController.__super__.onDetach.apply(this, arguments);
    };

    return OnboardingDeviceChainsViewController;

  })(this.OnboardingViewController);

}).call(this);
