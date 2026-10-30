Class(function CSSTransition(_object, _props, _time, _ease, _delay, _callback) {
  const _this = this;
  let _transformProps,
    _transitionProps,
    _clear = _props.clear;
  function killed() {
    return !_this || _this.kill || !_object || !_object.div;
  }
  (delete _props.clear,
    (this.playing = !0),
    (function () {
      if ("number" != typeof _time) throw "CSSTween Requires object, props, time, ease";
      (!(function initProperties() {
        var transform = TweenManager._getAllTransforms(_object),
          properties = [];
        for (var key in _props)
          TweenManager._isTransform(key)
            ? ((transform.use = !0), (transform[key] = _props[key]), delete _props[key])
            : properties.push(key);
        transform.use && (properties.push(HydraCSS.transformProperty), delete transform.use);
        (properties.forEach((prop, index) => {
          prop.match(/[A-Z]/) &&
            (properties[index] = prop.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase());
        }),
          (_transformProps = transform),
          (_transitionProps = properties));
      })(),
        (async function initCSSTween(values) {
          if (killed()) return;
          _object._cssTween && (_object._cssTween.kill = !0);
          ((_object._cssTween = _this), (_object.div._transition = !0));
          var strings = (function buildStrings(time, ease, delay) {
            for (var props = "", str = "", len = _transitionProps.length, i = 0; i < len; i++) {
              var transitionProp = _transitionProps[i];
              ((props += (props.length ? ", " : "") + transitionProp),
                (str +=
                  (str.length ? ", " : "") +
                  transitionProp +
                  " " +
                  time +
                  "ms " +
                  TweenManager._getEase(ease) +
                  " " +
                  delay +
                  "ms"));
            }
            return { props: props, transition: str };
          })(_time, _ease, _delay);
          _object.willChange(strings.props);
          var time = values ? values.time : _time,
            delay = values ? values.delay : _delay,
            props = values ? values.props : _props,
            transformProps = values ? values.transform : _transformProps,
            singleFrame = 1e3 / Render.REFRESH_RATE;
          if (
            ((_this.time = _time),
            (_this.delay = _delay),
            await Timer.delayedCall(3 * singleFrame),
            killed())
          )
            return;
          if (
            ((_object.div.style[HydraCSS.styles.vendorTransition] = strings.transition),
            (_this.playing = !0),
            "safari" == Device.system.browser)
          ) {
            if (
              (Device.system.browserVersion < 11 && (await Timer.delayedCall(singleFrame)),
              killed())
            )
              return;
            (_object.css(props), _object.transform(transformProps));
          } else (_object.css(props), _object.transform(transformProps));
          Timer.create(function () {
            killed() ||
              (!(function clearCSSTween(props, transformProps) {
                if (killed()) return;
                if (
                  ((_this.playing = !1),
                  (_object._cssTween = null),
                  _object.willChange(null),
                  _clear)
                ) {
                  const clear =
                    "string" == typeof _clear
                      ? _clear.split(",").map((key) => key.trim())
                      : [...props, ...Object.keys(transformProps)].filter((k) => "clear" !== k);
                  (clear.forEach((key) => _object.div.style.removeProperty(key)),
                    _object.div.style.removeProperty("transition"),
                    Object.keys(transformProps).forEach((key) => {
                      clear.includes(key) && delete _object[key];
                    }),
                    _object.transform());
                }
                ((_object = _props = null), Utils.nullObject(_this));
              })(_transitionProps, transformProps),
              _callback && _callback(),
              _this.completePromise && _this.completePromise.resolve());
          }, time + delay);
        })());
    })(),
    (this.stop = function () {
      this.playing &&
        ((this.kill = !0),
        (this.playing = !1),
        (_object.div.style[HydraCSS.styles.vendorTransition] = ""),
        (_object.div._transition = !1),
        _object.willChange(null),
        (_object._cssTween = null),
        Utils.nullObject(this));
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
