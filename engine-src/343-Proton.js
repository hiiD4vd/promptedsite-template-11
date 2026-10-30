Class(
  function Proton(_input, _group) {
    Inherit(this, Object3D);
    const _this = this;
    var _config, _size, _antimatter, _behaviorInput, _batches;
    const prefix = (this.prefix = `P_${_input.prefix}`);
    async function initConfig() {
      ((_config = _this.uilConfig = InputUIL.create(prefix + "_config", _group)).setLabel("Config"),
        _config
          .addButton("load-values", {
            label: "Values",
            actions: [
              { title: "Load", callback: loadValues },
              { title: "Save", callback: saveValues },
            ],
          })
          .addButton("save", {
            label: "Configuration",
            actions: [
              { title: "Load", callback: loadConfig },
              { title: "Save", callback: saveConfig },
            ],
          })
          .addButton("load-shader", {
            label: "Shader",
            actions: [{ title: "Load", callback: () => loadShader() }],
          })
          .addButton("load-behavior", {
            label: "Behavior",
            actions: [{ title: "Load", callback: () => loadBehavior() }],
          }));
      (_config.addSelect("type", [
        { label: "Permanent", value: "permanent" },
        { label: "Lifecycle", value: "lifecycle" },
      ]),
        window.ProtonCulling && _config.addToggle("FrustumCulling", !1),
        _config.addToggle("staticParticles", !1),
        (_this.preventUpdate = _config.get("staticParticles")),
        _config.addFile("initialPositions", { relative: "assets/geometry" }),
        window.ProtonPhysics && _config.addToggle("enablePhysics", !1),
        _config.add("particleCount", 1e3),
        window.ProtonVolumeShadows && _config.addToggle("volumeShadows", !1));
      let output = [
        { label: "Particles", value: "particles" },
        { label: "Custom", value: "custom" },
      ];
      (window.ProtonTubes && output.push({ label: "Tubes", value: "tubes" }),
        window.ProtonMarchingCubes && output.push({ label: "IsoSurface", value: "isosurface" }),
        _config.addSelect("output", output),
        _config.add("shader"),
        _config.get("shader") && _config.addTextarea("uniforms"),
        _config.add("class"));
      _config.get("type");
      try {
        if (!1 === _input.get("visible")) throw "Layer set to invisible";
        if (((_this.particleCount = _size = getSize()), 0 == _size || isNaN(_size)))
          throw "Size is falsy or 0";
        initAntimatter();
      } catch (e) {
        (Hydra.LOCAL && console.warn("Proton skipped", e), (_this.disabled = !0));
      }
    }
    function loadValues() {
      const name = prompt("Name of values to be loaded");
      if (null === name) return;
      let data = UILStorage.get(`proton_values_${name}`);
      (data || alert(`No values ${name} found`), (data = JSON.parse(data)));
      let apply = (shader, obj) => {
        for (let key in obj) UILStorage.set(shader.UILPrefix + key, obj[key]);
      };
      (apply(_this.behavior, data.behavior),
        apply(_this.shader, data.shader),
        _this.customClass &&
          _this.customClass.saveValues &&
          apply(_this.customClass.saveValues(), data.custom),
        alert("Values imported. Save and refresh."));
    }
    function saveValues() {
      const name = prompt("Name of values to be saved");
      if (null === name) return;
      let store = (shader, to) => {
          for (let key in shader.uniforms) {
            if (shader.uniforms[key].ignoreUIL) continue;
            let uilValue = UILStorage.get(shader.UILPrefix + key);
            void 0 !== uilValue && (to[key] = uilValue);
          }
        },
        output = { behavior: {}, shader: {} };
      (store(_this.behavior, output.behavior),
        store(_this.shader, output.shader),
        _this.customClass &&
          _this.customClass.saveValues &&
          ((output.custom = {}), store(_this.customClass.saveValues(), output.custom)),
        UILStorage.setWrite(`proton_values_${name}`, JSON.stringify(output)));
    }
    function loadConfig() {
      const name = prompt("Name of configuration to be loaded");
      if (null === name) return;
      let toLoad = UILStorage.get(`proton_config_${name}`);
      (loadBehavior(toLoad), loadShader(toLoad), alert("Loaded. Save and refresh"));
    }
    function saveConfig() {
      let name = prompt("Name of configuration to be saved");
      null !== name && UILStorage.setWrite(`proton_config_${name}`, prefix);
    }
    function loadShader(toLoad) {
      let shouldNotify = !toLoad;
      if (!toLoad) {
        const name = prompt("Name of shader to be loaded");
        if (null === name) return;
        toLoad = UILStorage.get(`proton_config_${name}`);
      }
      let copyConfig = InputUIL.create(toLoad + "_config", null);
      (_config.copyFrom(copyConfig, ["shader", "uniforms"]),
        (_config.get("uniforms") || "").split("\n").forEach((line) => {
          if (!line.includes(":")) return;
          let name = (line = line.replace(/ /g, "")).split(":")[0],
            shaderName = copyConfig.get("shader"),
            store = `${shaderName}/${shaderName}/${prefix}/`,
            lookup = `${shaderName}/${shaderName}/${toLoad}/`,
            val = UILStorage.get(lookup + name);
          val
            ? UILStorage.set(store + name, val)
            : ((val = UILStorage.get(lookup + "_tx_" + name)),
              val && UILStorage.set(store + "_tx_" + name, val));
        }),
        shouldNotify && alert("Loaded. Save and refresh"));
    }
    function loadBehavior(toLoad) {
      let shouldNotify = !toLoad;
      if (!toLoad) {
        const name = prompt("Name of behavior to be loaded");
        if (null === name) return;
        toLoad = UILStorage.get(`proton_config_${name}`);
      }
      let copyConfig = InputUIL.create(toLoad + "_config", null);
      _config.copyFrom(copyConfig, ["type", "particleCount", "output", "class"]);
      let copyBehavior = InputUIL.create(toLoad + "_behavior", null);
      InputUIL.create(prefix + "_behavior", null).copyFrom(copyBehavior, [
        "uniforms",
        "data",
        "codeCount",
      ]);
      let data = copyBehavior.get("data") || [],
        buniformString = copyBehavior.get("uniforms") + "\n";
      (ListUIL.create(prefix + "_code", null).internalAddItems(data.length),
        data.forEach((postfix) => {
          let toCode = InputUIL.create(prefix + postfix, null),
            fromCode = InputUIL.create(toLoad + postfix, null);
          (toCode.copyFrom(fromCode, ["name", "code", "uniforms", "preset"]),
            (buniformString += fromCode.get("uniforms") + "\n"));
        }),
        buniformString.split("\n").forEach((line) => {
          if (!line.includes(":")) return;
          let name = (line = line.replace(/ /g, "")).split(":")[0],
            lookup = "am_ProtonAntimatter_" + toLoad,
            store = "am_ProtonAntimatter_" + prefix,
            val = UILStorage.get(lookup + name);
          val && UILStorage.set(store + name, val);
        }));
      let className = copyConfig.get("class");
      (className &&
        ((_this.customClass = _this.parent.initClass(window[className], _this, _group, _input)),
        _this.customClass.loadConfig && _this.customClass.loadConfig(toLoad, prefix)),
        shouldNotify && alert("Loaded. Save and refresh"));
    }
    function getSize() {
      if (_this.parent.data && _this.parent.data.particleCount)
        return "string" == typeof _this.parent.data.particleCount
          ? eval(_this.parent.data.particleCount)
          : _this.parent.data.particleCount;
      let size = _config.getNumber("particleCount");
      if (isNaN(size) || 0 === size)
        try {
          size = eval(_config.get("particleCount"));
        } catch (e) {
          throw "Proton particleCount is not a number or valid test function";
        }
      if (isNaN(size)) throw "Proton particleCount is falsy!";
      return ((_this.particleCount = size), size);
    }
    async function initCustomClass() {
      _this.shader.addUniforms({ DPR: { value: World.DPR, ignoreUIL: !0 } });
      let className = _config.get("class");
      className &&
        (_this.customClass = _this.parent.initClass(window[className], _this, _group, _input));
    }
    function parseUniforms(text, predefined) {
      if (!text) return {};
      let split = text.split("\n"),
        output = {};
      return (
        split.forEach((line) => {
          if (!(line = line.replace(/ /g, "")).length || !line.includes(":")) return;
          let split = line.split(":"),
            name = split[0],
            val = split[1];
          if (val.includes("[")) {
            let array = JSON.parse(val);
            switch (array.length) {
              case 2:
                output[name] = { value: new Vector2().fromArray(array) };
                break;
              case 3:
                output[name] = { value: new Vector3().fromArray(array) };
                break;
              case 4:
                output[name] = { value: new Vector4().fromArray(array) };
                break;
              default:
                throw `Unknown uniform type ${line}`;
            }
          } else
            "C" == val.charAt(0)
              ? (predefined[name] = val.slice(1))
              : "T" === val
                ? (output[name] = { value: null })
                : "T3D" === val
                  ? (output[name] = { value: null, isTexture3D: !0 })
                  : "OEST" === val
                    ? (output[name] = { value: null, oes: !0 })
                    : val.includes(["0x", "#"])
                      ? (output[name] = { value: new Color(val) })
                      : (output[name] = { value: Number(val) });
        }),
        output
      );
    }
    function getUniformGLSLType(obj) {
      return "number" == typeof obj.value
        ? "float"
        : obj.oes
          ? "samplerExternalOES"
          : null === obj.value
            ? obj.isTexture3D
              ? "sampler3D"
              : "sampler2D"
            : obj.value instanceof Texture
              ? obj.value.isTexture3D
                ? "sampler3D"
                : "sampler2D"
              : obj.value instanceof Vector2
                ? "vec2"
                : obj.value instanceof Vector3 || obj.value instanceof Vector3D
                  ? "vec3"
                  : obj.value instanceof Vector4
                    ? "vec4"
                    : obj.value instanceof Color
                      ? "vec3"
                      : void 0;
    }
    async function initBehavior(behavior) {
      let glsl = [],
        predefinedUniforms = { HZ: "float" },
        input;
      _behaviorInput
        ? (input = _behaviorInput)
        : ((input = InputUIL.create(prefix + "_behavior", _group)),
          input.setLabel("Behavior Uniforms"),
          input.addTextarea("uniforms"),
          input.add("data", "hidden"),
          input.add("codeCount", "hidden"),
          (_behaviorInput = input));
      let map = {},
        list = [],
        count = input.getNumber("codeCount") || 0,
        data = input.get("data") || [],
        panel = ListUIL.create(prefix + "_code", _group);
      (panel.setLabel("Behavior Code"),
        panel.onAdd((name, input, index) => {
          (list[index] || addCode(),
            input.group.add(list[index].group),
            (list[index].mapId = name),
            (map[name] = list[index]),
            input.setLabel(map[name].get("name") || "Code"));
        }),
        panel.onRemove((name) => {
          let postfix = map[name].postfix;
          (list.remove(map[name]),
            data.remove(postfix),
            input.setValue("data", JSON.stringify(data)));
        }),
        panel.onSort((array) => {
          let arr = [];
          (array.forEach((name) => {
            arr.push(map[name].postfix);
          }),
            (data = arr),
            input.setValue("data", JSON.stringify(data)));
        }));
      let uniforms = parseUniforms(input.get("uniforms")),
        createCode = (postfix) => {
          let input = InputUIL.create(prefix + postfix, _group, !0);
          if (
            ((input.prefix = prefix + postfix),
            (input.postfix = postfix),
            input.setLabel("Editor"),
            input.add("name", "hidden"),
            Proton.ignorePresets && Proton.ignorePresets.includes(input.get("name")))
          )
            return;
          (ProtonPresets.bind(input),
            input.customPresetCallback && input.customPresetCallback(_this));
          let code = input.get("code") || "";
          if (!input.disabled && code.length) {
            for (
              uniforms = Utils.mergeObject(
                uniforms,
                parseUniforms(input.get("uniforms"), predefinedUniforms),
              );
              code.includes("#test ");
            )
              try {
                let test = code.split("#test ")[1],
                  name = test.split("\n")[0],
                  glsl = code.split("#test " + name + "\n")[1].split("#endtest")[0];
                (eval(name) || (code = code.replace(glsl, "")),
                  (code = code.replace("#test " + name + "\n", "")),
                  (code = code.replace("#endtest", "")));
              } catch (e) {
                throw "Error parsing test :: " + e;
              }
            glsl.push(code);
          }
          list.push(input);
        };
      data.forEach(createCode);
      let addCode = (_) => {
        (count++,
          data.push(`code_${count}`),
          input.setValue("data", JSON.stringify(data)),
          input.setValue("codeCount", count),
          createCode(`code_${count}`));
      };
      behavior instanceof AntimatterPass &&
        (behavior.addInput("tOrigin", _antimatter.vertices),
        behavior.addInput("tAttribs", _antimatter.attribs),
        behavior.addUniforms(uniforms));
      let filledRequire = [],
        insertUniform = (code, line) => code.split("//uniforms").join(line + "\n//uniforms"),
        insertCode = (code, line) => code.split("//code").join(line + "\n//code"),
        insertRequire = (code, line) => {
          let name = line.split("require(")[1].split(")")[0];
          return filledRequire.includes(name)
            ? code
            : (filledRequire.push(name),
              code.split("//require").join(Shaders.getShader(name) + "\n//require"));
        },
        insertGLSL = (code, line) => {
          if (line.includes("#require")) {
            let split = line.split("\n");
            for (let l of split)
              code = l.includes("#require") ? insertRequire(code, l) : insertCode(code, l);
            return code;
          }
          return insertCode(code, line);
        };
      ((behavior.onCreateShader = (code) => {
        for (let name in uniforms)
          code = insertUniform(code, `uniform ${getUniformGLSLType(uniforms[name])} ${name};`);
        for (let name in predefinedUniforms)
          code = insertUniform(code, `uniform ${predefinedUniforms[name]} ${name};`);
        for (let str of glsl) code = insertGLSL(code, str);
        return (
          _this.tubes && (code = _this.tubes.overrideShader(code)),
          Renderer.type == Renderer.WEBGL2 && (code = code.replace(/gl_FragColor/g, "FragColor")),
          code.includes("samplerExternalOES") &&
            window.AURA &&
            "android" == Device.system.os &&
            (code =
              "#version 300 es\n#extension GL_OES_EGL_image_external_essl3 : require\n" +
              code.replace("#version 300 es", "")),
          code
        );
      }),
        (behavior.uniforms.uMaxCount = { value: _this.particleCount, ignoreUIL: !0 }),
        ShaderUIL.add(behavior, _group).setLabel("Behavior Shader"),
        (behavior.uniforms.HZ = { value: 1 }),
        _config.get("FrustumCulling") && _batches.setupPositionTexture(behavior.output.texture),
        _this.startRender((_) => {
          behavior.uniforms.HZ.value = Render.HZ_MULTIPLIER;
        }, 10),
        (ProtonPresets.onCodeEdit = rebuildShader));
    }
    async function rebuildShader() {
      let lifecycle = "lifecycle" == _config.get("type"),
        behavior = _this.initClass(
          AntimatterPass,
          "ProtonAntimatter" + (lifecycle ? "Lifecycle" : ""),
          { unique: prefix, customCompile: prefix + Utils.uuid() },
        );
      (await initBehavior(behavior),
        behavior.initialize(64),
        behavior.upload(),
        _this.behavior.shader._gl && (_this.behavior.shader._gl = behavior.shader._gl),
        _this.behavior.shader._metal && (_this.behavior.shader._metal = behavior.shader._metal),
        _this.behavior.shader._gpu && (_this.behavior.shader._gpu = behavior.shader._gpu));
    }
    function completeShader(shader) {
      let transparent = _input.get("transparent"),
        depthWrite = _input.get("depthWrite"),
        depthTest = _input.get("depthTest"),
        blending = _input.get("blending"),
        castShadow = _input.get("castShadow"),
        receiveShadow = _input.get("receiveShadow");
      ("boolean" == typeof depthWrite && (shader.depthWrite = depthWrite),
        "boolean" == typeof depthTest && (shader.depthTest = depthTest),
        "boolean" == typeof transparent && (shader.transparent = transparent),
        "boolean" == typeof castShadow && (_this.mesh.castShadow = castShadow),
        "boolean" == typeof receiveShadow && (shader.receiveShadow = receiveShadow),
        blending && (shader.blending = blending),
        (shader.uniforms.tRandom = { value: _antimatter.attribs }));
    }
    ((this.uilInput = _input),
      (this.uilGroup = _group),
      (this.prefix = prefix),
      (this.preventUpdate = !1),
      initConfig());
    var _lastUpdateTime = 0,
      _updateFPS = null;
    function update() {
      if (!_this.preventUpdate) {
        if (null !== _updateFPS) {
          var now = performance.now();
          if (now - _lastUpdateTime < 1e3 / _updateFPS) return;
          _lastUpdateTime = now;
        }
        _antimatter.update();
      }
    }
    async function initInitialPositions() {
      let file = _config.getFilePath("initialPositions");
      if (!file) return;
      let isBinary = file.includes(".bin");
      (file.includes("assets/geometry") || (file = `assets/geometry/${file}`),
        isBinary || file.includes(".json") || (file += ".json"));
      let url = Thread.absolutePath(Assets.getPath(file)),
        pointData = {};
      if (isBinary) {
        await GeomThread.loadDracoLib();
        let data = await Thread.shared().loadDraco({ type: "decode", path: url });
        data._type
          ? ((pointData.positions = data.offset), (pointData.random = data.random))
          : ((pointData.positions = data.offset.buffer), (pointData.random = data.random.buffer));
      } else {
        pointData = await Thread.shared().parseInstancePositions({ url: url });
      }
      return (
        pointData.positions && (_this.particleCount = _size = pointData.positions.length / 3),
        pointData
      );
    }
    async function initAntimatter() {
      let lifecycle = "lifecycle" == _config.get("type");
      _config.get("enablePhysics")
        ? (_config.addVector("width", [0, 128]),
          _config.addVector("height", [0, 128]),
          _config.addVector("depth", [0, 128]))
        : (_config.addVector("width", [-1, 1]),
          _config.addVector("height", [-1, 1]),
          _config.addVector("depth", [-1, 1]));
      let dimensions = {
          w: _config.get("width") || [-1, 1],
          h: _config.get("height") || [-1, 1],
          d: _config.get("depth") || [-1, 1],
          pot:
            "tubes" === _config.get("output") ||
            !0 === _config.get("volumeShadows") ||
            "isosurface" === _config.get("output"),
        },
        pointData = null;
      if (_config.get("FrustumCulling")) {
        let file = _config.getFilePath("initialPositions");
        if (((file = Assets.getPath(file)), !file)) return;
        ((_batches = _this.initClass(ProtonCulling, _input, _group, file)),
          await _batches.ready,
          (pointData = {}),
          (pointData.positions = new Float32Array(_batches.pointData)),
          (_this.particleCount = _size = _batches.pointData.length / 3));
      } else pointData = await initInitialPositions();
      ((_antimatter = _this.initClass(Antimatter, _size, dimensions, World.RENDERER, pointData)),
        Proton.forceCloneVertices.includes(_config.get("class")) &&
          (_antimatter.cloneVertices = !0),
        (_this.antimatter = _antimatter),
        await _antimatter.ready());
      let output = _config.get("output");
      ("tubes" == output && (_this.tubes = _this.initClass(ProtonTubes, _this)),
        "isosurface" == output && (_this.surface = _this.initClass(ProtonMarchingCubes, _this)));
      let overrideShader,
        wildcard = _input.get("wildcard");
      if (wildcard && wildcard.includes(".behavior")) {
        let layer = await _this.parent.getLayer(wildcard.split(".")[0]);
        (await _this.wait(layer, "behavior"), (_this.behavior = layer.behavior));
      } else {
        let behavior = _this.initClass(
          AntimatterPass,
          "ProtonAntimatter" + (lifecycle ? "Lifecycle" : ""),
          { unique: prefix, customCompile: prefix },
        );
        ((_this.behavior = behavior), initBehavior(behavior));
      }
      _this.behavior.protonRef = _this;
      let shaderName = _config.get("shader");
      if (shaderName)
        if (shaderName.includes(".shader")) {
          let layer = await _this.parent.getLayer(shaderName.split(".")[0]);
          (await _this.wait(layer, "shader"), (overrideShader = layer.shader));
        } else {
          let uniforms = parseUniforms(_config.get("uniforms"));
          ((uniforms.unique =
            prefix + (_this.onGenerateUniqueShader ? _this.onGenerateUniqueShader() : "")),
            _antimatter.useShader(shaderName, uniforms));
        }
      (_antimatter.addPass(_this.behavior),
        (_this.mesh = _antimatter.getMesh()),
        (_this.mesh.shader._hierarchyClue = _this.group),
        _this.onCreateMesh && _this.onCreateMesh(_this.mesh),
        (output && "particles" != output) ||
          _this.delayedCall((_) => {
            _config.get("FrustumCulling") || _this.add(_antimatter.mesh);
          }, 480),
        Utils.query("uilOnly") || _this.startRender(update, RenderManager.AFTER_LOOPS),
        shaderName &&
          !shaderName.includes(".shader") &&
          (ShaderUIL.add(_antimatter.shader, _group).setLabel("Shader"),
          completeShader(_antimatter.shader)),
        overrideShader && _antimatter.overrideShader(overrideShader),
        (_this.shader = _antimatter.shader),
        (_this.shader.protonRef = _this),
        (_this.initialized = !0),
        lifecycle && (_this.spawn = _this.initClass(AntimatterSpawn, _this, _group, _input)),
        initCustomClass(),
        _config.get("volumeShadows") && _this.initClass(ProtonVolumeShadows, _this, _group, _input),
        _config.get("enablePhysics") && _this.initClass(ProtonPhysics, _this, _group, _input));
    }
    async function upload(sync = !0) {
      if (_this.disabled) return;
      await _this.ready();
      let output = _config.get("output"),
        uploadFuncName = sync ? "uploadSync" : "upload";
      (await _antimatter[uploadFuncName](!output || "particles" === output),
        _this.spawn && (await _this.spawn.upload()),
        _this.tubes && (await _this.tubes[uploadFuncName]()));
    }
    ((this.parseUniforms = parseUniforms),
      (this.setFPS = function (fps) {
        _updateFPS = fps;
      }),
      (this.ready = function () {
        return this.wait(this, "initialized");
      }),
      (this.applyToInstancedGeometry = function (geometry) {
        (geometry.addAttribute("lookup", new GeometryAttribute(_antimatter.getLookupArray(), 3, 1)),
          geometry.addAttribute(
            "random",
            new GeometryAttribute(_antimatter.getRandomArray(), 4, 1),
          ),
          (geometry.maxInstancedCount = _size));
      }),
      (this.applyToShader = function (shader) {
        shader.addUniforms({
          tPos: _antimatter.getOutput(),
          tPrevPos: _antimatter.getPrevOutput(),
        });
      }),
      (this.upload = (function () {
        let visible,
          count = 0;
        return async function () {
          (0 === count &&
            ((visible = _this.group.visible), (_this.group.visible = !1), (count += 1)),
            await upload(!1),
            (count -= 1),
            0 === count && (_this.group.visible = visible));
        };
      })()),
      (this.uploadSync = async function () {
        await upload(!0);
      }),
      (this.stopUpdating = function () {
        _this.stopRender(update, RenderManager.AFTER_LOOPS);
      }),
      (this.update = update),
      this.set("fps", async (v) => {
        (await _this.ready(), (_updateFPS = v));
      }),
      this.set("renderOrder", async (v) => {
        (await _this.ready(), await _antimatter.ready(), (_antimatter.mesh.renderOrder = v));
      }),
      this.get("renderOrder", (v) => _antimatter.mesh.renderOrder));
  },
  (_) => {
    ((Proton.forceCloneVertices = []),
      (Proton.ignore = function (name) {
        (Proton.ignorePresets || (Proton.ignorePresets = []), Proton.ignorePresets.push(name));
      }),
      Thread.upload(function parseInstancePositions({ url: url }, id) {
        get(url).then((data) => {
          let result = {},
            buffers = [];
          if (data?.positions)
            ((result.positions = new Float32Array(data.positions)),
              buffers.push(result.positions.buffer));
          else if (data) {
            let bufferName = "buffer",
              attributes = data;
            (data.data &&
              data.metadata?.type &&
              ((bufferName = "array"), (attributes = data.data.attributes)),
              (result.positions = new Float32Array(attributes.offset[bufferName])),
              buffers.push(result.positions.buffer));
          }
          if (data?.random)
            ((result.random = new Float32Array(data.random)), buffers.push(result.random.buffer));
          else if (data) {
            let bufferName = "buffer",
              attributes = data;
            (data.data &&
              data.metadata?.type &&
              ((bufferName = "array"), (attributes = data.data.attributes)),
              attributes.random &&
                ((result.random = new Float32Array(attributes.random[bufferName])),
                buffers.push(result.random.buffer)));
          }
          resolve(result, id, buffers);
        });
      }));
  },
);
