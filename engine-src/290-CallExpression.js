Interaction.Class(function Drawer(_object, _directions) {
  Inherit(this, Component);
  var _input,
    _origin,
    _values,
    _renderer,
    _max,
    _axis,
    _snap,
    _moving,
    _prevent,
    _kill,
    _touching,
    _this = this,
    _min = 0,
    _save = new Vector2(),
    _travel = new Vector2(),
    _evt = (new Vector2(), {});
  function initOrigin() {
    for (var key in ((_origin = {}),
    (_max = {}),
    (_snap = {}),
    _directions || (_directions = { x: 1, y: 1 }),
    _directions))
      ((_origin[key] = _object[key]), (_max[key] = _directions[key]));
    _axis = key;
  }
  function outOfBounds() {
    if (_max[_axis] < 1) {
      if (_object[_axis] > _max[_axis]) return !0;
      if (_object[_axis] < _min) return !0;
    } else {
      if (_object[_axis] > _max[_axis]) return !0;
      if (_object[_axis] < _min) return !0;
    }
  }
  function getElapsed() {
    return Math.range(_object[_axis], _min, _max[_axis], 0, 1);
  }
  function copyFromTo(o1, o2) {
    for (let key in o1) "number" == typeof o1[key] && (o2[key] = o1[key]);
  }
  function tweenObj(_time, _to) {
    _this.enabled &&
      (copyFromTo(_object, _values),
      tween(_values, _to, _time, _this.ease).onUpdate(() => {
        (copyFromTo(_values, _object),
          _this.autoRender && _renderer.needsUpdate && _renderer.update(),
          (_evt.elapsed = getElapsed()),
          _this.events.fire(Interaction.MOVE, _evt, !0),
          _this.onUpdate && _this.onUpdate(getElapsed()));
      }));
  }
  function inputUpdate(e) {
    let delta = _input.move;
    if (
      _this.enabled &&
      !_prevent &&
      !_kill &&
      _touching &&
      (!_this.prevent || !_this.prevent.disabled)
    ) {
      if (_this.prevent)
        if (Math.abs(delta[_axis]) < 20 && !_this.prevent.frozen) {
          var prevAxis = _this.prevent.axis;
          if (Math.abs(delta[prevAxis]) > _this.prevent.pixels)
            return (_this.prevent.disabled = !0);
        } else _this.prevent.disabled || (_this.prevent.frozen = !0);
      ((_moving = !0),
        (_object[_axis] = _save[_axis] + delta[_axis]),
        _travel.subVectors(_object, _origin),
        outOfBounds() &&
          (function clampWithFriction() {
            var max = _max[_axis],
              val = _object[_axis];
            max < 1
              ? (val > max &&
                  ((_object[_axis] = max - (max - val) * _this.friction), (_snap[_axis] = max)),
                val < _min &&
                  ((_object[_axis] = _min - (_min - val) * _this.friction), (_snap[_axis] = _min)))
              : (val > max &&
                  ((_object[_axis] = max + (val - max) * _this.friction), (_snap[_axis] = max)),
                val < 0 && ((_object[_axis] = val * _this.friction), (_snap[_axis] = _min)));
          })(),
        (e.elapsed = getElapsed()),
        _this.events.fire(Interaction.MOVE, e, !0),
        _this.autoRender && _renderer.needsUpdate && _renderer.update());
    }
  }
  function inputStart(e) {
    if (_this.checkPrevent && _this.checkPrevent(e)) return (_prevent = !0);
    _this.enabled &&
      ((_touching = !0),
      _save.copy(_object),
      clearTween(_values),
      _this.events.fire(Interaction.START, null, !0));
  }
  function inputEnd() {
    if (_kill) return (_kill = !1);
    if (!_this.enabled || _prevent) return (_prevent = !1);
    if (
      ((_touching = !1),
      _this.events.fire(Interaction.END, null, !0),
      !(
        _this.prevent &&
        ((_this.prevent.disabled = !1),
        (_this.prevent.frozen = !1),
        Math.abs(_input.velocity[_this.prevent.axis]) > 1 && Math.abs(_input.velocity[_axis]) < 1)
      ) &&
        _moving &&
        _this.enabled &&
        !_this.flag("toggle"))
    )
      if (((_moving = !1), _this.snap)) {
        var target = {},
          time = _this.easeTime;
        (Math.abs(_input.delta[_axis]) > 0.5
          ? _max[_axis] > 0
            ? (_input.delta[_axis] < 0 && _max[_axis] < 0) ||
              (_input.delta[_axis] > 0 && _max[_axis] > 0)
              ? (target[_axis] = _max[_axis])
              : (target[_axis] = _min)
            : _input.velocity[_axis] < 0
              ? (target[_axis] = _min)
              : (target[_axis] = _max[_axis])
          : getElapsed() > 0.5
            ? (target[_axis] = _max[_axis])
            : (target[_axis] = _min),
          tweenObj(time, target));
      } else outOfBounds() && tweenObj(_this.easeTime, _snap);
  }
  ((this.autoRender = !0),
    (this.friction = 0.5),
    (this.ease = "easeOutCubic"),
    (this.easeTime = 500),
    (this.snap = !0),
    (this.prevent = null),
    (this.enabled = !0),
    (function initHelpers() {
      ((_input = _this.initClass(Interaction, _object)),
        _this.events.sub(Mouse.input, Interaction.MOVE, inputUpdate),
        _this.events.sub(_input, Interaction.START, inputStart),
        _this.events.sub(_input, Interaction.END, inputEnd),
        (_values = {}),
        (_renderer = _this.initClass(Interaction.Renderer, _object)),
        (_this.input = _input));
    })(),
    initOrigin(),
    this.set("directions", function (d) {
      ((_directions = d), initOrigin());
    }),
    this.set("min", function (m) {
      _min = m;
    }),
    (this.resetOrigin = function () {
      initOrigin();
    }),
    (this.toggle = function (time) {
      _this.flag("toggle", !0);
      var target = {};
      (getElapsed() < 0.5 ? (target[_axis] = _max[_axis]) : (target[_axis] = _min),
        tweenObj(time || _this.easeTime, target),
        _this.delayedCall(function () {
          _this.flag("toggle", !1);
        }, 250));
    }),
    (this.getElapsed = function () {
      return getElapsed();
    }),
    (this.clearTween = function () {
      clearTween(_values);
    }),
    (this.forceInputEnd = function () {
      ((_kill = !0), inputEnd());
    }));
});
