(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.OnboardingDeviceChainsBtgViewController = (function(_super) {
    __extends(OnboardingDeviceChainsBtgViewController, _super);

    function OnboardingDeviceChainsBtgViewController() {
      return OnboardingDeviceChainsBtgViewController.__super__.constructor.apply(this, arguments);
    }

    OnboardingDeviceChainsBtgViewController.prototype.view = {
      chainSelected: ".choice",
      remember: "#remember",
      openHelpCenter: "#help",
      link: '#link'
    };

    OnboardingDeviceChainsBtgViewController.prototype.networks = [];

    OnboardingDeviceChainsBtgViewController.prototype.initialize = function() {
      OnboardingDeviceChainsBtgViewController.__super__.initialize.apply(this, arguments);
      this.networks = JSON.parse(this.params.networks);
      return l(this.networks);
    };

    OnboardingDeviceChainsBtgViewController.prototype.onAfterRender = function() {
      OnboardingDeviceChainsBtgViewController.__super__.onAfterRender.apply(this, arguments);
      return this.view.chainSelected.on("click", this.onChainSelected);
    };

    OnboardingDeviceChainsBtgViewController.prototype.splitTool = function(e) {
      var dialog;
      dialog = new OnboardingDeviceChainsChoiceDialogViewController({
        title: t("onboarding.device.chains.split_btg_title"),
        text: t('onboarding.device.chains.split_btg_message'),
        firstChoice: t('onboarding.device.chains.segwit_legacy'),
        secondChoice: t('onboarding.device.chains.segwit_segwit'),
        cancelChoice: t('onboarding.management.cancel')
      });
      dialog.once('click:first', (function(_this) {
        return function() {
          return _this.chainChoosen(_this.networks[0]);
        };
      })(this));
      dialog.once('click:second', (function(_this) {
        return function() {
          return _this.chainChoosen(_this.networks[2]);
        };
      })(this));
      return dialog.show();
    };

    OnboardingDeviceChainsBtgViewController.prototype.onChainSelected = function(e) {
      return this.chainChoosen(this.networks[e.target.attributes.value.value]);
    };

    OnboardingDeviceChainsBtgViewController.prototype.chainChoosen = function(e) {
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

    OnboardingDeviceChainsBtgViewController.prototype.openSupport = function() {
      return window.open(t('application.support_url'));
    };

    OnboardingDeviceChainsBtgViewController.prototype.onDetach = function() {
      return OnboardingDeviceChainsBtgViewController.__super__.onDetach.apply(this, arguments);
    };

    OnboardingDeviceChainsBtgViewController.prototype.openLink = function() {
      return open("https://bitcoincore.org/en/2016/01/26/segwit-benefits/");
    };

    return OnboardingDeviceChainsBtgViewController;

  })(this.OnboardingViewController);

}).call(this);
