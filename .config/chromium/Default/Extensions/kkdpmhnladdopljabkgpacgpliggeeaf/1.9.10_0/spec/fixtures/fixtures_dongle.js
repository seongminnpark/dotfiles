(function() {
  var _base;

  if ((_base = ledger.specs).fixtures == null) {
    _base.fixtures = {};
  }

  _.extend(ledger.specs.fixtures, {
    dongles: {
      dongle1: {
        id: 1,
        masterSeed: 'af5920746fad1e40b2a8c7080ee40524a335f129cb374d4c6f82fd6bf3139b17191cb8c38b8e37f4003768b103479947cab1d4f68d908ae520cfe71263b2a0cd',
        mnemonic: 'fox luggage hero item busy harbor dawn veteran bottom antenna rigid upgrade merit cash cigar episode leg multiply fish path tooth cup nation erosion',
        pairingKey: 'a26d9f9187c250beb7be79f9eb8ff249',
        pin: '0000'
      },
      dongle2: {
        id: 2,
        masterSeed: '16eb9af19037ea27cb9d493654d612217547cbd995ae0542c47902f683398eb85ae39579b80b839757ae7dee52bbb895eee421aedaded5a14d87072554026186',
        mnemonic: 'forest zebra delay attend prevent lab game secret cattle open degree among cigar wolf wagon catch invest glare tumble unit crumble tower skull tribe',
        pairingKey: 'a26d9f9187c250beb7be79f9eb8ff249',
        pin: '0000'
      },
      bitcoin_testnet: {
        id: 3,
        masterSeed: 'a637bca4c37332ed60a6cb2869ebd9f78e7d3c76541b49c57e532968b7f2c7689c774231bfb0bff49659b1390212af5ab6702bec5fed46b23be6f2bcb6c7f6cf',
        mnemonic: 'frost crew jaguar leisure design essence father badge ozone bleak able slot flash jazz uncle pledge flat piano toast loud rose panda tunnel deny',
        pairingKey: 'a26d9f9187c250beb7be79f9eb8ff249',
        pin: '0000'
      }
    }
  });

}).call(this);
