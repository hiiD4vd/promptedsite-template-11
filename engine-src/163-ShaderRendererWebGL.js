Class(function ShaderRendererWebGL(_gl) {
  const _this = this;
  var _pool = {},
    _programID = 0,
    _cached = {},
    _uboCache = {};
  const PROFILER = !!window.OptimizationProfiler,
    WEBGL2 = Renderer.type == Renderer.WEBGL2,
    GLOBAL_UNIFORMS = [
      "normalMatrix",
      "modelMatrix",
      "modelViewMatrix",
      "projectionMatrix",
      "viewMatrix",
      "cameraPosition",
      "cameraQuaternion",
      "resolution",
      "time",
      "shadowMatrix",
      "shadowLightPos",
      "shadowSize",
    ],
    DEPTH_FUNC_KEYS = {
      [Shader.DEPTH_FUNC_NEVER]: "NEVER",
      [Shader.DEPTH_FUNC_LESS]: "LESS",
      [Shader.DEPTH_FUNC_EQUAL]: "EQUAL",
      [Shader.DEPTH_FUNC_LEQUAL]: "LEQUAL",
      [Shader.DEPTH_FUNC_GREATER]: "GREATER",
      [Shader.DEPTH_FUNC_NOTEQUAL]: "NOTEQUAL",
      [Shader.DEPTH_FUNC_GEQUAL]: "GEQUAL",
      [Shader.DEPTH_FUNC_ALWAYS]: "ALWAYS",
    };
  function toTypedArray(uni) {
    uni.value;
    return (
      uni._gl || (uni._gl = {}),
      uni._gl.array && uni._gl.array.length == uni.value.length
        ? uni._gl.array.set(uni.value)
        : (uni._gl.array = new Float32Array(uni.value)),
      uni._gl.array
    );
  }
  function createShader(str, type, name = "Shader") {
    let shader = _gl.createShader(type);
    return (
      void 0 !== window.SPECTOR && (shader.__SPECTOR_Metadata = { name: name }),
      _gl.shaderSource(shader, str),
      _gl.compileShader(shader),
      Hydra.LOCAL &&
        (_gl.getShaderParameter(shader, _gl.COMPILE_STATUS) ||
          (!(function logPrettyShaderError(shader) {
            const shaderSrc = _gl
                .getShaderSource(shader)
                .split("\n")
                .map((line, index) => `${index}: ${line}`),
              shaderLog = _gl.getShaderInfoLog(shader),
              splitShader = shaderLog.split("\n"),
              dedupe = {},
              lineNumbers = splitShader
                .map((line) => parseFloat(line.replace(/^ERROR\: 0\:([\d]+)\:.*$/, "$1")))
                .filter((n) => !(!n || dedupe[n]) && ((dedupe[n] = !0), !0)),
              logArgs = [""];
            lineNumbers.forEach((number) => {
              ((shaderSrc[number - 1] = `%c${shaderSrc[number - 1]}%c`),
                logArgs.push(
                  "background: #FF0000; color:#FFFFFF; font-size: 10px",
                  "font-size: 10px",
                ));
            });
            const fragmentSourceToLog = shaderSrc.join("\n");
            ((logArgs[0] = fragmentSourceToLog),
              console.error(shaderLog),
              console.groupCollapsed("click to view full shader code"),
              console.warn(...logArgs),
              console.groupEnd());
          })(shader),
          _gl.deleteShader(shader))),
      shader
    );
  }
  function createProgram(shader) {
    (shader.vertexShader || Shader.runPreProcess(shader),
      _this.multiViewOverride && _this.multiViewOverride(shader));
    let vsCode = shader.onBeforeCompile(shader.vertexShader, "vs"),
      fsCode = shader.onBeforeCompile(shader.fragmentShader, "fs");
    (PROFILER &&
      OptimizationProfiler.active &&
      ([vsCode, fsCode] = OptimizationProfiler.override(shader, vsCode, fsCode)),
      RenderCount.add("shader", shader));
    let vs = createShader(vsCode, _gl.VERTEX_SHADER, `${shader.vsName} - ${shader.UILPrefix}`),
      fs = createShader(fsCode, _gl.FRAGMENT_SHADER, `${shader.fsName} - ${shader.UILPrefix}`);
    Hydra.LOCAL && window.GLSLLinter && GLSLLinter.lint(shader, vsCode, fsCode);
    let program = _gl.createProgram();
    return (
      _gl.attachShader(program, vs),
      _gl.attachShader(program, fs),
      _gl.linkProgram(program),
      Hydra.LOCAL &&
        (_gl.getProgramParameter(program, _gl.LINK_STATUS) ||
          (console.warn(`Shader: ${shader.vsName} | ${shader.vsName}`),
          console.error(
            `Could not compile WebGL program. ${shader.vsName} ${shader.fsName} \n\n` +
              _gl.getProgramInfoLog(program),
          ))),
      _gl.deleteShader(vs),
      _gl.deleteShader(fs),
      program
    );
  }
  function setupShaders(shader) {
    for (let i = shader._uniformKeys.length - 1; i > -1; i--) {
      let key = shader._uniformKeys[i],
        uniform = shader._uniformValues[i];
      if (void 0 === shader._gl[key] && uniform)
        if (uniform.ubo)
          if (WEBGL2) {
            if (
              (_uboCache[shader.UILPrefix] &&
                !shader.ubo &&
                (shader.ubo = _uboCache[shader.UILPrefix]),
              _uboCache[shader.UILPrefix])
            ) {
              shader._gl[key] = "U";
              continue;
            }
            (shader.ubo || (shader.ubo = new UBO(1, _gl)),
              shader.ubo.push(uniform),
              (shader._gl[key] = "U"));
          } else shader._gl[key] = _gl.getUniformLocation(shader._gl.program, key);
        else
          WEBGL2 && uniform.lightUBO
            ? ((shader._gl[key] = "U"), (shader.uboLight = !0))
            : (shader._gl[key] = _gl.getUniformLocation(shader._gl.program, key));
    }
    (shader.ubo && !_uboCache[shader.UILPrefix] && (_uboCache[shader.UILPrefix] = shader.ubo),
      shader._gl.setupGlobals ||
        ((shader._gl.setupGlobals = !0),
        GLOBAL_UNIFORMS.forEach((key) => {
          shader._gl[key] = _gl.getUniformLocation(shader._gl.program, key);
        })),
      shader.uboLight && _gl.getUniformBlockIndex(shader._gl.program, "lights"),
      WEBGL2 && _gl.getUniformBlockIndex(shader._gl.program, "global"));
  }
  function uniformTextureArray(uni, uLoc, shader) {
    let array = shader._gl.texArray || [];
    ((array.length = 0), (shader._gl.texArray = array));
    for (let i = 0; i < uni.value.length; i++) {
      array.push(shader._gl.texIndex);
      let texture = uni.value[i];
      (!1 === texture.loaded && (texture = Utils3D.getEmptyTexture()),
        (void 0 === texture._gl || texture.needsReupload) && Texture.renderer.upload(texture),
        _gl.activeTexture(_gl["TEXTURE" + shader._gl.texIndex++]),
        _gl.bindTexture(_gl.TEXTURE_2D, texture._gl));
    }
    _gl.uniform1iv(uLoc, array);
  }
  ((this.upload = function (shader) {
    if (
      (PROFILER && OptimizationProfiler.active && OptimizationProfiler.setupShader(shader),
      !shader._gl)
    ) {
      shader._gl = {};
      let key = `${shader.vsName}_${shader.fsName}_${shader.customCompile}`,
        cached = _pool[key];
      cached
        ? ((shader._gl.program = cached.program),
          (shader._gl._id = cached.id),
          shader.onBeforePrecompilePromise.resolve(),
          cached.count++,
          Hydra.LOCAL && _pool[key].references.push(shader))
        : ((shader._gl.program = createProgram(shader)),
          (shader._gl._id = _programID++),
          (_pool[key] = { count: 1, program: shader._gl.program, id: shader._gl._id }),
          Shader.registerPreProcess(shader),
          Hydra.LOCAL && (_pool[key].references = [shader]));
    }
    (setupShaders(shader),
      shader.ubo && shader.ubo.upload(),
      (Renderer.type == Renderer.WEBGL1 && FXLayer.exists) ||
        (shader.vertexShader = shader.fragmentShader = ""));
  }),
    (this.findCachedProgram = function (shader) {
      let key = `${shader.vsName}_${shader.fsName}_${shader.customCompile}`,
        cached = _pool[key];
      return (
        !!cached &&
        ((shader._gl = {}),
        (shader._gl.program = cached.program),
        (shader._gl._id = cached.id),
        Shader.addAutoUniforms(shader),
        shader.onBeforePrecompilePromise.resolve(),
        _uboCache[shader.UILPrefix] && (shader.ubo = shader.UILPrefix),
        cached.count++,
        Hydra.LOCAL && _pool[key].references.push(shader),
        !0)
      );
    }),
    (this.draw = function (shader) {
      (void 0 === shader._gl && this.upload(shader),
        WEBGL2 &&
          "undefined" != typeof RenderMonitor &&
          RenderMonitor.active &&
          (shader.renderTimeQuery ||
            (shader.renderTimeQuery = RenderMonitor.createQuery(_gl, shader)),
          shader.renderTimeQuery.beginTest?.()),
        (shader._gl.texIndex = 0),
        shader._gl.program != _cached.program &&
          (_gl.useProgram(shader._gl.program), (_cached.program = shader._gl.program)),
        shader.ubo && shader.ubo.bind(shader._gl.program, "ubo"),
        shader.uboLight && Lighting.bindUBO(shader._gl.program));
      for (let i = shader._uniformKeys.length - 1; i > -1; i--) {
        let key = shader._uniformKeys[i],
          uni = shader._uniformValues[i];
        if (!uni) continue;
        let uLoc = shader._gl[key];
        if (
          (void 0 === uLoc && (setupShaders(shader), (uLoc = shader._gl[key])),
          null !== uLoc && -1 !== uLoc && "U" !== uLoc)
        ) {
          if (
            (null === uni.value && (uni.value = Utils3D.getEmptyTexture()),
            Hydra.LOCAL && void 0 === uni.value)
          )
            throw `Uniform ${key} value is undefined. | ${shader.vsName} ${shader.fsName}`;
          switch (
            (uni.type ||
              (uni.type =
                "string" == typeof (uniform = uni).type
                  ? uniform.type
                  : "boolean" == typeof uniform.value
                    ? "b"
                    : null === uniform.value ||
                        uniform.value instanceof Texture ||
                        uniform.value.texture ||
                        (uniform.value.rt && uniform.value.rt.texture)
                      ? "t"
                      : uniform.value instanceof Vector2
                        ? "v2"
                        : uniform.value instanceof Vector3 || uniform.value instanceof Vector3D
                          ? "v3"
                          : uniform.value instanceof Vector4
                            ? "v4"
                            : uniform.value instanceof Matrix4
                              ? "m4"
                              : uniform.value instanceof Matrix3
                                ? "m3"
                                : uniform.value instanceof Color
                                  ? "c"
                                  : uniform.value instanceof Quaternion
                                    ? "q"
                                    : Array.isArray(uniform.value) &&
                                        uniform.value[0] instanceof Texture
                                      ? "tv"
                                      : "f"),
            uni.type)
          ) {
            case "f":
              _gl.uniform1f(uLoc, uni.value);
              break;
            case "i":
              _gl.uniform1i(uLoc, Math.floor(uni.value));
              break;
            case "b":
              _gl.uniform1i(uLoc, uni.value);
              break;
            case "v2":
              _gl.uniform2f(uLoc, uni.value.x, uni.value.y);
              break;
            case "v3":
              _gl.uniform3f(uLoc, uni.value.x, uni.value.y, uni.value.z);
              break;
            case "c":
              _gl.uniform3f(uLoc, uni.value.r, uni.value.g, uni.value.b);
              break;
            case "q":
            case "v4":
              _gl.uniform4f(uLoc, uni.value.x, uni.value.y, uni.value.z, uni.value.w);
              break;
            case "v3v":
              _gl.uniform3fv(uLoc, toTypedArray(uni));
              break;
            case "v4v":
              _gl.uniform4fv(uLoc, toTypedArray(uni));
              break;
            case "v2v":
              _gl.uniform2fv(uLoc, toTypedArray(uni));
              break;
            case "fv":
              _gl.uniform1fv(uLoc, toTypedArray(uni));
              break;
            case "m4":
              _gl.uniformMatrix4fv(uLoc, !1, uni.value.elements);
              break;
            case "m3":
              _gl.uniformMatrix3fv(uLoc, !1, uni.value.elements);
              break;
            case "tv":
              uniformTextureArray(uni, uLoc, shader);
              break;
            case "t":
              let texture = uni.value;
              (texture.isTexture ||
                (uni.value.rt && (texture = uni.value.rt.overrideTexture || uni.value.rt.texture),
                uni.value.texture && (texture = uni.value.texture)),
                !1 === texture.loaded && (texture = Utils3D.getEmptyTexture()));
              let texIndex = shader._gl.texIndex++;
              (uni.value.vrRT && ((shader._gl.vrRT = !0), (uni.value._glTexIndex = texIndex)),
                Texture.renderer.draw(texture, uLoc, key, texIndex));
          }
        }
      }
      var uniform;
      if (!shader.glCustomState) {
        if (shader.polygonOffset) {
          let key = shader.polygonOffsetFactor + "_" + shader.polygonOffsetUnits;
          (_cached.polygonOffset != key &&
            (_gl.enable(_gl.POLYGON_OFFSET_FILL),
            _gl.polygonOffset(shader.polygonOffsetFactor, shader.polygonOffsetUnits)),
            (_cached.polygonOffset = key));
        } else
          (_cached.polygonOffset && _gl.disable(_gl.POLYGON_OFFSET_FILL),
            (_cached.polygonOffset = !1));
        if (
          (shader.transparent || shader.opacity
            ? (_cached.transparent || _gl.enable(_gl.BLEND), (_cached.transparent = !0))
            : (_cached.transparent && _gl.disable(_gl.BLEND), (_cached.transparent = !1)),
          _cached.blending != shader.blending)
        ) {
          switch (shader.blending) {
            case Shader.ADDITIVE_BLENDING:
              (_gl.blendEquation(_gl.FUNC_ADD), _gl.blendFunc(_gl.SRC_ALPHA, _gl.ONE));
              break;
            case Shader.PREMULTIPLIED_ALPHA_BLENDING:
              (_gl.blendEquation(_gl.FUNC_ADD), _gl.blendFunc(_gl.ONE, _gl.ONE_MINUS_SRC_ALPHA));
              break;
            case Shader.REVERSE_PREMULTIPLIED_ALPHA_BLENDING:
              (_gl.blendEquation(_gl.FUNC_ADD), _gl.blendFunc(_gl.ONE_MINUS_DST_ALPHA, _gl.ONE));
              break;
            case Shader.ADDITIVE_COLOR_ALPHA:
              (_gl.blendEquation(_gl.FUNC_ADD), _gl.blendFunc(_gl.ONE, _gl.ONE));
              break;
            case Shader.MULTIPLY_BLENDING:
              (_gl.blendEquation(_gl.FUNC_ADD), _gl.blendFunc(_gl.DST_COLOR, _gl.ZERO));
              break;
            case Shader.MAX:
              (_gl.blendEquation(WEBGL2 ? _gl.MAX : Renderer.extensions.minMax.MAX_EXT),
                _gl.blendFunc(_gl.ONE, _gl.ONE));
              break;
            case Shader.MIN:
              (_gl.blendEquation(WEBGL2 ? _gl.MIN : Renderer.extensions.minMax.MIN_EXT),
                _gl.blendFunc(_gl.ONE, _gl.ONE));
              break;
            case Shader.SUBTRACTIVE_BLENDING:
              (_gl.blendEquation(_gl.FUNC_SUBTRACT), _gl.blendFunc(_gl.ONE, _gl.ONE));
              break;
            default:
              (_gl.blendEquationSeparate(_gl.FUNC_ADD, _gl.FUNC_ADD),
                _gl.blendFuncSeparate(
                  _gl.SRC_ALPHA,
                  _gl.ONE_MINUS_SRC_ALPHA,
                  _gl.ONE,
                  _gl.ONE_MINUS_SRC_ALPHA,
                ));
          }
          _cached.blending = shader.blending;
        }
        shader.depthTest
          ? (_cached.depthTest || _gl.enable(_gl.DEPTH_TEST), (_cached.depthTest = !0))
          : (_cached.depthTest && _gl.disable(_gl.DEPTH_TEST), (_cached.depthTest = !1));
        let depthFunc = _gl[DEPTH_FUNC_KEYS[shader.depthFunc || Shader.DEPTH_FUNC_LESS]];
        if (
          (_cached.depthFunc !== depthFunc &&
            (_gl.depthFunc(depthFunc), (_cached.depthFunc = depthFunc)),
          shader.stencilTest)
        )
          if (
            (_cached.stencilTest || _gl.enable(_gl.STENCIL_TEST),
            (_cached.stencilTest = !0),
            shader.stencilMask)
          )
            (_gl.stencilFunc(_gl.ALWAYS, 1, 255),
              _gl.stencilOp(_gl.KEEP, _gl.KEEP, _gl.REPLACE),
              _gl.stencilMask(255),
              _gl.colorMask(!1, !1, !1, !1),
              _gl.disable(_gl.DEPTH_TEST));
          else {
            (_gl.colorMask(!0, !0, !0, !0), _gl.enable(_gl.DEPTH_TEST));
            let mode = "inside";
            (_gl.stencilFunc("inside" == mode ? _gl.EQUAL : _gl.NOTEQUAL, 1, 255),
              _gl.stencilOp(_gl.KEEP, _gl.KEEP, _gl.KEEP));
          }
        else (_cached.stencilTest && _gl.disable(_gl.STENCIL_TEST), (_cached.stencilTest = !1));
        switch (shader.side) {
          case Shader.BACK_SIDE:
            _cached.side != Shader.BACK_SIDE &&
              (_gl.enable(_gl.CULL_FACE),
              _gl.cullFace(_gl.FRONT),
              (_cached.side = Shader.BACK_SIDE));
            break;
          case Shader.DOUBLE_SIDE:
            _cached.side != Shader.DOUBLE_SIDE &&
              (_gl.disable(_gl.CULL_FACE), (_cached.side = Shader.DOUBLE_SIDE));
            break;
          default:
            _cached.side != Shader.FRONT_SIDE &&
              (_gl.enable(_gl.CULL_FACE),
              _gl.cullFace(_gl.BACK),
              (_cached.side = Shader.FRONT_SIDE));
        }
        if (
          (_cached.depthMask != shader.depthWrite &&
            (_gl.depthMask(!!shader.depthWrite), (_cached.depthMask = shader.depthWrite)),
          shader.colorMask && shader.colorMask.push)
        )
          _gl.colorMask(
            shader.colorMask[0] || !1,
            shader.colorMask[1] || !1,
            shader.colorMask[2] || !1,
            shader.colorMask[3] || !1,
          );
        else
          switch (shader.colorMask) {
            case Shader.COLOR_MASK_NONE:
              _cached.colorMask != shader.colorMask &&
                (_gl.colorMask(!0, !0, !0, !0), (_cached.colorMask = shader.colorMask));
              break;
            case Shader.COLOR_MASK_RGB:
              _cached.colorMask != shader.colorMask &&
                (_gl.colorMask(!1, !1, !1, !0), (_cached.colorMask = shader.colorMask));
              break;
            case Shader.COLOR_MASK_RGBA:
              _cached.colorMask != shader.colorMask &&
                (_gl.colorMask(!1, !1, !1, !1), (_cached.colorMask = shader.colorMask));
          }
      }
      if (shader.customState)
        for (let i = 0; i < shader.customState.length; i++) {
          let obj = shader.customState[i];
          _gl[obj.fn].apply(_gl, obj.params);
        }
    }),
    (this.destroy = function (shader) {
      (delete shader._gl, shader.ubo && shader.ubo.destroy());
    }),
    (this.appendUniform = function (shader, key, value, hint) {
      let loc = shader._gl[key];
      if (
        (void 0 === loc && (loc = loc = _gl.getUniformLocation(shader._gl.program, key)),
        null !== loc)
      )
        if (value.isMatrix4) _gl.uniformMatrix4fv(loc, !1, value.elements);
        else if (value.isMatrix3) _gl.uniformMatrix3fv(loc, !1, value.elements);
        else if (value.isVector4) _gl.uniform4f(loc, value.x, value.y, value.z, value.w);
        else if (value.isQuaternion) _gl.uniform4f(loc, value.x, value.y, value.z, value.w);
        else if (value.isVector3) _gl.uniform3f(loc, value.x, value.y, value.z);
        else if (value.isVector2) _gl.uniform2f(loc, value.x, value.y);
        else if (value instanceof Float32Array)
          switch (hint) {
            case "matrix":
              _gl.uniformMatrix4fv(loc, !1, value);
              break;
            case "float":
              _gl.uniform1fv(loc, value);
              break;
            case "vec3":
              _gl.uniform3fv(loc, value);
          }
        else if (Array.isArray(value)) {
          let array = shader._gl.texArray || [];
          ((array.length = 0), (shader._gl.texArray = array));
          for (let i = 0; i < value.length; i++)
            (array.push(shader._gl.texIndex),
              _gl.activeTexture(_gl["TEXTURE" + shader._gl.texIndex++]),
              _gl.bindTexture(_gl.TEXTURE_2D, value[i]._gl));
          _gl.uniform1iv(loc, array);
        } else _gl.uniform1f(loc, value);
    }),
    (this.resetState = function () {
      (_cached.depthMask || (_gl.depthMask(!0), (_cached.depthMask = !0)),
        _cached.depthTest || _gl.enable(_gl.DEPTH_TEST),
        (_cached.depthTest = !0),
        _cached.depthFunc !== _gl.LESS && _gl.depthFunc(_gl.LESS),
        (_cached.depthFunc = _gl.LESS),
        _cached.colorMask != Shader.COLOR_MASK_NONE &&
          (_gl.colorMask(!0, !0, !0, !0), (_cached.colorMask = Shader.COLOR_MASK_NONE)),
        (_cached.program = null));
    }),
    (this.clearState = function () {
      _cached = {};
    }),
    (this.hotReload = function (file) {
      file = file.split(".")[0].trim();
      for (let key in _pool)
        if (
          key.includes(file) &&
          !["|instance", "|Line3D", "|MergedLine"].find((part) => key.includes(part))
        ) {
          let obj = _pool[key],
            rootShader = obj.references[0];
          for (let i = 0; i < obj.references.length; i++) {
            let shader = obj.references[i];
            (0 === i
              ? ((shader.restoreFS = shader.restoreVS = null),
                shader.resetProgram(),
                (shader._gl = {}),
                (shader._gl.program = createProgram(shader)),
                (shader._gl._id = _programID++),
                (obj.program = shader._gl.program),
                (obj.id = shader._gl._id))
              : (shader.destroy(),
                (shader.restoreFS = rootShader.restoreFS),
                (shader.restoreVS = rootShader.restoreVS),
                (shader.vertexShader = rootShader.vertexShader),
                (shader.fragmentShader = rootShader.fragmentShader),
                (shader._gl = {}),
                (shader._gl.program = obj.program),
                (shader._gl._id = obj.id)),
              setupShaders(rootShader));
          }
        }
    }),
    (this.hotReloadClearProgram = function (id) {
      for (let key in _pool) key.includes(id) && delete _pool[key];
    }));
});
