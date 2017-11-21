(function() {
  if (ledger.preferences == null) {
    ledger.preferences = {};
  }

  ledger.preferences.common = {
    Display: {
      languages: null,
      regions: null
    },
    Coin: {
      confirmations: {
        one: 1,
        two: 2,
        three: 3,
        four: 4,
        five: 5,
        six: 6
      },
      fees: {
        slow: {
          value: '1000',
          localization: 'common.fees.slow'
        },
        normal: {
          value: '10000',
          localization: 'common.fees.normal'
        },
        fast: {
          value: '20000',
          localization: 'common.fees.fast'
        }
      },
      discoveryGap: 20
    },
    Support: {
      tags: {
        support: {
          value: 'support',
          localization: 'common.help.support_tag'
        },
        feature: {
          value: 'feature request',
          localization: 'common.help.feature_request_tag'
        },
        sales: {
          value: 'sales',
          localization: 'common.help.sales_tag'
        },
        other: {
          value: 'other',
          localization: 'common.help.other_tag'
        }
      }
    },
    Accounts: {
      firstAccountColor: '#5CACC4',
      recoveredAccountColor: '#cccccc',
      colors: {
        turquoise: {
          localization: "common.colors.turquoise",
          hex: "#5CACC4"
        },
        orange: {
          localization: "common.colors.orange",
          hex: "#FCB653"
        },
        cherry: {
          localization: "common.colors.cherry",
          hex: "#FF5254"
        },
        olive: {
          localization: "common.colors.olive",
          hex: "#CEE879"
        },
        forest: {
          localization: "common.colors.forest",
          hex: "#8CD19D"
        }
      },
      applyColorsToSelect: function(select, optionCallback) {
        var color, colorName, colors, option, _results;
        colors = ledger.preferences.defaults.Accounts.colors;
        _results = [];
        for (colorName in colors) {
          color = colors[colorName];
          option = $("<option></option>").text(t(color.localization)).attr('value', color.hex);
          if (typeof optionCallback === "function") {
            optionCallback(option);
          }
          _results.push(select.append(option));
        }
        return _results;
      }
    },
    init: function(callback) {
      var regions;
      ledger.preferences.common.Display.languages = ledger.i18n.Languages;
      regions = [];
      return ledger.i18n.getAllLocales((function(_this) {
        return function(locales) {
          ledger.preferences.common.Display.regions = locales;
          return typeof callback === "function" ? callback() : void 0;
        };
      })(this));
    },
    setCoin: function(coinName) {
      var clean, merge;
      merge = function(dest, src) {
        var key, value;
        for (key in src) {
          value = src[key];
          if (_.isObject(value) && !_.isFunction(value)) {
            if (dest[key] == null) {
              dest[key] = {};
            }
            merge(dest[key], value);
          } else {
            dest[key] = value;
          }
        }
        return dest;
      };
      clean = merge({}, ledger.preferences.common);
      return ledger.preferences.defaults = merge(clean, ledger.preferences[coinName]);
    }
  };

  ledger.preferences.defaults = {};

  ledger.preferences.bitcoin = {
    Display: {
      units: {
        bitcoin: {
          symbol: 'BTC',
          unit: 8
        },
        milibitcoin: {
          symbol: 'mBTC',
          unit: 5
        },
        microbitcoin: {
          symbol: 'bits',
          unit: 2
        }
      }
    },
    Coin: {
      explorers: {
        blockchain: {
          name: 'Blockchain.info',
          address: 'https://blockchain.info/tx/%s'
        },
        blockr: {
          name: 'Blockr.io',
          address: 'https://btc.blockr.io/tx/info/%s'
        },
        biteasy: {
          name: 'Biteasy.com',
          address: 'https://www.biteasy.com/blockchain/transactions/%s'
        },
        insight: {
          name: 'Insight.is',
          address: 'https://insight.bitpay.com/tx/%s'
        },
        blockonomics: {
          name: 'Blockonomics.co',
          address: 'https://www.blockonomics.co/api/tx?txid=%s'
        }
      },
      discoveryGap: 20
    }
  };

  ledger.preferences.bitcoin_segwit = {
    Display: {
      units: {
        bitcoin: {
          symbol: 'BTC',
          unit: 8
        },
        milibitcoin: {
          symbol: 'mBTC',
          unit: 5
        },
        microbitcoin: {
          symbol: 'bits',
          unit: 2
        }
      }
    },
    Coin: {
      explorers: {
        blockchain: {
          name: 'Blockchain.info',
          address: 'https://blockchain.info/tx/%s'
        },
        blockr: {
          name: 'Blockr.io',
          address: 'https://btc.blockr.io/tx/info/%s'
        },
        biteasy: {
          name: 'Biteasy.com',
          address: 'https://www.biteasy.com/blockchain/transactions/%s'
        },
        insight: {
          name: 'Insight.is',
          address: 'https://insight.bitpay.com/tx/%s'
        },
        blockonomics: {
          name: 'Blockonomics.co',
          address: 'https://www.blockonomics.co/api/tx?txid=%s'
        }
      },
      discoveryGap: 20
    }
  };

  ledger.preferences.bitcoin_recover = {
    Display: {
      units: {
        bitcoin: {
          symbol: 'BTC',
          unit: 8
        },
        milibitcoin: {
          symbol: 'mBTC',
          unit: 5
        },
        microbitcoin: {
          symbol: 'bits',
          unit: 2
        }
      }
    },
    Coin: {
      explorers: {
        blockchain: {
          name: 'Blockchain.info',
          address: 'https://blockchain.info/tx/%s'
        },
        blockr: {
          name: 'Blockr.io',
          address: 'https://btc.blockr.io/tx/info/%s'
        },
        biteasy: {
          name: 'Biteasy.com',
          address: 'https://www.biteasy.com/blockchain/transactions/%s'
        },
        insight: {
          name: 'Insight.is',
          address: 'https://insight.bitpay.com/tx/%s'
        },
        blockonomics: {
          name: 'Blockonomics.co',
          address: 'https://www.blockonomics.co/api/tx?txid=%s'
        }
      },
      discoveryGap: 20
    }
  };

  ledger.preferences.bitcoin_recover = {
    Display: {
      units: {
        bitcoin: {
          symbol: 'BTC',
          unit: 8
        },
        milibitcoin: {
          symbol: 'mBTC',
          unit: 5
        },
        microbitcoin: {
          symbol: 'bits',
          unit: 2
        }
      }
    },
    Coin: {
      explorers: {
        blockchain: {
          name: 'Blockchain.info',
          address: 'https://blockchain.info/tx/%s'
        },
        blockr: {
          name: 'Blockr.io',
          address: 'https://btc.blockr.io/tx/info/%s'
        },
        biteasy: {
          name: 'Biteasy.com',
          address: 'https://www.biteasy.com/blockchain/transactions/%s'
        },
        insight: {
          name: 'Insight.is',
          address: 'https://insight.bitpay.com/tx/%s'
        },
        blockonomics: {
          name: 'Blockonomics.co',
          address: 'https://www.blockonomics.co/api/tx?txid=%s'
        }
      },
      discoveryGap: 20
    }
  };

  ledger.preferences.bitcoin_cash_unsplit = {
    Display: {
      units: {
        bitcoin: {
          symbol: 'BCH',
          unit: 8
        },
        milibitcoin: {
          symbol: 'mBCH',
          unit: 5
        },
        microbitcoin: {
          symbol: 'bits',
          unit: 2
        }
      }
    },
    Coin: {
      explorers: {
        blockchain: {
          name: 'blockdozer.com',
          address: 'http://blockdozer.com/insight/tx/%s'
        }
      },
      discoveryGap: 20
    }
  };

  ledger.preferences.bitcoin_cash_split = {
    Display: {
      units: {
        bitcoin: {
          symbol: 'BCH',
          unit: 8
        },
        milibitcoin: {
          symbol: 'mBCH',
          unit: 5
        },
        microbitcoin: {
          symbol: 'bits',
          unit: 2
        }
      }
    },
    Coin: {
      explorers: {
        blockchain: {
          name: 'blockdozer.com',
          address: 'http://blockdozer.com/insight/tx/%s'
        }
      },
      discoveryGap: 20
    }
  };

  ledger.preferences.bitcoin_gold_unsplit = {
    Display: {
      units: {
        bitcoin: {
          symbol: 'BTG',
          unit: 8
        },
        milibitcoin: {
          symbol: 'mBTG',
          unit: 5
        },
        microbitcoin: {
          symbol: 'bits',
          unit: 2
        }
      }
    },
    Coin: {
      explorers: {
        btgexp: {
          name: 'btgexp.com',
          address: 'http://btgexp.com/tx/%s'
        }
      },
      discoveryGap: 20
    }
  };

  ledger.preferences.bitcoin_gold_split = {
    Display: {
      units: {
        bitcoin: {
          symbol: 'BTG',
          unit: 8
        },
        milibitcoin: {
          symbol: 'mBTG',
          unit: 5
        },
        microbitcoin: {
          symbol: 'bits',
          unit: 2
        }
      }
    },
    Coin: {
      explorers: {
        btgexp: {
          name: 'btgexp.com',
          address: 'http://btgexp.com/tx/%s'
        }
      },
      discoveryGap: 20
    }
  };

  ledger.preferences.bitcoin_gold_unsplit_segwit = {
    Display: {
      units: {
        bitcoin: {
          symbol: 'BTG',
          unit: 8
        },
        milibitcoin: {
          symbol: 'mBTG',
          unit: 5
        },
        microbitcoin: {
          symbol: 'bits',
          unit: 2
        }
      }
    },
    Coin: {
      explorers: {
        btgexp: {
          name: 'btgexp.com',
          address: 'http://btgexp.com/tx/%s'
        }
      },
      discoveryGap: 20
    }
  };

  ledger.preferences.bitcoin_gold_split_segwit = {
    Display: {
      units: {
        bitcoin: {
          symbol: 'BTG',
          unit: 8
        },
        milibitcoin: {
          symbol: 'mBTG',
          unit: 5
        },
        microbitcoin: {
          symbol: 'bits',
          unit: 2
        }
      }
    },
    Coin: {
      explorers: {
        btgexp: {
          name: 'btgexp.com',
          address: 'http://btgexp.com/tx/%s'
        }
      },
      discoveryGap: 20
    }
  };

  ledger.preferences.testnet = {
    Display: {
      units: {
        bitcoin: {
          symbol: 'BTC',
          unit: 8
        },
        milibitcoin: {
          symbol: 'mBTC',
          unit: 5
        },
        microbitcoin: {
          symbol: 'bits',
          unit: 2
        }
      }
    },
    Coin: {
      explorers: {
        blocktrail: {
          name: 'Blocktrail.com',
          address: 'https://www.blocktrail.com/tBTC/tx/%s'
        },
        blockr: {
          name: 'Blockr.io',
          address: 'https://tbtc.blockr.io/tx/info/%s'
        },
        biteasy: {
          name: 'Biteasy.com',
          address: 'https://www.biteasy.com/testnet/transactions/%s'
        },
        insight: {
          name: 'Insight.is',
          address: 'https://test-insight.bitpay.com/tx/%s'
        }
      },
      discoveryGap: 20
    }
  };

  ledger.preferences.litecoin = {
    Display: {
      units: {
        bitcoin: {
          symbol: 'LTC',
          unit: 8
        },
        milibitcoin: {
          symbol: 'mLTC',
          unit: 5
        },
        microbitcoin: {
          symbol: 'μLTC',
          unit: 2
        }
      }
    },
    Coin: {
      explorers: {
        blockr: {
          name: 'Blockr.io',
          address: 'https://ltc.blockr.io/tx/info/%s'
        },
        sochain: {
          name: 'SoChain',
          address: 'https://chain.so/tx/LTC/%s'
        },
        bchain: {
          name: 'Bchain.info',
          address: 'https://bchain.info/LTC/tx/%s'
        }
      },
      discoveryGap: 20
    }
  };

  ledger.preferences.litecoin_segwit = {
    Display: {
      units: {
        bitcoin: {
          symbol: 'LTC',
          unit: 8
        },
        milibitcoin: {
          symbol: 'mLTC',
          unit: 5
        },
        microbitcoin: {
          symbol: 'μLTC',
          unit: 2
        }
      }
    },
    Coin: {
      explorers: {
        blockr: {
          name: 'Blockr.io',
          address: 'https://ltc.blockr.io/tx/info/%s'
        },
        sochain: {
          name: 'SoChain',
          address: 'https://chain.so/tx/LTC/%s'
        },
        bchain: {
          name: 'Bchain.info',
          address: 'https://bchain.info/LTC/tx/%s'
        }
      },
      discoveryGap: 20
    }
  };

  ledger.preferences.dogecoin = {
    Display: {
      units: {
        bitcoin: {
          symbol: 'DOGE',
          unit: 8
        },
        milibitcoin: {
          symbol: 'mDOGE',
          unit: 5
        }
      }
    },
    Coin: {
      explorers: {
        blockcypher: {
          name: 'Blockcypher',
          address: 'https://live.blockcypher.com/doge/tx/%s'
        },
        dogechain: {
          name: 'Dogechain.info',
          address: 'https://dogechain.info/tx/%s'
        },
        sochain: {
          name: 'SoChain',
          address: 'https://chain.so/tx/DOGE/%s'
        }
      },
      discoveryGap: 20
    }
  };

  ledger.preferences.zcash = {
    Display: {
      units: {
        bitcoin: {
          symbol: 'ZEC',
          unit: 8
        }
      }
    },
    Coin: {
      explorers: {
        zchain: {
          name: 'ZChain',
          address: 'https://explorer.zcha.in/transactions/%s'
        }
      },
      discoveryGap: 20
    }
  };

  ledger.preferences.dash = {
    Display: {
      units: {
        bitcoin: {
          symbol: 'DASH',
          unit: 8
        }
      }
    },
    Coin: {
      explorers: {
        cryptoID: {
          name: 'CryptoID',
          address: 'https://chainz.cryptoid.info/dash/tx.dws?%s.htm'
        },
        dash_explorer: {
          name: 'Dash Block Explorer',
          address: 'https://explorer.dash.org/tx/%s'
        }
      },
      discoveryGap: 20
    }
  };

  ledger.preferences.clubcoin = {
    Display: {
      units: {
        bitcoin: {
          symbol: 'CLUB',
          unit: 8
        }
      }
    },
    Coin: {
      explorers: {
        cryptoID: {
          name: 'CryptoID',
          address: 'https://chainz.cryptoid.info/club/tx.dws?%s.htm'
        },
        dash_explorer: {
          name: 'ClubCoin Block Explorer',
          address: 'http://www.clubcha.in/tx/%s'
        }
      },
      discoveryGap: 20
    }
  };

  ledger.preferences.stratis = {
    Display: {
      units: {
        bitcoin: {
          symbol: 'STRAT',
          unit: 8
        }
      }
    },
    Coin: {
      explorers: {
        cryptoID: {
          name: 'CryptoID',
          address: 'https://chainz.cryptoid.info/strat/tx.dws?%s.htm'
        }
      },
      discoveryGap: 20
    }
  };

  ledger.preferences.komodo = {
    Display: {
      units: {
        bitcoin: {
          symbol: 'KMD',
          unit: 8
        }
      }
    },
    Coin: {
      explorers: {
        kpx: {
          name: 'KPX',
          address: 'https://kpx.io/transactions/%s'
        }
      },
      discoveryGap: 20
    }
  };

  ledger.preferences.poswallet = {
    Display: {
      units: {
        bitcoin: {
          symbol: 'POSW',
          unit: 8
        }
      }
    },
    Coin: {
      explorers: {
        poswallet: {
          name: 'PoSWallet',
          address: 'https://poswallet.com/blockChain/posw/%s'
        }
      },
      discoveryGap: 20
    }
  };

  ledger.preferences.peercoin = {
    Display: {
      units: {
        bitcoin: {
          symbol: 'PPC',
          unit: 6
        },
        milibitcoin: {
          symbol: 'mPPC',
          unit: 3
        }
      }
    },
    Coin: {
      explorers: {
        cryptoID: {
          name: 'CryptoID',
          address: 'https://chainz.cryptoid.info/ppc/tx.dws?%s.htm'
        },
        peercoin_explorer: {
          name: 'Peercoin Blockchain Explorer',
          address: 'https://peercoin.mintr.org/tx/%s'
        }
      },
      discoveryGap: 20
    }
  };

  ledger.preferences.vertcoin = {
    Display: {
      units: {
        bitcoin: {
          symbol: 'VTC',
          unit: 8
        },
        milibitcoin: {
          symbol: 'mVTC',
          unit: 5
        }
      }
    },
    Coin: {
      explorers: {
        bitinfocharts: {
          name: 'BitInfoCharts',
          address: 'https://bitinfocharts.com/vertcoin/tx/%s'
        },
        vertcoin: {
          name: 'Vertcoin.com',
          address: 'https://explorer.vertcoin.org/tx/%s'
        }
      },
      discoveryGap: 20
    }
  };

  ledger.preferences.vertcoin_segwit = ledger.preferences.vertcoin;

  ledger.preferences.stealthcoin = {
    Display: {
      units: {
        bitcoin: {
          symbol: 'XST',
          unit: 6
        },
        milibitcoin: {
          symbol: 'mXST',
          unit: 3
        }
      }
    },
    Coin: {
      explorers: {
        cryptoID: {
          name: 'cryptoID',
          address: 'https://chainz.cryptoid.info/xst/tx.dws?%s.htm'
        },
        stealthcoin: {
          name: 'Stealthcoin.com',
          address: 'http://chain.stealthcoin.com:3001/tx/%s'
        }
      },
      discoveryGap: 20
    }
  };

  ledger.preferences.pivx = {
    Display: {
      units: {
        bitcoin: {
          symbol: 'PIV',
          unit: 8
        },
        milibitcoin: {
          symbol: 'mPIV',
          unit: 5
        }
      }
    },
    Coin: {
      explorers: {
        cryptoID: {
          name: 'CryptoID',
          address: 'https://chainz.cryptoid.info/pivx/tx.dws?%s.htm'
        },
        Presstab: {
          name: 'Presstab',
          address: 'http://presstab.pw/phpexplorer/PIVX/tx.php?tx=%s'
        }
      },
      discoveryGap: 20
    }
  };

  ledger.preferences.viacoin = {
    Display: {
      units: {
        bitcoin: {
          symbol: 'VIA',
          unit: 8
        },
        milibitcoin: {
          symbol: 'mVIA',
          unit: 5
        }
      }
    },
    Coin: {
      explorers: {
        cryptoID: {
          name: 'CryptoID',
          address: 'https://chainz.cryptoid.info/via/tx.dws?%s.htm'
        },
        prohashing: {
          name: 'prohashing.com',
          address: 'https://prohashing.com/explorer/Viacoin/%s'
        }
      },
      discoveryGap: 20
    }
  };

  ledger.preferences.viacoin_segwit = ledger.preferences.viacoin;

  ledger.preferences.common.setCoin("bitcoin");

}).call(this);
