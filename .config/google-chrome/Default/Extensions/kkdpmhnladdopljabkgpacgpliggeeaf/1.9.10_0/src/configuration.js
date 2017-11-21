(function() {
  var _base;

  this.ledger.env = ledger.build.Mode === 'debug' ? 'dev' : 'prod';

  this.ledger.isProd = ledger.env === "prod";

  this.ledger.isDev = ledger.env === "dev";

  if ((_base = this.ledger).config == null) {
    _base.config = {};
  }

  _.extend(this.ledger.config, {
    m2fa: {
      baseUrl: 'wss://ws.ledgerwallet.com/2fa/channels'
    },
    restClient: {
      baseUrl: 'https://api.ledgerwallet.com/'
    },
    syncRestClient: {
      pullIntervalDelay: 60000,
      pullThrottleDelay: 1000,
      pushDebounceDelay: 1000
    },
    defaultLoggerDaysMax: 2,
    btchipDebug: false,
    defaultLoggingLevel: {
      Connected: {
        Enabled: 'ALL',
        Disabled: 'NONE'
      },
      Disconnected: {
        Enabled: 'ALL',
        Disabled: 'ALL'
      }
    },
    network: ledger.bitcoin.Networks[ledger.build.Network],
    defaultAddressDiscoveryGap: 20,
    defaultAccountDiscoveryGap: 1
  });

  Q.longStackSupport = true;

  this.configureApplication = function(app) {
    return _.extend(ledger.config, {
      defaultLoggingLevel: {
        Connected: {
          Enabled: ledger.utils.Logger.Levels[ledger.config.defaultLoggingLevel.Connected.Enabled],
          Disabled: ledger.utils.Logger.Levels[ledger.config.defaultLoggingLevel.Connected.Disabled]
        },
        Disconnected: {
          Enabled: ledger.utils.Logger.Levels[ledger.config.defaultLoggingLevel.Disconnected.Enabled],
          Disabled: ledger.utils.Logger.Levels[ledger.config.defaultLoggingLevel.Disconnected.Disabled]
        }
      }
    });
  };

  this.DEBUG = ledger.config.btcshipDebug;

}).call(this);
