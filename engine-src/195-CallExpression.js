Module(function ShaderCode() {
  let textureExpression = /texture(2D|Cube)?(\w+)?\s*\(/g;
  function removeUBO(code, name) {
    let uniforms = code.split(`uniform ${name} {`)[1];
    ((uniforms = uniforms.split("};")[0]),
      (uniforms = uniforms.split("\n")),
      uniforms.forEach((u) => {
        (u = u.trim()).length && (code = code.replace(u, "uniform " + u));
      }));
    let split = code.split(`uniform ${name} {`);
    return (
      (split[1] = split[1].replace("};", "")),
      (code = (code = split.join("")).replace(`uniform ${name} {`, ""))
    );
  }
  this.exports = {
    convertWebGL1: function convertWebGL1(code, type) {
      return (
        (code = (code = code.replace("#version 300 es", "")).replace(
          "out vec4 FragColor;",
          "",
        )).includes("samplerExternalOES") &&
          (code = code.replace("samplerExternalOES", "sampler2D")),
        (code = code.replace(
          textureExpression,
          function (match, samplerType, suffix = "", offset, origCode) {
            if (!samplerType) {
              let name = origCode
                .substring(offset + match.length)
                .split(",", 1)[0]
                ?.trim();
              (name && (samplerType = new RegExp(`sampler(\\w+)\\s+${name}`).exec(origCode)?.[1]),
                samplerType || (samplerType = "2D"));
            }
            if (
              (suffix.endsWith("EXT") && (suffix = suffix.slice(0, -3)),
              "vs" === type && ["Lod", "ProjLod"].includes(suffix))
            )
              return `texture${samplerType}${suffix}(`;
            if (["Lod", "Grad", "ProjLod", "ProjGrad"].includes(suffix)) {
              if (Renderer.extensions.lod) return `texture${samplerType}${suffix}EXT(`;
              suffix.endsWith("Lod") && (suffix = suffix.slice(0, -3));
            }
            return `texture${samplerType}${suffix}(`;
          },
        )).includes("uniform global {") && (code = removeUBO(code, "global")),
        code.includes("uniform ubo {") && (code = removeUBO(code, "ubo")),
        code.includes("uniform lights {") && (code = removeUBO(code, "lights")),
        code
      );
    },
    convertWebGL2: function convertWebGL2(code, type) {
      return (
        !(code = (code =
          "vs" == type
            ? (code = code.replace(/attribute/g, "in")).replace(/varying/g, "out")
            : code.replace(/varying/g, "in")).replace(
          textureExpression,
          function (match, samplerType, suffix = "") {
            return (suffix.endsWith("EXT") && (suffix = suffix.slice(0, -3)), `texture${suffix}(`);
          },
        )).includes("samplerExternalOES") ||
          ("android" == Device.system.os && window.AURA) ||
          (code = code.replace("samplerExternalOES", "sampler2D")),
        Renderer.UBO
          ? (code.includes("uniform global {") &&
              (code = code.replace("uniform global", "layout(std140) uniform global")),
            code.includes("uniform ubo {") &&
              (code = code.replace("uniform ubo", "layout(std140) uniform ubo")),
            Lighting.UBO
              ? code.includes("uniform lights {") &&
                (code = code.replace("uniform lights", "layout(std140) uniform lights"))
              : code.includes("uniform lights {") && (code = removeUBO(code, "lights")))
          : (code.includes("uniform global {") && (code = removeUBO(code, "global")),
            code.includes("uniform ubo {") && (code = removeUBO(code, "ubo")),
            code.includes("uniform lights {") && (code = removeUBO(code, "lights"))),
        code
      );
    },
  };
});
