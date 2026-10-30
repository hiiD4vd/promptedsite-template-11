Class(
  function PBRShader(_vertexShader, _fragmentShader, _params) {
    const _this = this;
    function defineSetter(prop) {
      Object.defineProperty(_this, prop, {
        set: function (v) {
          _this.shader[prop] = v;
        },
        get: function () {
          return _this.shader[prop];
        },
      });
    }
    ("object" == typeof _vertexShader &&
      ((_params = _vertexShader), (_vertexShader = _fragmentShader = "PBR")),
      "string" != typeof _fragmentShader &&
        ((_params = _fragmentShader), (_fragmentShader = _vertexShader)),
      _vertexShader || (_vertexShader = _fragmentShader = "PBR"),
      (function initShader() {
        let lookup = Utils3D.getLookupTexture("~assets/images/pbr/lut.png");
        ((lookup.forcePersist = !0),
          (_this.shader = new Shader(
            _vertexShader,
            _fragmentShader,
            Utils.mergeObject(_params || {}, {
              tBaseColor: { value: null, getTexture: Utils3D.getRepeatTexture },
              tMRO: { value: null, getTexture: Utils3D.getRepeatTexture },
              tNormal: { value: null, getTexture: Utils3D.getRepeatTexture },
              tEnvDiffuse: { value: null, premultiplyAlpha: !1 },
              tEnvSpecular: { value: null, premultiplyAlpha: !1 },
              uEnvOffset: { value: new Vector2(0, 0) },
              tLightmap: { value: null, premultiplyAlpha: !1 },
              tLUT: { value: lookup, ignoreUIL: !0 },
              uTint: { value: new Color("#FFFFFF") },
              uTiling: { value: new Vector2(1, 1) },
              uOffset: { value: new Vector2(0, 0) },
              uMRON: { value: new Vector4(1, 1, 1, 1) },
              uEnv: { value: new Vector3(1, 1, 0) },
              uUseLightmap: { value: 0 },
              uHDR: { value: 0, ignoreUIL: !0 },
              uUseTonemapping: { value: 1, ignoreUIL: !0 },
              uUseLinearOutput: { value: 0 },
              uLightmapIntensity: { value: 1 },
              receiveLight: !0,
            }),
          )),
          (_this.shader.parent = _this),
          (_this.lights = _this.shader.lights),
          (_this.uniforms = _this.shader.uniforms),
          [
            "side",
            "blending",
            "polygonOffset",
            "polygonOffsetFactor",
            "polygonOffsetUnits",
            "receiveShadow",
            "vertexShader",
            "fragmentShader",
            "depthTest",
            "depthWrite",
            "wireframe",
            "transparent",
            "visible",
            "persists",
            "material",
            "customShadowShader",
          ].forEach(defineSetter));
      })());
  },
  (_) => {
    const prototype = PBRShader.prototype;
    ((PBRShader.webgl1 = function () {
      return World.RENDERER.type == Renderer.WEBGL1;
    }),
      (prototype.set = function (key, value) {
        return (
          void 0 !== value && (this.shader.uniforms[key].value = value),
          this.shader.uniforms[key].value
        );
      }),
      (prototype.get = function (key) {
        return this.shader.uniforms[key].value;
      }),
      (prototype.tween = function (key, value, time, ease, delay, callback, update) {
        return tween(
          this.shader.uniforms[key],
          { value: value },
          time,
          ease,
          delay,
          callback,
          update,
        );
      }),
      (prototype.setPBR = prototype.setOverride =
        function (key, value, ref = this) {
          switch (
            (ref.parent instanceof PBRShader && (ref = ref.parent), ref.set(key, value), key)
          ) {
            case "tEnvDiffuse":
            case "tEnvSpecular":
            case "tLUT":
              ((value.generateMipmaps = !1), (value.minFilter = Texture.LINEAR));
          }
          let src = value.src;
          src &&
            src.toLowerCase().includes("rgbm") &&
            (ref.shader.set("uHDR", 1), ref.shader.set("uEnv", new Vector3(1, 1, 0)));
        }),
      (prototype.destroy = function () {
        this.shader.destroy();
      }),
      (prototype.copyUniformsTo = function (shader, linked, ignore) {
        for (let key in this.uniforms)
          void 0 !== this.uniforms[key] &&
            ((ignore && ignore.includes?.(key)) ||
              (shader.uniforms[key] = linked
                ? this.uniforms[key]
                : { type: this.uniforms[key].type, value: this.uniforms[key].value }));
      }),
      (prototype.replicateUniformsTo = function (shader) {
        ((shader.uniforms = this.uniforms),
          (shader._uniformKeys = this._uniformKeys),
          (shader._uniformValues = this._uniformValues));
      }),
      (prototype.addUniforms = function (uniforms) {
        uniforms.UILPrefix && ((this.UILPrefix = uniforms.UILPrefix), delete uniforms.UILPrefix);
        for (let key in uniforms)
          (this.hotReloading && this.uniforms[key]) || (this.uniforms[key] = uniforms[key]);
      }));
  },
);
