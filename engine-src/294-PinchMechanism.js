Class(
  function PinchMechanism(element = Stage) {
    Inherit(this, Component);
    var _this = this,
      _event = { percent: 0, theta: 0, average: new Vector2() },
      _p0 = new Vector2(),
      _p1 = new Vector2(),
      _calc = new Vector2(),
      _dist = 0,
      _start = 0,
      _percent = 0,
      _last = 0,
      _touching = !1,
      _time = performance.now(),
      _thetaOffset = !1;
    function setTouches(e) {
      var p0 = e.touches[0],
        p1 = e.touches[1];
      (p0 && _p0.set(p0.clientX, p0.clientY), p1 && _p1.set(p1.clientX, p1.clientY));
    }
    function touchStart(e) {
      2 != e.touches.length ||
        _touching ||
        ((_thetaOffset = !1),
        (_touching = !0),
        (_start = _percent),
        setTouches(e),
        element.bind("touchmove", touchMove),
        (_dist = _calc.subVectors(_p0, _p1).length()));
    }
    function touchMove(e) {
      let now = performance.now();
      if (now - _time < 16) return;
      ((_time = now), setTouches(e));
      var dist = _calc.subVectors(_p0, _p1).length(),
        absDist = dist - _dist,
        perc = Math.range(absDist, 0, _this.max, 0, 1);
      ((_percent = Math.clamp(_start + perc, 0, 1)),
        _event.average.set((_p0.x + _p1.x) / 2, (_p0.y + _p1.y) / 2),
        (_event.delta = dist > _last ? 1 : -1),
        (_event.percent = _percent));
      let theta = Math.atan2(_p1.y - _p0.y, _p1.x - _p0.x);
      (!1 === _thetaOffset && (_thetaOffset = theta),
        (_event.theta += theta - _thetaOffset),
        (_thetaOffset = theta),
        _this.events.fire(PinchMechanism.UPDATE, _event, !0),
        (_last = dist));
    }
    function touchEnd(e) {
      _touching &&
        ((_touching = !1),
        (_start = _percent),
        element.unbind("touchmove", touchMove),
        _this.events.fire(PinchMechanism.END, null, !0));
    }
    ((this.max = 150),
      this.set("percent", function (value) {
        _percent = value;
      }),
      (this.start = function () {
        !(function addListeners() {
          (element.bind("touchstart", touchStart),
            element.bind("touchend", touchEnd),
            element.bind("touchcancel", touchEnd));
        })();
      }),
      (this.stop = function () {
        !(function removeListeners() {
          (element.unbind("touchstart", touchStart),
            element.unbind("touchend", touchEnd),
            element.unbind("touchcancel", touchEnd),
            element.unbind("touchmove", touchMove));
        })();
      }),
      (this.snapTo = function (to, time) {
        let d = { v: _percent };
        tween(d, { v: to }, time, "linear").onUpdate(() => {
          ((_event.delta = 0),
            (_event.percent = d.v),
            (_start = d.v),
            _this.events.fire(Events.UPDATE, _event, !0));
        });
      }));
  },
  function () {
    ((PinchMechanism.END = "pinch_end"), (PinchMechanism.UPDATE = "pinch_update"));
  },
);
