Class(function Line3DLayer(_input, _group) {
  Inherit(this, Object3D);
  const _this = this;
  var _shader, _line, _config;
  async function load(json, subdivisions, color, width) {
    (json.includes("assets/geometry") || (json = `assets/geometry/${json}`),
      json.includes(".json") || (json += ".json"));
    let merged = await LineUtil.loadFromSplines(Assets.getPath(json), subdivisions, color, width);
    ((_line = merged),
      _this.add(merged),
      _shader && merged.useShader(_shader),
      _this.flag("loaded", !0));
  }
  (!(function () {
    let config = InputUIL.create(_input.prefix + "line3d", _group);
    config
      .add("json")
      .add("subdivisions", 100)
      .addColor("color", new Color())
      .add("width", 10)
      .setLabel("Spline");
    let json = config.get("json");
    if (json) {
      load(
        json,
        _this.parent.data && _this.parent.data.line3DSubdivisions
          ? _this.parent.data.line3DSubdivisions
          : config.getNumber("subdivisions"),
        config.get("color"),
        config.getNumber("width"),
      );
    }
    ((_config = config),
      (function initShader() {
        let shader = _input.get("shader");
        shader &&
          shader.length &&
          ((_this.shader = _shader =
            _this.initClass(Shader, shader, { transparent: !0, unique: _input.prefix })),
          (function completeShader(shader) {
            let transparent = _input.get("transparent"),
              depthWrite = _input.get("depthWrite"),
              depthTest = _input.get("depthTest"),
              blending = _input.get("blending"),
              castShadow = _input.get("castShadow"),
              receiveShadow = _input.get("receiveShadow");
            "boolean" == typeof depthWrite && (shader.depthWrite = depthWrite);
            "boolean" == typeof depthTest && (shader.depthTest = depthTest);
            "boolean" == typeof transparent && (shader.transparent = transparent);
            "boolean" == typeof castShadow && defer((_) => (_this.mesh.castShadow = castShadow));
            "boolean" == typeof receiveShadow && (shader.receiveShadow = receiveShadow);
            blending && (shader.blending = blending);
          })(_shader),
          window[shader] && _this.initClass(window[shader], _this, _shader),
          ShaderUIL.add(_shader, _group).setLabel("Shader"));
      })());
  })(),
    (this.ready = function () {
      return _this.wait("loaded");
    }),
    (this.getRandomPosition = async function () {
      let positions = _line.geometry.attributes.position.array,
        index = 3 * Math.random(0, positions.length / 3, 0);
      return new Vector3(positions[index], positions[index + 1], positions[index + 2]);
    }),
    (this.loadFile = function (path) {
      if (
        (_line && (_this.flag("loaded", !1), _this.group.remove(_line.group), _line.destroy()),
        "string" == typeof path)
      )
        load(
          path,
          _config.getNumber("subdivisions"),
          _config.get("color"),
          _config.getNumber("width"),
        );
      else {
        let merged = path;
        ((_line = merged),
          _this.add(merged),
          _shader && merged.useShader(_shader),
          _this.flag("loaded", !0));
      }
    }));
});
