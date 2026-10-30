Class(
  function Shader(_vertexShader, _fragmentShader, _params, _onBeforeBuild, _postfix) {
    "object" == typeof _vertexShader &&
      ((_fragmentShader = _vertexShader.uniforms), (_vertexShader = _vertexShader.name));
    const _this = this;
    ((this.uniforms = Shader.createUniforms(this)),
      (this.side = Shader.FRONT_SIDE),
      (this.blending = Shader.NORMAL_BLENDING),
      (this.colorMask = Shader.COLOR_MASK_NONE),
      (this.polygonOffset = !1),
      (this.polygonOffsetFactor = 0),
      (this.polygonOffsetUnits = 1),
      (this.depthTest = !0),
      (this.depthWrite = !0),
      (this.depthFunc = Shader.DEPTH_FUNC_LESS),
      (this.stencilTest = !1),
      (this.stencilMask = !1),
      (this.wireframe = !1),
      (this.transparent = !1),
      (this.visible = !0),
      (this.persists = !1),
      (this.precision = "high"),
      (this.customCompile = _params?.customCompile || ""),
      (this.onBeforePrecompilePromise = Promise.create()),
      "string" != typeof _fragmentShader &&
        ((_params = _fragmentShader), (_fragmentShader = _vertexShader)),
      (_params = _params || {}),
      (_this.vsParam = _vertexShader),
      (_this.fsParam = _fragmentShader),
      (_this.params = _params),
      (_this.onBeforeBuild = _onBeforeBuild),
      (_this.vsName = _vertexShader),
      (_this.fsName = (_fragmentShader || _vertexShader) + (_postfix || "")),
      _params.vsName && ((_this.vsName = _params.vsName), delete _params.vsName),
      _params.precision && (_this.precision = _params.precision),
      _params.receiveShadow &&
        ((_this.receiveLight = !0), World.RENDERER.shadows && (_this.precision = "high")));
    let vs = _vertexShader,
      fs = _fragmentShader;
    (_params.uilFrom && ((vs = _params.uilFrom), (fs = _params.uilFrom), delete _params.uilFrom),
      (_this.UILPrefix =
        _params.UILPrefix || `${vs}/${fs}/${_params.unique ? _params.unique + "/" : ""}`),
      Shader.parseParams(_params, _this),
      Shader.renderer.findCachedProgram(_this) ||
        Shader.hasAlreadyPreProcessed(_this) ||
        Shader.runPreProcess(_this));
  },
  (_) => {
    ((Shader.FRONT_SIDE = "shader_front_side"),
      (Shader.BACK_SIDE = "shader_back_side"),
      (Shader.DOUBLE_SIDE = "shader_double_side"),
      (Shader.DOUBLE_SIDE_TRANSPARENCY = "shader_double_side_trasparency"),
      (Shader.ADDITIVE_BLENDING = "shader_additive_blending"),
      (Shader.NORMAL_BLENDING = "shader_normal_blending"),
      (Shader.PREMULTIPLIED_ALPHA_BLENDING = "shader_premultiplied_alpha_blending"),
      (Shader.ADDITIVE_COLOR_ALPHA = "shader_additive_color_alpha"),
      (Shader.MULTIPLY_BLENDING = "shader_multiply_blending"),
      (Shader.SUBTRACTIVE_BLENDING = "shader_subtractive_blending"),
      (Shader.REVERSE_PREMULTIPLIED_ALPHA_BLENDING = "shader_reverse_premultiplied_alpha_blending"),
      (Shader.MAX = "shader_max"),
      (Shader.MIN = "shader_min"),
      (Shader.CUSTOM_DEPTH = "shader_custom_depth"),
      (Shader.COLOR_MASK_RGB = "shader_colormask_rgb"),
      (Shader.COLOR_MASK_RGBA = "shader_colormask_rgba"),
      (Shader.COLOR_MASK_NONE = "shader_colormask_none"),
      (Shader.DEPTH_FUNC_NEVER = "shader_depth_func_never"),
      (Shader.DEPTH_FUNC_LESS = "shader_depth_func_less"),
      (Shader.DEPTH_FUNC_EQUAL = "shader_depth_func_equal"),
      (Shader.DEPTH_FUNC_LEQUAL = "shader_depth_func_lequal"),
      (Shader.DEPTH_FUNC_GREATER = "shader_depth_func_greater"),
      (Shader.DEPTH_FUNC_NOTEQUAL = "shader_depth_func_notequal"),
      (Shader.DEPTH_FUNC_GEQUAL = "shader_depth_func_gequal"),
      (Shader.DEPTH_FUNC_ALWAYS = "shader_depth_func_always"),
      (Shader.BEFORE_DESTROY = "shader_destroy"),
      (Shader.parseParams = function (_params, _this) {
        for (let key in _params)
          if ("receiveShadow" == key) _this.receiveShadow = _params[key];
          else if ("receiveLight" == key) _this.receiveLight = _params[key];
          else if (_params[key] && void 0 !== _params[key].value)
            window.UILStorage && UILStorage.hasData()
              ? ((_this.uniforms[key] =
                  UILStorage.parse(_this.UILPrefix + key, _params[key].value) || _params[key]),
                _params[key].ubo && (_this.uniforms[key].ubo = !0))
              : (_this.uniforms[key] = _params[key]);
          else {
            if ("unique" == key) continue;
            _this[key] = _params[key];
          }
      }),
      (Shader.runPreProcess = function (shader) {
        if (
          ((shader.vertexShader = Shader.process(
            Shaders.getShader(shader.vsParam + ".vs"),
            "vs",
            shader,
            shader.onBeforeBuild,
          )),
          (shader.fragmentShader = Shader.process(
            Shaders.getShader(shader.fsParam + ".fs"),
            "fs",
            shader,
            shader.onBeforeBuild,
          )),
          shader.vertexShader.includes("//js") && !window[shader.vsName])
        ) {
          let code = shader.vertexShader.split("\n"),
            adders = [];
          (code.forEach((line) => {
            if (line.includes("//js")) {
              let name = line.split(" ")[2].replace(";", ""),
                value = line.split("//js ")[1].replace(";", "");
              adders.push((obj) => {
                obj[name] = { value: eval?.(value) };
              });
            } else if (/uniform\s+sampler2D/.test(line)) {
              let name = line.split(" ")[2].replace(";", "");
              if (name.includes("sampler")) return;
              adders.push((obj) => {
                obj[name] ||
                  ((obj[name] = { value: null }),
                  line.includes("repeat") && (obj[name].getTexture = Utils3D.getRepeatTexture),
                  line.includes("ignoreUIL") && (obj[name].ignoreUIL = !0));
              });
            }
          }),
            (window[shader.vsName] = function (_mesh, _shader) {
              let uniforms = {};
              (adders.forEach((addTo) => addTo(uniforms)), _shader.addUniforms(uniforms));
            }));
        }
      }));
    let shaderAutoUniforms = {};
    function getLightingCode(_this) {
      if (
        (!_this.receiveShadow && Shader.shouldReceiveShadow(_this) && (_this.receiveShadow = !0),
        !_this.receiveLight || _this.isShadow)
      )
        return "";
      let numLights = Lighting.getLighting(_this).position.length / 4;
      return 0 == numLights
        ? Lighting.getShadowUniforms(_this)
        : [
            `#define NUM_LIGHTS ${numLights}`,
            "uniform lights {",
            `vec4 lightPos[${numLights}];`,
            `vec4 lightColor[${numLights}];`,
            `vec4 lightData[${numLights}];`,
            `vec4 lightData2[${numLights}];`,
            `vec4 lightData3[${numLights}];`,
            `vec4 lightProperties[${numLights}];`,
            "};",
          ].join("\n") + Lighting.getShadowUniforms(_this);
    }
    ((Shader.process = function (code, type, _this, _onBeforeBuild) {
      const WEBGL2 = Renderer.type == Renderer.WEBGL2;
      if (!code) throw "No shader found! " + _this.vsName + " | " + _this.fsName;
      const externalOES =
          code.includes("samplerExternalOES") && window.AURA && "android" == Device.system.os,
        standardDeriv = !WEBGL2 && code.includes(["fwidth", "dFdx", "dFdy"]),
        drawBuffers =
          !WEBGL2 &&
          code.includes(["gl_FragData", "#drawbuffer"]) &&
          window.World &&
          World.NUKE.useDrawBuffers;
      let levelOfDetail =
        !WEBGL2 &&
        code.includes([
          "textureGrad",
          "textureProjGrad",
          "texture2DGrad",
          "textureCubeGrad",
          "texture2DProjGrad",
        ]);
      levelOfDetail ||
        WEBGL2 ||
        "fs" !== type ||
        (levelOfDetail = code.includes([
          "textureLod",
          "texture2DLod",
          "textureCubeLod",
          "texture2DProjLod",
        ]));
      const layoutsDefined = code.includes("layout");
      let header, autoUniforms;
      ((header =
        "vs" == type
          ? [
              "#version 300 es",
              externalOES ? "#extension GL_OES_EGL_image_external_essl3 : require" : "",
              levelOfDetail ? "#extension GL_EXT_shader_texture_lod : enable" : "",
              `precision ${_this.precision}p float;`,
              `precision ${_this.precision}p int;`,
              WEBGL2 ? `precision ${_this.precision}p sampler3D;` : "",
              WEBGL2 ? `precision ${_this.precision}p sampler2DArray;` : "",
              WEBGL2 ? `precision ${_this.precision}p usampler2D;` : "",
              WEBGL2 ? `precision ${_this.precision}p isampler2D;` : "",
              "attribute vec2 uv;",
              "attribute vec3 position;",
              "attribute vec3 normal;",
              "uniform mat3 normalMatrix;",
              "uniform mat3 normalMatrixWorld;",
              "uniform mat4 modelMatrix;",
              "uniform mat4 modelViewMatrix;",
              "uniform global {",
              "mat4 projectionMatrix;",
              "mat4 viewMatrix;",
              "vec3 cameraPosition;",
              "vec4 cameraQuaternion;",
              "vec2 resolution;",
              "float time;",
              "float timeScale;",
              "};",
            ].join("\n")
          : [
              "#version 300 es",
              externalOES ? "#extension GL_OES_EGL_image_external_essl3 : require" : "",
              standardDeriv ? "#extension GL_OES_standard_derivatives : enable" : "",
              drawBuffers ? "#extension GL_EXT_draw_buffers : require" : "",
              levelOfDetail ? "#extension GL_EXT_shader_texture_lod : enable" : "",
              `precision ${_this.precision}p float;`,
              `precision ${_this.precision}p int;`,
              WEBGL2 ? `precision ${_this.precision}p sampler3D;` : "",
              WEBGL2 ? `precision ${_this.precision}p sampler2DArray;` : "",
              WEBGL2 ? `precision ${_this.precision}p usampler2D;` : "",
              WEBGL2 ? `precision ${_this.precision}p isampler2D;` : "",
              "uniform mat3 normalMatrix;",
              "uniform mat3 normalMatrixWorld;",
              "uniform mat4 modelMatrix;",
              "uniform mat4 modelViewMatrix;",
              "uniform global {",
              "mat4 projectionMatrix;",
              "mat4 viewMatrix;",
              "vec3 cameraPosition;",
              "vec4 cameraQuaternion;",
              "vec2 resolution;",
              "float time;",
              "float timeScale;",
              "};",
              layoutsDefined ? "" : "out vec4 FragColor;",
            ].join("\n")),
        (header += "\n__ACTIVE_THEORY_LIGHTS__\n\n"),
        window.AURA && (header += "#define AURA\n"),
        _this.defines && _this.defines.forEach((d) => (header += `#define ${d.toUpperCase()}\n`)),
        _onBeforeBuild && (code = _onBeforeBuild(code, type)));
      let split = code.split("\n");
      for (let i = split.length - 1; i > -1; i--) {
        let line = split[i];
        if (line.includes("uniform sampler2D")) {
          let name = line.split(" ")[2].replace(";", "").trim();
          _this.uniforms[name] ||
            (autoUniforms || (autoUniforms = {}),
            (autoUniforms[name] = { value: null }),
            line.includes("repeat") && (autoUniforms[name].getTexture = Utils3D.getRepeatTexture),
            line.includes("ignoreUIL") && (autoUniforms[name].ignoreUIL = !0));
        }
      }
      if (autoUniforms) {
        shaderAutoUniforms[`${_this.vsName}_${_this.vsName}_${_this.customCompile}`] = autoUniforms;
        for (let key in autoUniforms) _this.uniforms[key] = { ...autoUniforms[key] };
      }
      return (code = header + code);
    }),
      (Shader.addAutoUniforms = function (_this) {
        let autoUniforms =
          shaderAutoUniforms[`${_this.vsName}_${_this.vsName}_${_this.customCompile}`];
        if (autoUniforms)
          for (let key in autoUniforms) _this.uniforms[key] = { ...autoUniforms[key] };
      }));
    const prototype = Shader.prototype,
      isResettingProgramProp =
        "function" == typeof Symbol ? Symbol("isResettingProgram") : "_isResettingProgram";
    ((prototype.copyUniformsTo = function (shader, linked, ignore) {
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
      }),
      (prototype.draw = function (mesh, geom) {
        (this.receiveLight && !this.__lighting && Lighting.getLighting(this),
          Shader.renderer.draw(this, mesh, geom));
      }),
      (prototype.upload = function (mesh, geom) {
        (!this.receiveShadow && Shader.shouldReceiveShadow(this) && (this.receiveShadow = !0),
          Shader.renderer.upload(this, mesh, geom),
          this.receiveShadow && !this.shadow && Lighting.initShadowShader(this, mesh));
      }));
    let _destroyEvt = {};
    ((prototype.destroy = function () {
      (this.persists ||
        (this[isResettingProgramProp] ||
          ((_destroyEvt.shader = this),
          Events.emitter._fireEvent(Shader.BEFORE_DESTROY, _destroyEvt),
          (_destroyEvt.shader = null)),
        Shader.renderer.destroy(this),
        this.shadow && this.shadow.destroy()),
        this.receiveLight && Lighting.destroyShader(this));
    }),
      (prototype.onBeforeCompile = function (code, type) {
        const WEBGL2 = Renderer.type == Renderer.WEBGL2;
        "}" != (code = code.trim())[code.length - 1] && (code += "\n}");
        let p = this.mesh,
          scene = World.SCENE;
        for (this._hierarchyClue && (p = this._hierarchyClue); p;)
          (p instanceof Scene && (scene = p), (p = p._parent));
        (scene.nuke && scene.nuke.onBeforeShaderCompile
          ? scene.nuke.onBeforeShaderCompile(this.mesh)
          : this.onBeforePrecompilePromise.resolve(),
          this.receiveShadow && (this.receiveLight = !0));
        let varyings = [],
          uniforms = [];
        ((code = code.split("\n")).forEach((line, index) => {
          ("fs" == type &&
            line.includes("#drawbuffer") &&
            (line.includes("#drawbuffer Color")
              ? (code[index] = line.replace("#drawbuffer Color", ""))
              : (code[index] = "")),
            line.includes("varying") && varyings.push(line.trim()),
            line.includes("uniform") && uniforms.push(line.trim()));
        }),
          (code = code.join("\n")));
        const process = function (array) {
          let replace,
            counts = [];
          (array.forEach((value) => {
            let count = 0;
            (array.forEach((v2) => {
              value == v2 && count++;
            }),
              count > 1 &&
                (replace || (replace = []),
                replace.includes(value) || (replace.push(value), counts.push(count))));
          }),
            replace &&
              replace.forEach((value, i) => {
                let count = counts[i];
                for (let j = 0; j < count - 1; j++) {
                  let index = code.lastIndexOf(value);
                  code = code.substring(0, index) + code.substring(index + value.length);
                }
              }));
        };
        (process(varyings),
          process(uniforms),
          "fs" == type &&
            (WEBGL2
              ? code.includes("gl_FragColor") && (code = code.replace(/gl_FragColor/g, "FragColor"))
              : code.includes("#applyShadow") && (code = code.replace("#applyShadow", ""))),
          (code = code.replace("__ACTIVE_THEORY_LIGHTS__", getLightingCode(this))),
          "fs" == type &&
            code.includes("SHADOW_MAPS") &&
            (code = require("GLSLOptimizer")(
              code.replaceAll("SHADOW_COUNT", Lighting.getShadowCount(this)),
            )),
          this.preCompile && (code = this.preCompile(code, type)));
        let converter = require("ShaderCode");
        return (code = WEBGL2
          ? converter.convertWebGL2(code, type)
          : converter.convertWebGL1(code, type));
      }),
      (prototype.set = function (key, value, ref) {
        let _this = ref || this;
        return _this.uniforms[key]
          ? (void 0 !== value &&
              (TweenManager.clearTween(_this.uniforms[key]),
              (_this.uniforms[key].value = value),
              _this.ubo && (_this.ubo.needsUpdate = !0)),
            _this.uniforms[key].value)
          : console.warn(`No key ${key} found on shader`, _this);
      }),
      (prototype.get = function (key, ref) {
        let _this = ref || this;
        return _this.uniforms[key] && _this.uniforms[key].value;
      }),
      (prototype.tween = function (key, value, time, ease, delay, callback, update, scaledTime) {
        return "number" == typeof value
          ? tween(
              this.uniforms[key],
              { value: value },
              time,
              ease,
              delay,
              callback,
              update,
              null,
              scaledTime,
            )
          : tween(
              this.uniforms[key].value,
              value,
              time,
              ease,
              delay,
              callback,
              update,
              null,
              scaledTime,
            );
      }),
      (prototype.clone = function (noShadows, postfix) {
        const _this = this;
        noShadows && (_this.params.receiveShadow = !1);
        let shader = new Shader(_this.vsParam, _this.fsParam, _this.params, null, postfix);
        for (let key in _this)
          key.includes(["vsName", "fsName", "uniforms", "_uniform", "_gl"]) ||
            "function" == typeof _this[key] ||
            (shader[key] = _this[key]);
        for (let key in _this.uniforms)
          shader.uniforms[key] = {
            type: _this.uniforms[key].type,
            value: _this.uniforms[key].value,
          };
        return shader;
      }),
      (prototype.resetProgram = function () {
        ((this[isResettingProgramProp] = !0),
          this.shadow && (this.shadow[isResettingProgramProp] = !0),
          this.destroy(),
          (this[isResettingProgramProp] = !1),
          this.shadow && (this.shadow[isResettingProgramProp] = !1),
          (this.vertexShader =
            this.restoreVS ||
            Shader.process(Shaders.getShader(this.vsName + ".vs"), "vs", this, this.onBeforeBuild)),
          (this.fragmentShader =
            this.restoreFS ||
            Shader.process(Shaders.getShader(this.fsName + ".fs"), "fs", this, this.onBeforeBuild)),
          (this.shadow = null));
      }));
    var _shaderShadowMap = {},
      _emptyShadowMap;
    Object.defineProperty(prototype, "receiveShadow", {
      set: function (v) {
        ((_shaderShadowMap[this.vsName + "_" + this.fsName] = v),
          (this._receiveShadow = v),
          v &&
            !this.uniforms.shadowMap &&
            (_emptyShadowMap || (_emptyShadowMap = [Utils3D.getEmptyTexture()]),
            (this.uniforms.shadowMap = { value: _emptyShadowMap })));
      },
      get: function () {
        return this._receiveShadow;
      },
    });
    let shaders = {};
    ((Shader.hasAlreadyPreProcessed = function (shader) {
      let key = `${shader.vsName}_${shader.vsName}_${shader.customCompile}`;
      return shaders[key];
    }),
      (Shader.registerPreProcess = function (shader) {
        let key = `${shader.vsName}_${shader.vsName}_${shader.customCompile}`;
        shaders[key] = !0;
      }),
      (Shader.shouldReceiveShadow = function (shader) {
        return _shaderShadowMap[shader.vsName + "_" + shader.fsName];
      }));
  },
);
