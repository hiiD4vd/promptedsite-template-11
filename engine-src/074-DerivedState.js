Class(function DerivedState() {
  Inherit(this, Component);
  const _this = this;
  var _cb,
    _map = {};
  function update() {
    let truthy = !0;
    for (let key in _map) _map[key] || (truthy = !1);
    _cb?.(truthy);
  }
  ((this.bind = function (callback) {
    ((_cb = callback), update());
  }),
    (this.isTruthy = function () {
      let truthy = !0;
      for (let key in _map) _map[key] || (truthy = !1);
      return truthy;
    }),
    (this.truthy = function (state, key, validator) {
      function test(val) {
        ((_map[key] =
          null != validator
            ? "function" == typeof validator
              ? validator(val)
              : validator && !!val
            : !!val),
          update());
      }
      ("string" == typeof state && ((validator = key), (key = state), (state = null)),
        key.includes("/") || state || (key = _this.parent.fragName + "/" + key),
        (_map[key] = !1),
        (state = state || AppState),
        test(),
        _this.bindState(state, key, test));
    }),
    (this.eq = function (state, key, statement) {
      function test(val) {
        ((_map[key] = statement == val), update());
      }
      ("string" == typeof state && ((statement = key), (key = state), (state = null)),
        key.includes("/") || state || (key = _this.parent.fragName + "/" + key),
        (_map[key] = !1),
        (state = state || AppState),
        test(),
        _this.bindState(state, key, test));
    }),
    (this.neq = function (state, key, statement) {
      function test(val) {
        ((_map[key] = statement != val), update());
      }
      ("string" == typeof state && ((statement = key), (key = state), (state = null)),
        key.includes("/") || state || (key = _this.parent.fragName + "/" + key),
        (_map[key] = !1),
        (state = state || AppState),
        _this.bindState(state, key, test),
        test());
    }));
});
