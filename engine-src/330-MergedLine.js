Class(
  function MergedLine(_geometry, _lineCount) {
    Inherit(this, Object3D);
    const _this = this;
    var _shader, _mesh, _vs, _fs;
    function updateShader(shader) {
      ((shader.customCompile = `${shader.vsName}|${shader.fsName}|MergedLine`),
        shader.resetProgram(),
        (shader.vertexShader = shader.vertexShader.replace(
          "uniform float uLineWidth;",
          "attribute float thickness;",
        )),
        (shader.vertexShader = shader.vertexShader.replace("uLineWidth", "thickness")),
        (shader.fragmentShader = shader.fragmentShader.replace("uniform float uLineWidth;", "")),
        (shader.vertexShader = shader.vertexShader.replace(
          "uniform vec3 uColor;",
          "attribute vec3 aColor;",
        )),
        (shader.vertexShader = shader.vertexShader.replace("vColor = uColor;", "vColor = aColor;")),
        (shader.vertexShader = shader.vertexShader.replace(
          "uniform float uOpacity;",
          "attribute float aOpacity;",
        )),
        (shader.vertexShader = shader.vertexShader.replace(
          "vOpacity = uOpacity;",
          "vOpacity = aOpacity;",
        )),
        (_vs = shader.vertexShader),
        (_fs = shader.fragmentShader),
        _shader !== shader && _shader.copyUniformsTo(shader, !0));
    }
    ((this.geometry = _geometry),
      (function initShader() {
        ((_shader = _this.initClass(Shader, "Line", {
          uBaseWidth: Line3D.BASE_WIDTH,
          uLineCount: { type: "f", value: _lineCount || 1, ignoreUIL: !0 },
          transparent: !0,
        })).vertexShader
          ? ((Line3D.vertexShader = _shader.vertexShader),
            (Line3D.vsName = _shader.vsName),
            (Line3D.fragmentShader = _shader.fragmentShader),
            (Line3D.fsName = _shader.fsName))
          : ((_shader.vertexShader = Line3D.vertexShader),
            (_shader.fragmentShader = Line3D.fragmentShader)),
          (_shader.vertexShader && _shader.vertexShader.length) ||
            (_shader.vertexShader = Shaders.getShader("Line.vs")),
          (_shader.fragmentShader && _shader.fragmentShader.length) ||
            (_shader.fragmentShader = Shaders.getShader("Line.fs")),
          (_this.shader = _shader),
          updateShader(_shader));
      })(),
      (function createMesh() {
        (((_mesh = new Mesh(_geometry, _shader)).frustumCulled = !1),
          _this.add(_mesh),
          (_this.mesh = _mesh));
      })(),
      Hydra.LOCAL &&
        (function initHotReload() {
          _this.events.sub(ShaderUIL.SHADER_UPDATE, ({ shader: shader }) => {
            let updateCustom = !1;
            if (shader.includes(Line3D.vsName)) {
              let newBaseShader = new Shader(Line3D.vsName, Line3D.fsName);
              if (
                (newBaseShader.vertexShader &&
                  ((Line3D.vertexShader = newBaseShader.vertexShader),
                  (Line3D.fragmentShader = newBaseShader.fragmentShader)),
                updateShader(newBaseShader),
                Shader.renderer.hotReloadClearProgram(newBaseShader.customCompile),
                _shader.vsName === newBaseShader.vsName)
              )
                return (
                  newBaseShader.upload(_mesh, _geometry),
                  _shader._gl && (_shader._gl = newBaseShader._gl),
                  _shader._gpu && (_shader._gpu = newBaseShader._gpu),
                  void (_shader._metal && (_shader._metal = newBaseShader._metal))
                );
              updateCustom = !0;
            }
            if (shader.includes(_shader.vsName) || updateCustom) {
              let newShader = new Shader(_shader.vsName, _shader.fsName, _shader.params);
              (_this.useShader(newShader),
                Shader.renderer.hotReloadClearProgram(_shader.customCompile));
            }
          });
        })(),
      (this.useShader = function (shader) {
        ((_shader.vertexShader = _vs),
          (_shader.fragmentShader = _fs),
          ((_shader = Line3D.mergeShaders(shader, _shader)).customCompile =
            `${_shader.customCompile}|MergedLine`),
          (_this.shader = _shader),
          (shader.uniforms.uBaseWidth.ignoreUIL = shader.uniforms.uLineCount.ignoreUIL = !0),
          (shader.transparent = !0),
          _mesh && (_mesh.shader = _shader));
      }),
      (this.onDestroy = function () {
        (_this.events.fire(MergedLine.DESTROY),
          _mesh.destroy(),
          _this.group && _this.group.parent && _this.group.parent.remove(_this.group),
          _this._onDestroy && _this._onDestroy());
      }),
      (this.clone = function () {
        return new MergedLine(_geometry, _fs);
      }),
      this.set("widthMultiplier", (v) => {
        _shader.set("uBaseWidth", 1.8 * v);
      }),
      this.set("color", (hex) => {
        _shader.uniforms.uColor.value.set(hex);
      }));
  },
  (_) => {
    MergedLine.DESTROY = "merged_line_destroy";
  },
);
