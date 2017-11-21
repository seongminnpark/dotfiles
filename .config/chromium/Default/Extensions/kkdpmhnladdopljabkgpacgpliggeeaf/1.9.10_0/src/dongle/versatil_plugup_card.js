(function() {
  if (window.ledger == null) {
    window.ledger = {};
  }

  if (ledger.dongle == null) {
    ledger.dongle = {};
  }


  /*
  ************************************************************************
  Copyright (c) 2013-2014 UBINITY SAS
  
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
  
          http://www.apache.org/licenses/LICENSE-2.0
  
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
  *************************************************************************
   */

  ledger.dongle.VersatilePlugUpCard = Class.extend(Card, {
    initialize: function(terminal, device, ledgerTransport, timeout) {
      if (typeof timeout === 'undefined') {
        timeout = 0;
      }
      this.winusb = device['transport'] === 'winusb';
      this.device = new chromeDevice(device);
      this.terminal = terminal;
      this.timeout = timeout;
      this.ledger = ledgerTransport;
      this.exchangeStack = [];
    },
    connect_async: function() {
      var currentObject;
      currentObject = this;
      return this.device.open_async().then(function(result) {
        currentObject.connection = true;
        return currentObject;
      });
    },
    getTerminal: function() {
      return this.terminal;
    },
    getAtr: function() {
      return new ByteString('', HEX);
    },
    beginExclusive: function() {},
    endExclusive: function() {},
    openLogicalChannel: function(channel) {
      throw 'Not supported';
    },
    exchange_async: function(apdu, returnLength) {},
    exchange_async_fido: function(apdu, returnLength) {},
    exchange_async_ledger: function(apdu, returnLength) {
      var currentObject, deferred, exchangeTimeout, processNextExchange, wrapCommandAPDU;
      wrapCommandAPDU = function(channel, command, packetSize) {
        var blockSize, header, i, offset, padding, paddingSize, result, sequenceIdx;
        sequenceIdx = 0;
        offset = 0;
        header = Convert.toHexByte(channel >> 8 & 0xff);
        header += Convert.toHexByte(channel & 0xff);
        header += Convert.toHexByte(0x05);
        header += Convert.toHexByte(sequenceIdx >> 8 & 0xff);
        header += Convert.toHexByte(sequenceIdx & 0xff);
        sequenceIdx++;
        header += Convert.toHexByte(command.length >> 8 & 0xff);
        header += Convert.toHexByte(command.length & 0xff);
        blockSize = command.length > packetSize - 7 ? packetSize - 7 : command.length;
        result = new ByteString(header, HEX);
        result = result.concat(command.bytes(offset, blockSize));
        offset += blockSize;
        while (offset !== command.length) {
          header = Convert.toHexByte(channel >> 8 & 0xff);
          header += Convert.toHexByte(channel & 0xff);
          header += Convert.toHexByte(0x05);
          header += Convert.toHexByte(sequenceIdx >> 8 & 0xff);
          header += Convert.toHexByte(sequenceIdx & 0xff);
          sequenceIdx++;
          blockSize = command.length - offset > packetSize - 5 ? packetSize - 5 : command.length - offset;
          result = result.concat(new ByteString(header, HEX));
          result = result.concat(command.bytes(offset, blockSize));
          offset += blockSize;
        }
        padding = '';
        paddingSize = packetSize - result.length;
        i = 0;
        while (i < paddingSize) {
          padding += '00';
          i++;
        }
        return result.concat(new ByteString(padding, HEX));
      };
      currentObject = this;
      if (!(apdu instanceof ByteString)) {
        throw 'Invalid parameter';
      }
      if (!this.connection) {
        throw 'Connection is not open';
      }
      if (currentObject.ledger) {
        apdu = wrapCommandAPDU(0x0101, apdu, 64);
      }
      deferred = Q.defer();
      exchangeTimeout = void 0;
      deferred.promise.apdu = apdu;
      deferred.promise.returnLength = returnLength;
      if (this.timeout !== 0) {
        exchangeTimeout = setTimeout((function() {
          deferred.reject('timeout');
        }), this.timeout);
      }
      currentObject.exchangeStack.push(deferred);
      if (currentObject.exchangeStack.length === 1) {
        processNextExchange = function() {
          var deferred;
          var performExchange;
          deferred = currentObject.exchangeStack[0];
          if (typeof currentObject.listener !== 'undefined') {
            currentObject.listener.begin();
          }
          performExchange = function() {
            var deferredHidSend, firstReceived, offsetSent, receivePart, received, sendPart, toReceive, unwrapResponseAPDU;
            if (currentObject.winusb) {
              return currentObject.device.send_async(deferred.promise.apdu.toString(HEX)).then(function(result) {
                return currentObject.device.recv_async(512);
              });
            } else {
              deferredHidSend = Q.defer();
              offsetSent = 0;
              firstReceived = true;
              toReceive = 0;
              unwrapResponseAPDU = function(channel, data, packetSize) {
                var blockSize, offset, responseLength, result, sequenceIdx;
                offset = 0;
                sequenceIdx = 0;
                if (typeof data === 'undefined' || data.length < 7 + 5) {
                  return;
                }
                if (data.byteAt(offset++) !== (channel >> 8 & 0xff)) {
                  throw 'Invalid channel';
                }
                if (data.byteAt(offset++) !== (channel & 0xff)) {
                  throw 'Invalid channel';
                }
                if (data.byteAt(offset++) !== 0x05) {
                  throw 'Invalid tag';
                }
                if (data.byteAt(offset++) !== (sequenceIdx >> 8 & 0xff)) {
                  throw 'Invalid sequence';
                }
                if (data.byteAt(offset++) !== (sequenceIdx & 0xff)) {
                  throw 'Invalid sequence';
                }
                responseLength = (data.byteAt(offset) << 8) + data.byteAt(offset + 1);
                offset += 2;
                if (data.length < 7 + responseLength) {
                  return;
                }
                blockSize = responseLength > packetSize - 7 ? packetSize - 7 : responseLength;
                result = data.bytes(offset, blockSize);
                offset += blockSize;
                while (result.length !== responseLength) {
                  sequenceIdx++;
                  if (offset === data.length) {
                    return;
                  }
                  if (data.byteAt(offset++) !== (channel >> 8 & 0xff)) {
                    throw 'Invalid channel';
                  }
                  if (data.byteAt(offset++) !== (channel & 0xff)) {
                    throw 'Invalid channel';
                  }
                  if (data.byteAt(offset++) !== 0x05) {
                    throw 'Invalid tag';
                  }
                  if (data.byteAt(offset++) !== (sequenceIdx >> 8 & 0xff)) {
                    throw 'Invalid sequence';
                  }
                  if (data.byteAt(offset++) !== (sequenceIdx & 0xff)) {
                    throw 'Invalid sequence';
                  }
                  blockSize = responseLength - result.length > packetSize - 5 ? packetSize - 5 : responseLength - result.length;
                  result = result.concat(data.bytes(offset, blockSize));
                  offset += blockSize;
                }
                return result;
              };
              received = new ByteString('', HEX);
              sendPart = function() {
                var block, blockSize, i, padding, paddingSize;
                if (offsetSent === deferred.promise.apdu.length) {
                  return receivePart();
                }
                blockSize = deferred.promise.apdu.length - offsetSent > 64 ? 64 : deferred.promise.apdu.length - offsetSent;
                block = deferred.promise.apdu.bytes(offsetSent, blockSize);
                padding = '';
                paddingSize = 64 - block.length;
                i = 0;
                while (i < paddingSize) {
                  padding += '00';
                  i++;
                }
                if (padding.length !== 0) {
                  block = block.concat(new ByteString(padding, HEX));
                }
                return currentObject.device.send_async(block.toString(HEX)).then(function(result) {
                  offsetSent += blockSize;
                  return sendPart();
                }).fail(function(error) {
                  deferredHidSend.reject(error);
                });
              };
              receivePart = function() {
                if (!currentObject.ledger) {
                  return currentObject.device.recv_async(64).then(function(result) {
                    received = received.concat(new ByteString(result.data, HEX));
                    if (firstReceived) {
                      firstReceived = false;
                      if (received.length === 2 || received.byteAt(0) !== 0x61) {
                        deferredHidSend.resolve({
                          resultCode: 0,
                          data: received.toString(HEX)
                        });
                      } else {
                        toReceive = received.byteAt(1);
                        if (toReceive === 0) {
                          toReceive === 256;
                        }
                        toReceive += 2;
                      }
                    }
                    if (toReceive < 64) {
                      deferredHidSend.resolve({
                        resultCode: 0,
                        data: received.toString(HEX)
                      });
                    } else {
                      toReceive -= 64;
                      return receivePart();
                    }
                  }).fail(function(error) {
                    deferredHidSend.reject(error);
                  });
                } else {
                  return currentObject.device.recv_async(64).then(function(result) {
                    var response;
                    received = received.concat(new ByteString(result.data, HEX));
                    response = unwrapResponseAPDU(0x0101, received, 64);
                    if (typeof response === 'undefined') {
                      return receivePart();
                    } else {
                      deferredHidSend.resolve({
                        resultCode: 0,
                        data: response.toString(HEX)
                      });
                    }
                  }).fail(function(error) {
                    deferredHidSend.reject(error);
                  });
                }
              };
              sendPart();
              return deferredHidSend.promise;
            }
          };
          performExchange().then(function(result) {
            var resultBin, size;
            resultBin = new ByteString(result.data, HEX);
            if (!currentObject.ledger) {
              if (resultBin.length === 2 || resultBin.byteAt(0) !== 0x61) {
                deferred.promise.SW1 = resultBin.byteAt(0);
                deferred.promise.SW2 = resultBin.byteAt(1);
                deferred.promise.response = new ByteString('', HEX);
              } else {
                size = resultBin.byteAt(1);
                if (size === 0) {
                  size = 256;
                }
                deferred.promise.response = resultBin.bytes(2, size);
                deferred.promise.SW1 = resultBin.byteAt(2 + size);
                deferred.promise.SW2 = resultBin.byteAt(2 + size + 1);
              }
            } else {
              deferred.promise.SW1 = resultBin.byteAt(resultBin.length - 2);
              deferred.promise.SW2 = resultBin.byteAt(resultBin.length - 1);
              deferred.promise.response = resultBin.bytes(0, resultBin.length - 2);
            }
            deferred.promise.SW = (deferred.promise.SW1 << 8) + deferred.promise.SW2;
            currentObject.SW1 = deferred.promise.SW1;
            currentObject.SW2 = deferred.promise.SW2;
            currentObject.SW = deferred.promise.SW;
            if (typeof currentObject.logger !== 'undefined') {
              currentObject.logger.log(currentObject.terminal.getName(), 0, deferred.promise.apdu, deferred.promise.response, deferred.promise.SW);
            }
            if (this.timeout !== 0) {
              clearTimeout(exchangeTimeout);
            }
            deferred.resolve(deferred.promise.response);
          }).fail(function(err) {
            if (this.timeout !== 0) {
              clearTimeout(exchangeTimeout);
            }
            deferred.reject(err);
          })["finally"](function() {
            if (typeof currentObject.listener !== 'undefined') {
              currentObject.listener.end();
            }
            currentObject.exchangeStack.shift();
            if (currentObject.exchangeStack.length > 0) {
              processNextExchange();
            }
          });
        };
        processNextExchange();
      }
      return deferred.promise;
    },
    reset: function(mode) {},
    disconnect_async: function(mode) {
      var currentObject;
      currentObject = this;
      if (!this.connection) {
        return;
      }
      return this.device.close_async().then(function(result) {
        currentObject.connection = false;
      });
    },
    getSW: function() {
      return this.SW;
    },
    getSW1: function() {
      return this.SW1;
    },
    getSW2: function() {
      return this.SW2;
    },
    setCommandDelay: function(delay) {},
    setReportDelay: function(delay) {},
    getCommandDelay: function() {
      return 0;
    },
    getReportDelay: function() {
      return 0;
    }
  });

}).call(this);
