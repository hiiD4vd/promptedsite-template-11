Class(function Timer() {
  const _this = this,
    _callbacks = [],
    _discard = [];
  var _defer = [],
    _nextDefer = [],
    _deferNextTicks = [];
  function loop(t, delta) {
    for (let i = _discard.length - 1; i >= 0; i--) {
      let obj = _discard[i];
      ((obj.callback = null), _callbacks.remove(obj));
    }
    _discard.length && (_discard.length = 0);
    let deferQueue = _nextDefer;
    [_defer, _nextDefer] = [_nextDefer, _defer];
    for (let i = _callbacks.length - 1; i >= 0; i--) {
      let obj = _callbacks[i];
      obj
        ? obj.paused ||
          (obj.scaledTime ? (obj.current += delta) : (obj.current += Render.DT),
          obj.current >= obj.time && (obj.callback && obj.callback(), _discard.push(obj)))
        : _callbacks.remove(obj);
    }
    for (let i = deferQueue.length - 1; i > -1; i--) deferQueue[i]();
    deferQueue.length = 0;
  }
  function find(ref) {
    for (let i = _callbacks.length - 1; i > -1; i--)
      if (_callbacks[i].ref == ref) return _callbacks[i];
  }
  function handleDeferNextTick(e) {
    if (
      null != e &&
      e.source === window &&
      "_hydraDeferNextTick" === e.data &&
      (e.stopPropagation(), _deferNextTicks.length > 0)
    ) {
      _deferNextTicks.shift()();
    }
  }
  (Render.start(loop),
    window.addEventListener("message", handleDeferNextTick, !0),
    (this.__clearTimeout = function (ref) {
      const obj = find(ref);
      return !!obj && ((obj.callback = null), _callbacks.remove(obj), !0);
    }),
    (this.create = function (callback, time, scaledTime) {
      if (window._NODE_) return setTimeout(callback, time);
      const obj = {
        time: Math.max(1, time || 1),
        current: 0,
        ref: Utils.timestamp(),
        callback: callback,
        scaledTime: scaledTime,
      };
      return (_callbacks.unshift(obj), obj.ref);
    }),
    (this.delayedCall = function (time) {
      let promise = Promise.create();
      return (_this.create(promise.resolve, time), promise);
    }),
    (window.defer = this.defer =
      function (callback) {
        let promise;
        return (
          callback || ((promise = Promise.create()), (callback = promise.resolve)),
          _nextDefer.unshift(callback),
          promise
        );
      }),
    (window.deferNextTick = this.deferNextTick =
      function (callback) {
        let promise;
        return (
          callback || ((promise = Promise.create()), (callback = promise.resolve)),
          _deferNextTicks.push(callback),
          (callback.time = performance.now()),
          window.postMessage("_hydraDeferNextTick", window.location.origin),
          promise
        );
      }),
    (this.pause = function (ref) {
      const obj = find(ref);
      return !!obj && ((obj.paused = !0), !0);
    }),
    (this.resume = function (ref) {
      const obj = find(ref);
      return !!obj && ((obj.paused = !1), !0);
    }),
    (this.isPending = function (ref) {
      return !!find(ref);
    }));
}, "static");
