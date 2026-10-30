Class(function FireDBFirestore(_database) {
  Inherit(this, Component);
  var _collection;
  function Query() {
    const qthis = this,
      _config = {};
    ((this.where = function (field, operator, value) {
      return ((_config.where = { field: field, operator: operator, value: value }), qthis);
    }),
      (this.limit = function (limit) {
        return ((_config.limit = limit), qthis);
      }),
      (this.orderBy = function (field, direction) {
        return ((_config.orderBy = { field: field, direction: direction }), qthis);
      }),
      (this.get = async function () {
        let query = _collection;
        (_config.where &&
          (query = query.where(_config.where.field, _config.where.operator, _config.where.value)),
          _config.limit && (query = query.limit(_config.limit)),
          _config.orderBy &&
            (query = query.orderBy(_config.orderBy.field, _config.orderBy.direction)));
        let doc = await query.get();
        return !doc || doc.empty
          ? []
          : [
              ...doc.docs.map((d) => {
                const data = d.data();
                return ((data.__id = d.id), data);
              }),
            ];
      }));
  }
  ((this.collection = function (name) {
    return ((_collection = _database.collection(name)), this);
  }),
    (this.add = function (data) {
      return _collection.add(data);
    }),
    (this.remove = function (id) {
      return ("object" == typeof id && (id = data.__id), _collection.doc(id).delete());
    }),
    (this.set = function (id, data) {
      return (
        "object" == typeof id && ((id = (data = id).__id), delete data.__id),
        data.__id && delete data.__id,
        _collection.doc(id).set(data)
      );
    }),
    (this.get = async function (id) {
      "object" == typeof id && (id = data.__id);
      const doc = await _collection.doc(id).get();
      if (!doc || !doc.exists) return null;
      const data = doc.data();
      return ((data.__id = doc.id), data);
    }),
    (this.update = function (id, data) {
      return (
        "object" == typeof id && ((id = (data = id).__id), delete data.__id),
        _collection.doc(id).update(data)
      );
    }),
    (this.bindChange = function (id, callback) {
      return (
        "object" == typeof id && (id = data.__id),
        _collection.doc(id).onSnapshot((doc) => {
          const data = doc.data();
          ((data.__id = doc.id), callback(data));
        })
      );
    }),
    (this.bindAdd = function (callback) {
      return _collection.onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if ("added" === change.type) {
            const data = change.doc.data();
            ((data.__id = change.doc.id), callback(data));
          }
        });
      });
    }),
    (this.bindRemove = function (callback) {
      return _collection.onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if ("removed" === change.type) {
            const data = change.doc.data();
            ((data.__id = change.doc.id), callback(data));
          }
        });
      });
    }),
    (this.query = function () {
      return new Query();
    }));
});
