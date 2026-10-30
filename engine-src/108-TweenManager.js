Class(function TweenManager() {
  Namespace(this);
  var _this = this,
    _tweens = [];
  let _updateIndex = null;
  function updateTweens(time, dt) {
    for (_updateIndex = _tweens.length - 1; _updateIndex >= 0; _updateIndex--) {
      let tween = _tweens[_updateIndex];
      tween?.update ? tween.update(dt) : _tweens.splice(_updateIndex, 1);
    }
    _updateIndex = null;
  }
  function findEase(name) {
    for (var eases = _this.CubicEases, i = eases.length - 1; i > -1; i--)
      if (eases[i].name == name) return eases[i];
    return !1;
  }
  ((this.CubicEases = []),
    Render.start(updateTweens),
    (this._addMathTween = function (tween) {
      _tweens.push(tween);
    }),
    (this._removeMathTween = function (tween) {
      let i = _tweens.indexOf(tween);
      i >= 0 &&
        (_tweens.splice(i, 1), null !== _updateIndex && i < _updateIndex && (_updateIndex -= 1));
    }),
    (this._getEase = function (name, values) {
      var ease = findEase(name);
      return !!ease && (values ? (ease.path ? ease.path.solve : ease.values) : ease.curve);
    }),
    (this._inspectEase = function (name) {
      return findEase(name);
    }),
    (this.tween = function (object, props, time, ease, delay, complete, isManual, scaledTime) {
      return (
        "number" != typeof delay &&
          ((scaledTime = isManual), (isManual = complete), (complete = delay), (delay = 0)),
        new MathTween(object, props, time, ease, delay, complete, isManual, scaledTime)
      );
    }),
    (this.clearTween = function (object) {
      if (
        (object._mathTween && object._mathTween.stop && object._mathTween.stop(),
        object._mathTweens)
      ) {
        for (var tweens = object._mathTweens, i = 0; i < tweens.length; i++) {
          var tw = tweens[i];
          tw && tw.tween && tw.tween.stop && tw.tween.stop();
        }
        object._mathTweens = null;
      }
    }),
    (this.addCustomEase = function (ease) {
      var add = !0;
      if ("object" != typeof ease || !ease.name || !ease.curve)
        throw "TweenManager :: addCustomEase requires {name, curve}";
      for (var i = _this.CubicEases.length - 1; i > -1; i--)
        ease.name == _this.CubicEases[i].name && (add = !1);
      if (add) {
        if ("m" == ease.curve.charAt(0).toLowerCase()) {
          if (!window.EasingPath) throw "Using custom eases requires easingpath module";
          ease.path = new EasingPath(ease.curve);
        } else
          ease.values = (function stringToValues(str) {
            for (
              var values = str.split("(")[1].slice(0, -1).split(","), i = 0;
              i < values.length;
              i++
            )
              values[i] = parseFloat(values[i]);
            return values;
          })(ease.curve);
        _this.CubicEases.push(ease);
      }
      return ease;
    }),
    (Math.interpolate = function (start, end, alpha, ease) {
      const fn = _this.Interpolation.convertEase(ease);
      return Math.mix(
        start,
        end,
        "function" == typeof fn ? fn(alpha) : _this.Interpolation.solve(fn, alpha),
      );
    }),
    (window.tween = this.tween),
    (window.clearTween = this.clearTween));
}, "Static");
