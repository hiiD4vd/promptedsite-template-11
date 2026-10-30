Class(function Render() {
  const _this = this,
    _render = [],
    _native = [],
    _drawFrame = [],
    _multipliers = [];
  let _renderIndex = null,
    _nativeIndex = null;
  var _last = performance.now(),
    _localTSL = 0,
    _elapsed = 0,
    _capLast = 0,
    _sampleRefreshRate = [],
    _firstSample = !1,
    _saveRefreshRate = 60,
    rAF = requestAnimationFrame,
    _refreshScale = 1,
    _canCap = 0,
    _screenHash = getScreenHash();
  function render(tsl) {
    if (_last >= tsl) return void (THREAD || _this.isPaused || rAF(render));
    if (_native.length) {
      let multiplier = 60 / _saveRefreshRate;
      for (_nativeIndex = _native.length - 1; _nativeIndex > -1; _nativeIndex--) {
        let callback = _native[_nativeIndex];
        try {
          callback(multiplier);
        } catch (error) {
          handleRenderCallbackError(callback, error);
        }
      }
      _nativeIndex = null;
    }
    if (_this.capFPS > 0 && ++_canCap > 31) {
      let delta = tsl - _capLast;
      if (((_capLast = tsl), (_elapsed += delta) < 1e3 / _this.capFPS))
        return void (THREAD || _this.isPaused || rAF(render));
      ((_this.REFRESH_RATE = _this.capFPS),
        (_this.HZ_MULTIPLIER = (60 / _this.REFRESH_RATE) * _refreshScale),
        (_elapsed = 0));
    }
    if (((_this.timeScaleUniform.value = 1), _multipliers.length))
      for (let i = 0; i < _multipliers.length; i++) {
        let obj = _multipliers[i];
        _this.timeScaleUniform.value *= obj.value;
      }
    ((_this.DT = tsl - _last), (_last = tsl));
    let delta = _this.DT * _this.timeScaleUniform.value;
    if (((delta = Math.min(200, delta)), _sampleRefreshRate && !_this.capFPS)) {
      let fps = 1e3 / _this.DT;
      if ((_sampleRefreshRate.push(fps), _sampleRefreshRate.length > 30)) {
        _sampleRefreshRate.sort((a, b) => a - b);
        let rate = _sampleRefreshRate[Math.round(_sampleRefreshRate.length / 2)];
        ((rate = _this.REFRESH_TABLE.reduce((prev, curr) =>
          Math.abs(curr - rate) < Math.abs(prev - rate) ? curr : prev,
        )),
          (_this.REFRESH_RATE = _saveRefreshRate =
            _firstSample ? Math.max(_this.REFRESH_RATE, rate) : rate),
          (_this.HZ_MULTIPLIER = (60 / _this.REFRESH_RATE) * _refreshScale),
          (_sampleRefreshRate = null),
          (_firstSample = !0));
      }
    }
    for (
      _this.TIME = tsl,
        _this.DELTA = delta,
        _this.startFrame && _this.startFrame(tsl, delta),
        _localTSL += delta,
        _renderIndex = _render.length - 1;
      _renderIndex >= 0;
      _renderIndex--
    ) {
      var callback = _render[_renderIndex];
      if (callback)
        try {
          if (callback.fps) {
            if (tsl - callback.last < 1e3 / callback.fps) continue;
            (callback(++callback.frame), (callback.last = tsl));
            continue;
          }
          callback(tsl, delta);
        } catch (error) {
          handleRenderCallbackError(callback, error);
        }
      else _render.splice(_renderIndex, 1);
    }
    _renderIndex = null;
    for (let i = _drawFrame.length - 1; i > -1; i--) _drawFrame[i](tsl, delta);
    (_this.drawFrame && _this.drawFrame(tsl, delta),
      _this.endFrame && _this.endFrame(tsl, delta),
      THREAD || _this.isPaused || rAF(render));
  }
  function handleRenderCallbackError(callback, error) {
    if (Hydra.LOCAL) throw error;
    let evt = { callback: callback, error: error, preventStopRender: !1 };
    (Events.emitter._fireEvent(_this.RENDER_CALLBACK_ERROR, evt),
      evt.preventStopRender || _this.stop(callback));
  }
  function getScreenHash() {
    return window.screen
      ? `${window.screen.width}x${window.screen.height}.${window.screen.pixelDepth}`
      : "none";
  }
  function checkMoveScreen() {
    var newScreen = getScreenHash();
    _screenHash !== newScreen &&
      ((_screenHash = newScreen), (_sampleRefreshRate = null), (_firstSample = !1));
  }
  ((this.timeScaleUniform = { value: 1, type: "f", ignoreUIL: !0 }),
    (this.REFRESH_TABLE = [30, 60, 72, 90, 100, 120, 144, 240]),
    (this.REFRESH_RATE = 60),
    (this.HZ_MULTIPLIER = 1),
    (this.RENDER_CALLBACK_ERROR = "render_callback_error"),
    (this.capFPS = null),
    THREAD ||
      (rAF(render),
      setInterval((_) => (_sampleRefreshRate = []), 3e3),
      setInterval(checkMoveScreen, 5e3)),
    (this.now = function () {
      return _localTSL;
    }),
    (this.setRefreshScale = function (scale) {
      ((_refreshScale = scale), (_sampleRefreshRate = []));
    }),
    (this.start = function (callback, fps, native) {
      (fps && ((callback.fps = fps), (callback.last = -1 / 0), (callback.frame = -1)),
        native
          ? ~_native.indexOf(callback) ||
            (_native.unshift(callback), null !== _nativeIndex && (_nativeIndex += 1))
          : ~_render.indexOf(callback) ||
            (_render.unshift(callback), null !== _renderIndex && (_renderIndex += 1)));
    }),
    (this.stop = function (callback) {
      let i = _render.indexOf(callback);
      (i >= 0 &&
        (_render.splice(i, 1), null !== _renderIndex && i < _renderIndex && (_renderIndex -= 1)),
        (i = _native.indexOf(callback)),
        i >= 0 &&
          (_native.splice(i, 1), null !== _nativeIndex && i < _nativeIndex && (_nativeIndex -= 1)));
    }),
    (this.tick = function () {
      THREAD && ((this.TIME = performance.now()), render(this.TIME));
    }),
    (this.forceRender = function (time) {
      ((this.TIME = time), render(this.TIME));
    }),
    (this.Worker = function (_callback, _budget = 4) {
      Inherit(this, Component);
      let _scope = this,
        _elapsed = 0;
      function loop() {
        if (!_scope.dead) {
          for (; _elapsed < _budget;) {
            if (_scope.dead || _scope.paused) return;
            const start = performance.now();
            (_callback && _callback(), (_elapsed += performance.now() - start));
          }
          _elapsed = 0;
        }
      }
      (this.startRender(loop),
        (this.stop = function () {
          ((this.dead = !0), this.stopRender(loop));
        }),
        (this.pause = function () {
          ((this.paused = !0), this.stopRender(loop));
        }),
        (this.resume = function () {
          ((this.paused = !1), this.startRender(loop));
        }),
        (this.setCallback = function (cb) {
          _callback = cb;
        }));
    }),
    (this.pause = function () {
      _this.isPaused = !0;
    }),
    (this.resume = function () {
      _this.isPaused && ((_this.isPaused = !1), rAF(render));
    }),
    (this.useRAF = function (raf) {
      ((_firstSample = null), (_last = performance.now()), (rAF = raf)(render));
    }),
    (this.onDrawFrame = function (cb) {
      _drawFrame.push(cb);
    }),
    (this.setTimeScale = function (v) {
      _this.timeScaleUniform.value = v;
    }),
    (this.getTimeScale = function () {
      return _this.timeScaleUniform.value;
    }),
    (this.createTimeMultiplier = function () {
      let obj = { value: 1 };
      return (_multipliers.push(obj), obj);
    }),
    (this.destroyTimeMultiplier = function (obj) {
      _multipliers.remove(obj);
    }),
    (this.tweenTimeScale = function (value, time, ease, delay) {
      return tween(_this.timeScaleUniform, { value: value }, time, ease, delay, null, null, !0);
    }),
    Object.defineProperty(_this, "FRAME_HZ_MULTIPLIER", {
      get: () => (60 / (1e3 / _this.DELTA)) * _refreshScale,
      enumerable: !0,
    }));
}, "Static");
