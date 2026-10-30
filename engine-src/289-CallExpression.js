Interaction.Class(function Dragger(_obj, _config) {
  Inherit(this, Component);
  const _this = this;
  var _input;
  ("object" != typeof _obj ||
    _config ||
    ((_obj = (_config = _obj).object),
    "boundsMinX" in _config &&
      "boundsMaxX" in _config &&
      (_config.boundsX = [
        parseFloat(_config.boundsMinX ?? -2),
        parseFloat(_config.boundsMaxX ?? 2),
      ]),
    "boundsMinY" in _config &&
      "boundsMaxY" in _config &&
      (_config.boundsY = [
        parseFloat(_config.boundsMinY ?? -2),
        parseFloat(_config.boundsMaxY ?? 2),
      ])),
    (this.boundsX = _config.boundsX || [-2, 2]),
    (this.boundsY = _config.boundsY || [-2, 2]),
    (this.multiplier = _config.multiplier || 1),
    (this.flipX = _config.flipX),
    (this.flipY = _config.flipY),
    (this.lerp = _config.lerp || 0.1));
  var _hitCamera,
    _element = _config.element || Stage,
    _v2 = new Vector2(),
    _holdPos = new Vector2(),
    _holdObjPos = new Vector2(),
    _target = new Vector2(),
    _v3 = new Vector3(),
    _snapping = !1,
    _nearestX = (_this.boundsX[0] + _this.boundsX[1]) / 2,
    _nearestY = (_this.boundsY[0] + _this.boundsY[1]) / 2;
  function loop() {
    if (
      (_config.hitObject &&
        (checkHit()
          ? _this.flag("hovering") || (_this.flag("hovering", !0), _element.cursor("grab", _this))
          : _this.flag("hovering") &&
            !_this.flag("dragging") &&
            (_this.flag("hovering", !1), _element.cursor("auto", _this))),
      clampTarget(),
      _snapping)
    )
      return (
        _config.snapX &&
          ((_obj.x = Math.lerp(_nearestX, _obj.x, 0.5 * _this.lerp)), (_target.x = _obj.x)),
        void (
          _config.snapY &&
          ((_obj.y = Math.lerp(_nearestY, _obj.y, 0.5 * _this.lerp)), (_target.y = _obj.y))
        )
      );
    ((_obj.x = Math.lerp(_target.x, _obj.x, _this.lerp)),
      (_obj.y = Math.lerp(_target.y, _obj.y, _this.lerp)));
  }
  function checkHit() {
    if (!_config.hitObject) return !0;
    return "2d" === Interaction3D.find(_hitCamera).input.type
      ? _config.hitObject.interaction.checkObjectHit(_config.hitObject, Mouse, _hitCamera)
      : void 0;
  }
  function clampTarget() {
    (_target.x > _this.boundsX[1] && (_target.x = _this.boundsX[1]),
      _target.x < _this.boundsX[0] && (_target.x = _this.boundsX[0]),
      _target.y < _this.boundsY[0] && (_target.y = _this.boundsY[0]),
      _target.y > _this.boundsY[1] && (_target.y = _this.boundsY[1]));
  }
  function touchStart(e) {
    ((_snapping = !1),
      _this.flag("dragging", !0),
      getInputPos(e, _holdPos),
      _config.absoluteMode ? _holdObjPos.copy(_holdPos) : _holdObjPos.copy(_obj),
      _element.cursor("grabbing", _this),
      _config.onTouchStart && _config.onTouchStart(),
      touchMove(e));
  }
  function getInputPos(e, target = _v2) {
    return (
      _config.hitObject
        ? (_config.hitObject.interaction.getObjectHitLocalCoords(
            _v3,
            _config.hitObject,
            Mouse,
            _hitCamera,
          ),
          target.copy(_v3))
        : target.copy(e),
      target
    );
  }
  function touchMove(e) {
    if (!_this.flag("dragging")) return;
    let delta = getInputPos(e).sub(_holdPos);
    ((_target.x = _holdObjPos.x + delta.x * _this.multiplier * (_this.flipX ? -1 : 1)),
      (_target.y = _holdObjPos.y + delta.y * _this.multiplier * (_this.flipY ? -1 : 1)),
      clampTarget());
  }
  function touchEnd(e) {
    _this.flag("dragging") &&
      (_this.flag("dragging", !1),
      _config.hitObject
        ? checkHit()
          ? _element.cursor("grab", _this)
          : (_this.flag("hovering", !1), _element.cursor("auto", _this))
        : _element.cursor("grab", _this),
      (_config.snapX || _config.snapY) &&
        (function snapOnEnd() {
          ((_snapping = !0), _config.snapX && (_nearestX = getNearestSnapPoint("x")));
          _config.snapY && (_nearestY = getNearestSnapPoint("y"));
        })(),
      _config.onTouchEnd && _config.onTouchEnd());
  }
  function getNearestSnapPoint(axis) {
    let snaps = getSnapPoints(axis);
    return snaps[getNearestSnapPointIndex(axis, snaps)];
  }
  function getSnapPoints(axis) {
    let bounds = "x" === axis ? _this.boundsX : _this.boundsY,
      center = (bounds[0] + bounds[1]) / 2;
    bounds = [...bounds, center];
    let snaps = bounds.sort((a, b) => a - b);
    return snaps.filter((val, index) => 0 === index || val !== snaps[index - 1]);
  }
  function getNearestSnapPointIndex(axis, snaps = getSnapPoints(axis)) {
    let shortestDist = 1 / 0,
      nearestIndex = -1;
    return (
      snaps.find((val, index) => {
        let dist = Math.abs(_target[axis] - val);
        if (dist >= shortestDist) return !0;
        ((nearestIndex = index), (shortestDist = dist));
      }),
      nearestIndex
    );
  }
  function incrementSnapIndex(axis, increment) {
    if (((_snapping = !1), "x" === axis ? _config.snapX : _config.snapY)) {
      let snaps = getSnapPoints(axis),
        currentIndex = "x" === axis ? _this.snapIndexX : _this.snapIndexY,
        nextIndex = Math.clamp(currentIndex + increment, 0, snaps.length - 1);
      _target[axis] = snaps[nextIndex];
    } else {
      let bounds = "x" === axis ? _this.boundsX : _this.boundsY;
      ((_target[axis] += (bounds[1] - bounds[0]) / (_config.numStepsX || 5)), clampTarget());
    }
  }
  function moveToSnapIndex(axis, snapIndex) {
    if (((_snapping = !1), "x" === axis ? _config.snapX : _config.snapY)) {
      let snaps = getSnapPoints(axis);
      _target[axis] = snaps[Math.clamp(snapIndex, 0, snaps.length - 1)];
    } else {
      let bounds = "x" === axis ? _this.boundsX : _this.boundsY,
        step = (bounds[1] - bounds[0]) / (_config.numStepsY || 5);
      _target[axis] = Math.clamp(step * snapIndex, bounds[0], bounds[1]);
    }
  }
  function moveTo(axis, val) {
    ((_snapping = !1),
      (_target[axis] = val),
      clampTarget(),
      ("x" === axis ? _config.snapX : _config.snapY) &&
        (_target[axis] = getNearestSnapPoint(axis)));
  }
  function jumpTo(axis, val) {
    (moveTo(axis, val), (_obj[axis] = _target[axis]));
  }
  (!(function addListeners() {
    ((_input = GestureManager.add(_this, _element, checkHit)),
      _this.events.sub(_input, Interaction.START, touchStart),
      _this.events.sub(_input, Interaction.MOVE, touchMove),
      _this.events.sub(_input, Interaction.END, touchEnd),
      _config.hitObject && (_hitCamera = _config.hitCamera || World.CAMERA));
  })(),
    _this.startRender(loop),
    (this.onVisible = function () {
      _config.hitObject || _element.cursor("grab", _this);
    }),
    (this.onInvisible = function () {
      _config.hitObject || _element.cursor("auto", _this);
    }),
    (this.setBoundsX = function (arr) {
      (_this.boundsX.splice(0, _this.boundsX.length, ...arr),
        clampTarget(),
        _config.snapX && (_target.x = getNearestSnapPoint("x")));
    }),
    (this.setBoundsY = function (arr) {
      (_this.boundsY.splice(0, _this.boundsY.length, ...arr),
        clampTarget(),
        _config.snapY && (_target.y = getNearestSnapPoint("y")));
    }),
    (this.nextX = function () {
      incrementSnapIndex("x", 1);
    }),
    (this.nextY = function () {
      incrementSnapIndex("y", 1);
    }),
    (this.prevX = function () {
      incrementSnapIndex("x", -1);
    }),
    (this.prevY = function () {
      incrementSnapIndex("y", -1);
    }),
    (this.moveToSnapIndexX = function (snapIndexX) {
      moveToSnapIndex("x", snapIndexX);
    }),
    (this.moveToSnapIndexY = function (snapIndexY) {
      moveToSnapIndex("y", snapIndexY);
    }),
    (this.moveToX = function (x) {
      moveTo("x", x);
    }),
    (this.moveToY = function (y) {
      moveTo("y", y);
    }),
    (this.jumpToX = function (x) {
      jumpTo("x", x);
    }),
    (this.jumpToY = function (y) {
      jumpTo("y", y);
    }),
    this.get("snapIndexX", () => getNearestSnapPointIndex("x")),
    this.get("snapIndexY", () => getNearestSnapPointIndex("y")),
    this.get("snapIndexCountX", () => getSnapPoints("x").length),
    this.get("snapIndexCountY", () => getSnapPoints("y").length));
});
