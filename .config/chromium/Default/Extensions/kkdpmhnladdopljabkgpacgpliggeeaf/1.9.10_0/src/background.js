(function() {
  var performUpdateIfPossible, updateAvailable;

  updateAvailable = false;

  
  var apps = [
    {
      name: "Ledger Wallet Ethereum",
      id: "hmlhkialjkaldndjnlcdfdphcgeadkkm"
    },
    {
      name: "Ledger Manager",
      id: "beimhnaefocolcplfimocfiaiefpkgbf"
    }
  ];

  function ensureIsSingleton(callback) {
    var iterate = function (index) {
      if (index >= apps.length) {
        callback(true, null);
      } else {
        var app = apps[index];
        chrome.runtime.sendMessage(app.id, {request: "is_launched"},
            function (response) {
              if (typeof response === "undefined" || !response.result)
                iterate(index + 1);
              else
                callback(false, app);
            });
      }
    };
    iterate(0)
  }

  function startApp(callback) {
    chrome.app.window.create('views/layout.html', {
      id: "main_window",
      innerBounds: {
        minWidth: 1000,
        minHeight: 640
      }
    }, function(createdWindow) {
      return createdWindow.onClosed.addListener(performUpdateIfPossible);
    });
  }

  function displayCantLaunchNotification(app) {
    chrome.notifications.create("cannot_launch", {
      type: "basic",
      title: chrome.i18n.getMessage("application_name"),
      message: chrome.i18n.getMessage("application_singleton_alert_message").replace("{APPLICATION_NAME}", app.name),
      iconUrl: "assets/images/icon-48.png"
    }, function () {});
    chrome.app.window.create('public/mac_close_fix/fix.html', {
      id: "fix1000",
      innerBounds: {
        width: 0,
        height: 0,
        left: 0,
        top: 0,
        minWidth: 0,
        minHeight: 0
      },
      hidden: true,
      frame: "none"
    })
  }

  function tryStartApp() {
    ensureIsSingleton(function (isSingleton, app) {
      console.log(arguments);
      if (isSingleton) {
        startApp();
      } else {
        displayCantLaunchNotification(app)
      }
    })
  }
;

  chrome.app.runtime.onLaunched.addListener((function(_this) {
    return function() {
      return tryStartApp();
    };
  })(this));

  chrome.runtime.onMessageExternal.addListener((function(_this) {
    return function(request, sender, sendResponse) {
      var data, payload, req;
      window.externalSendResponse = sendResponse;
      if (typeof request.request === "string") {
        req = request.request;
      } else if (request.request != null) {
        req = request.request.command;
        data = request.request;
      }
      payload = {};
      switch (req) {
        case 'ping':
          window.externalSendResponse({
            command: "ping",
            result: true
          });
          break;
        case 'is_launched':
          window.externalSendResponse({
            command: "is_launched",
            result: chrome.app.window.getAll().length !== 0
          });
          break;
        case 'launch':
          tryStartApp();
          window.externalSendResponse({
            command: "launch",
            result: true
          });
          break;
        case 'has_session':
          payload = {
            command: 'has_session'
          };
          break;
        case 'bitid':
          payload = {
            command: 'bitid',
            uri: data.uri,
            silent: data.silent
          };
          break;
        case 'get_accounts':
          payload = {
            command: 'get_accounts'
          };
          break;
        case 'get_operations':
          payload = {
            command: 'get_operations',
            account_id: data.account_id
          };
          break;
        case 'get_new_addresses':
          payload = {
            command: 'get_new_addresses',
            account_id: data.account_id,
            count: data.count
          };
          break;
        case 'send_payment':
          payload = {
            command: 'send_payment',
            address: data.address,
            amount: data.amount,
            data: data.data
          };
          break;
        case 'get_xpubkey':
          payload = {
            command: 'get_xpubkey',
            path: data.path
          };
          break;
        case 'sign_message':
          payload = {
            command: 'sign_message',
            path: data.path,
            message: data.message
          };
          break;
        case 'sign_p2sh':
          payload = {
            command: 'sign_p2sh',
            inputs: data.inputs,
            scripts: data.scripts,
            outputs_number: data.outputs_number,
            outputs_script: data.outputs_script,
            paths: data.paths
          };
          break;
        case 'coinkite_get_xpubkey':
          payload = {
            command: 'coinkite_get_xpubkey',
            index: data.index
          };
          break;
        case 'coinkite_sign_json':
          payload = {
            command: 'coinkite_sign_json',
            json: data.json
          };
      }
      if ((payload.command != null) && (chrome.app.window.get("main_window") != null)) {
        chrome.app.window.get("main_window").contentWindow.postMessage(payload, "*");
      }
      return true;
    };
  })(this));

  chrome.runtime.onMessage.addListener((function(_this) {
    return function(request, sender, sendResponse) {
      if (window.externalSendResponse) {
        return window.externalSendResponse(request);
      }
    };
  })(this));

  chrome.runtime.onUpdateAvailable.addListener(function() {
    updateAvailable = true;
    return performUpdateIfPossible();
  });

  performUpdateIfPossible = function() {
    return setTimeout(function() {
      if (updateAvailable === true && chrome.app.window.getAll().length === 0) {
        return chrome.runtime.reload();
      }
    }, 0);
  };

}).call(this);
