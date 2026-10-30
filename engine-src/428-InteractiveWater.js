Class(function InteractiveWater(_input, _group) {
  Inherit(this, Object3D);
  const _this = this;
  var _compute,
    _heightmapVariable,
    _shader,
    _config,
    _wrapper = new Group();
  function loop() {
    (_compute.compute(),
      (_shader.uniforms.heightmap.value = _compute.getCurrentRenderTarget(_heightmapVariable)));
  }
  (!(function initConfig() {
    ((_config = InputUIL.create(_input.prefix + "water", _group)).add("subdivide", 128),
      _config.add("viscosity", 0.98),
      _config.addNumber("heightScale", 1),
      _config.setLabel("Config"),
      (_config.onUpdate = (key) => {
        ("viscosity" == key &&
          _heightmapVariable.shader.set("viscosityConstant", _config.getNumber("viscosity")),
          "heightScale" == key && _shader.set("heightScale", _config.getNumber("heightScale")));
      }),
      (_wrapper.rotation.x = Math.radians(-90)));
  })(),
    (function initPlane() {
      let shaderName = _input.get("shader");
      _shader = _this.initClass(Shader, shaderName || "WaterShader", {
        WIDTH: { value: 256, ignoreUIL: !0 },
        heightmap: { value: null, ignoreUIL: !0 },
        heightScale: { value: 0, ignoreUIL: !0 },
      });
      let geom = new PlaneGeometry(1, 1, 1, 1),
        mesh = new Mesh(geom, _shader);
      (_wrapper.add(mesh),
        (_this.mesh = mesh),
        shaderName &&
          (window[shaderName] &&
            (_this.shaderClass = _this.parent.initClass(
              window[shaderName],
              _this.group,
              _shader,
              _group,
              _input,
            )),
          ShaderUIL.add(_shader, _group).setLabel("Shader")));
    })(),
    (function initCompute() {
      let heightmap = (_compute = _this.initClass(GPUCompute, 256, 256)).createTexture(),
        pixels = heightmap.data,
        len = 65536;
      for (let i = 0; i < len; i++)
        ((pixels[4 * i + 0] = 0),
          (pixels[4 * i + 1] = 0),
          (pixels[4 * i + 2] = 0),
          (pixels[4 * i + 3] = 1));
      (((_heightmapVariable = _compute.addVariable(
        "heightmap",
        "InteractiveWaterHeightmap",
        heightmap,
      )).dependencies = [_heightmapVariable]),
        _heightmapVariable.shader.addUniforms({
          tHand: { value: null },
          viscosityConstant: { value: _config.getNumber("viscosity") },
          WIDTH: { value: 256 },
          uScroll: { value: 0 },
        }),
        heightmap.upload(),
        _compute.init());
    })(),
    _this.startRender(loop, 60),
    _this.group.add(_wrapper),
    this.set("viscosity", (v) => _heightmapVariable.shader.set("viscosityConstant", v)),
    this.get("computeShader", () => _heightmapVariable.shader));
});
