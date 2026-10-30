Class(function FireDBFirebase(_database) {
  Inherit(this, Component);
  var _key;
  ((this.bindChange = function (key, callback) {
    (void 0 === callback && ((callback = key), (key = _key)),
      _database.ref(key).on("value", (snapshot) => {
        let obj = snapshot.val();
        (obj && (obj.__id = snapshot.key), callback(obj));
      }));
  }),
    (this.bindAdd = function (key, callback) {
      (void 0 === callback && ((callback = key), (key = _key)),
        _database.ref(key).on("child_added", (snapshot) => {
          let obj = snapshot.val();
          (obj && (obj.__id = snapshot.key), callback(obj));
        }));
    }),
    (this.bindRemove = function (key, callback) {
      (void 0 === callback && ((callback = key), (key = _key)),
        _database.ref(key).on("child_removed", (snapshot) => {
          let obj = snapshot.val();
          (obj && (obj.__id = snapshot.key), callback(obj));
        }));
    }),
    (this.update = function (key, value) {
      return (void 0 === value && ((value = key), (key = _key)), _database.ref(key).update(value));
    }),
    (this.push = this.add =
      function (key, value) {
        return (void 0 === value && ((value = key), (key = _key)), _database.ref(key).push(value));
      }),
    (this.remove = function (key, value) {
      return (
        void 0 === value && ((value = key), (key = _key)),
        value.__id && (value = value.__id),
        _database.ref(`${key}/${value}`).remove()
      );
    }),
    (this.read = function (key = _key) {
      return _database
        .ref(key)
        .once("value")
        .then((snapshot) => snapshot.val());
    }),
    (this.orderBy = function (key, orderBy, limitTo = null) {
      void 0 === orderBy
        ? ((orderBy = null), (key = _key))
        : void 0 === limitTo && "string" != typeof orderBy && "object" != typeof orderBy
          ? ((limitTo = null), (key = orderBy = null))
          : void 0 === limitTo && ((limitTo = null), (key = _key));
      let query = _database.ref(key);
      return (
        "string" == typeof orderBy
          ? (query = query.orderByChild(orderBy))
          : "key" === orderBy
            ? (query = query.orderByKey())
            : "value" === orderBy
              ? (query = query.orderByValue())
              : "object" == typeof orderBy &&
                null !== orderBy &&
                "priority" in orderBy &&
                (query = query.orderByPriority()),
        null !== limitTo &&
          ("number" == typeof limitTo
            ? (query = query.limitToFirst(limitTo))
            : "object" == typeof limitTo &&
              ("first" in limitTo
                ? (query = query.limitToFirst(limitTo.first))
                : "last" in limitTo && (query = query.limitToLast(limitTo.last)))),
        query.once("value").then((snapshot) => {
          const results = [];
          return (
            snapshot.forEach((childSnapshot) => {
              let childObj = childSnapshot.val();
              ((childObj.__id = childSnapshot.key), results.push(childObj));
            }),
            results
          );
        })
      );
    }),
    (this.key = function (key) {
      return ((_key = key), this);
    }));
});
