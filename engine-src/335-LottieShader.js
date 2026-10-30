Class(function LottieShader(_mesh, _shader, _group, _input) {
  Inherit(this, Component);
  !(function () {
    const unique = `lottie_${_group?.id || _input?.name || _mesh?.uilName}`;
    _shader.addUniforms({
      tMap: { value: null, ignoreUIL: !0 },
      uFrame: { value: 0 },
      uSharp: { value: 1 },
      uSharpEdge: { value: 0.6 },
      uSolidColor: { value: new Color(16711680) },
      uSecondColor: { value: new Color(255) },
      uUseSolidColor: { value: 0 },
      uScale: { value: 1 },
      unique: unique,
      transparent: !0,
    });
  })();
});
