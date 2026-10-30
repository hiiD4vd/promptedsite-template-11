Class(function FrameTween(_object, _props, _time, _ease, _delay, _callback, _manual) {
  var _endValues,
    _transformEnd,
    _transformStart,
    _startValues,
    _isTransform,
    _isCSS,
    _transformProps,
    _cssTween,
    _transformTween,
    _start,
    _update,
    _this = this;
  function copy(obj) {
    let newObj = {};
    for (let key in obj) "number" == typeof obj[key] && (newObj[key] = obj[key]);
    return newObj;
  }
  function clear() {
    (_object._cssTweens && _object._cssTweens.remove(_this),
      (_this.playing = !1),
      (_object._cssTween = null),
      (_object = _props = null));
  }
  function update() {
    if (
      !(function killed() {
        return _this.kill || !_object || !_object.div || !_object.css;
      })()
    ) {
      if ((_isCSS && _object.css(_props), _isTransform))
        if (_object.multiTween) {
          for (var key in _transformProps)
            "number" == typeof _transformProps[key] && (_object[key] = _transformProps[key]);
          _object.transform();
        } else _object.transform(_transformProps);
      (_start && (_start(), (_start = null)), _update && _update());
    }
  }
  function tweenComplete() {
    _this.playing &&
      (clear(), _callback && _callback(), _this.completePromise && _this.completePromise.resolve());
  }
  ((this.playing = !0),
    (_this.object = _object),
    (_this.props = _props),
    (_this.time = _time),
    (_this.ease = _ease),
    (_this.delay = _delay),
    defer(function () {
      if (_this.overrideValues) {
        let values = _this.overrideValues(_this, _object, _props, _time, _ease, _delay);
        values &&
          ((_this.props = _props = values.props || _props),
          (_this.time = _time = values.time || _time),
          (_this.ease = _ease = values.ease || _ease),
          (_this.delay = _delay = values.delay || _delay));
      }
      if (("object" == typeof _ease && (_ease = "easeOutCubic"), _object && _props)) {
        if (((_this.object = _object), "number" != typeof _time))
          throw "FrameTween Requires object, props, time, ease";
        (!(function initValues() {
          _props.math && delete _props.math;
          Device.tween.transition &&
            _object.div &&
            _object.div._transition &&
            ((_object.div.style[HydraCSS.styles.vendorTransition] = ""),
            (_object.div._transition = !1));
          ((_this.time = _time),
            (_this.delay = _delay),
            (_endValues = {}),
            (_transformEnd = {}),
            (_transformStart = {}),
            (_startValues = {}),
            _object.multiTween ||
              (void 0 === _props.x && (_props.x = _object.x),
              void 0 === _props.y && (_props.y = _object.y),
              void 0 === _props.z && (_props.z = _object.z)));
          for (var key in _props)
            if (key.includes(["damping", "spring"]))
              ((_endValues[key] = _props[key]), (_transformEnd[key] = _props[key]));
            else if (TweenManager._isTransform(key))
              ((_isTransform = !0),
                (_transformStart[key] = _object[key] ?? ("scale" == key ? 1 : 0)),
                (_transformEnd[key] = _props[key]));
            else {
              _isCSS = !0;
              var v = _props[key];
              "string" == typeof v
                ? (_object.div.style[key] = v)
                : "number" == typeof v &&
                  ((_startValues[key] = _object.css ? Number(_object.css(key)) : 0),
                  (_endValues[key] = v));
            }
        })(),
          (function startTween() {
            !_object._cssTween || _manual || _object.multiTween || (_object._cssTween.kill = !0);
            ((_this.time = _time),
              (_this.delay = _delay),
              _object.multiTween &&
                (_object._cssTweens || (_object._cssTweens = []), _object._cssTweens.push(_this)));
            ((_object._cssTween = _this),
              (_this.playing = !0),
              (_props = copy(_startValues)),
              (_transformProps = copy(_transformStart)),
              _isCSS &&
                (_cssTween = tween(_props, _endValues, _time, _ease, _delay, null, _manual)
                  .onUpdate(update)
                  .onComplete(tweenComplete)));
            _isTransform &&
              (_transformTween = tween(
                _transformProps,
                _transformEnd,
                _time,
                _ease,
                _delay,
                null,
                _manual,
              )
                .onComplete(_isCSS ? null : tweenComplete)
                .onUpdate(_isCSS ? null : update));
          })());
      }
    }),
    (this.stop = function () {
      this.playing &&
        (_cssTween && _cssTween.stop && _cssTween.stop(),
        _transformTween && _transformTween.stop && _transformTween.stop(),
        clear());
    }),
    (this.interpolate = function (elapsed) {
      (_cssTween && _cssTween.interpolate(elapsed),
        _transformTween && _transformTween.interpolate(elapsed),
        update());
    }),
    (this.getValues = function () {
      return {
        start: _startValues,
        transformStart: _transformStart,
        end: _endValues,
        transformEnd: _transformEnd,
      };
    }),
    (this.setEase = function (ease) {
      (_cssTween && _cssTween.setEase(ease), _transformTween && _transformTween.setEase(ease));
    }),
    (this.onStart = function (callback) {
      return ((_start = callback), this);
    }),
    (this.onUpdate = function (callback) {
      return ((_update = callback), this);
    }),
    (this.onComplete = function (callback) {
      return ((_callback = callback), this);
    }),
    (this.promise = function () {
      return (
        _this.completePromise || (_this.completePromise = Promise.create()),
        _this.completePromise
      );
    }));
});
