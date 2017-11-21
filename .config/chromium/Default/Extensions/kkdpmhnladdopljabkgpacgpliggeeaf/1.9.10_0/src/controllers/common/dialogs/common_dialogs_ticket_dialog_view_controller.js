(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.CommonDialogsTicketDialogViewController = (function(_super) {
    __extends(CommonDialogsTicketDialogViewController, _super);

    function CommonDialogsTicketDialogViewController() {
      return CommonDialogsTicketDialogViewController.__super__.constructor.apply(this, arguments);
    }

    CommonDialogsTicketDialogViewController.prototype.view = {
      logsSwitchContainer: "#logs_switch_container",
      logsContainer: "#logs_container",
      tagsSegmentedControlContainer: "#tags_segmented_control_container",
      nameInput: "#name_input",
      subjectInput: "#subject_input",
      messageTextArea: "#message_text_area",
      emailAddressInput: "#email_address_input",
      errorContainer: "#error_container",
      sendButtton: "#send_button"
    };

    CommonDialogsTicketDialogViewController.prototype.onAfterRender = function() {
      CommonDialogsTicketDialogViewController.__super__.onAfterRender.apply(this, arguments);
      this.view.logsSwitch = new ledger.widgets.Switch(this.view.logsSwitchContainer);
      this.view.logsSwitch.setOn(true);
      this.view.tagsSegmentedControl = new ledger.widgets.SegmentedControl(this.view.tagsSegmentedControlContainer, ledger.widgets.SegmentedControl.Styles.Small);
      this._populateTagsSegmentedControl();
      this._updateLogsContainerVisibility();
      this._updateErrorContainerText();
      this._listenEvents();
      return _.defer((function(_this) {
        return function() {
          return _this.view.nameInput.focus();
        };
      })(this));
    };

    CommonDialogsTicketDialogViewController.prototype.sendTicket = function() {
      var nextError;
      nextError = this._nextErrorLocalizedText();
      this._updateErrorContainerText(nextError);
      if (nextError == null) {
        return this._performTicketSend();
      }
    };

    CommonDialogsTicketDialogViewController.prototype._shouldAttachLogs = function() {
      return this.view.logsContainer.is(':visible') && this.view.logsSwitch.isOn();
    };

    CommonDialogsTicketDialogViewController.prototype._populateTagsSegmentedControl = function() {
      var id, tag, _i, _len, _ref;
      _ref = _.keys(ledger.preferences.defaults.Support.tags);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        id = _ref[_i];
        tag = ledger.preferences.defaults.Support.tags[id];
        this.view.tagsSegmentedControl.addAction(t(tag.localization));
      }
      return this.view.tagsSegmentedControl.setSelectedIndex(0);
    };

    CommonDialogsTicketDialogViewController.prototype._updateLogsContainerVisibility = function() {
      if (this._selectedTag() === ledger.preferences.defaults.Support.tags.support.value && ((ledger.preferences.instance == null) || ledger.preferences.instance.isLogActive())) {
        return this.view.logsContainer.show();
      } else {
        return this.view.logsContainer.hide();
      }
    };

    CommonDialogsTicketDialogViewController.prototype._updateErrorContainerText = function(text) {
      this.view.errorContainer.text((text != null ? text : ''));
      if (text != null) {
        return this.view.errorContainer.show();
      } else {
        return this.view.errorContainer.hide();
      }
    };

    CommonDialogsTicketDialogViewController.prototype._listenEvents = function() {
      return this.view.tagsSegmentedControl.on('selection', (function(_this) {
        return function(event, _arg) {
          var index;
          index = _arg.index;
          return _this._updateLogsContainerVisibility();
        };
      })(this));
    };

    CommonDialogsTicketDialogViewController.prototype._nextErrorLocalizedText = function() {
      var data;
      data = this._datasToSend();
      if (data.message === '' || data.subject === '' || data.email === '' || data.name === '') {
        return t('common.errors.fill_all_fields');
      } else if (ledger.validers.isValidEmailAddress(data.email) === false) {
        return t('common.errors.not_a_valid_email');
      }
      return void 0;
    };

    CommonDialogsTicketDialogViewController.prototype._selectedTag = function() {
      var selectedTagId;
      selectedTagId = _.keys(ledger.preferences.defaults.Support.tags)[this.view.tagsSegmentedControl.getSelectedIndex()];
      return ledger.preferences.defaults.Support.tags[selectedTagId].value;
    };

    CommonDialogsTicketDialogViewController.prototype._datasToSend = function() {
      return {
        name: _.str.trim(this.view.nameInput.val()),
        subject: _.str.trim(this.view.subjectInput.val()),
        message: _.str.trim(this.view.messageTextArea.val()),
        email: _.str.trim(this.view.emailAddressInput.val()),
        tag: this._selectedTag(),
        metadata: this._getMetadata(),
        zip: null
      };
    };

    CommonDialogsTicketDialogViewController.prototype._disableInterface = function(disable) {
      if (disable) {
        return this.view.sendButtton.addClass('disabled');
      } else {
        return this.view.sendButtton.removeClass('disabled');
      }
    };

    CommonDialogsTicketDialogViewController.prototype._performTicketSend = function() {
      var data, sendBlock;
      sendBlock = (function(_this) {
        return function(data) {
          if (!_this.isShown()) {
            return;
          }
          return ledger.api.GrooveRestClient.singleton().sendTicket(data, function(success) {
            if (!_this.isShown()) {
              return;
            }
            return _this.dismiss(function() {
              var dialog;
              if (success) {
                dialog = new CommonDialogsMessageDialogViewController({
                  kind: "success",
                  title: t("common.help.sent_message"),
                  subtitle: t('common.help.thank_you_message')
                });
              } else {
                dialog = new CommonDialogsMessageDialogViewController({
                  kind: "error",
                  title: t("wallet.send.errors.not_sent_message"),
                  subtitle: t('common.errors.error_occurred')
                });
              }
              return dialog.show();
            });
          });
        };
      })(this);
      this._disableInterface(true);
      this.view.sendButtton.text(t('common.sending'));
      data = this._datasToSend();
      if (this._shouldAttachLogs()) {
        return ledger.utils.Logger.exportLogsToZip((function(_this) {
          return function(_arg) {
            var zip;
            zip = _arg.zip;
            if (!_this.isShown()) {
              return;
            }
            if (zip != null) {
              data.zip = zip;
            }
            return sendBlock(data);
          };
        })(this));
      } else {
        return sendBlock(data);
      }
    };

    CommonDialogsTicketDialogViewController.prototype._getMetadata = function() {
      var firmwareVersion, hexFirmwareVersion, intFirmwareVersion, metadata, parser, ua, _ref, _ref1, _ref2;
      parser = new UAParser();
      parser.setUA(window.navigator.userAgent);
      ua = parser.getResult();
      intFirmwareVersion = (_ref = ledger.app.dongle) != null ? _ref.getIntFirmwareVersion() : void 0;
      hexFirmwareVersion = (_ref1 = intFirmwareVersion) != null ? _ref1.toString(16) : void 0;
      firmwareVersion = (_ref2 = ledger.app.dongle) != null ? _ref2.getStringFirmwareVersion() : void 0;
      metadata = {
        browser: {
          name: ua.browser.name,
          version: ua.browser.version,
          major: ua.browser.major
        },
        os: {
          name: ua.os.name,
          version: ua.os.version
        },
        cpuArchitecture: ua.cpu.architecture,
        device: {
          model: ua.device.model,
          type: ua.device.type,
          vendor: ua.device.vendor
        },
        engine: {
          name: ua.engine.name,
          version: ua.engine.version
        },
        appVersion: ledger.managers.application.stringVersion(),
        firmware: {
          version: firmwareVersion,
          hexVersion: hexFirmwareVersion,
          intVersion: intFirmwareVersion
        }
      };
      return JSON.stringify(metadata);
    };

    return CommonDialogsTicketDialogViewController;

  })(ledger.common.DialogViewController);

}).call(this);
