Class(function Draw(__rtScale = 0.3, __filter = Texture.LINEAR) {
  Inherit(this, Component);
  const _this = this;
  let _rt,
    _scene,
    _mousePos = new Vector2(),
    _ease = 0.5,
    _rtScale = __rtScale,
    _width = Stage.width * _rtScale,
    _height = Stage.height * _rtScale;
  function resize() {
    ((_width = Stage.width * _rtScale),
      (_height = Stage.height * _rtScale),
      _rt.setSize(_width, _height),
      _scene.uniforms.uResolution.value.set(_width, _height));
  }
  function loop() {
    ((_scene.uniforms.tSource.value = _rt.read), _scene.render(_rt.write), _rt.swap());
  }
  ((_scene = _this.initClass(DrawScene, "DrawShader", "DrawShader", {
    tSource: { value: null },
    uResolution: { value: new Vector2(Stage.width, Stage.height) },
    uPosition: { value: new Vector2() },
    uTrail: { value: 0.9 },
    uSharp: { value: 0 },
    uSize: { value: 1 },
  })),
    (_rt = _this.initClass(PingPongRT, _width, _height, __filter)),
    (_rt.disableDepth = !0),
    _this.startRender(loop),
    _this.onResize(resize),
    this.get("rt", () => _rt),
    this.set("ease", (value) => {
      _ease = value;
    }),
    this.set("trail", (value) => {
      _scene.uniforms.uTrail.value = value;
    }),
    this.set("sharp", (value) => {
      _scene.uniforms.uSharp.value = value;
    }),
    this.set("size", (value) => {
      _scene.uniforms.uSize.value = value;
    }),
    this.set("position", (value) => {
      (_mousePos.copy(value),
        _scene.uniforms.uPosition.value.lerp(_mousePos.clone().multiplyScalar(_rtScale), _ease));
    }));
});
