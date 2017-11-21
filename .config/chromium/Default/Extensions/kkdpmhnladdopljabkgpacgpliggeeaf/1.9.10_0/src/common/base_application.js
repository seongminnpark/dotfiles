(function() {
  var ApplicationLogger, DongleLogger, XhrLogger, _base,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (this.ledger == null) {
    this.ledger = {};
  }

  if (ledger.common == null) {
    ledger.common = {};
  }

  if ((_base = ledger.common).application == null) {
    _base.application = {};
  }

  DongleLogger = function() {
    return ledger.utils.Logger.getLoggerByTag('AppDongle');
  };

  ApplicationLogger = function() {
    return ledger.utils.Logger.getLoggerByTag('Application');
  };

  XhrLogger = function() {
    return ledger.utils.Logger.getLoggerByTag('XHR');
  };


  /*
    Base class for the main application class. This class holds the non-specific part of the application (i.e. click dispatching, application lifecycle)
   */

  ledger.common.application.BaseApplication = (function(_super) {
    __extends(BaseApplication, _super);

    function BaseApplication() {
      configureApplication(this);
      this._navigationController = null;
      this.donglesManager = new ledger.dongle.Manager();
      this.router = new Router(this);
      this._dongleAttestationLock = false;
      this._isConnectingDongle = false;
      ledger.dialogs.manager.initialize($('#dialogs_container'));
      window.onerror = ApplicationLogger().error.bind(ApplicationLogger());
    }


    /*
      Starts the application by configuring the application environment, starting services and rendering view controllers
     */

    BaseApplication.prototype.start = function() {
      this._listenCommands();
      this._listenClickEvents();
      this._listenDongleEvents();
      this._listenXhr();
      this.onStart();
      return this.donglesManager.start();
    };


    /*
      Reloads the whole application.
     */

    BaseApplication.prototype.reload = function() {
      this.donglesManager.stop();
      return chrome.runtime.reload();
    };


    /*
      Handle URI navigation through the application. This allows to dispatch actions on view controllers and pushing view controllers
      in the current {NavigationController}
     */

    BaseApplication.prototype.navigate = function(layoutName, viewController) {
      return this.router.once('routed', (function(_this) {
        return function(event, data) {
          var actionName, controller, newUrl, oldUrl, onControllerRendered, parameters, _ref, _ref1;
          oldUrl = _this._lastUrl != null ? _this._lastUrl.parseAsUrl() : {
            hash: '',
            pathname: '',
            params: function() {
              return '';
            }
          };
          newUrl = data.url.parseAsUrl();
          _this._lastUrl = data.url;
          _this.currentUrl = data.url;
          controller = null;
          _ref = ledger.url.parseAction(newUrl.hash), actionName = _ref[0], parameters = _ref[1];
          onControllerRendered = function() {
            if (newUrl.hash.length > 0) {
              return this.handleAction(actionName, parameters);
            }
          };
          if (_this._navigationController === null || _this._navigationController.constructor.name !== layoutName) {
            if ((_ref1 = _this._navigationController) != null) {
              _ref1.onDetach();
            }
            _this._navigationController = new window[layoutName]();
            _this._navigationController.onAttach();
            controller = new viewController(newUrl.params(), data.url);
            controller.on('afterRender', onControllerRendered.bind(_this));
            _this._navigationController.push(controller);
            return _this._navigationController.render(_this._navigationControllerSelector());
          } else {
            if (_this._navigationController.topViewController().constructor.name === viewController.name && oldUrl.pathname === newUrl.pathname && _.isEqual(newUrl.params(), oldUrl.params())) {
              return _this.handleAction(actionName, parameters);
            } else {
              controller = new viewController(newUrl.params(), data.url);
              controller.on('afterRender', onControllerRendered.bind(_this));
              return _this._navigationController.push(controller);
            }
          }
        };
      })(this));
    };


    /*
      Reloads the currently displayed view controller and css files.
     */

    BaseApplication.prototype.reloadUi = function(reloadViewTemplates) {
      var dialog, _i, _len, _ref, _results;
      if (reloadViewTemplates == null) {
        reloadViewTemplates = false;
      }
      if (reloadViewTemplates) {
        $('link').each(function(_, link) {
          var cleanHref;
          if ((link.href != null) && link.href.length > 0) {
            cleanHref = link.href;
            cleanHref = cleanHref.replace(/\?[0-9]*/i, '');
            return link.href = cleanHref + '?' + (new Date).getTime();
          }
        });
        $('script').each(function(_, script) {
          if (script.src.match(/\/views\//)) {
            return $(script).remove();
          }
        });
        window.JST = {};
      }
      this._navigationController.rerender();
      _ref = ledger.dialogs.manager.getAllDialogs();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        dialog = _ref[_i];
        _results.push(dialog.rerender());
      }
      return _results;
    };

    BaseApplication.prototype.scheduleReloadUi = function(reloadViewTemplates) {
      if (reloadViewTemplates == null) {
        reloadViewTemplates = false;
      }
      if (this._reloadUiSchedule) {
        clearTimeout(this._reloadUiSchedule);
      }
      return this._reloadUiSchedule = setTimeout((function(_this) {
        return function() {
          _this._reloadUiSchedule = null;
          return _this.reloadUi(reloadViewTemplates);
        };
      })(this), 500);
    };


    /*
      This method is used to dispatch an action to the view controller hierarchy. First it tries to trigger an action on
      open dialogs then it will attempt to trigger action on the navigation controller. The navigation controller will dispatch
      the action to its view controllers or handle the action itself. If the action is still unanswered at the end of the dispatch
      the application class can handle it itself.
     */

    BaseApplication.prototype.handleAction = function(actionName, params) {
      var handled;
      handled = false;
      if (ledger.dialogs.manager.displayedDialog() != null) {
        handled = ledger.dialogs.manager.displayedDialog().handleAction(actionName, params);
      }
      if (!handled) {
        handled = this._navigationController.handleAction(actionName, params);
      }
      return handled;
    };


    /*
      Requests the application to perform or perform again a dongle certification process
     */

    BaseApplication.prototype.performDongleAttestation = function() {
      var _ref;
      if (this.dongle.getFirmwareInformation().hasScreenAndButton()) {
        (Try((function(_this) {
          return function() {
            return _this.onDongleCertificationDone(_this.dongle, null);
          };
        })(this))).printError();
      } else {
        if (this._dongleAttestationLock === true) {
          return;
        }
        this._dongleAttestationLock = true;
        if ((_ref = this.dongle) != null) {
          _ref.isCertified((function(_this) {
            return function(dongle, error) {
              _this._dongleAttestationLock = false;
              return (Try(function() {
                return _this.onDongleCertificationDone(dongle, error);
              })).printError();
            };
          })(this));
        }
      }
    };

    BaseApplication.prototype.isConnectingDongle = function() {
      return this._isConnectingDongle;
    };


    /*
      Returns the jQuery element used as the main div container in which controllers will render themselves.
    
      @return [jQuery.Element] The jQuery element of the controllers container
     */

    BaseApplication.prototype._navigationControllerSelector = function() {
      return $('#controllers_container');
    };

    BaseApplication.prototype._listenCommands = function() {
      return chrome.commands.onCommand.addListener((function(_this) {
        return function(command) {
          switch (command) {
            case 'reload-page':
              return _this.reloadUi(true);
            case 'reload-application':
              return _this.reload();
            case 'update-firmware':
              return _this.onCommandFirmwareUpdate();
            case 'export-logs':
              return _this.onCommandExportLogs();
          }
        };
      })(this));
    };


    /*
      Catches click on links and dispatch them if possible to the router.
     */

    BaseApplication.prototype._listenClickEvents = function() {
      var self;
      self = this;
      $('body').delegate('a', 'click', function(e) {
        var pathTest, url;
        if ((this.href != null) && (this.protocol === 'chrome-extension:' || this.protocol === 'file:')) {
          url = null;
          pathTest = _.str.startsWith(this.pathname, '/views/');
          if (chrome.runtime.electron) {
            pathTest = this.pathname.match(/.*\.html.*/);
          }
          if (pathTest && (self.currentUrl != null)) {
            url = ledger.url.createRelativeUrlWithFragmentedUrl(self.currentUrl, this.href);
          } else {
            url = this.pathname + this.search + this.hash;
          }
          self.router.go(url);
          return false;
        }
        return true;
      });
      return $('body').delegate('[data-href]', 'click', function(e) {
        var href, parser, pathTest, url;
        href = $(this).attr('data-href');
        if ((href != null) && href.length > 0) {
          parser = href.parseAsUrl();
          pathTest = _.str.startsWith(parser.pathname, '/views/');
          if (chrome.runtime.electron) {
            pathTest = parser.pathname.match(/.*\.html.*/);
          }
          if (pathTest && (self.currentUrl != null)) {
            url = ledger.url.createRelativeUrlWithFragmentedUrl(self.currentUrl, href);
          } else {
            url = parser.pathname + parser.search + parser.hash;
          }
          self.router.go(url);
          if ($(this).prop('tagName') === 'INPUT') {
            return true;
          } else {
            return false;
          }
        }
        return true;
      });
    };

    BaseApplication.prototype._listenDongleEvents = function() {
      this.donglesManager.on('connecting', (function(_this) {
        return function(event, device) {
          if (_this.dongle != null) {
            return;
          }
          DongleLogger().info('Connecting', device.deviceId);
          _this._isConnectingDongle = true;
          _this._connectingDevice = device.deviceId;
          return (Try(function() {
            return _this.onConnectingDongle(device);
          })).printError();
        };
      })(this));
      this.donglesManager.on('connected', (function(_this) {
        return function(event, dongle) {
          _this._isConnectingDongle = false;
          _this._connectingDevice = void 0;
          return _this.connectDongle(dongle);
        };
      })(this));
      return this.donglesManager.on('disconnect', (function(_this) {
        return function(event, device) {
          if (_this._connectingDevice !== device.deviceId) {
            return;
          }
          _this._isConnectingDongle = false;
          _this._connectingDevice = void 0;
          return _.defer(function() {
            return (Try(function() {
              return _this.onDongleIsDisconnected(null);
            })).printError();
          });
        };
      })(this));
    };

    BaseApplication.prototype.connectDongle = function(dongle) {
      this.dongle = dongle;
      this._dongleAttestationLock = false;
      DongleLogger().info("Connected", dongle.id, dongle.getStringFirmwareVersion());
      dongle.once('state:disconnected', (function(_this) {
        return function() {
          DongleLogger().info('Disconnected', dongle.id);
          _this.dongle = null;
          return _.defer(function() {
            return (Try(function() {
              return _this.onDongleIsDisconnected(dongle);
            })).printError();
          });
        };
      })(this));
      dongle.once('state:error', (function(_this) {
        return function() {
          return (Try(function() {
            return _this.onDongleNeedsUnplug(dongle);
          })).printError();
        };
      })(this));
      (Try((function(_this) {
        return function() {
          return _this.onDongleConnected(dongle);
        };
      })(this))).printError();
      if (dongle.isInBootloaderMode()) {
        DongleLogger().info('Dongle is Bootloader mode', dongle.id);
        return (Try((function(_this) {
          return function() {
            return _this.onDongleIsInBootloaderMode(dongle);
          };
        })(this))).printError();
      }
    };

    BaseApplication.prototype.reconnectDongleAndEnterWalletMode = function() {
      var d;
      d = ledger.defer();
      this.donglesManager.resume();
      this.donglesManager.once('connected', (function(_this) {
        return function(event, dongle) {
          _this.dongle = dongle;
          dongle.once('state:disconnected', function() {
            DongleLogger().info('Disconnected', dongle.id);
            _this.dongle = null;
            return _.defer(function() {
              return (Try(function() {
                return _this.onDongleIsDisconnected(dongle);
              })).printError();
            });
          });
          dongle.once('state:error', function() {
            return (Try(function() {
              return _this.onDongleNeedsUnplug(dongle);
            })).printError();
          });
          _this.onReconnectingDongle();
          return d.resolve(dongle);
        };
      })(this));
      return d.promise;
    };

    BaseApplication.prototype.notifyDongleIsUnlocked = function() {
      DongleLogger().info('Dongle unlocked', this.dongle.id);
      return (Try((function(_this) {
        return function() {
          return _this.onDongleIsUnlocked(_this.dongle);
        };
      })(this))).printError();
    };

    BaseApplication.prototype.onConnectingDongle = function(dongle) {
      this.dongle = dongle;
      dongle.once('disconnected', (function(_this) {
        return function() {
          _.defer(function() {
            return (Try(function() {
              return _this.onDongleIsDisconnected(dongle);
            })).printError();
          });
          return _this.dongle = null;
        };
      })(this));
      dongle.once('state:error', (function(_this) {
        return function() {
          return (Try(function() {
            return _this.onDongleNeedsUnplug(dongle);
          })).printError();
        };
      })(this));
      dongle.once('state:unlocked', (function(_this) {
        return function() {
          return (Try(function() {
            return _this.onDongleIsUnlocked(dongle);
          })).printError();
        };
      })(this));
      return (Try((function(_this) {
        return function() {
          return _this.onDongleConnected(dongle);
        };
      })(this))).printError();
    };

    BaseApplication.prototype._listenXhr = function() {
      var formatRequest;
      formatRequest = function(request, response) {
        return ("" + request.type + " " + request.url) + (response != null ? " [" + response.status + "] - " + response.statusText : "");
      };
      return $(document).bind('ajaxSend', function(_1, _2, request) {
        return XhrLogger().info(formatRequest(request, null));
      }).bind('ajaxSuccess', function(_1, response, request) {
        return XhrLogger().good(formatRequest(request, response));
      }).bind('ajaxError', function(_1, response, request) {
        return XhrLogger().bad(formatRequest(request, response));
      });
    };

    BaseApplication.prototype.onDongleConnected = function(dongle) {};

    BaseApplication.prototype.onDongleNeedsUnplug = function(dongle) {};

    BaseApplication.prototype.onDongleIsUnlocked = function(dongle) {};

    BaseApplication.prototype.onDongleIsDisconnected = function(dongle) {};

    BaseApplication.prototype.onDongleCertificationDone = function(dongle, error) {};

    BaseApplication.prototype.onDongleIsInBootloaderMode = function(dongle) {};

    BaseApplication.prototype.onCommandFirmwareUpdate = function() {};

    BaseApplication.prototype.onCommandExportLogs = function() {};

    BaseApplication.prototype.onCommandRunSpecs = function() {};

    BaseApplication.prototype.onReconnectingDongle = function() {};

    return BaseApplication;

  })(this.EventEmitter);

}).call(this);
