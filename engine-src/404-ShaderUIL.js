Class(function ShaderUIL() {
  ((this.exists = {}),
    (this.UPDATE = "shader_update"),
    (this.TEXTURE_UPDATE = "shader_texture_update"),
    (this.SHADER_UPDATE = "shader_shader_update"),
    (this.add = function (shader, group, options) {
      return new ShaderUILConfig(
        shader.shader || shader,
        null === group ? null : group || UIL.global,
        options,
      );
    }),
    (this.createOverride = function (prefix, obj, group, shaderOnly, newClone) {
      let uniforms = {};
      Array.isArray(obj)
        ? obj.forEach((o) => {
            o = o.uniforms || o;
            for (let key in o) o[key].ignoreUIL || (uniforms[key] = o[key]);
          })
        : (uniforms = obj.uniforms || obj);
      let shader = Utils3D.getTestShader();
      if (((shader.vertexShader = shader.fragmentShader = ""), newClone))
        for (let key in uniforms) {
          let value = uniforms[key].value;
          (value?.clone && (value = value.clone()),
            (shader.uniforms[key] = { value: value, type: uniforms[key].type }));
        }
      else for (let key in uniforms) shader.uniforms[key] = uniforms[key];
      return ((shader.UILPrefix = prefix), null === shaderOnly ? shader : this.add(shader, group));
    }),
    (this.createDecorator = function (shader, prefix, obj, group) {
      let uniforms = {};
      for (let key in obj) uniforms[key] = shader.uniforms[key];
      let nShader = Utils3D.getTestShader();
      return (
        (nShader.vertexShader = shader.fragmentShader = ""),
        (nShader.uniforms = uniforms),
        (nShader.UILPrefix = prefix),
        this.add(nShader, group)
      );
    }),
    (this.createClone = function (prefix, obj) {
      let uniforms = obj.uniforms || obj,
        shader = Utils3D.getTestShader();
      for (let key in uniforms) {
        let value = uniforms[key].value,
          ignoreUIL = uniforms[key].ignoreUIL || null === value;
        (!ignoreUIL && value.clone && (value = value.clone()),
          (shader.uniforms[key] = { value: value, ignoreUIL: ignoreUIL }));
      }
      return ((shader.UILPrefix = prefix), shader);
    }),
    (this.lerpShader = function (from, to, alpha, hz, uniformsFilter) {
      ((from = from.uniforms || from), (to = to.uniforms || to));
      for (let key in from) {
        let f = from[key],
          t = to[key];
        f &&
          t &&
          ((uniformsFilter && -1 === uniformsFilter.indexOf(key)) ||
            ("number" == typeof t.value
              ? (f.value = Math.lerp(t.value, f.value, alpha, hz))
              : "c" === f.type
                ? ((f.value.r = Math.lerp(t.value.r, f.value.r, alpha, hz)),
                  (f.value.g = Math.lerp(t.value.g, f.value.g, alpha, hz)),
                  (f.value.b = Math.lerp(t.value.b, f.value.b, alpha, hz)))
                : "v3" === f.type
                  ? ((f.value.x = Math.lerp(t.value.x, f.value.x, alpha, hz)),
                    (f.value.y = Math.lerp(t.value.y, f.value.y, alpha, hz)),
                    (f.value.z = Math.lerp(t.value.z, f.value.z, alpha, hz)))
                  : "v2" === f.type
                    ? ((f.value.x = Math.lerp(t.value.x, f.value.x, alpha, hz)),
                      (f.value.y = Math.lerp(t.value.y, f.value.y, alpha, hz)))
                    : f.value && f.value.lerp && f.value.lerp(t.value, alpha, hz)));
      }
    }));
}, "static");
