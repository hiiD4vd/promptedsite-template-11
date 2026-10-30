Class(
  function Interaction(_object) {
    Inherit(this, Events);
    const _this = this;
    var _touchId,
      _velocity = [],
      _moved = 0,
      _time = performance.now();
    function Vec2() {
      ((this.x = 0),
        (this.y = 0),
        (this.length = function () {
          return Math.sqrt(this.x * this.x + this.y * this.y);
        }));
    }
    var _vec2Pool = new ObjectPool(Vec2, 10);
    let _distance, _timeDown, _timeMove;
    function loop() {
      _moved++ > 10 &&
        ((_this.velocity.x = _this.velocity.y = 0), (_this.delta.x = _this.delta.y = 0));
    }
    function down(e) {
      if (!e.multiscreenSimulated) {
        const hitCondition =
          !!_this.hitReturn && "hit" == e.target.className && e.target.hydraObject != _object;
        if (_this.isTouching && !_this.multiTouch && null !== _touchId && e.touches) {
          for (let i = 0; i < e.touches.length; ++i)
            if (e.touches[i].identifier === _touchId) return;
          ((_touchId = null), (_this.isTouching = !1));
        }
        if (
          (_this.isTouching && !_this.multiTouch) ||
          hitCondition ||
          Interaction.hitIsBound(e.target, _object)
        )
          return;
      }
      _this.isTouching = !0;
      let x = e.x,
        y = e.y;
      (e.changedTouches &&
        !_touchId &&
        ((x = e.changedTouches[0].clientX),
        (y = e.changedTouches[0].clientY),
        (_touchId = e.changedTouches[0].identifier)),
        e.touches && "number" == typeof e.touches[0].force && (e.force = e.touches[0].force),
        (e.x = _this.x = x),
        (e.y = _this.y = y),
        (_this.hold.x = _this.last.x = x),
        (_this.hold.y = _this.last.y = y),
        (_this.delta.x = _this.move.x = _this.velocity.x = 0),
        (_this.delta.y = _this.move.y = _this.velocity.y = 0),
        (_distance = 0),
        _this.events.fire(Interaction.START, e, !0),
        (_timeDown = _timeMove = Render.TIME));
    }
    function move(e) {
      if (!_this.isTouching && !_this.unlocked) return;
      let now = performance.now();
      if (now - _time < 16) return;
      _time = now;
      let x = e.x,
        y = e.y;
      if (e.touches)
        for (let i = 0; i < e.touches.length; i++) {
          let touch = e.touches[i];
          touch.identifier == _touchId && ((x = touch.clientX), (y = touch.clientY));
        }
      (_this.isTouching && ((_this.move.x = x - _this.hold.x), (_this.move.y = y - _this.hold.y)),
        e.touches && "number" == typeof e.touches[0].force && (e.force = e.touches[0].force),
        (e.x = _this.x = x),
        (e.y = _this.y = y),
        (_this.delta.x = x - _this.last.x),
        (_this.delta.y = y - _this.last.y),
        (_this.last.x = x),
        (_this.last.y = y),
        (_moved = 0),
        (_distance += _this.delta.length()));
      let delta = Render.TIME - (_timeMove || Render.TIME);
      if (((_timeMove = Render.TIME), delta > 0.01)) {
        let velocity = _vec2Pool.get();
        ((velocity.x = Math.abs(_this.delta.x) / delta),
          (velocity.y = Math.abs(_this.delta.y) / delta),
          _velocity.push(velocity),
          _velocity.length > 5 && _vec2Pool.put(_velocity.shift()));
      }
      _this.velocity.x = _this.velocity.y = 0;
      for (let i = 0; i < _velocity.length; i++)
        ((_this.velocity.x += _velocity[i].x), (_this.velocity.y += _velocity[i].y));
      ((_this.velocity.x /= _velocity.length),
        (_this.velocity.y /= _velocity.length),
        (_this.velocity.x = _this.velocity.x || 0),
        (_this.velocity.y = _this.velocity.y || 0),
        _this.events.fire(Interaction.MOVE, e, !0),
        _this.isTouching && _this.events.fire(Interaction.DRAG, e, !0));
    }
    function up(e) {
      if (e && e.changedTouches && e.touches.length) {
        let someTouchIdentified = !1;
        for (let i = 0; i < e.changedTouches.length; i++)
          e.changedTouches[i].identifier === _touchId && (someTouchIdentified = !0);
        if (!someTouchIdentified) return;
      }
      if (!_this.isTouching && !_this.unlocked) return;
      ((_this.isTouching = !1),
        (_this.move.x = 0),
        (_this.move.y = 0),
        Math.max(0.001, Render.TIME - (_timeMove || Render.TIME)) >= 40 &&
          ((_this.delta.x = 0), (_this.delta.y = 0)),
        _distance < 20 &&
          Render.TIME - _timeDown < 1e3 &&
          !e.isLeaveEvent &&
          !e.multiscreenSimulated &&
          _this.events.fire(Interaction.CLICK, e, !0),
        _this.events.fire(Interaction.END, e, !0),
        (_touchId = null),
        Device.mobile && (_this.velocity.x = _this.velocity.y = 0));
    }
    function leave() {
      _this.ignoreLeave || ((_this.delta.x = 0), (_this.delta.y = 0), up({ isLeaveEvent: !0 }));
    }
    ((this.x = 0),
      (this.y = 0),
      (this.hold = new Vec2()),
      (this.last = new Vec2()),
      (this.delta = new Vec2()),
      (this.move = new Vec2()),
      (this.velocity = new Vec2()),
      (this.hitReturn = !0),
      (function () {
        if ((!_object) instanceof HydraObject) throw "Interaction.Input requires a HydraObject";
        (!(function addHandlers() {
          _object == Stage || _object == __window
            ? Interaction.bind("touchstart", down)
            : (_object.bind("touchstart", down), Interaction.bindObject(_object));
          (Interaction.bind("touchmove", move),
            Interaction.bind("touchend", up),
            Interaction.bind("leave", leave));
        })(),
          Render.start(loop));
      })(),
      (this.destroy = function () {
        (Interaction.unbind("touchstart", down),
          Interaction.unbind("touchmove", move),
          Interaction.unbind("touchend", up),
          Interaction.unbind("leave", leave),
          Render.stop(loop),
          Interaction.unbindObject(_object),
          _object && _object.unbind && _object.unbind("touchstart", down));
      }),
      (this._manualMove = move),
      (this._manualDown = down),
      (this._manualUp = up));
  },
  () => {
    (Namespace(Interaction),
      (Interaction.CLICK = "interaction_click"),
      (Interaction.START = "interaction_start"),
      (Interaction.MOVE = "interaction_move"),
      (Interaction.DRAG = "interaction_drag"),
      (Interaction.END = "interaction_end"));
    const _objects = [],
      _events = { touchstart: [], touchmove: [], touchend: [], leave: [] };
    function touchMove(e) {
      _events.touchmove.forEach((c) => c(e));
    }
    function touchStart(e) {
      _events.touchstart.forEach((c) => c(e));
    }
    function touchEnd(e) {
      _events.touchend.forEach((c) => c(e));
    }
    function leave(e) {
      ((e.leave = !0), _events.leave.forEach((c) => c(e)));
    }
    (Hydra.ready(async () => {
      (await defer(),
        __window.bind("touchstart", touchStart),
        __window.bind("touchmove", touchMove),
        __window.bind("touchend", touchEnd),
        __window.bind("touchcancel", touchEnd),
        __window.bind("contextmenu", touchEnd),
        __window.bind("mouseleave", leave),
        __window.bind("mouseout", leave));
    }),
      (Interaction.bind = function (evt, callback) {
        _events[evt].push(callback);
      }),
      (Interaction.unbind = function (evt, callback) {
        _events[evt].remove(callback);
      }),
      (Interaction.bindObject = function (obj) {
        _objects.push(obj);
      }),
      (Interaction.unbindObject = function (obj) {
        _objects.remove(obj);
      }),
      (Interaction.hitIsBound = function (element, boundObj) {
        let obj = element.hydraObject;
        if (!obj) return !1;
        for (; obj;) {
          if (obj != boundObj && _objects.includes(obj)) return !0;
          obj = obj._parent;
        }
        return !1;
      }));
  },
);
