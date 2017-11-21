(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.Operation = (function(_super) {
    __extends(Operation, _super);

    function Operation() {
      return Operation.__super__.constructor.apply(this, arguments);
    }

    Operation.init();

    Operation.index('uid');

    Operation.displayableOperationsChain = function(context) {
      var accountIds;
      if (context == null) {
        context = ledger.database.contexts.main;
      }
      accountIds = _(Account.displayableAccounts(context)).map(function(a) {
        return a.index;
      });
      return Operation.find({
        account_id: {
          $in: accountIds
        }
      }).where(function(op) {
        return (op['double_spent_priority'] == null) || op['double_spent_priority'] === 0;
      }).sort(this.defaultSort);
    };

    Operation.fromSend = function(tx, account) {
      var changeOutputs, changeValue, index, inputs, uid, value;
      index = account.getId();
      uid = "sending" + tx.hash + "_" + index;
      inputs = _(tx.inputs).filter(function(i) {
        return _(i.nodes).some(function(n) {
          return (n != null ? n[0] : void 0) === index;
        });
      });
      value = _(inputs).reduce((function(m, i) {
        return m.add(i.value);
      }), ledger.Amount.fromSatoshi(0));
      changeOutputs = _(tx.outputs).filter(function(o) {
        return _(o.nodes).some(function(n) {
          return (n != null ? n[1] : void 0) === 1 && (n != null ? n[0] : void 0) === index;
        });
      });
      changeValue = _(changeOutputs).reduce((function(m, o) {
        return m.add(o.value);
      }), ledger.Amount.fromSatoshi(0));
      return this._createOperationFromTransaction(uid, "sending", tx, value.subtract(tx.fees).subtract(changeValue), account);
    };

    Operation.fromReception = function(tx, account) {
      var accountChangeOutputs, accountInputs, accountOutputs, hasOwnInputs, index, inputValue, outputValue, outputs, uid, value;
      index = account.getId();
      uid = "reception_" + tx.hash + "_" + index;
      accountInputs = _(tx.inputs).filter(function(i) {
        return _(i.accounts).some(function(a) {
          return (a != null) && a.index === index;
        });
      });
      accountOutputs = _(tx.outputs).filter(function(o) {
        return _(o.accounts).some(function(a) {
          return (a != null) && a.index === index;
        });
      });
      accountChangeOutputs = _(accountOutputs).filter(function(o) {
        return _(o.nodes).some(function(n) {
          return (n != null ? n[1] : void 0) === 1;
        });
      });
      if (accountOutputs.length === accountChangeOutputs.length) {
        inputValue = _(accountInputs).reduce((function(m, o) {
          return m.add(o.value);
        }), ledger.Amount.fromSatoshi(0));
        outputValue = _(accountOutputs).reduce((function(m, o) {
          return m.add(o.value);
        }), ledger.Amount.fromSatoshi(0));
        value = outputValue.subtract(inputValue);
      } else {
        hasOwnInputs = _(tx.inputs).filter(function(i) {
          return _(i.nodes).some(function(n) {
            return (n != null ? n[0] : void 0) === index;
          });
        }).length > 0;
        outputs = _(tx.outputs).filter(function(o) {
          return _(o.nodes).some(function(n) {
            return (!hasOwnInputs || (n != null ? n[1] : void 0) !== 1) && (n != null ? n[0] : void 0) === index;
          });
        });
        value = _(outputs).reduce((function(m, o) {
          return m.add(o.value);
        }), ledger.Amount.fromSatoshi(0));
      }
      return this._createOperationFromTransaction(uid, "reception", tx, value, account);
    };

    Operation._createOperationFromTransaction = function(uid, type, tx, value, account) {
      var block, er, i, input, inputs, o, operation, output, outputs, recipients, senders, transaction, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3;
      try {
        if (((_ref = tx['block']) != null ? _ref['hash'] : void 0) != null) {
          block = (_ref1 = Block.fromJson(tx['block'])) != null ? _ref1.save() : void 0;
        }
        transaction = Transaction.fromJson(tx).save();
        inputs = [];
        _ref2 = tx['inputs'];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          i = _ref2[_i];
          input = Input.fromJson(i).save();
          inputs.push(input.get('uid'));
        }
        transaction.set('inputs_uids', inputs);
        _ref3 = tx['ownOutputs'] || [];
        for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
          o = _ref3[_j];
          if (!_.isEmpty(o.paths)) {
            output = Output.fromJson(tx['hash'], o).save();
            transaction.add('outputs', output);
          }
        }
        transaction.save();
        if (block != null) {
          block.add('transactions', transaction).save();
        }
        tx.inputs = _(tx.inputs).filter(function(i) {
          return i.addresses != null;
        });
        outputs = tx.outputs.length > 100 ? tx.ownOutputs : tx.outputs;
        recipients = _(tx.outputs).chain().filter(function(o) {
          return (o.addresses != null) && !_(o.nodes).some(function(n) {
            return (n != null ? n[1] : void 0) === 1;
          });
        }).map(function(o) {
          return o.addresses;
        }).flatten().value();
        senders = _(tx.inputs).chain().map(function(i) {
          return i.addresses;
        }).flatten().value();
        if ((recipients != null ? recipients.length : void 0) === 0) {
          recipients = _(tx.outputs).chain().map(function(o) {
            return o.addresses;
          }).flatten().value();
        }
        operation = this.findOrCreate({
          uid: uid
        }).set('type', type).set('value', value.toString()).set('senders', senders).set('time', new Date(transaction.get('received_at')).getTime()).set('recipients', recipients).save();
        operation.set('account', account).set('transaction', transaction).save();
        return operation;
      } catch (_error) {
        er = _error;
        return e(er);
      }
    };

    Operation.prototype.serialize = function() {
      var json;
      json = Operation.__super__.serialize.apply(this, arguments);
      delete json['uid'];
      return json;
    };

    Operation.prototype.get = function(key) {
      var transaction;
      transaction = (function(_this) {
        return function() {
          if (transaction._tx != null) {
            transaction._tx;
          }
          return transaction._tx = _this.get('transaction');
        };
      })(this);
      switch (key) {
        case 'hash':
          return transaction().get('hash');
        case 'time':
          return transaction().get('received_at');
        case 'confirmations':
          return transaction().get('confirmations');
        case 'fees':
          return transaction().get('fees');
        case 'double_spent_priority':
          return transaction().get('double_spent_priority');
        case 'total_value':
          if (Operation.__super__.get.call(this, 'type') === 'sending') {
            return ledger.Amount.fromSatoshi(Operation.__super__.get.call(this, 'value')).add(transaction().get('fees'));
          } else {
            return Operation.__super__.get.call(this, 'value');
          }
          break;
        default:
          return Operation.__super__.get.call(this, key);
      }
    };

    Operation.all = function(context) {
      if (context == null) {
        context = ledger.database.contexts.main;
      }
      return this.find({}, context).sort(this.defaultSort).data();
    };

    Operation.getUnconfirmedOperations = function(context) {
      if (context == null) {
        context = ledger.database.contexts.main;
      }
      return this.find({
        confirmations: {
          $eq: 0
        }
      }, context).data();
    };

    Operation.defaultSort = function(a, b) {
      var d;
      d = b.time - a.time;
      if (d === 0) {
        if (a.type > b.type) {
          return 1;
        } else {
          return -1;
        }
      } else if (d > 0) {
        return 1;
      } else {
        return -1;
      }
    };

    return Operation;

  })(ledger.database.Model);

}).call(this);
