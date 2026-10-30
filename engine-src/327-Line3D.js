Class(
  function Line3D(_params = {}) {
    Inherit(this, Object3D);
    const _this = this;
    let _geometry,
      _shader,
      _mesh,
      _vs,
      _fs,
      _prevPoint,
      _index = _params.index || 0,
      _points = _params.points || [],
      _pressure = _params.pressure || [],
      _taperFunction = _params.taperFunction || (() => 1),
      _dynamic = _params.dynamic || !1;
    function initMesh() {
      if (_mesh) return;
      let geometry;
      if (_params.geometry) geometry = _params.geometry;
      else {
        if (_points.length < 2) return;
        geometry = _geometry.geometry;
      }
      ((_mesh = new Mesh(geometry, _shader)),
        (_mesh.frustumCulled = !1),
        "number" == typeof _params.renderOrder && (_mesh.renderOrder = _params.renderOrder),
        _this.add(_mesh),
        (_this.mesh = _mesh),
        _geometry && (_geometry.mesh = _mesh));
    }
    (!(function initGeometry() {
      _params.geometry ||
        (_geometry = _this.initClass(LineGeometry, {
          index: _index,
          points: _points,
          pressure: _pressure,
          taperFunction: _taperFunction,
          dynamic: _dynamic,
        }));
    })(),
      window.THREAD ||
        ((function initShader() {
          const shaderName = _params.customShader || "Line";
          ((_shader = _this.initClass(Shader, shaderName, {
            uLineWidth: { value: _params.width || Line3D.defaultLineWidth, ignoreUIL: !0 },
            uBaseWidth: Line3D.BASE_WIDTH,
            uColor: { value: new Color(_params.color || Line3D.defaultColor), ignoreUIL: !0 },
            uOpacity: { value: _params.opacity || Line3D.defaultOpacity, ignoreUIL: !0 },
            transparent: !0,
            depthWrite: !1 !== _params.depthWrite,
            depthTest: !1 !== _params.depthTest,
          })),
            (_vs = _shader.vertexShader),
            (_fs = _shader.fragmentShader),
            _vs &&
              ((Line3D.vertexShader = _shader.vertexShader),
              (Line3D.vsName = _shader.vsName),
              (Line3D.fragmentShader = _shader.fragmentShader),
              (Line3D.fsName = _shader.fsName)),
            (_this.shader = _shader));
        })(),
        initMesh(),
        Hydra.LOCAL &&
          (function initHotReload() {
            _this.events.sub(ShaderUIL.SHADER_UPDATE, ({ shader: shader }) => {
              let updateCustom = !1;
              if (shader.includes(Line3D.vsName)) {
                let newBaseShader = new Shader(Line3D.vsName, Line3D.fsName);
                if (
                  (newBaseShader.resetProgram(),
                  (_vs = Line3D.vertexShader = newBaseShader.vertexShader),
                  (_fs = Line3D.fragmentShader = newBaseShader.fragmentShader),
                  _shader.vsName === newBaseShader.vsName)
                )
                  return;
                updateCustom = !0;
              }
              if (shader.includes(_shader.vsName) || updateCustom) {
                let newShader = new Shader(_shader.vsName, _shader.fsName, _shader.params);
                (_this.useShader(newShader),
                  Shader.renderer.hotReloadClearProgram(_shader.customCompile));
              }
            });
          })()),
      this.get("data", () => ({
        geometry: { points: _points, pressure: _pressure, index: _index },
        meta: {
          fs: _shader.fsName,
          vs: _shader.vsName,
          width: _shader.uniforms.uLineWidth.value,
          opacity: _shader.uniforms.uOpacity.value,
          color: _shader.uniforms.uColor.value.getHex(),
        },
      })),
      this.get("lineGeometry", () => _geometry),
      this.get("geometry", () => _mesh?.geometry || _geometry.geometry),
      this.set("lineWidth", (v) => {
        _shader.set("uLineWidth", v);
      }),
      this.set("color", (hex) => {
        _shader.uniforms.uColor.value.set(hex);
      }),
      this.set("opacity", (value) => {
        _shader.uniforms.uOpacity.value = value;
      }),
      (this.useShader = function (shader) {
        ((_shader.vertexShader = _vs),
          (_shader.fragmentShader = _fs),
          (_shader = Line3D.mergeShaders(shader, _shader)),
          (_this.shader = _shader),
          _mesh && (_mesh.shader = _shader));
      }),
      (this.draw = function (pos, pressure = 1) {
        (_points.push(pos.x, pos.y, pos.z || 0),
          _pressure.push(pressure),
          _points.length < 2 || (_geometry.update(_points, !0), _mesh || initMesh()));
      }),
      (this.moveTo = function (pos, subdivisions = 30) {
        if (_prevPoint) {
          let v = new Vector3();
          for (let i = 0; i < subdivisions; i++)
            (v.copy(_prevPoint).lerp(pos, i / (subdivisions - 1), !1),
              _points.push(v.x, v.y, v.z || 0),
              _pressure.push(1));
        }
        ((_prevPoint = pos),
          _points.length < 2 || (_geometry.update(_points, !0), _mesh || initMesh()));
      }),
      (this.clear = function (clearGeometry = !0) {
        ((_points.length = 0), (_prevPoint = null), clearGeometry && _geometry.clear());
      }),
      (this.fromCurve = function (curve, subdivisions = 30) {
        _this.clear();
        for (let i = 0; i <= subdivisions; i++) {
          let pct = i / subdivisions,
            pos = curve.getPoint(pct);
          (_points.push(pos.x, pos.y, pos.z || 0), _pressure.push(1));
        }
        (_geometry.update(_points, !0), _mesh || initMesh());
      }),
      (this.onDestroy = function () {
        (_this.parent && _this.parent.group && _this.parent.group.remove(_this.group),
          _mesh && _mesh.destroy && _mesh.destroy(),
          _this._onDestroy && _this._onDestroy());
      }));
  },
  () => {
    ((Line3D.defaultLineWidth = 1),
      (Line3D.defaultOpacity = 1),
      (Line3D.defaultColor = "#ffffff"),
      (Line3D.BASE_WIDTH = { value: 0.005, ignoreUIL: !0 }),
      (Line3D.MAX_LINE_LENGTH = 500),
      (Line3D.mergeShaders = function (s0, s1) {
        ((s0.customCompile = `${s0.vsName}|${s0.fsName}|Line3D`), s1.copyUniformsTo(s0));
        for (let key in s1.properties) s0.properties[key] = s1.properties[key];
        if (s0.lineFormat || !s0.vertexShader) return ((s0.lineFormat = !0), s0);
        s1.fragmentShader ||
          ((s1.fragmentShader = Line3D.fragmentShader), (s1.vertexShader = Line3D.vertexShader));
        let vs = s0.vertexShader.split("__ACTIVE_THEORY_LIGHTS__")[1],
          fs = s0.fragmentShader.split("__ACTIVE_THEORY_LIGHTS__")[1],
          split = vs.split("void main() {"),
          fsParams = s1.fragmentShader.split("__ACTIVE_THEORY_LIGHTS__")[1].split("void main")[0];
        if (
          ((s0.fragmentShader = s0.fragmentShader.split("__ACTIVE_THEORY_LIGHTS__").join(fsParams)),
          (s1.vertexShader = s1.vertexShader.replace("//params", split[0])),
          (s1.vertexShader = s1.vertexShader.replace("//main", split[1].split("}")[0])),
          s0.vertexShader.includes("customMatrix"))
        ) {
          let content = s0.vertexShader.split("customMatrix() {")[1];
          content = content.split("}")[0];
          let matrix = s1.vertexShader.split("//startMatrix")[1].split("//endMatrix")[0];
          s1.vertexShader = s1.vertexShader.replace(matrix, content);
        }
        if (s0.vertexShader.includes("customDirection")) {
          let content = s0.vertexShader.split("customDirection() {")[1];
          ((content = content.split("}")[0]),
            (s1.vertexShader = s1.vertexShader.replace("//direction", content)));
        }
        return (
          (split = fs.split("void main() {")),
          (s1.fragmentShader = s1.fragmentShader.replace(
            "//fsmain",
            split[1].substring(0, split[1].lastIndexOf("}")),
          )),
          (s1.fragmentShader = s1.fragmentShader.replace("//fsparams", split[0])),
          (s0.vertexShader = s1.vertexShader),
          (s0.fragmentShader = s1.fragmentShader),
          s0
        );
      }));
  },
);
