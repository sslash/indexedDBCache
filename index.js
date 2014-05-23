(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.IndexDBCache = factory();
    }
}(this, function () {


    var IndexDBCache = function (opts) {
        opts = opts || {};
        this.version = opts.version || 1;

        this._initStores = function (db, stores) {
            stores.forEach(function(store) {
                var opts = store.keyPath ? {keyPath : store.keyPath} : {};

                 if (!opts.keyPath) {

                     // generates keys, starting at 1
                     opts.autoIncrement = true
                 };

                var store = db.createObjectStore(store.name, opts);
            });
        };


        this.init = function (dbName, stores) {
            var hasIDB = typeof window.indexedDB != 'undefined';
            if (!hasIDB) { throw new Error('Your browser does not support IndexDB'); }
            if (!dbName) { throw new Error('DB must have a dbName'); }

            this.dbName = dbName;
            var idb = indexedDB.open(this.dbName, this.version);

            idb.onupgradeneeded = function(e) {
                if ( e.oldVersion < 1 ) {
                    this._initStores(idb.result, stores || []);
                }
            }.bind(this)
        };


        this.put = function (store, obj, next) {

            var idb = indexedDB.open(this.dbName, this.version);

            idb.onsuccess = function(evt) {
                idb.result.transaction([store], 'readwrite')
                .objectStore(store)
                .put(obj)
                .onsuccess = function(event) {
                    if (next) { next(event.target.result); }
                };
            }
        };


        this.find = function (store, next) {
            var idb = indexedDB.open(this.dbName, this.version);

            idb.onsuccess = function(evt) {
                var items = [];

                 idb.result.transaction([store], 'readwrite')
                .objectStore(store)
                .openCursor(IDBKeyRange.lowerBound(0), 'next')
                .onsuccess = function (event) {
                    var cursor = event.target.result;
                    if (cursor) {
                        items.push({key: cursor.key, value : cursor.value});
                        cursor.continue();
                    } else {
                        if ( next ) { next(items); }
                    }
                }
            }
        };

        this.findOne = function (store, key, next) {
            var idb = indexedDB.open(this.dbName, this.version);
            idb.onsuccess = function (evt) {
                idb.result.transaction([store], 'readonly')
                .objectStore(store)
                .get(key)
                .onsuccess = function (evt) {
                    if ( next ) { next(evt.target.result); }
                }
            }
        };

        this.delete = function (store, key, next) {

            var idb = indexedDB.open(this.dbName, this.version);
            idb.onsuccess = function (evt) {
                idb.result.transaction([store], 'readwrite')
                .objectStore(store)
                .delete(key)
                .onsuccess = function (evt) {
                    if ( next ) { next(evt); }
                }
            }
        }
    };

    return IndexDBCache;
}));
