(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  this.Coinkite = (function() {
    Coinkite.prototype.API_BASE = "https://api.coinkite.com";

    Coinkite.prototype.CK_SIGNING_ADDRESS = "1GPWzXfpN9ht3g7KsSu8eTB92Na5Wpmu7g";

    Coinkite.CK_PATH = "0xb11e'/0xccc0'";

    Coinkite.factory = function(callback) {
      return ledger.storage.sync.get("__apps_coinkite_api_key", (function(_this) {
        return function(r) {
          var api_key;
          api_key = r.__apps_coinkite_api_key;
          return ledger.storage.sync.get("__apps_coinkite_api_secret", function(r) {
            var secret;
            secret = r.__apps_coinkite_api_secret;
            if (typeof secret === "string") {
              return callback(new Coinkite(api_key, secret));
            } else {
              return callback(void 0);
            }
          });
        };
      })(this));
    };

    function Coinkite(api_key, secret) {
      this.postSignedJSON = __bind(this.postSignedJSON, this);
      this.apiKey = api_key;
      this.secret = secret;
      this.httpClient = new HttpClient(this.API_BASE);
    }

    Coinkite.prototype.getExtendedPublicKey = function(index, callback) {
      var error, path;
      path = this._buildPath(index);
      try {
        return ledger.app.dongle.getExtendedPublicKey(path, (function(_this) {
          return function(key) {
            _this.xpub = key._xpub58;
            return ledger.app.dongle.getPublicAddress(path, function(address) {
              return ledger.app.dongle.signMessage("Coinkite", {
                path: path,
                pubKey: address.publicKey
              }, function(signature) {
                return typeof callback === "function" ? callback({
                  xpub: _this.xpub,
                  signature: signature,
                  path: path
                }, null) : void 0;
              });
            });
          };
        })(this));
      } catch (_error) {
        error = _error;
        return typeof callback === "function" ? callback(null, error) : void 0;
      }
    };

    Coinkite.prototype.getRequestData = function(request, callback) {
      var url;
      url = '/v1/co-sign/' + request;
      this._setAuthHeaders(url);
      return this.httpClient["do"]({
        type: 'GET',
        url: url
      }).then((function(_this) {
        return function(data, statusText, jqXHR) {
          return typeof callback === "function" ? callback(data, null) : void 0;
        };
      })(this)).fail((function(_this) {
        return function(error, statusText) {
          return typeof callback === "function" ? callback(null, error.responseJSON.message + ' ' + error.responseJSON.help_msg) : void 0;
        };
      })(this)).done();
    };

    Coinkite.prototype.getCosigner = function(data, callback) {
      var error;
      this.cosigner = null;
      try {
        return ledger.app.dongle.getExtendedPublicKey(Coinkite.CK_PATH, (function(_this) {
          return function(key) {
            var xpub;
            xpub = key._xpub58;
            return async.eachSeries(data.cosigners, (function(cosigner, finishedCallback) {
              var check;
              check = cosigner.xpubkey_check;
              if (xpub.indexOf(check, xpub.length - check.length) > 0) {
                _this.cosigner = cosigner.CK_refnum;
              }
              return finishedCallback();
            }), function(finished) {
              return callback(_this.cosigner, data.has_signed_already[_this.cosigner]);
            });
          };
        })(this));
      } catch (_error) {
        error = _error;
        return callback(this.cosigner);
      }
    };

    Coinkite.prototype.getCosignData = function(request, cosigner, callback) {
      var url;
      this.request = request;
      this.cosigner = cosigner;
      url = '/v1/co-sign/' + request + '/' + cosigner;
      this._setAuthHeaders(url);
      return this.httpClient["do"]({
        type: 'GET',
        url: url
      }).then((function(_this) {
        return function(data, statusText, jqXHR) {
          return typeof callback === "function" ? callback(data.signing_info, null) : void 0;
        };
      })(this)).fail((function(_this) {
        return function(error, statusText) {
          return typeof callback === "function" ? callback(null, error.responseJSON.message + ' ' + error.responseJSON.help_msg) : void 0;
        };
      })(this)).done();
    };

    Coinkite.prototype.getCosignSummary = function(request, cosigner, callback) {
      var url;
      this.request = request;
      this.cosigner = cosigner;
      url = '/v1/co-sign/' + request + '/' + cosigner + '.html';
      this._setAuthHeaders(url);
      return this.httpClient["do"]({
        type: 'GET',
        url: url
      }).then((function(_this) {
        return function(data, statusText, jqXHR) {
          return typeof callback === "function" ? callback(data, null) : void 0;
        };
      })(this)).fail((function(_this) {
        return function(error, statusText) {
          return typeof callback === "function" ? callback(null, error.responseJSON.message + ' ' + error.responseJSON.help_msg) : void 0;
        };
      })(this)).done();
    };

    Coinkite.prototype.cosignRequest = function(data, post, callback) {
      var error, input, inputs, outputs_number, outputs_script, paths, scripts, transaction, _i, _len, _ref, _ref1;
      try {
        transaction = Bitcoin.Transaction.deserialize(data.raw_unsigned_txn);
        outputs_number = transaction['outs'].length;
        outputs_script = ledger.app.dongle.formatP2SHOutputScript(transaction);
        inputs = [];
        paths = [];
        scripts = [];
        _ref = data.input_info;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          input = _ref[_i];
          paths.push(this._buildPath((_ref1 = data.ledger_key) != null ? _ref1.subkey_index : void 0) + "/" + input.sp);
          inputs.push([input.txn, Bitcoin.convert.bytesToHex(ledger.bitcoin.numToBytes(parseInt(input.out_num), 4).reverse())]);
          scripts.push(data.redeem_scripts[input.sp].redeem);
        }
        return ledger.app.dongle.signP2SHTransaction(inputs, scripts, outputs_number, outputs_script, paths).then((function(_this) {
          return function(result) {
            var index, signatures, url, _j, _len1, _ref2;
            signatures = [];
            index = 0;
            _ref2 = data.inputs;
            for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
              input = _ref2[_j];
              signatures.push([result[index], input[1], input[0]]);
              index++;
            }
            if (post) {
              url = '/v1/co-sign/' + _this.request + '/' + _this.cosigner + '/sign';
              _this._setAuthHeaders(url);
              return _this.httpClient["do"]({
                type: 'PUT',
                url: url,
                dataType: 'json',
                contentType: 'application/json',
                data: {
                  signatures: signatures
                }
              }).then(function(data, statusText, jqXHR) {
                return typeof callback === "function" ? callback(data, null) : void 0;
              }).fail(function(error, statusText) {
                return typeof callback === "function" ? callback(null, error.responseJSON.message + ' ' + error.responseJSON.help_msg) : void 0;
              }).done();
            } else {
              return typeof callback === "function" ? callback(signatures, null) : void 0;
            }
          };
        })(this)).fail((function(_this) {
          return function(error) {
            return typeof callback === "function" ? callback(null, error) : void 0;
          };
        })(this));
      } catch (_error) {
        error = _error;
        return typeof callback === "function" ? callback(null, error) : void 0;
      }
    };

    Coinkite.prototype.getRequestFromJSON = function(data) {
      if (data.contents != null) {
        return $.extend({
          api: true
        }, JSON.parse(data.contents));
      } else {
        return $.extend({
          api: true
        }, data);
      }
    };

    Coinkite.prototype.buildSignedJSON = function(request, callback) {
      var error;
      try {
        return this.verifyExtendedPublicKey(request, (function(_this) {
          return function(result, error) {
            if (result) {
              return _this.cosignRequest(request, false, function(result, error) {
                var body, path, rv, _ref;
                if (error != null) {
                  return typeof callback === "function" ? callback(null, error) : void 0;
                }
                path = _this._buildPath((_ref = request.ledger_key) != null ? _ref.subkey_index : void 0);
                rv = {
                  cosigner: request.cosigner,
                  request: request.request,
                  signatures: result
                };
                body = {
                  _humans: "This transaction has been signed by a Ledger Wallet Nano",
                  content: JSON.stringify(rv)
                };
                return ledger.app.dongle.getPublicAddress(path, function(key, error) {
                  if (error != null) {
                    return typeof callback === "function" ? callback(null, error) : void 0;
                  } else {
                    body.signed_by = key.bitcoinAddress.value;
                    return ledger.app.dongle.signMessage(sha256_digest(body.content), {
                      path: path,
                      pubKey: key.publicKey
                    }, function(signature) {
                      body.signature_sha256 = signature;
                      return typeof callback === "function" ? callback(JSON.stringify(body), null) : void 0;
                    });
                  }
                });
              });
            } else {
              return typeof callback === "function" ? callback(null, t("apps.coinkite.cosign.errors.wrong_nano_text")) : void 0;
            }
          };
        })(this));
      } catch (_error) {
        error = _error;
        return typeof callback === "function" ? callback(null, error) : void 0;
      }
    };

    Coinkite.prototype.postSignedJSON = function(json, callback) {
      var httpClient;
      httpClient = new HttpClient("https://coinkite.com");
      return httpClient["do"]({
        type: 'PUT',
        url: '/co-sign/done-signature',
        contentType: 'text/plain',
        data: json
      }).then((function(_this) {
        return function(data, statusText, jqXHR) {
          return typeof callback === "function" ? callback(data, null) : void 0;
        };
      })(this)).fail((function(_this) {
        return function(error, statusText) {
          if (error.responseJSON != null) {
            return typeof callback === "function" ? callback(null, error.responseJSON.message) : void 0;
          } else {
            return typeof callback === "function" ? callback(null, error.statusText) : void 0;
          }
        };
      })(this)).done();
    };

    Coinkite.prototype.verifyExtendedPublicKey = function(request, callback) {
      var check, path, _ref;
      check = request.xpubkey_check;
      path = this._buildPath((_ref = request.ledger_key) != null ? _ref.subkey_index : void 0);
      return ledger.app.dongle.getExtendedPublicKey(path, (function(_this) {
        return function(key) {
          var xpub;
          if (key._xpub58.indexOf(check, key._xpub58.length - check.length) > 0) {
            return typeof callback === "function" ? callback(true) : void 0;
          } else {
            xpub = new ledger.wallet.ExtendedPublicKey(ledger.app.dongle, path);
            return xpub.initialize_legacy(function() {
              return typeof callback === "function" ? callback(xpub._xpub58.indexOf(check, xpub._xpub58.length - check.length) > 0) : void 0;
            });
          }
        };
      })(this));
    };

    Coinkite.prototype.testDongleCompatibility = function(callback) {
      var data, error, inputs, outputs_number, outputs_script, paths, scripts, transaction;
      transaction = Bitcoin.Transaction.deserialize("0100000001b4e84a9115e3633abaa1730689db782aa3bb54fa429a3c52a7fa55a788d611fd0100000000ffffffff02a0860100000000001976a914069b75ac23920928eda632a20525a027e67d040188ac50c300000000000017a914c70abc77a8bb21997a7a901b7e02d42c0c0bbf558700000000");
      inputs = [["214af8788d11cf6e3a8dd2efb00d0c3facb446273dee2cf8023e1fae8b2afcbd", "00000000"]];
      scripts = ["522102feec7dd82317846908c20c342a02a8e8c17fb327390ce8d6669ef09a9c85904b210308aaece16e0f99b78e4beb30d8b18652af318428d6d64df26f8089010c7079f452ae"];
      outputs_number = transaction['outs'].length;
      outputs_script = ledger.app.dongle.formatP2SHOutputScript(transaction);
      paths = [Coinkite.CK_PATH + "/0"];
      data = {
        "input_info": [
          {
            "full_sp": "m/0",
            "out_num": 1,
            "sp": "0",
            "txn": "fd11d688a755faa7523c9a42fa54bba32a78db890673a1ba3a63e315914ae8b4"
          }
        ],
        "inputs": [["0", "214af8788d11cf6e3a8dd2efb00d0c3facb446273dee2cf8023e1fae8b2afcbd"]],
        "raw_unsigned_txn": "0100000001b4e84a9115e3633abaa1730689db782aa3bb54fa429a3c52a7fa55a788d611fd0100000000ffffffff02a0860100000000001976a914069b75ac23920928eda632a20525a027e67d040188ac50c300000000000017a914c70abc77a8bb21997a7a901b7e02d42c0c0bbf558700000000",
        "redeem_scripts": {
          "0": {
            "addr": "3NjjSXDhRtn4yunA7P8DGGTQuyPnbktcs3",
            "redeem": "522102feec7dd82317846908c20c342a02a8e8c17fb327390ce8d6669ef09a9c85904b210308aaece16e0f99b78e4beb30d8b18652af318428d6d64df26f8089010c7079f452ae"
          }
        }
      };
      try {
        return ledger.app.dongle.signP2SHTransaction(inputs, scripts, outputs_number, outputs_script, paths).then((function(_this) {
          return function(result) {
            return callback(true);
          };
        })(this)).fail((function(_this) {
          return function(error) {
            return callback(false);
          };
        })(this));
      } catch (_error) {
        error = _error;
        return callback(false);
      }
    };

    Coinkite.prototype._buildPath = function(index) {
      var path;
      path = Coinkite.CK_PATH;
      if (index) {
        path = path + "/" + index;
      }
      return path;
    };

    Coinkite.prototype._setAuthHeaders = function(endpoint) {
      var data, ts;
      endpoint = endpoint.split('?')[0];
      ts = (new Date).toISOString();
      data = endpoint + '|' + ts;
      this.httpClient.setHttpHeader('X-CK-Key', this.apiKey);
      this.httpClient.setHttpHeader('X-CK-Sign', CryptoJS.HmacSHA256(data, this.secret).toString());
      return this.httpClient.setHttpHeader('X-CK-Timestamp', ts);
    };

    return Coinkite;

  })();

}).call(this);
