(function() {
  if (ledger.router == null) {
    ledger.router = {};
  }

  ledger.router.ignorePluggedWalletForRouting = this.ledger.isDev;

  ledger.router.pluggedWalletRoutesExceptions = ['/', '/onboarding/device/plug', '/onboarding/device/connecting', '/onboarding/device/forged'];

  this.declareRoutes = function(route, app) {
    route('/', function() {
      if (app.isInWalletMode()) {
        return app.router.go('/onboarding/device/plug', {
          animateIntro: true
        });
      } else {
        return app.router.go('/update/welcome');
      }
    });
    route('/onboarding/device/plug', function(params) {
      return app.navigate(ONBOARDING_LAYOUT, OnboardingDevicePlugViewController);
    });
    route('/onboarding/device/unplug', function(params) {
      return app.navigate(ONBOARDING_LAYOUT, OnboardingDeviceUnplugViewController);
    });
    route('/onboarding/device/connecting', function(params) {
      return app.navigate(ONBOARDING_LAYOUT, OnboardingDeviceConnectingViewController);
    });
    route('/onboarding/device/pin', function(params) {
      return app.navigate(ONBOARDING_LAYOUT, OnboardingDevicePinViewController);
    });
    route('/onboarding/device/chains/litecoin', function(params) {
      return app.navigate(ONBOARDING_LAYOUT, OnboardingDeviceChainsLitecoinViewController);
    });
    route('/onboarding/device/chains', function(params) {
      return app.navigate(ONBOARDING_LAYOUT, OnboardingDeviceChainsViewController);
    });
    route('/onboarding/device/opening', function(params) {
      return app.navigate(ONBOARDING_LAYOUT, OnboardingDeviceOpeningViewController);
    });
    route('/onboarding/device/update', function(params) {
      return app.navigate(ONBOARDING_LAYOUT, OnboardingDeviceUpdateViewController);
    });
    route('/onboarding/device/error', function(params) {
      return app.navigate(ONBOARDING_LAYOUT, OnboardingDeviceErrorViewController);
    });
    route('/onboarding/device/unsupported', function(params) {
      return app.navigate(ONBOARDING_LAYOUT, OnboardingDeviceUnsupportedViewController);
    });
    route('/onboarding/device/failed', function(params) {
      return app.navigate(ONBOARDING_LAYOUT, OnboardingDeviceFailedViewController);
    });
    route('/onboarding/device/wrongpin', function(params) {
      return app.router.go('/onboarding/device/error', {
        message: _.str.sprintf(t('onboarding.device.errors.wrongpin.tries_left'), params['?params'].tries_left),
        indication: _.str.sprintf(t('onboarding.device.errors.wrongpin.unplug_plug'), ledger.config.network.plural)
      });
    });
    route('/onboarding/device/frozen', function(params) {
      return app.router.go('/onboarding/device/error', {
        serious: true,
        message: _.str.sprintf(t('onboarding.device.errors.frozen.blank_next_time'), ledger.config.network.plural),
        indication: _.str.sprintf(t('onboarding.device.errors.frozen.unplug_plug'), ledger.config.network.plural)
      });
    });
    route('/onboarding/device/forged', function(params) {
      return app.router.go('/onboarding/device/error', {
        message: _.str.sprintf(t('onboarding.device.errors.forged.forbidden_access'), ledger.config.network.plural),
        indication: t('onboarding.device.errors.forged.get_help')
      });
    });
    route('/onboarding/device/swapped_bip39_provisioning', function(params) {
      return app.navigate(ONBOARDING_LAYOUT, OnboardingDeviceSwappedbip39provisioningViewController);
    });
    route('/onboarding/device/switch_firmware', function(params) {
      return app.navigate(ONBOARDING_LAYOUT, OnboardingDeviceSwitchfirmwareViewController);
    });
    route('/onboarding/management/security', function(params) {
      return app.navigate(ONBOARDING_LAYOUT, OnboardingManagementSecurityViewController);
    });
    route('/onboarding/management/done', function(params) {
      return app.navigate(ONBOARDING_LAYOUT, OnboardingManagementDoneViewController);
    });
    route('/onboarding/management/welcome', function(params) {
      return app.navigate(ONBOARDING_LAYOUT, OnboardingManagementWelcomeViewController);
    });
    route('/onboarding/management/pinconfirmation', function(params) {
      return app.navigate(ONBOARDING_LAYOUT, OnboardingManagementPinconfirmationViewController);
    });
    route('/onboarding/management/pin', function(params) {
      return app.navigate(ONBOARDING_LAYOUT, OnboardingManagementPinViewController);
    });
    route('/onboarding/management/seedconfirmation', function(params) {
      return app.navigate(ONBOARDING_LAYOUT, OnboardingManagementSeedconfirmationViewController);
    });
    route('/onboarding/management/seed', function(params) {
      return app.navigate(ONBOARDING_LAYOUT, OnboardingManagementSeedViewController);
    });
    route('/onboarding/management/summary', function(params) {
      return app.navigate(ONBOARDING_LAYOUT, OnboardingManagementSummaryViewController);
    });
    route('/onboarding/management/provisioning', function(params) {
      return app.navigate(ONBOARDING_LAYOUT, OnboardingManagementProvisioningViewController);
    });
    route('/onboarding/management/recovery_mode', function(params) {
      return app.navigate(ONBOARDING_LAYOUT, OnboardingManagementRecoverymodeViewController);
    });
    route('/onboarding/management/recovery_device', function(params) {
      return app.navigate(ONBOARDING_LAYOUT, OnboardingManagementRecoverydeviceViewController);
    });
    route('/onboarding/management/convert', function(params) {
      return app.navigate(ONBOARDING_LAYOUT, OnboardingManagementConvertViewController);
    });
    route('wallet/accounts/index', function() {
      return app.navigate(WALLET_LAYOUT, WalletAccountsIndexViewController);
    });
    route('/wallet/accounts/alloperations', function(params) {
      return app.navigate(WALLET_LAYOUT, WalletAccountsAlloperationsViewController);
    });
    route('/wallet/accounts/{id}/show', function(params) {
      return app.navigate(WALLET_LAYOUT, WalletAccountsShowViewController);
    });
    route('/wallet/accounts/{id}/operations', function(params) {
      return app.navigate(WALLET_LAYOUT, WalletAccountsOperationsViewController);
    });
    route('/wallet/accounts/{id}', function(params) {
      return app.router.go("/wallet/accounts/" + params['id'] + "/show");
    });
    route('/wallet/accounts', function() {
      return app.router.go("/wallet/accounts/index");
    });
    route('/wallet/send/index:?params:', function(params) {
      var dialog;
      if (params == null) {
        params = {};
      }
      dialog = new WalletSendIndexDialogViewController(params["?params"] || {});
      return dialog.show();
    });
    route('/wallet/receive/index:?params:', function(params) {
      var dialog;
      if (params == null) {
        params = {};
      }
      dialog = new WalletReceiveIndexDialogViewController(params["?params"] || {});
      return dialog.show();
    });
    route('/wallet/settings/index', function(params) {
      var dialog;
      dialog = new WalletSettingsIndexDialogViewController();
      return dialog.show();
    });
    route('/wallet/switch/chains', function(params) {
      var tmp;
      ledger.app.releaseWallet(false, false);
      tmp = {};
      tmp[ledger.app.chains.currentKey] = 0;
      return ledger.storage.global.chainSelector.set(tmp, (function(_this) {
        return function() {
          return ledger.app.onDongleIsUnlocked(ledger.app.dongle);
        };
      })(this));
    });
    route('/wallet/help/index', function(params) {
      return window.open(t('application.support_url'));
    });
    route('/update/index', function(params) {
      return app.navigate(UPDATE_LAYOUT, UpdateIndexViewController);
    });
    route('/update/plug', function(params) {
      return app.navigate(UPDATE_LAYOUT, UpdatePlugViewController);
    });
    route('/update/unplug', function(params) {
      return app.navigate(UPDATE_LAYOUT, UpdateUnplugViewController);
    });
    route('/update/seed', function(param) {
      return app.navigate(UPDATE_LAYOUT, UpdateSeedViewController);
    });
    route('/update/erasing', function(param) {
      return app.navigate(UPDATE_LAYOUT, UpdateErasingViewController);
    });
    route('/update/unlocking', function(param) {
      return app.navigate(UPDATE_LAYOUT, UpdateUnlockingViewController);
    });
    route('/update/updating', function() {
      return app.navigate(UPDATE_LAYOUT, UpdateUpdatingViewController);
    });
    route('/update/loading', function() {
      return app.navigate(UPDATE_LAYOUT, UpdateLoadingViewController);
    });
    route('/update/done', function(param) {
      return app.navigate(UPDATE_LAYOUT, UpdateDoneViewController);
    });
    route('/update/linux', function(param) {
      return app.navigate(UPDATE_LAYOUT, UpdateLinuxViewController);
    });
    route('/update/cardcheck', function(param) {
      return app.navigate(UPDATE_LAYOUT, UpdateCardcheckViewController);
    });
    route('/update/error', function(param) {
      return app.navigate(UPDATE_LAYOUT, UpdateErrorViewController);
    });
    route('/update/welcome', function(param) {
      return app.navigate(UPDATE_LAYOUT, UpdateWelcomeViewController);
    });
    route('/wallet/bitid/index', function(params) {
      var dialog, _ref, _ref1;
      if (params == null) {
        params = {};
      }
      dialog = new WalletBitidIndexDialogViewController({
        uri: (_ref = params["?params"]) != null ? _ref.uri : void 0,
        silent: (_ref1 = params["?params"]) != null ? _ref1.silent : void 0
      });
      return dialog.show();
    });
    route('/wallet/bitid/form', function(params) {
      var dialog;
      dialog = new WalletBitidFormDialogViewController();
      return dialog.show();
    });
    route('/wallet/xpubkey/index', function(params) {
      var dialog, _ref;
      if (params == null) {
        params = {};
      }
      dialog = new WalletXpubkeyIndexDialogViewController({
        path: (_ref = params["?params"]) != null ? _ref.path : void 0
      });
      return dialog.show();
    });
    route('/wallet/message/index', function(params) {
      var dialog, _ref, _ref1;
      if (params == null) {
        params = {};
      }
      dialog = new WalletMessageIndexDialogViewController({
        path: (_ref = params["?params"]) != null ? _ref.path : void 0,
        message: (_ref1 = params["?params"]) != null ? _ref1.message : void 0
      });
      return dialog.show();
    });
    route('/wallet/p2sh/index', function(params) {
      var dialog, _ref, _ref1, _ref2, _ref3, _ref4;
      if (params == null) {
        params = {};
      }
      dialog = new WalletP2shIndexDialogViewController({
        inputs: (_ref = params["?params"]) != null ? _ref.inputs : void 0,
        scripts: (_ref1 = params["?params"]) != null ? _ref1.scripts : void 0,
        outputs_number: (_ref2 = params["?params"]) != null ? _ref2.outputs_number : void 0,
        outputs_script: (_ref3 = params["?params"]) != null ? _ref3.outputs_script : void 0,
        paths: (_ref4 = params["?params"]) != null ? _ref4.paths : void 0
      });
      return dialog.show();
    });
    route('/wallet/api/accounts', function(params) {
      var dialog;
      if (params == null) {
        params = {};
      }
      dialog = new WalletApiAccountsDialogViewController();
      return dialog.show();
    });
    route('/wallet/api/operations', function(params) {
      var dialog, _ref;
      if (params == null) {
        params = {};
      }
      dialog = new WalletApiOperationsDialogViewController({
        account_id: (_ref = params["?params"]) != null ? _ref.account_id : void 0
      });
      return dialog.show();
    });
    route('/wallet/api/addresses', function(params) {
      var dialog, _ref, _ref1;
      if (params == null) {
        params = {};
      }
      dialog = new WalletApiAddressesDialogViewController({
        account_id: (_ref = params["?params"]) != null ? _ref.account_id : void 0,
        count: (_ref1 = params["?params"]) != null ? _ref1.count : void 0
      });
      return dialog.show();
    });
    route('/apps/coinkite/dashboard/index', function(params) {
      return app.navigate(COINKITE_LAYOUT, AppsCoinkiteDashboardIndexViewController);
    });
    route('/apps/coinkite/settings/index', function(params) {
      var dialog;
      dialog = new AppsCoinkiteSettingsIndexDialogViewController();
      return dialog.show();
    });
    route('/apps/coinkite/keygen/index', function(params) {
      var dialog, _ref;
      dialog = new AppsCoinkiteKeygenIndexDialogViewController({
        index: (_ref = params["?params"]) != null ? _ref.index : void 0
      });
      return dialog.show();
    });
    route('/apps/coinkite/keygen/processing', function(params) {
      var dialog;
      dialog = new AppsCoinkiteKeygenProcessingDialogViewController();
      return dialog.show();
    });
    route('/apps/coinkite/cosign/index', function(params) {
      var dialog;
      dialog = new AppsCoinkiteCosignIndexDialogViewController();
      return dialog.show();
    });
    route('/apps/coinkite/cosign/show', function(params) {
      var dialog, _ref;
      dialog = new AppsCoinkiteCosignShowDialogViewController({
        json: (_ref = params["?params"]) != null ? _ref.json : void 0
      });
      return dialog.show();
    });
    route('/apps/coinkite/dashboard/compatibility', function(params) {
      var dialog;
      dialog = new AppsCoinkiteDashboardCompatibilityDialogViewController();
      return dialog.show();
    });
    route('/apps/coinkite/help/index', function(params) {
      return window.open(t('application.support_coinkite_url'));
    });
    route('/specs/index', function() {
      return app.navigate(SPECS_LAYOUT, SpecIndexViewController);
    });
    return route('/specs/result', function() {
      return app.navigate(SPECS_LAYOUT, SpecResultViewController);
    });
  };

}).call(this);
