Class(function Camera(_worldCamera) {
  Inherit(this, Component);
  const _this = this;
  var _debug,
    _prevCamera,
    _lockCamera,
    _curve,
    _manual,
    _scheduleSlot,
    _calc = new Vector3(),
    _target = new Group(),
    _anim = { weight: 0, weight2: 0 },
    _center = new Vector3(),
    _cameraTarget = new Group(),
    _cameraTarget2 = new Group();
  function loop() {
    _scheduleSlot || render();
  }
  function render() {
    if (
      (_debug && (_debug.visible = !_debug.position.equals(_center)),
      _manual && (_anim.weight2 = _manual.value),
      (_anim.weight += (_anim.weight2 - _anim.weight) * _this.lerp),
      _prevCamera)
    ) {
      if ((_prevCamera.updateMatrixWorld(), _lockCamera.updateMatrixWorld(), _curve)) {
        (_curve.lerpPos || (_curve.lerpPos = new Vector3().copy(_prevCamera.getWorldPosition())),
          _curve.lerpOffset ||
            (_curve.lerpOffset = new Vector3()
              .copy(_curve.getPointAt(1))
              .multiplyScalar(-2)
              .add(_lockCamera.getWorldPosition())));
        let pos = _calc
          .copy(_curve.getPointAt(_anim.weight))
          .add(_curve.lerpOffset)
          .add(_lockCamera.getWorldPosition());
        (_curve.lerpPos.lerp(pos, _curve.lerp || 1, !1),
          _target.position.copy(_curve.lerpPos),
          _anim.weight >= 1 &&
            ((_curve = _curve.lerpPos = _curve.lerpOffset = null),
            _this.onCurveComplete && _this.onCurveComplete()));
      } else
        _target.position
          .copy(_prevCamera.getWorldPosition())
          .lerp(_lockCamera.getWorldPosition(), _anim.weight, !1);
      _target.quaternion
        .copy(_prevCamera.getWorldQuaternion())
        .slerp(_lockCamera.getWorldQuaternion(), _anim.weight, !1);
      let needsUpdate = !1,
        zoom = Math.mix(_prevCamera.zoom, _lockCamera.zoom, _anim.weight);
      _worldCamera.zoom !== zoom && ((_worldCamera.zoom = zoom), (needsUpdate = !0));
      let fov =
        !_worldCamera.isOrthographicCamera &&
        Math.mix(_prevCamera.fov, _lockCamera.fov, _anim.weight);
      fov && _worldCamera.fov !== fov && ((_worldCamera.fov = fov), (needsUpdate = !0));
      let near = Math.mix(_prevCamera.near, _lockCamera.near, _anim.weight);
      _worldCamera.near !== near && ((_worldCamera.near = near), (needsUpdate = !0));
      let far = Math.mix(_prevCamera.far, _lockCamera.far, _anim.weight);
      (_worldCamera.far !== far && ((_worldCamera.far = far), (needsUpdate = !0)),
        _worldCamera.aspect !== _lockCamera.aspect &&
          ((_worldCamera.aspect = _lockCamera.aspect), (needsUpdate = !0)),
        needsUpdate && _worldCamera.updateProjectionMatrix(),
        _cameraTarget.position.lerp(_target.position, _this.lerp2, !1),
        _cameraTarget.quaternion.slerp(_target.quaternion, _this.lerp2, !1));
    } else if (_lockCamera) {
      (_lockCamera.updateMatrixWorld(), Utils3D.decompose(_lockCamera, _cameraTarget));
      let needsUpdate = !1;
      (_lockCamera.zoom &&
        _worldCamera.zoom != _lockCamera.zoom &&
        ((_worldCamera.zoom = _lockCamera.zoom), (needsUpdate = !0)),
        _worldCamera.isOrthographicCamera ||
          _worldCamera.fov == _lockCamera.fov ||
          ((_worldCamera.fov = _lockCamera.fov), (needsUpdate = !0)),
        _worldCamera.near !== _lockCamera.near &&
          ((_worldCamera.near = _lockCamera.near), (needsUpdate = !0)),
        _worldCamera.far !== _lockCamera.far &&
          ((_worldCamera.far = _lockCamera.far), (needsUpdate = !0)),
        _worldCamera.aspect !== _lockCamera.aspect &&
          ((_worldCamera.aspect = _lockCamera.aspect), (needsUpdate = !0)),
        needsUpdate && _worldCamera.updateProjectionMatrix());
    }
    ((_prevCamera || _lockCamera) &&
      (_cameraTarget2.position.lerp(_cameraTarget.position, _this.finalLerp, !1),
      _cameraTarget2.quaternion.slerp(_cameraTarget.quaternion, _this.finalLerp, !1),
      _worldCamera.position.lerp(_cameraTarget2.position, _this.finalLerp, !1),
      _worldCamera.quaternion.slerp(_cameraTarget2.quaternion, _this.finalLerp, !1)),
      _worldCamera.updateMatrixWorld(),
      _debug &&
        (_debug.position.copy(_worldCamera.position),
        _debug.quaternion.copy(_worldCamera.quaternion)),
      RenderManager.fire(_this));
  }
  ((this.lerp = 1),
    (this.lerp2 = 1),
    (this.worldCamera = _worldCamera),
    (this.finalLerp = 1),
    (this.multiTween = !0),
    (function () {
      if (RenderManager.type != RenderManager.NORMAL)
        return ((_worldCamera = void 0), void (_this.worldCamera = _worldCamera));
      ((_worldCamera.controllingCamera = _this),
        _this.startRender(loop, RenderManager.AFTER_LOOPS));
    })(),
    (this.lock = function (camera, scheduleSlot) {
      (camera instanceof Camera
        ? ((scheduleSlot = camera), (camera = camera.worldCamera))
        : camera.controllingCamera && (scheduleSlot = camera.controllingCamera),
        (_lockCamera = camera),
        (_prevCamera = null),
        _worldCamera &&
          (_scheduleSlot && _this.stopRender(render, _scheduleSlot),
          (_scheduleSlot = scheduleSlot) && _this.startRender(render, _scheduleSlot),
          _lockCamera.zoom && (_worldCamera.zoom = _lockCamera.zoom),
          _worldCamera.isOrthographicCamera || (_worldCamera.fov = _lockCamera.fov),
          _worldCamera.updateProjectionMatrix(),
          render()));
    }),
    (this.transition = function (
      camera,
      duration = 1e3,
      ease = "easeInOutCubic",
      scheduleSlotOrDelay,
    ) {
      let delay, scheduleSlot;
      return (
        "number" == typeof scheduleSlotOrDelay
          ? (delay = scheduleSlotOrDelay)
          : scheduleSlotOrDelay && (scheduleSlot = scheduleSlotOrDelay),
        camera instanceof Camera
          ? ((scheduleSlot = camera), (camera = camera.worldCamera))
          : camera.controllingCamera && (scheduleSlot = camera.controllingCamera),
        _curve && (_curve = _curve.lerpPos = _curve.lerpOffset = null),
        camera.curve && ((_curve = camera.curve).lerpPos = camera.lerpPos),
        _prevCamera === camera
          ? ((duration *= 0.5 * Math.smoothStep(0.5, 1, _anim.weight) + 0.5),
            (_anim.weight = 1 - _anim.weight))
          : (_anim.weight = 0),
        (_manual = void 0),
        scheduleSlot &&
          _worldCamera &&
          (_scheduleSlot && _this.stopRender(render, _scheduleSlot),
          (_scheduleSlot = scheduleSlot),
          _this.startRender(render, _scheduleSlot)),
        (_anim.weight2 = _anim.weight),
        (_prevCamera = _lockCamera),
        (_lockCamera = camera),
        tween(_anim, { weight2: 1 }, duration, ease, delay)
      );
    }),
    (this.manualTransition = function (camera) {
      return (this.transition(camera).stop(), (_manual = { value: 0 }));
    }),
    (this.setPrevCamera = function (camera) {
      _prevCamera = camera.camera || camera;
    }),
    this.get("worldCamera", (_) => _worldCamera),
    this.get("lockCamera", (_) => _lockCamera),
    this.set("debugScale", (s) => {
      _debug && _debug.scale.setScalar(s);
    }),
    (this.createLocal = function (camera) {
      let needsResize = !1;
      camera || ((camera = World.CAMERA.clone()), (needsResize = !0));
      let instance = new Camera(camera.camera || camera);
      return (
        needsResize &&
          instance.onResize(() => {
            instance.overrideResize
              ? "function" == typeof instance.overrideResize && instance.overrideResize()
              : instance.lockCamera ||
                ((camera.aspect = Stage.width / Stage.height), camera.updateProjectionMatrix());
          }),
        instance
      );
    }));
}, "singleton");
