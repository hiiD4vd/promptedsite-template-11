Class(function AntimatterPass(_shader, _uni, _clone) {
  Inherit(this, Component);
  var _this = this;
  this.UILPrefix = "am_" + _shader;
  const _uniforms = {
    tInput: { type: "t", value: null, ignoreUIL: !0 },
    fSize: { type: "f", value: 64, ignoreUIL: !0 },
  };
  var _rts = [],
    _read = 0,
    _write = 0;
  function prepareShader(code, type) {
    if ("vs" == type) return code;
    let header = [
        "uniform sampler2D tInput;",
        "uniform float fSize;",
        "varying vec2 vUv;",
        Shaders.getShader("antimatter.glsl"),
      ].join("\n"),
      mainAt = code.indexOf("void main()"),
      before = code.slice(0, mainAt),
      after = code.slice(mainAt);
    return (
      (code = before + header + after),
      _this.onCreateShader && (code = _this.onCreateShader(code)),
      code
    );
  }
  function initRT(size) {
    var type =
        "ios" == Device.system.os && Renderer.type == Render.WEBGL1
          ? Texture.HALF_FLOAT
          : Texture.FLOAT,
      parameters = {
        minFilter: Texture.NEAREST,
        magFilter: Texture.NEAREST,
        format: Texture.RGBAFormat,
        type: type,
      },
      rt = new RenderTarget(size, size, parameters);
    return ((rt.texture.generateMipmaps = !1), rt);
  }
  ((this.uniforms = _uniforms),
    (this.output = initRT(64)),
    (this.name = _shader),
    (this.id = Utils.timestamp()),
    (this.ready = !1),
    (function () {
      if (_uni)
        for (var key in (_uni.unique &&
          ((_this.UILPrefix += "_" + _uni.unique.replace("/", "_")), delete _uni.unique),
        _uni.customCompile &&
          ((_this.customCompile = _uni.customCompile || ""), delete _uni.customCompile),
        _uni))
          _uniforms[key] = _uni[key];
    })(),
    (this.addInput = function (name, attribute) {
      var uniform =
        "object" != typeof attribute || attribute.height || "string" != typeof attribute.type
          ? attribute instanceof AntimatterAttribute
            ? { type: "t", value: attribute.texture, ignoreUIL: !0 }
            : attribute instanceof AntimatterPass
              ? { type: "t", value: attribute.output, ignoreUIL: !0 }
              : { type: "t", value: attribute, ignoreUIL: !0 }
          : attribute;
      let lookup = UILStorage.parse(_this.UILPrefix + name);
      lookup && (uniform.value = lookup.value);
      let uniforms = _shader && _shader.uniforms ? _shader.uniforms : _uniforms;
      return ((uniforms[name] = uniform), (uniform.ignoreUIL = !0), uniforms[name]);
    }),
    (this.addUniforms = function (object) {
      let uniforms = _shader && _shader.uniforms ? _shader.uniforms : _uniforms;
      for (let key in object) {
        let uniform = object[key],
          lookup = UILStorage.parse(_this.UILPrefix + key);
        if (lookup) {
          if (Array.isArray(lookup.value))
            switch (lookup.value.length) {
              case 2:
                lookup.value = new Vector2().fromArray(lookup.value);
                break;
              case 3:
                lookup.value = new Vector3().fromArray(lookup.value);
                break;
              case 4:
                lookup.value = new Vector4().fromArray(lookup.value);
            }
          uniform.value = lookup.value;
        }
        uniforms[key] = uniform;
      }
    }),
    (this.getRT = function (index) {
      return _rts[index];
    }),
    (this.getRead = function () {
      return _rts[_read];
    }),
    (this.getWrite = function () {
      return _rts[_write];
    }),
    (this.setRead = function (index) {
      _read = index;
    }),
    (this.setWrite = function (index) {
      _write = index;
    }),
    (this.swap = function () {
      (++_write > 2 && ((_write = 0), (_this.ready = !0)),
        ++_read > 2 && (_this.onInit && (_this.onInit(), (_this.onInit = null)), (_read = 0)));
    }),
    (this.initialize = function (size) {
      if (!_this.init) {
        _this.init = !0;
        for (var i = 0; i < 3; i++) _rts.push(initRT(size));
        (_this.output.setSize(size, size),
          _shader instanceof Shader ||
            (((_shader = _this.initClass(Shader, "AntimatterPass", _shader, {
              customCompile: _this.customCompile,
            }))._attachmentData = {
              format: Texture.RGBAFormat,
              type: Texture.FLOAT,
              attachments: 1,
            }),
            (_shader.preCompile = prepareShader),
            _shader.addUniforms(_uniforms),
            (_this.uniforms = _shader.uniforms),
            (_shader.UILPrefix = _this.UILPrefix),
            (_shader.id = Utils.timestamp())),
          (_this.shader = _shader),
          (_shader.uniforms.fSize.value = size));
      }
    }),
    (this.setUniform = function (key, value) {
      (_uniforms[key] || (_uniforms[key] = { value: value }),
        (_uniforms[key].value = value),
        _shader && _shader.uniforms && (_shader.uniforms[key].value = value));
    }),
    (this.getUniform = function (key) {
      return _shader && _shader.uniforms ? _shader.uniforms[key].value : null;
    }),
    (this.tween = function (key, value, time, ease, delay, callback, update) {
      return tween(_shader.uniforms[key], { value: value }, time, ease, delay, callback, update);
    }),
    (this.clone = function () {
      return new AntimatterPass(_shader, _uni);
    }),
    (this.onDestroy = function () {
      _rts.forEach(function (rt) {
        rt && rt.destroy && rt.destroy();
      });
    }),
    (this.upload = async function () {
      (_shader.upload(), await defer());
      for (let i = 0; i < _rts.length; i++) (_rts[i].upload(), await defer());
      for (let key in _shader.uniforms) {
        let uniform = _shader.uniforms[key];
        uniform.value &&
          (uniform.value.uploadAsync
            ? await uniform.value.uploadAsync()
            : uniform.value.upload && (uniform.value.upload(), await defer()));
      }
    }));
});
