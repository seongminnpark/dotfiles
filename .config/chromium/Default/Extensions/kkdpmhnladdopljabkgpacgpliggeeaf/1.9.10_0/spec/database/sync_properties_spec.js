(function() {
  var __slice = [].slice;

  describe('Database synchronized properties', function() {
    var context, db, store, sync;
    store = null;
    sync = null;
    db = null;
    context = null;
    beforeEach(function(done) {
      store = new ledger.storage.MemoryStore("local");
      sync = new ledger.storage.MemoryStore("sync");
      db = new ledger.database.Database('specs', store);
      return db.load(function() {
        context = new ledger.database.contexts.Context(db, sync);
        return done();
      });
    });
    it('updates existing objects', function(done) {
      var onDbSaved;
      onDbSaved = _.after(2, _.once(function() {
        l("Update called");
        return sync.substore('sync_account_0').set({
          index: 0,
          name: "My Sync Spec Account"
        }, function() {
          sync.emit('pulled');
          return context.on('update:account', function() {
            var account;
            account = Account.find({
              index: 0
            }, context).data()[0];
            expect(account.get('name')).toBe("My Sync Spec Account");
            return done();
          });
        });
      }));
      context.on('insert:account', onDbSaved);
      sync.on('set', onDbSaved);
      return Account.create({
        index: 0,
        name: "My Spec Account"
      }, context).save();
    });
    it('creates missing objects', function(done) {
      return sync.substore('sync_account_0').set({
        index: 0,
        name: "My Sync Spec Account"
      }, function() {
        sync.emit('pulled');
        return context.on('insert:account', function() {
          var account;
          account = Account.find({
            index: 0
          }, context).data()[0];
          expect(account.get('name')).toBe("My Sync Spec Account");
          return done();
        });
      });
    });
    it('creates data on sync store when an object is inserted', function(done) {
      sync.on('set', function(ev, items) {
        expect(JSON.parse(items['sync.__sync_account_0_index'])).toBe(0);
        expect(JSON.parse(items['sync.__sync_account_0_name'])).toBe("My Greatest Account");
        return done();
      });
      return Account.create({
        index: 0,
        name: "My Greatest Account"
      }, context).save();
    });
    it('updates sync store when an object is saved', function(done) {
      sync.once('set', function(ev, items) {
        Account.findById(0, context).set('name', "My Whatever Account").save();
        return sync.once('set', function(ev, items) {
          expect(JSON.parse(items['sync.__sync_account_0_index'])).toBe(0);
          expect(JSON.parse(items['sync.__sync_account_0_name'])).toBe("My Whatever Account");
          return done();
        });
      });
      return Account.create({
        index: 0,
        name: "My Greatest Account"
      }, context).save();
    });
    it('deletes data from sync store when an object is deleted', function(done) {
      var onDbSaved;
      onDbSaved = _.after(2, _.once(function() {
        Account.findById(0, context)["delete"]();
        return sync.on('remove', function() {
          var ev, items;
          ev = arguments[0], items = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
          expect(items).toContain('sync.__sync_account_0_index');
          expect(items).toContain('sync.__sync_account_0_name');
          return done();
        });
      }));
      context.on('insert:account', onDbSaved);
      sync.on('set', onDbSaved);
      return Account.create({
        index: 0,
        name: "My Greatest Account"
      }, context).save();
    });
    it('pushes sync relations', function(done) {
      var account, afterSave;
      afterSave = function() {
        return sync.getAll(function(data) {
          var accountTagId;
          expect(data['__sync_account_0_name']).toBe('My tagged account');
          accountTagId = data['__sync_account_0_account_tag_id'];
          expect(accountTagId).not.toBeUndefined();
          expect(data["__sync_account_tag_" + accountTagId + "_name"]).toBe("My accounted tag");
          expect(data["__sync_account_tag_" + accountTagId + "_color"]).toBe("#FF0000");
          return done();
        });
      };
      sync.on('set', _.debounce(afterSave, 50));
      account = Account.create({
        index: 0,
        name: "My tagged account"
      }, context).save();
      return account.set('account_tag', AccountTag.create({
        name: "My accounted tag",
        color: "#FF0000"
      }, context).save()).save();
    });
    it('restores relationships when data database is empty', function(done) {
      return sync.set({
        __sync_account_0_name: "My poor account",
        __sync_account_0_index: 1,
        __sync_account_0_account_tag_id: "auniqueid",
        __sync_account_tag_auniqueid_uid: 'auniqueid',
        __sync_account_tag_auniqueid_name: 'My Rich Tag',
        __sync_account_tag_auniqueid_color: "#FF0000"
      }, function() {
        var afterSave;
        afterSave = _.after(2, _.once(function() {
          expect(Account.findById(1, context).get('account_tag').get('name')).toBe('My Rich Tag');
          expect(Account.findById(1, context).get('account_tag').get('color')).toBe("#FF0000");
          expect(Account.findById(1, context).get('name')).toBe("My poor account");
          return done();
        }));
        context.on('insert:account insert:account_tag', afterSave);
        return sync.emit('pulled');
      });
    });
    return it('deletes relationships', function(done) {
      var afterSave;
      Account.create({
        index: 0,
        name: 'Account 0'
      }, context).save();
      Account.create({
        index: 1,
        name: 'Account 1'
      }, context).save();
      Account.findById(0, context).set('account_tag', AccountTag.create({
        name: 'AccountTag'
      }, context).save()).save();
      afterSave = function() {
        return sync.clear(function() {
          return sync.set({
            __sync_account_1_index: 1,
            __sync_account_1_name: 'Account 1'
          }, function() {
            sync.emit('pulled');
            return _.delay(function() {
              expect(Account.all(context).length).toBe(1);
              expect(AccountTag.all(context).length).toBe(0);
              expect(Account.findById(1, context)).not.toBeUndefined();
              expect(Account.findById(1, context).get('name')).toBe('Account 1');
              return done();
            }, 50);
          });
        });
      };
      return sync.once('set', function() {
        return _.delay(afterSave, 50);
      });
    });
  });

}).call(this);
