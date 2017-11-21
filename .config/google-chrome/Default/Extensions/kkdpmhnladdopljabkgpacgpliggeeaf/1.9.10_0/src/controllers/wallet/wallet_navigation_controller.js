(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WalletNavigationController = (function(_super) {
    __extends(WalletNavigationController, _super);

    WalletNavigationController.prototype._menuItemBaseUrl = {
      '/wallet/accounts/index': '#accounts-item'
    };

    WalletNavigationController.prototype.view = {
      balanceValue: '#balance_value',
      reloadIcon: '#reload_icon',
      currencyContainer: '#currency_container',
      flashContainer: '.flash-container',
      chainsItem: '#chains-item'
    };

    function WalletNavigationController() {
      this._updateReloadIconState = __bind(this._updateReloadIconState, this);
      WalletNavigationController.__super__.constructor.apply(this, arguments);
      ledger.application.router.on('routed', this._onRoutedUrl);
    }

    WalletNavigationController.prototype._onRoutedUrl = function(event, data) {
      var url;
      url = data.url;
      return this.updateMenu(url);
    };

    WalletNavigationController.prototype.onAfterRender = function() {
      var url;
      WalletNavigationController.__super__.onAfterRender.apply(this, arguments);
      if (ledger.config.network.chain == null) {
        this.view.chainsItem.css('opacity', '0.0');
      }
      this.view.flashContainer.hide();
      url = ledger.application.router.currentUrl;
      this.updateMenu(url);
      this._listenBalanceEvents();
      this._listenSynchronizationEvents();
      return this._listenCountervalueEvents();
    };

    WalletNavigationController.prototype.updateMenu = function(url) {
      var baseUrl, color, itemSelector, menuItem, newSelector, previousItem, previousSelector, _ref, _results;
      _ref = this._menuItemBaseUrl;
      _results = [];
      for (baseUrl in _ref) {
        itemSelector = _ref[baseUrl];
        if (_.str.startsWith(url, baseUrl)) {
          menuItem = this.select(itemSelector);
          if (!menuItem.hasClass('selected')) {
            previousItem = this.select('li.selected');
            if (previousItem.length > 0) {
              previousSelector = previousItem.find('.selector');
              color = previousSelector.css('background-color');
              previousItem.removeClass('selected');
              previousSelector.css('background-color', color);
              previousItem.find('.selector').animate({
                bottom: '-10px'
              }, 200, function() {
                previousSelector.css('background-color', '');
                return previousSelector.css('bottom', '0px');
              });
              menuItem.addClass('selected');
              newSelector = menuItem.find('.selector');
              newSelector.css('bottom', '-10px');
              newSelector.animate({
                bottom: '0px'
              }, 200);
            } else {
              menuItem.addClass('selected');
            }
          }
          break;
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    WalletNavigationController.prototype.onDetach = function() {
      var _ref;
      WalletNavigationController.__super__.onDetach.apply(this, arguments);
      ledger.app.off('wallet:balance:changed', this._updateBalanceValue);
      ledger.app.off('wallet:balance:changed wallet:balance:unchanged wallet:balance:failed wallet:operations:sync:failed wallet:operations:sync:done', this._onSynchronizationStateChanged);
      ledger.tasks.OperationsSynchronizationTask.instance.off('start stop', this._onSynchronizationStateChanged);
      if ((_ref = ledger.preferences.instance) != null) {
        _ref.off('currencyActive:changed', this._updateCountervalue);
      }
      return ledger.app.off('wallet:balance:changed', this._updateCountervalue);
    };

    WalletNavigationController.prototype._listenBalanceEvents = function() {
      this._updateBalanceValue();
      return ledger.app.on('wallet:balance:changed', this._updateBalanceValue);
    };

    WalletNavigationController.prototype._updateBalanceValue = function(balance) {
      return this.view.balanceValue.text(ledger.formatters.fromValue(Wallet.instance.getBalance().wallet.total));
    };

    WalletNavigationController.prototype._listenSynchronizationEvents = function() {
      this.view.reloadIcon.on('click', (function(_this) {
        return function() {
          ledger.tasks.TickerTask.instance.updateTicker();
          ledger.tasks.WalletLayoutRecoveryTask.instance.startIfNeccessary();
          ledger.storage.sync.pull();
          return _.defer(_this._updateReloadIconState);
        };
      })(this));
      ledger.tasks.WalletLayoutRecoveryTask.instance.on('start stop', this._onSynchronizationStateChanged);
      return this._updateReloadIconState();
    };

    WalletNavigationController.prototype._onSynchronizationStateChanged = function() {
      ledger.tasks.WalletLayoutRecoveryTask.instance.getLastSynchronizationStatus().then((function(_this) {
        return function(state) {
          var _ref;
          l("State is", state);
          if (state === 'failure' && (_this._syncFailureFlash == null)) {
            _this._syncFailureFlash = _this.flash("wallet.flash.api_failure");
            return _this._syncFailureFlash.onClick(function() {
              return new WalletDialogsApifailuresDialogViewController().show();
            });
          } else if (state !== 'failure') {
            if ((_ref = _this._syncFailureFlash) != null) {
              _ref.hide();
            }
            return _this._syncFailureFlash = void 0;
          }
        };
      })(this));
      return _.defer(this._updateReloadIconState);
    };

    WalletNavigationController.prototype._updateReloadIconState = function() {
      if (this._isSynchronizationRunning()) {
        return this.view.reloadIcon.addClass('spinning');
      } else {
        return this.view.reloadIcon.removeClass('spinning');
      }
    };

    WalletNavigationController.prototype._isSynchronizationRunning = function() {
      return ledger.tasks.WalletLayoutRecoveryTask.instance.isRunning();
    };

    WalletNavigationController.prototype._listenCountervalueEvents = function() {
      this._updateCountervalue();
      ledger.preferences.instance.on('currencyActive:changed', this._updateCountervalue);
      return ledger.app.on('wallet:balance:changed', this._updateCountervalue);
    };

    WalletNavigationController.prototype._updateCountervalue = function() {
      this.view.currencyContainer.removeAttr('data-countervalue');
      this.view.currencyContainer.empty();
      if (ledger.preferences.instance.isCurrencyActive()) {
        return this.view.currencyContainer.attr('data-countervalue', Wallet.instance.getBalance().wallet.total);
      } else {
        return this.view.currencyContainer.text(t('wallet.top_menu.balance'));
      }
    };

    WalletNavigationController.prototype.getActionBarDrawer = function() {
      return this._actionBarDrawer || (this._actionBarDrawer = _.extend(new ledger.common.ActionBarNavigationController.ActionBar.Drawer(), {
        createBreadcrumbPartView: (function(_this) {
          return function(title, url, position, length) {
            var view;
            view = $("<span>" + (t(title)) + "</span>");
            if (position === 0) {
              view.addClass("breadcrumb-root");
            }
            if (position === 0) {
              url += "/index";
            }
            if (!_.isEmpty(url) && position < length - 1 && _this.topViewController().routedUrl !== url) {
              view.attr('data-href', url);
            }
            return view;
          };
        })(this),
        createBreadcrumbSeparatorView: (function(_this) {
          return function(position) {
            return $("<span>&nbsp;&nbsp;>&nbsp;&nbsp;</span>");
          };
        })(this),
        createActionView: (function(_this) {
          return function(title, icon, url, position, length) {
            var view;
            view = $("<span><i class=\"fa " + icon + "\"></i>" + (t(title)) + "</span>");
            view.attr('data-href', url);
            return view;
          };
        })(this),
        createActionSeparatorView: (function(_this) {
          return function(position) {
            return null;
          };
        })(this),
        getActionBarHolderView: (function(_this) {
          return function() {
            return _this.select('.action-bar-holder');
          };
        })(this),
        getBreadCrumbHolderView: (function(_this) {
          return function() {
            return _this.select('.breadcrumb-holder');
          };
        })(this),
        getActionsHolderView: (function(_this) {
          return function() {
            return _this.select('.actions-holder');
          };
        })(this)
      }));
    };

    WalletNavigationController.prototype.flash = function(infoText, linkText, priority) {
      var flash;
      if (linkText == null) {
        linkText = void 0;
      }
      if (priority == null) {
        priority = 0;
      }
      flash = new WalletNavigationController.Flash(infoText, linkText, priority);
      if ((this._currentFlash == null) || this._currentFlash.getPriority() < priority || this._currentFlash.isHidden()) {
        this._currentFlash = flash;
        flash.show(this.view.flashContainer);
      }
      return flash;
    };

    WalletNavigationController.prototype.getCurrentFlash = function() {
      return this._currentFlash;
    };

    return WalletNavigationController;

  })(ledger.common.ActionBarNavigationController);

  this.WalletNavigationController.Flash = (function() {
    function Flash(infoText, linkText, priority) {
      this._infoText = t(infoText);
      this._linkText = linkText != null ? t(linkText) : t('common.flash.link');
      this._priority = priority;
      this._container = void 0;
    }

    Flash.prototype.onClick = function(callback) {
      var _ref;
      this._onClick = callback;
      return (_ref = this._container) != null ? _ref.find('.flash-link').click(this._onClick) : void 0;
    };

    Flash.prototype.show = function(container) {
      this._container = container;
      container.find('.flash-text').text(this._infoText);
      container.find('.flash-link').text(this._linkText);
      container.slideDown(250);
      return this.onClick(this._onClick);
    };

    Flash.prototype.hide = function() {
      var _ref;
      if ((_ref = this._container) != null) {
        _ref.slideUp(250);
      }
      return this._container = void 0;
    };

    Flash.prototype.isHidden = function() {
      return this._container == null;
    };

    Flash.prototype.isShown = function() {
      return !this.isHidden();
    };

    Flash.prototype.getPriority = function() {
      return this._priority;
    };

    return Flash;

  })();

}).call(this);
