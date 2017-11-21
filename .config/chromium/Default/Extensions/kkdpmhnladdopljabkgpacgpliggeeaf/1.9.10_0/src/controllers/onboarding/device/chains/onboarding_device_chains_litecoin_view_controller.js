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
      openHelpCenter: "#help",
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
      return this.view.chainSelected.on("click", this.onChainSelected);
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
