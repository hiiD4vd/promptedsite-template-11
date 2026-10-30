Class(function LottieMesh(_mesh, _shader, _group, _input) {
  Inherit(this, Component);
  const _this = this;
  let _lottie, _active, _frame, _config;
  function loop() {
    if (!_active || !_lottie.animation) return;
    let targetFrame = _shader.get("uFrame");
    targetFrame !== _frame &&
      ((_lottie.animation.loop = !1),
      _lottie.animation.setCurrentRawFrameValue(targetFrame),
      (_frame = targetFrame));
  }
  (_mesh._lottiemesh ||
    ((_mesh._lottiemesh = _this),
    (function initConfig() {
      ((_config = InputUIL.create(`${_input.prefix}lottiemesh`, _group)),
        _config.setLabel("Lottie"),
        _config.addFile("file", { relative: "assets/geometry" }),
        _config.addNumber("resolution", 1, 0.1));
    })(),
    (function initShader() {
      ((_mesh.shader = _this.initClass(Shader, "LottieShader")),
        _this.initClass(LottieShader, _mesh, _mesh.shader, _group, _input),
        (_shader = _mesh.shader).addUniforms({ uFrame: { value: 0 } }),
        ShaderUIL.add(_shader, _group).setLabel("Lottie Shader"));
    })(),
    _this.startRender(loop)),
    (this.onVisible = async function () {
      ((_active = !0),
        (_lottie = _this.initClass(LottieTexture, {
          path: _config.getFilePath("file"),
          dpr: _config.getNumber("resolution") || 1,
        })),
        await _lottie.ready,
        _shader.set("tMap", _lottie.texture));
    }),
    (this.onInvisible = function () {
      ((_active = !1), _lottie?.destroy());
    }),
    (this.onDestroy = function () {
      ((_active = !1), _lottie?.destroy());
    }),
    this.get("active", (_) => _active),
    this.get("lottie", (_) => _lottie),
    this.get("frame", (_) => _frame));
});
