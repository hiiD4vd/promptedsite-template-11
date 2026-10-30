Class(function TweenTimeline() {
  Inherit(this, Component);
  const _this = this;
  let _tween,
    _total = 0;
  const _tweens = [];
  function calculate() {
    _tweens.sort(function (a, b) {
      const ta = a.time + a.delay;
      return b.time + b.delay - ta;
    });
    const first = _tweens[0];
    _total = first.time + first.delay;
  }
  function loop() {
    let time = _this.elapsed * _total;
    for (let i = _tweens.length - 1; i > -1; i--) {
      let t = _tweens[i],
        relativeTime = time - t.delay,
        elapsed = Math.clamp(relativeTime / t.time, 0, 1);
      t.interpolate(elapsed);
    }
    _this.events.fire(Events.UPDATE, _this, !0);
  }
  ((this.elapsed = 0),
    this.get("timeRemaining", () => _total - _this.elapsed * _total),
    (this.add = function (object, props, time, ease, delay = 0) {
      let tween;
      return (
        (object instanceof MathTween || object instanceof FrameTween) &&
          ((props = object.props),
          (time = object.time),
          (ease = object.ease),
          (delay = object.delay),
          (object = object.object)),
        (tween =
          object instanceof HydraObject
            ? new FrameTween(object, props, time, ease, delay, null, !0)
            : new MathTween(object, props, time, ease, delay, null, !0)),
        _tweens.push(tween),
        defer(calculate),
        tween
      );
    }),
    (this.tween = function (to, time, ease, delay, callback) {
      return (
        _this.clearTween(),
        (_tween = tween(_this, { elapsed: to }, time, ease, delay)
          .onUpdate(loop)
          .onComplete(callback)),
        _tween
      );
    }),
    (this.clearTween = function () {
      _tween && _tween.stop && _tween.stop();
    }),
    (this.start = function () {
      _this.startRender(loop);
    }),
    (this.stop = function () {
      _this.stopRender(loop);
    }),
    (this.update = function () {
      loop();
    }),
    (this.seek = function (elapsed) {
      ((_this.elapsed = elapsed), loop());
    }),
    (this.onDestroy = function () {
      (_this.clearTween(), Render.stop(loop));
      for (var i = 0; i < _tweens.length; i++) _tweens[i].stop();
    }));
});
