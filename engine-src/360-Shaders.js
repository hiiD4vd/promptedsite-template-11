Class(function Shaders() {
  Inherit(this, Component);
  var _this = this,
    _dependencies,
    _shaderNames;
  function parseSingleShader(code, fileName) {
    let uniforms = code.split("#!UNIFORMS")[1].split("#!")[0],
      varyings = code.split("#!VARYINGS")[1].split("#!")[0],
      attributes = code.split("#!ATTRIBUTES")[1].split("#!")[0];
    for (; code.includes("#!SHADER");) {
      let split = (code = code.slice(code.indexOf("#!SHADER"))).split("#!SHADER")[1],
        br = split.indexOf("\n"),
        name = getShaderName(split.slice(0, br), fileName),
        glsl = split.slice(br);
      ((glsl = name.includes(".vs")
        ? attributes + uniforms + varyings + glsl
        : uniforms + varyings + glsl),
        (_this[name] = glsl),
        _shaderNames &&
          name !== fileName &&
          ((_shaderNames[fileName] = _shaderNames[fileName] || []),
          _shaderNames[fileName].push(name)),
        (code = code.replace("#!SHADER", "$")));
    }
  }
  function parseCompiled(shaders) {
    var split = shaders.split("{@}");
    split.shift();
    for (var i = 0; i < split.length; i += 2) {
      var name = split[i],
        text = split[i + 1];
      text.includes("#!UNIFORMS") ? parseSingleShader(text, name) : (_this[name] = text);
    }
  }
  function parseRequirements() {
    for (var key in _this) {
      var obj = _this[key];
      "string" == typeof obj && (_this[key] = require(obj, key));
    }
  }
  function require(shader, key) {
    if (!shader.includes("require")) return shader;
    for (shader = shader.replace(/# require/g, "#require"); shader.includes("#require");) {
      var name = shader.split("#require(")[1].split(")")[0];
      if (((name = name.replace(/ /g, "")), !_this[name]))
        throw "Shader required " + name + ", but not found in compiled shaders.\n" + shader;
      (_dependencies &&
        (_dependencies[name] || (_dependencies[name] = []),
        _dependencies[name].includes(key) || _dependencies[name].push(key)),
        (shader = shader.replace("#require(" + name + ")", _this[name])));
    }
    return shader;
  }
  function getShaderName(shaderLine, fileName) {
    let name = shaderLine.split(": ")[1];
    (name.slice(0, 6).includes("Vertex") && (name = fileName.split(".")[0] + ".vs"),
      name.slice(0, 8).includes("Fragment") && (name = fileName.split(".")[0] + ".fs"));
    let splitName = name.split(".");
    return splitName[0] + (splitName[1].includes("vs") ? ".vs" : ".fs");
  }
  (Hydra.LOCAL && ((_dependencies = {}), (_shaderNames = {})),
    this.get("dependencies", (_) => _dependencies),
    (this.parse = function (code, file) {
      (code.includes("{@}")
        ? (parseCompiled(code), parseRequirements())
        : ((file = (file = file.split("/"))[file.length - 1]), (_this[file] = code)),
        (_this.shadersParsed = !0));
    }),
    (this.parseSingle = parseSingleShader),
    (this.onReady = this.ready =
      function (callback) {
        let promise = Promise.create();
        return (
          callback && promise.then(callback),
          _this.wait(() => promise.resolve(), _this, "shadersParsed"),
          promise
        );
      }),
    (this.getShader = function (string) {
      _this.FALLBACKS && _this.FALLBACKS[string] && (string = _this.FALLBACKS[string]);
      var code = _this[string];
      if (!code) throw `No shader ${string} found`;
      for (; code.includes("#test ");)
        try {
          var test = code.split("#test ")[1],
            name = test.split("\n")[0],
            glsl = code.split("#test " + name + "\n")[1].split("#endtest")[0];
          (eval(name) || (code = code.replace(glsl, "")),
            (code = code.replace("#test " + name + "\n", "")),
            (code = code.replace("#endtest", "")));
        } catch (e) {
          throw "Error parsing test :: " + string;
        }
      return code;
    }),
    (this.hasShader = function (string) {
      return !(!_this.FALLBACKS?.[string] && !_this[string]);
    }),
    (this.getShaderNames = function getShaderNames(fileName) {
      return _shaderNames[fileName];
    }));
}, "static");
