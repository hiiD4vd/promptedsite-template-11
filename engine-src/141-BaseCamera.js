Class(function BaseCamera(_input, _group) {
  Inherit(this, Object3D);
  const _this = this;
  var _debugCamera,
    _type = "perspective",
    _manualRender = !1;
  function resize() {
    if (_this.overrideResize) "function" == typeof _this.overrideResize && _this.overrideResize();
    else
      switch (_type) {
        case "perspective":
          ((_this.camera.aspect = getAspect()), _this.camera.updateProjectionMatrix());
          break;
        case "orthographic":
          if (_this.width || _this.height) _this.camera.setViewport(_this.width, _this.height);
          else {
            let stage = findStage(),
              m = 900 / stage.height / 100;
            _this.camera.setViewport(stage.width * m, stage.height * m);
          }
      }
  }
  function findStage() {
    return Utils3D.findNuke(_this)?.stage || Stage;
  }
  function getAspect() {
    let stage = findStage();
    return stage.width / stage.height;
  }
  function loop() {
    if (
      (_this._loop?.(), _this.group.updateMatrixWorld(!0), _debugCamera && _debugCamera.visible)
    ) {
      Utils3D.decompose(_this.camera, _debugCamera);
      let viewportHeight,
        active = AppState.get("playground_camera_active");
      ((viewportHeight = active.isOrthographicCamera
        ? (active.top - active.bottom) / active.zoom
        : Utils3D.getHeightFromCamera(active, _this.camera.position.distanceTo(active.position))),
        _debugCamera.scale.setScalar((0.025 * viewportHeight) / 0.1));
    }
    RenderManager.fire(_this);
  }
  ((this.camera = new PerspectiveCamera(30, getAspect(), 0.1, 1e3)),
    this.group.add(this.camera),
    (this.playgroundLock = function (camera = Camera.instance()) {
      if (!Global.PLAYGROUND) return;
      Utils.getConstructorName(_this.parent).includes(Global.PLAYGROUND.split("/")[0]) &&
        RenderManager.type == RenderManager.NORMAL &&
        camera.lock(_this.camera);
    }),
    (this.lock = function (camera) {
      if ("orthographic" == _type && !camera.worldCamera.isOrthographicCamera)
        return console.error(
          "You can't lock an orthographic camera to the main camera. Use an FXScene .setCamera",
        );
      let p = _this.parent;
      for (; p;) {
        if (p.cameraController) {
          camera = p.cameraController;
          break;
        }
        p = p.parent;
      }
      if (!camera) {
        let p = _this.parent;
        for (; p;) {
          if (p.useCamera && p.nuke) return p.useCamera(_this);
          p = p.parent;
        }
      }
      ((camera = camera || Camera.instance()),
        RenderManager.type == RenderManager.NORMAL && camera.lock(_this.camera, _this));
    }),
    (this.transition = function (time, ease, delay, camera = Camera.instance()) {
      "object" == typeof delay && ((camera = delay), (delay = 0));
      let p = _this.parent;
      for (; p;) {
        if (p.cameraController) {
          camera = p.cameraController;
          break;
        }
        p = p.parent;
      }
      let promise = Promise.create();
      return (
        camera.transition(_this.camera, time, ease, delay || 0),
        _this.delayedCall((_) => promise.resolve(), time + (delay || 0)),
        promise
      );
    }),
    (this.manualTransition = function (camera = Camera.instance()) {
      return camera.manualTransition(_this.camera);
    }),
    (this.setFOV = function (fov) {
      "orthographic" !== _type &&
        fov != this.camera.fov &&
        ((this.camera.fov = fov), this.camera.updateProjectionMatrix());
    }),
    (this.setHorizontalFOV = function (hfov) {
      const fov =
        (2 * Math.atan(Math.tan(((hfov / 2) * Math.PI) / 180) / this.camera.aspect) * 180) /
        Math.PI;
      _this.setFOV(fov);
    }),
    (this.getFOV = function () {
      return this.camera.fov;
    }),
    (this.useOrthographic = function (w, h) {
      "orthographic" !== _type &&
        (isNaN(w) || (this.width = w),
        isNaN(h) || (this.height = h),
        this.camera && this.group.remove(this.camera),
        (this.camera = new OrthographicCamera()),
        this.group.add(this.camera),
        (this.camera.position.z = 1),
        (_type = "orthographic"),
        resize());
    }),
    (this.usePerspective = function () {
      "perspective" !== _type &&
        (this.camera && this.group.remove(this.camera),
        (this.camera = new PerspectiveCamera()),
        this.group.add(this.camera),
        (_type = "perspective"),
        resize());
    }),
    (this.useCurve = function (curve) {
      return ((_this.camera.curve = curve), this);
    }),
    _this.get("zoom", () => _this.camera.zoom),
    _this.set("zoom", (zoom) => {
      ((_this.camera.zoom = zoom), _this.camera.updateProjectionMatrix());
    }),
    _this.get("near", () => _this.camera.near),
    _this.set("near", (near) => {
      ((_this.camera.near = near), _this.camera.updateProjectionMatrix());
    }),
    _this.get("far", () => _this.camera.far),
    _this.set("far", (far) => {
      ((_this.camera.far = far), _this.camera.updateProjectionMatrix());
    }),
    this.get("manualRender", () => _manualRender),
    this.set("manualRender", (value) => {
      (value = !!value) !== _manualRender &&
        ((_manualRender = value) ? _this.stopRender(loop) : _this.startRender(loop));
    }),
    (this.update = function () {
      (_manualRender ||
        !Hydra.LOCAL ||
        _this.flag("manualRenderWarned") ||
        (console.warn("Set manualRender to true if using GazeCamera.update()"),
        _this.flag("manualRenderWarned", !0)),
        loop());
    }),
    (_this.setProjectionProperties = function ({ fov: fov, near: near, far: far, zoom: zoom }) {
      let needsUpdate = !1;
      ("orthographic" !== _type &&
        void 0 !== fov &&
        fov !== this.camera.fov &&
        ((this.camera.fov = fov), (needsUpdate = !0)),
        void 0 !== near &&
          near !== this.camera.near &&
          ((this.camera.near = near), (needsUpdate = !0)),
        void 0 !== far && far !== this.camera.far && ((this.camera.far = far), (needsUpdate = !0)),
        void 0 !== zoom &&
          zoom !== this.camera.zoom &&
          ((this.camera.zoom = zoom), (needsUpdate = !0)),
        needsUpdate && _this.camera.updateProjectionMatrix());
    }),
    (this.setAspectRatio = function (ratio) {
      ((_this.camera.aspect = ratio),
        _this.camera.updateProjectionMatrix(),
        (_this.overrideResize = !0));
    }),
    (function init() {
      if ((_this.startRender(loop), _this.onResize(resize), defer(resize), _input)) {
        _this.prefix = _input.prefix;
        let cameraUIL = CameraUIL.add(_this, _group);
        (cameraUIL.setLabel("Camera"), (_this.group._cameraUIL = cameraUIL));
      }
      Global.PLAYGROUND &&
        AppState.bind("playground_camera_active", (active) => {
          _this.group._parent &&
            (active
              ? (_debugCamera ||
                  (((_debugCamera = new Mesh(
                    new BoxGeometry(0.1, 0.1, 0.2),
                    new Shader("DebugCamera", {
                      uColor: { value: new Color("#ffffff") },
                      transparent: !0,
                      depthTest: !1,
                    }),
                  )).renderOrder = 9999),
                  _this.delayedCall((_) => _this.group._parent.add(_debugCamera), 50)),
                (_debugCamera.visible = !0))
              : _debugCamera && (_debugCamera.visible = !1));
        });
    })());
});
