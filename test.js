var Cache = require('./index.js');

describe ('index', function () {
    var db = 'fooDB';
    var store = {name: 'barStore'};
    var keyStore = {name: 'storeWithKey', keyPath : 'id'};

    beforeEach(function () {
        this.cache = new Cache();
        this.cache.init(db, [store, keyStore]);
    });

    it ( 'should delete', function (done) {
        var _this = this;

        this.cache.put(store.name, {sap : 'dap', fap : 'bap'}, function (key) {
            var putKey = key;
            _this.cache.delete(store.name, putKey, function (res) {

                _this.cache.findOne(store.name, putKey, function (res) {
                    expect(res).to.be.undefined;
                    done();
                });
            })
        })
    });

    it ('should put an object in the store', function (done) {
        var _this = this;

        this.cache.put(store.name, {sap : 'dap'}, function (key) {
            _this.cache.find(store.name, function (res) {
                expect(res[0].value.sap).to.equal('dap');
                done();
            })
        })
    });

    it ( 'should retrieve one object from the store', function (done) {
        var _this = this;
        this.cache.put(keyStore.name, {fooer : 'barers', id : '1337'}, function () {
            _this.cache.findOne(keyStore.name, '1337', function (res) {
                expect(res.fooer).to.equal('barers')
                done();
            });
        });
    })
})
