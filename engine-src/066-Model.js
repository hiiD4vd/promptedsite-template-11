Class(function Model() {
  (Inherit(this, Component), Namespace(this));
  const _this = this,
    _storage = {},
    _requests = {};
  let _data = 0,
    _triggered = 0;
  ((this.push = function (name, val) {
    _storage[name] = val;
  }),
    (this.pull = function (name) {
      return _storage[name];
    }),
    (this.waitForData = this.promiseData =
      function (num = 1) {
        _data += num;
      }),
    (this.fulfillData = this.resolveData =
      function () {
        (_triggered++, _triggered == _data && (_this.dataReady = !0));
      }),
    (this.ready = function (callback) {
      let promise = Promise.create();
      return (
        callback && promise.then(callback),
        _this.wait(_this, "dataReady").then(promise.resolve),
        promise
      );
    }),
    (this.initWithData = function (data) {
      for (var key in ((_this.STATIC_DATA = data), _this)) {
        var model = _this[key],
          init = !1;
        for (var i in data)
          i.toLowerCase().replace(/-/g, "") == key.toLowerCase() &&
            ((init = !0), model.init && model.init(data[i]));
        !init && model.init && model.init();
      }
      _this.init && _this.init(data);
    }),
    (this.loadData = function (url, callback) {
      let promise = Promise.create();
      callback || (callback = promise.resolve);
      var _this = this;
      return (
        get(url + "?" + Utils.timestamp()).then((d) => {
          defer(() => {
            (_this.initWithData(d), callback(d));
          });
        }),
        promise
      );
    }),
    (this.handleRequest = function (type, callback) {
      _requests[type] = callback;
    }),
    (this.makeRequest = this.request =
      async function (type, data, mockData = {}) {
        if (
          ("function" == typeof type && ((mockData = type), (data = null), (type = null)),
          "function" == typeof data && ((mockData = data), (data = null)),
          "function" == typeof mockData && (mockData = await mockData()),
          mockData?.reflow)
        )
          return mockData;
        if (!_requests[type])
          return Array.isArray(mockData)
            ? new StateArray(mockData)
            : AppState.createLocal(mockData);
        let result = await _requests[type](data, mockData);
        if (
          (Array.isArray(result)
            ? (result = new StateArray(result))
            : "object" == typeof result &&
              (result instanceof StateArray ||
                result.isAppState ||
                (result = AppState.createLocal(result))),
          !(result instanceof StateArray || result.createLocal))
        )
          throw `makeRequest ${type} must return either an AppState or StateArray`;
        return result;
      }));
});
