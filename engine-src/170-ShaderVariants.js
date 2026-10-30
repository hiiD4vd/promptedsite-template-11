Class(function ShaderVariants(_params = {}) {
  const _this = this;
  var _target,
    _destination,
    _map = {};
  const LERP = _params.lerp || 0.07;
  function generate(key, shaderOrUniforms) {
    let uniforms,
      prefix =
        shaderOrUniforms.UILPrefix?.split("/")[0] ||
        _this.parent.uilInput?.prefix ||
        Utils.getConstructorName(_this.parent);
    ((prefix += "_shaderVariants_" + key),
      (uniforms =
        Array.isArray(shaderOrUniforms) || shaderOrUniforms.uniforms
          ? shaderOrUniforms.uniforms
          : shaderOrUniforms));
    let mesh,
      newUniforms = {};
    for (let key in uniforms) {
      let uni = uniforms[key];
      (void 0 === uni.value &&
        (uni.setUniform
          ? ((mesh = uni.protonRef), (uniforms[key] = uni = uni.uniforms[key]))
          : ((mesh = uni.protonRef || uni),
            (uniforms[key] = uni = mesh.shader ? mesh.shader.uniforms[key] : mesh.uniforms[key]))),
        "string" == typeof uni.value && (uni.value = Number(uni.value)),
        uni.ignoreVariants || uni.ignoreUIL || (newUniforms[key] = uniforms[key]));
    }
    let uilFolder = _this.parent.uilFolder;
    return (
      uilFolder || (uilFolder = shaderOrUniforms.mesh?.__uilGroup || mesh?.uilGroup),
      [newUniforms, prefix, uilFolder]
    );
  }
  (_this.parent.startRender(function loop() {
    _destination && ShaderUIL.lerpShader(_destination, _target, LERP);
  }),
    (_this.parent.createShaderOverride = function createShaderOverride(key, inUniforms, active) {
      if (inUniforms.uniforms)
        throw "Using an entire shader for createShaderOverride is not what you want. Just pass in the uniforms that are meant to be overriden.";
      let [uniforms, prefix, uilFolder] = generate(key, inUniforms),
        shader = ShaderUIL.createOverride(prefix, uniforms, null, null, !active);
      (ShaderUIL.add(shader, uilFolder).setLabel(`Shader: ${key}`),
        active &&
          _this.parent.startRender((_) => {
            ShaderUIL.lerpShader(shader, uniforms, 1);
          }));
    }),
    (_this.parent.createShaderVariant = function createShaderVariant(key, shaderOrUniforms) {
      let [uniforms, prefix, uilFolder] = generate(key, shaderOrUniforms),
        shader = ShaderUIL.createOverride(prefix, uniforms, null, null, !0);
      (ShaderUIL.add(shader, uilFolder).setLabel(`Shader: ${key}`),
        (_map[key] = shader),
        _target || (_target = shader),
        _destination ||
          (_destination = ShaderUIL.createOverride(
            "OverrideDestination" + Utils.uuid(),
            uniforms,
            null,
            null,
          )));
    }),
    (_this.parent.setShaderVariant = function setShaderVariant(key) {
      if (!(_target = _map[key])) throw `No Shader variant ${key}`;
    }));
});
