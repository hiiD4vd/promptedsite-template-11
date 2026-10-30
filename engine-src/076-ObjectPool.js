Class(function ObjectPool(_type, _number = 10) {
  var _pool = [];
  ((this.array = _pool),
    (function () {
      if (_type) for (var i = 0; i < _number; i++) _pool.push(new _type());
    })(),
    (this.get = function () {
      return _pool.shift() || (_type ? new _type() : null);
    }),
    (this.empty = function () {
      _pool.length = 0;
    }),
    (this.put = function (obj) {
      obj && !_pool.includes(obj) && _pool.push(obj);
    }),
    (this.insert = function (array) {
      void 0 === array.push && (array = [array]);
      for (var i = 0; i < array.length; i++) this.put(array[i]);
    }),
    (this.length = function () {
      return _pool.length;
    }),
    (this.randomize = function () {
      let array = _pool;
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }),
    (this.destroy = function () {
      for (let i = _pool.length - 1; i >= 0; i--) _pool[i].destroy && _pool[i].destroy();
      return (_pool = null);
    }));
});
