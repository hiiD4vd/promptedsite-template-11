Class(function Gate() {
  var _list = [],
    _map = {};
  ((this.create = function (name) {
    let promise = Promise.create();
    name ? (_map[name] = promise) : _list.push(promise);
  }),
    (this.open = function (name) {
      name && (_map[name] || (_map[name] = Promise.create()), _map[name].resolve());
      let promise = _list.shift();
      promise && promise.resolve();
    }),
    (this.wait = function (name) {
      return _list.length || name
        ? name
          ? (_map[name] || (_map[name] = Promise.create()), _map[name])
          : _list[_list.length - 1] || Promise.resolve()
        : Promise.resolve();
    }));
}, "static");
