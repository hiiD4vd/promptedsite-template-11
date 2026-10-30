Class(function FXSceneCompositor(_shader, _options = {}) {
  Inherit(this, Object3D);
  const _this = this;
  var _basicShader,
    _shaders = new Map();
  function decorateShader(shader) {
    shader.addUniforms({
      tFrom: { value: null, ignoreUIL: !0 },
      tTo: { value: null, ignoreUIL: !0 },
      uTransition: { value: 0 },
    });
  }
  function loop() {
    ((_this.mesh.shader = _shader.uniforms.uTransition.value > 0 ? _shader : _basicShader),
      _shader.uniforms.uTransition.value >= 1 &&
        ((_this.mesh.shader = _basicShader),
        _basicShader.set("tMap", _shader.get("tTo")),
        _shader.set("uTransition", 0)));
  }
  (!(function initOptions() {
    (null === _options ||
      _options instanceof Texture ||
      _options.texture ||
      (_options.rt && _options.rt.texture)) &&
      (_options = { startTexture: _options });
  })(),
    decorateShader(_shader),
    (function initMesh() {
      let uniforms = { tMap: { value: _options.startTexture || null } };
      (_options.basicShader
        ? (_basicShader = _options.basicShader).addUniforms(uniforms)
        : (_basicShader = _this.initClass(Shader, "ScreenQuad", uniforms)),
        (_this.mesh = new Mesh(World.QUAD, _basicShader)),
        (_this.mesh.frustumCulled = !1),
        _this.add(_this.mesh));
    })(),
    (function initHotReload() {
      _this.events.sub(
        Component.HMR_INSTANCE_RELOADED,
        ({ oldInstance: oldInstance, newInstance: newInstance }) => {
          (newInstance !== _basicShader.get("tMap") && newInstance !== _shader.get("tTo")) ||
            (newInstance.visible = !0);
        },
      );
    })(),
    _shaders.set("default", _shader),
    _this.startRender(loop),
    (this.useShader = function (shader) {
      let nextShader = _shaders.get(shader) || _shaders.get("default");
      (nextShader.set("tFrom", _shader.get("tFrom")),
        nextShader.set("tTo", _shader.get("tTo")),
        (_shader = nextShader),
        _shader.onActivate?.());
    }),
    (this.addShader = function (shaderName) {
      let shader = _this.initClass(Shader, shaderName, _options.uniforms);
      return (decorateShader(shader), _shaders.set(shaderName, shader), shader);
    }),
    (this.useBasicShader = function (shader) {
      (_basicShader.copyUniformsTo(shader, !0), (_basicShader = shader));
    }),
    (this.swap = function (showTransition) {
      showTransition
        ? ((_this.mesh.shader = _shader),
          _shader.set("tFrom", _basicShader.get("tMap")),
          _shader.set("tTo", _basicShader.get("tMap")))
        : (_basicShader.set("tMap", _shader.get("tTo")),
          (_this.mesh.shader = _basicShader),
          _shader.set("tFrom", _basicShader.get("tMap")));
    }),
    this.set("manual", (v) => {
      v ? _this.stopRender(loop) : _this.startRender(loop);
    }),
    (this.transition = async function (texture, time, ease, delay = 0) {
      _this.parent.lock && _this.parent.lock();
      let from = _shader.get("tFrom");
      (_shader.set("tTo", texture),
        (texture.visible = !0),
        from || "number" != typeof delay
          ? ("number" != typeof delay && (await delay, (delay = 0)),
            await _shader
              .tween("uTransition", 1, time, ease, delay)
              .onUpdate((_) => {
                _shader.linkTweens &&
                  _shader.linkTweens.forEach((tween) => {
                    tween.seek(_shader.get("uTransition"));
                  });
              })
              .promise())
          : _shader.set("uTransition", 1),
        from && (from.visible = !1),
        _shader.set("tFrom", texture),
        _this.parent.unlock && _this.parent.unlock());
    }),
    (this.interpolate = function (from, to, blend) {
      ((_this.mesh.shader = _shader),
        _shader.set("tFrom", from),
        _shader.set("tTo", to),
        _shader.set("uTransition", blend));
    }),
    (this.test = function (shader) {
      ((_this.manual = !0), _this.useShader(shader), _this.swap(!0));
    }));
});
