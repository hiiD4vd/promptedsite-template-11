Shader.createUniforms = function (shader) {
  let uniforms = {},
    handler = {
      set(target, property, value) {
        ((target[property] = value),
          (shader._uniformKeys.length = 0),
          (shader._uniformValues.length = 0));
        for (let key in uniforms)
          (shader._uniformKeys.push(key), shader._uniformValues.push(uniforms[key]));
        return !0;
      },
    };
  return ((shader._uniformValues = []), (shader._uniformKeys = []), new Proxy(uniforms, handler));
};
