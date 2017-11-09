(function() {
  var Firmwares, _base;

  this.ledger || (this.ledger = {});

  (_base = this.ledger).dongle || (_base.dongle = {});

  Firmwares = {
    V_B_1_4_11: 0x0001040b,
    V_B_1_4_12: 0x0001040c,
    V_B_1_4_13: 0x0001040d,
    V_L_1_0_0: 0x20010000,
    V_L_1_0_1: 0x20010001,
    V_L_1_0_2: 0x20010002,
    V_L_1_1_0: 0x20010100,
    V_B_L_1_1_1: 0x30010101,
    V_B_L_1_1_5: 0x30010105
  };

  this.ledger.dongle.Firmwares = Firmwares;


  /*
   */

  ledger.dongle.FirmwareInformation = (function() {
    function FirmwareInformation(dongle, version) {
      this.version = version;
      this._dongle = dongle;
    }

    FirmwareInformation.prototype.hasSwappedBip39SetupSupport = function() {
      return this.hasSubFirmwareSupport();
    };

    FirmwareInformation.prototype.hasSetupFirmwareSupport = function() {
      return this.getFirmwareModeFlag() & 0x01;
    };

    FirmwareInformation.prototype.hasOperationFirmwareSupport = function() {
      return this.getFirmwareModeFlag() & 0x02;
    };

    FirmwareInformation.prototype.hasSubFirmwareSupport = function() {
      return this.getIntFirmwareVersion() >= Firmwares.V_L_1_1_0;
    };

    FirmwareInformation.prototype.getFirmwareModeFlag = function() {
      if (this.version.length > 7) {
        return this.version.byteAt(7);
      } else {
        return 0x00;
      }
    };

    FirmwareInformation.prototype.getIntFirmwareVersion = function() {
      return this.getArchitecture() << 24 | this.getIntSemanticFirmwareVersion();
    };

    FirmwareInformation.prototype.getStringFirmwareVersion = function() {
      return "" + (this.getIntFirmwareMajorVersion()) + "." + (this.getIntFirmwareMinorVersion()) + "." + (this.getIntFirmwarePatchVersion());
    };

    FirmwareInformation.prototype.getFeaturesFlag = function() {
      return this.version.byteAt(0);
    };

    FirmwareInformation.prototype.getArchitecture = function() {
      return this.version.byteAt(1);
    };

    FirmwareInformation.prototype.getIntFirmwareMajorVersion = function() {
      return this.version.byteAt(2);
    };

    FirmwareInformation.prototype.getIntFirmwareMinorVersion = function() {
      return this.version.byteAt(3);
    };

    FirmwareInformation.prototype.getIntFirmwarePatchVersion = function() {
      return this.version.byteAt(4);
    };

    FirmwareInformation.prototype.getIntSemanticFirmwareVersion = function() {
      return this.getIntFirmwareMajorVersion() << 16 | this.getIntFirmwareMinorVersion() << 8 | this.getIntFirmwarePatchVersion();
    };

    FirmwareInformation.prototype.isUsingDeprecatedBip32Derivation = function() {
      return this.version.byteAt(2) === 0x01 && this.version.byteAt(3) === 0x04 && this.version.byteAt(4) < 7;
    };

    FirmwareInformation.prototype.isUsingDeprecatedSetupKeymap = function() {
      return this.version.byteAt(2) === 0x01 && this.version.byteAt(3) === 0x04 && this.version.byteAt(4) < 8;
    };

    FirmwareInformation.prototype.hasCompressedPublicKeysSupport = function() {
      return this.getFeaturesFlag() & 0x01;
    };

    FirmwareInformation.prototype.hasSecureScreen2FASupport = function() {
      return this.getIntFirmwareVersion() >= Firmwares.V_L_1_0_0;
    };

    FirmwareInformation.prototype.hasRecoveryFlashingSupport = function() {
      return this.getIntFirmwareVersion() >= Firmwares.V_L_1_1_0;
    };

    FirmwareInformation.prototype.isUsingInputFinalizeFull = function() {
      return this.getIntFirmwareVersion() >= Firmwares.V_L_1_0_2;
    };

    FirmwareInformation.prototype.hasFeature = function(featureFlag) {
      return (this.getFirmwareModeFlag() & featureFlag) === featureFlag;
    };

    FirmwareInformation.prototype.hasUInt16CoinVersion = function() {
      return this.getIntFirmwareVersion() >= Firmwares.V_B_L_1_1_1;
    };

    FirmwareInformation.prototype.hasBleSupport = function() {
      return this.hasFeature(0x10);
    };

    FirmwareInformation.prototype.hasSecureScreenAndButton = function() {
      return this.hasFeature(0x02);
    };

    FirmwareInformation.prototype.hasUnsafeScreenAndButton = function() {
      return this.hasFeature(0x04);
    };

    FirmwareInformation.prototype.hasScreenAndButton = function() {
      return this.hasSecureScreenAndButton() || this.hasUnsafeScreenAndButton();
    };

    FirmwareInformation.prototype.hasVerifyAddressOnScreen = function() {
      return this.getIntFirmwareVersion() >= Firmwares.V_B_L_1_1_5;
    };

    return FirmwareInformation;

  })();

}).call(this);
