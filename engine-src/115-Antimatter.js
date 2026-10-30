Class(function Antimatter(_num, _config, _renderer = World.RENDERER, _pointData = null) {
  Inherit(this, AntimatterFBO);
  var _geometry,
    _this = this,
    _drawLimit = _num,
    _size = (function findSize() {
      return _config.pot
        ? Math.pow(2, Math.ceil(Math.log(Math.sqrt(_num)) / Math.log(2)))
        : Math.ceil(Math.sqrt(_num));
    })();
  async function createBuffer() {
    let {
      geometry: geometry,
      vertices: vertices,
      attribs: attribs,
      usedDepth: usedDepth,
      key: key,
    } = await AntimatterUtil.createBufferArray(_size, _num, _config, _pointData);
    ((_this.key = key),
      (_this.vertices = _this.cloneVertices ? vertices.clone() : vertices),
      ((_geometry = geometry.clone(!0)).drawRange.end = _drawLimit),
      (_this.vertices.geometry = _geometry),
      (_this.attribs = _this.random = attribs),
      (_this.textureUsedDepth = usedDepth),
      _this.init(_geometry, _renderer, _size));
  }
  (defer(createBuffer),
    (this.createFloatArray = function (components = 3) {
      return new Float32Array(_size * _size * components);
    }),
    (this.createFloatArrayAsync = async function (components = 3, freshCopy) {
      let { array: array } = await AntimatterUtil.createFloatArray(
        _size * _size * components,
        freshCopy,
      );
      return array;
    }),
    (this.ready = function (callback) {
      return _this.wait(_this, "vertices");
    }),
    (this.useShader = function (vs, fs, params) {
      ("object" == typeof fs && ((params = fs), (fs = null)),
        (this.vertexShader = vs),
        (this.fragmentShader = fs || vs),
        (this.uniforms = params));
    }),
    (this.createMesh = this.getMesh =
      function () {
        let shader = _this.createShader(_this.fragmentShader || "AntimatterBasicFrag");
        return (
          (_this.mesh = new Points(_geometry, shader)),
          (_this.mesh.frustumCulled = !1),
          (_this.shader = shader),
          (_this.geometry = _geometry),
          _this.mesh
        );
      }),
    (this.createShader = function (fs) {
      let uniforms = _this.uniforms || {};
      const nuke = (function findNuke() {
        let p = _this.parent;
        for (; p;) {
          if (p.nuke) return p.nuke;
          p = p.parent;
        }
        for (p = _this.parent; p;) {
          if (p.nuke) return p.nuke;
          p = p.group ? p.group._parent : p.parent || p._parent;
        }
        return World.NUKE;
      })();
      _this._nuke = nuke;
      let obj = {
        tPos: { type: "t", value: _this.vertices.texture, ignoreUIL: !0 },
        tPrevPos: { type: "t", value: _this.vertices.texture, ignoreUIL: !0 },
        uDPR: { value: nuke?.dpr || 1, ignoreUIL: !0 },
      };
      for (let key in uniforms) obj[key] = uniforms[key];
      let shader = new Shader(_this.vertexShader || "AntimatterPosition", fs, obj),
        vs = shader.vertexShader;
      if (vs && !vs.includes("uniform sampler2D tPos")) {
        let split = vs.split("__ACTIVE_THEORY_LIGHTS__"),
          defined = "uniform sampler2D tPos;";
        shader.vertexShader = split[0] + "\n" + defined + "\n__ACTIVE_THEORY_LIGHTS__\n" + split[1];
      }
      return ((shader._parentnuke = nuke), shader);
    }),
    (this.getLookupArray = function () {
      return new Float32Array(_this.vertices.geometry.attributes.position.array);
    }),
    (this.getRandomArray = function () {
      return _geometry.attributes.random.array;
    }),
    (this.overrideShader = function (original) {
      let shader = original.clone();
      ((shader._parentnuke = _this._nuke),
        original.copyUniformsTo(shader),
        (shader.uniforms.tPos = { type: "t", value: _this.vertices.texture, ignoreUIL: !0 }),
        (shader.uniforms.tPrevPos = { type: "t", value: _this.vertices.texture, ignoreUIL: !0 }),
        (shader.uniforms.uDPR = { value: shader?._parentnuke?.dpr || 1, ignoreUIL: !0 }),
        (_this.shader = shader),
        (_this.mesh.shader = shader));
    }),
    (this.upload = async function (needsMesh) {
      if (
        ((_this.preventRender = !0),
        (_geometry.distributeBufferData = !0),
        await _this.ready(),
        _this.vertices?.destroy &&
          (await _this.vertices.uploadAsync(),
          await defer(),
          _this.random?.destroy &&
            (await _this.random.uploadAsync(),
            await defer(),
            _this.mesh && needsMesh && (_this.mesh.upload(), await _geometry.uploadBuffersAsync()),
            _this.destroy)))
      ) {
        for (let key in _this.shader.uniforms) {
          let uniform = _this.shader.uniforms[key];
          uniform.value &&
            (uniform.value.uploadAsync
              ? await uniform.value.uploadAsync()
              : uniform.value.upload && (uniform.value.upload(), await defer()));
        }
        await _this.wait(100);
        for (let i = 0; i < _this.passes.length; i++) await _this.passes[i].upload();
        _this.preventRender = !1;
      }
    }),
    (this.uploadSync = async function (needsMesh) {
      (await _this.ready(),
        _this.customClass && _this.customClass.loaded && (await _this.customClass.loaded()));
      for (let i = 0; i < 4; i++) _this.update();
    }),
    this.get("particleCount", (_) => _num),
    this.get("textureSize", (_) => _size),
    this.get("powerOf2", (_) => Math.pow(2, Math.ceil(Math.log(Math.sqrt(_num)) / Math.log(2)))));
});
