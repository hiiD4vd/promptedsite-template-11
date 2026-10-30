Class(function NukePass(_fs, _uniforms, _pass) {
  Inherit(this, Component);
  var _this = this;
  if ("object" == typeof _fs) {
    let shader = _fs.shader;
    ((_uniforms = _fs.uniforms), (_fs = shader));
  }
  ((this.UILPrefix = "string" == typeof _fs ? _fs : Utils.getConstructorName(_fs)),
    (this.init = function (fs, vs) {
      if (_this.pass) return;
      _this = this;
      (fs || this.constructor.toString().match(/function ([^\(]+)/)[1],
        Array.isArray(fs) && fs.join(""));
      if (
        ((_this.uniforms = _uniforms || _this.uniforms || {}),
        (_this.uniforms.tDiffuse = { type: "t", value: null, ignoreUIL: !0 }),
        _this.uniforms.unique && (_this.UILPrefix += "_" + _this.uniforms.unique + "_"),
        window.UILStorage)
      )
        for (let key in _this.uniforms)
          "unique" !== key &&
            (_this.uniforms[key] =
              UILStorage.parse(_this.UILPrefix + key, _this.uniforms[key].value) ||
              _this.uniforms[key]);
      ((_this.pass = _this.initClass(
        Shader,
        vs || "NukePass",
        fs,
        Utils.mergeObject(_this.uniforms, { precision: "high" }),
        (code, type) =>
          "fs" == type
            ? (function prefix(code) {
                if (!code) throw `No shader ${_fs} found`;
                let pre = "";
                return (
                  code.includes("uniform sampler2D tDiffuse") ||
                    ((pre += "uniform sampler2D tDiffuse;\n"), (pre += "varying vec2 vUv;\n")),
                  pre + code
                );
              })(code)
            : code,
      )),
        (_this.uniforms = _this.pass.uniforms));
    }),
    (this.set = function (key, value) {
      (TweenManager.clearTween(_this.uniforms[key]), (_this.uniforms[key].value = value));
    }),
    (this.get = function (key) {
      return void 0 === _this.uniforms[key] ? null : _this.uniforms[key].value;
    }),
    (this.tween = function (key, value, time, ease, delay, callback, update) {
      return tween(_this.uniforms[key], { value: value }, time, ease, delay, callback, update);
    }),
    (this.clone = function () {
      return (_this.pass || _this.init(_fs), new NukePass(null, null, _this.pass.clone()));
    }),
    (this.upload = function () {
      _this.pass.upload();
    }),
    (this.addUniforms = function (obj) {
      for (let key in obj) _this.uniforms[key] = obj[key];
    }),
    "string" == typeof _fs
      ? _this.init(_fs)
      : _pass && ((_this.pass = _pass), (_this.uniforms = _pass.uniforms)));
});
