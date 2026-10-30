Class(function MathTween(_object, _props, _time, _ease, _delay, _callback, _manual, _scaledTime) {
  var _startTime,
    _startValues,
    _endValues,
    _easeFunction,
    _paused,
    _newEase,
    _spring,
    _damping,
    _start,
    _update,
    _currentTime,
    _this = this,
    _elapsed = 0;
  function clear() {
    if (!_object && !_props) return !1;
    ((_object._mathTween = null),
      TweenManager._removeMathTween(_this),
      Utils.nullObject(_this),
      _object._mathTweens && _object._mathTweens.remove(_this._tweenWrapper));
  }
  ((_this.object = _object),
    (_this.props = _props),
    (_this.time = _time),
    (_this.ease = _ease),
    (_this.delay = _delay),
    defer(function () {
      if (!_this.stopped) {
        if (_this.overrideValues) {
          let values = _this.overrideValues(_this, _object, _props, _time, _ease, _delay);
          values &&
            ((_this.props = _props = values.props || _props),
            (_this.time = _time = values.time || _time),
            (_this.ease = _ease = values.ease || _ease),
            (_this.delay = _delay = values.delay || _delay));
        }
        if (_object && _props) {
          if (((_this.object = _object), "number" != typeof _time))
            throw "MathTween Requires object, props, time, ease";
          !(function start() {
            _object.multiTween ||
              !_object._mathTween ||
              _manual ||
              TweenManager.clearTween(_object);
            _manual || TweenManager._addMathTween(_this);
            ((_this.time = _time), (_this.delay = _delay));
            let propString = (function getPropString() {
              let string = "";
              for (let key in _props) "number" == typeof _props[key] && (string += key + " ");
              return string;
            })();
            ((_object._mathTween = _this),
              _object.multiTween &&
                (_object._mathTweens || (_object._mathTweens = []),
                _object._mathTweens.forEach((t) => {
                  t.props == propString && t.tween.stop();
                }),
                (_this._tweenWrapper = { props: propString, tween: _this }),
                _object._mathTweens.push(_this._tweenWrapper)));
            _ease || (_ease = "linear");
            "string" == typeof _ease &&
              ((_ease = TweenManager.Interpolation.convertEase(_ease)),
              (_easeFunction = "function" == typeof _ease));
            ((_startTime = _scaledTime ? Render.now() : performance.now()),
              (_currentTime = _startTime),
              (_startTime += _delay),
              (_endValues = _props),
              (_startValues = {}),
              _props.spring && (_spring = _props.spring));
            _props.damping && (_damping = _props.damping);
            for (var prop in ((_this.startValues = _startValues), _endValues))
              "number" == typeof _object[prop] && (_startValues[prop] = _object[prop]);
          })();
        }
      }
    }),
    (this.update = function (dt) {
      if (_paused) return;
      if ((_currentTime += _scaledTime ? dt : Render.DT) < _startTime) return;
      _elapsed = (_elapsed = (_currentTime - _startTime) / _time) > 1 ? 1 : _elapsed;
      let delta = this.interpolate(_elapsed);
      (_start && (_start(delta), (_start = null)),
        _update && _update(delta),
        1 == _elapsed &&
          (_callback && _callback(),
          _this.completePromise && _this.completePromise.resolve(),
          clear()));
    }),
    (this.pause = function () {
      _paused = !0;
    }),
    (this.resume = function () {
      _paused = !1;
    }),
    (this.stop = function () {
      return ((_this.stopped = !0), clear(), null);
    }),
    (this.setEase = function (ease) {
      _newEase != ease &&
        ((_newEase = ease),
        (_ease = TweenManager.Interpolation.convertEase(ease)),
        (_easeFunction = "function" == typeof _ease));
    }),
    (this.getValues = function () {
      return { start: _startValues, end: _endValues };
    }),
    (this.interpolate = function (elapsed) {
      var delta = _easeFunction
        ? _ease(elapsed, _spring, _damping)
        : TweenManager.Interpolation.solve(_ease, elapsed);
      for (var prop in _startValues)
        if ("number" == typeof _startValues[prop] && "number" == typeof _endValues[prop]) {
          var start = _startValues[prop],
            end = _endValues[prop];
          _object[prop] = start + (end - start) * delta;
        }
      return delta;
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
    }),
    (this.setElapsed = function (elapsed) {
      ((_startTime = performance.now()), (_currentTime = _startTime + _time * elapsed));
    }),
    Object.defineProperty(_this, "scaledTime", {
      get: () => _scaledTime,
      set(scaledTime) {
        if (
          !!_scaledTime !== (scaledTime = !!scaledTime) &&
          ((_scaledTime = scaledTime), 0 === _elapsed)
        ) {
          let alreadyDelayed = (_scaledTime ? performance.now() : Render.now()) - _startTime;
          ((_startTime = _scaledTime ? Render.now() : performance.now()),
            (_currentTime = _startTime -= alreadyDelayed),
            (_startTime += _delay));
        }
      },
    }));
});
