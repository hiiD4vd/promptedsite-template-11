Class(function FluidHandler(_params = { layout: null, active: !0, mouse: Mouse }) {
  Inherit(this, Object3D);
  const _this = this;
  var _config, _fluid, _custom;
  this.scale = 1;
  var _scale = 1,
    _last = new Vector2(),
    _mouse = new Vector2(),
    _white = new Color("#ffffff");
  function loop() {
    if (!_this.disabled) {
      if (!_this.skipMouse) {
        ((_scale += (_this.scale - _scale) * Math.framerateNormalizeLerpAlpha(0.05)),
          _custom || _mouse.copy(_params.mouse));
        let len = _mouse.distanceTo(_last),
          size = _this.scaleBasedOnVelocity ? Math.range(len, 0, 5, 0, 60, !0) : 25;
        size *= 0.8;
        let delta = Math.range(len, 0, 15, 0, 10, !0);
        (len > 0.01 &&
          _fluid.drawInput(
            _mouse.x,
            _mouse.y,
            (_mouse.x - _last.x) * delta,
            (_mouse.y - _last.y) * delta,
            _white,
            size * _scale,
          ),
          _last.copy(_mouse));
      }
      _this?.texture && _fluid.drawSplatTexture(_this.texture, _white);
    }
  }
  ((this.scaleBasedOnVelocity = !0),
    (async function () {
      let layout = _this.initClass(SceneLayout, "fluidhandler");
      (((_fluid = await layout.getLayer("textureFluid")).forcePersist = !0),
        (function initConfig() {
          ((_config = InputUIL.create(
            `${_fluid.uilInput.prefix}fluidhandler`,
            _fluid.uilGroup,
          )).setLabel("Fluid Hanlder Config"),
            _config.add("scale", 1),
            (_config.onUpdate = (key) => {
              if ("scale" === key) _this.scale = _config.getNumber("scale");
            }),
            _config.onUpdate());
        })(),
        _this.isPlayground() && _fluid.initMesh(),
        (_this.fluid = _fluid),
        _params.active
          ? _this.startRender(loop, RenderManager.AFTER_LOOPS)
          : (_fluid.visible = !1));
    })(),
    (this.applyTo = async function (shader) {
      (await _this.wait("fluid"),
        (shader.uniforms.tFluid = _fluid.fbos.velocity.uniform),
        (shader.uniforms.tFluidMask = { value: _fluid }));
    }),
    (this.useCustomMouse = function () {
      _custom = !0;
    }),
    (this.getFluid = async function () {
      return (await _this.wait("fluid"), _this.fluid);
    }),
    this.get("mouse", (_) => _mouse));
});
