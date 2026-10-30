Class(function GLUIStage() {
  Inherit(this, Component);
  const _this = this;
  var _scene = new Scene(),
    _camera = new OrthographicCamera(1, 1, 1, 1, 0.1, 1);
  function resizeHandler() {
    const _stage = _this?.customStageSize || Stage;
    ((_camera.left = _stage.width / -2),
      (_camera.right = _stage.width / 2),
      (_camera.top = _stage.height / 2),
      (_camera.bottom = _stage.height / -2),
      (_camera.near = 0.01),
      (_camera.far = 1e3),
      _camera.updateProjectionMatrix(),
      (_camera.position.x = _stage.width / 2),
      (_camera.position.y = -_stage.height / 2));
  }
  ((this.interaction = new GLUIStageInteraction2D(_camera, _scene, Stage)),
    (this.alpha = 1),
    (this.scene = _scene),
    (_scene.disableAutoSort = !0),
    (_camera.position.z = 1),
    (function addListeners() {
      _this.events.sub(Events.RESIZE, resizeHandler);
    })(),
    resizeHandler(),
    (this.add = function ($obj) {
      (($obj.parent = _this), _scene.add($obj.group || $obj.mesh));
    }),
    (this.remove = function ($obj) {
      (($obj.parent = null), _scene.remove($obj.group));
    }),
    (this.clear = function () {
      (_scene.traverse((obj) => {
        obj.geometry && obj.shader && obj.destroy();
      }),
        (_scene.children.length = _scene.childrenLength = 0));
    }),
    (this.renderToRT = function (scene, rt, camera) {
      let clearAlpha;
      rt &&
        rt.fxscene &&
        rt.fxscene.clearAlpha > -1 &&
        ((clearAlpha = World.RENDERER.getClearAlpha()), World.RENDERER.setClearAlpha(0));
      let skipMultisample = rt && rt.multisample;
      skipMultisample && (rt.multisample = !1);
      let autoClear = World.RENDERER.autoClear;
      ((World.RENDERER.autoClear = !1),
        World.RENDERER.render(scene, camera || _camera, rt),
        (World.RENDERER.autoClear = autoClear),
        skipMultisample && (rt.multisample = !0),
        clearAlpha && World.RENDERER.setClearAlpha(clearAlpha));
    }),
    this.get("camera", () => _camera),
    (this.setStageSize = function setStageSize(size) {
      ((_this.customStageSize = size), resizeHandler());
    }),
    (this.resize = resizeHandler),
    (this.render = function loop() {
      if (!_scene.children.length) return;
      let clear = World.RENDERER.autoClear;
      ((World.RENDERER.autoClear = !1),
        World.RENDERER.render(_scene, _camera, null, !0, _this.xrFramebuffer),
        (World.RENDERER.autoClear = clear));
    }),
    (this.renderDirect = (callback) => {
      _scene.children.length &&
        (_scene.traverse((obj) => {
          obj.shader && (obj.shader.depthTest = !1);
        }),
        callback(_scene, _camera));
    }));
});
