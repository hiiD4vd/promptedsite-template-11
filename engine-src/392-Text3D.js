Class(
  function Text3D(_input, _group, _cloneOptions) {
    Inherit(this, Object3D);
    const _this = this;
    var _config, _fontObject, $text;
    function initUIL() {
      if (
        (_cloneOptions?.config
          ? (_config = _cloneOptions.config)
          : ((_config = InputUIL.create(_input.prefix + "_text3d", _group)).setLabel("Text3D"),
            _config.addTextarea("text").addTextarea("fontStyle"),
            _config.addToggle("anchor2D", !1),
            _config.addToggle("renderRetina", !1),
            _config.add("data", "hidden")),
        UIL.sidebar)
      ) {
        function onUpdate(key) {
          if ("data" != key) {
            let text = parseData(_config.get("text")),
              obj = getFontObject();
            (_config.setValue("data", JSON.stringify(obj)),
              $text && ($text.setText(text, obj), obj.color && $text.setColor(obj.color)),
              _this.onUpdate && _this.onUpdate(),
              _this.events.fire(Events.UPDATE, { key: key }, !0));
          }
        }
        _cloneOptions?.original
          ? _this.events.sub(_cloneOptions.original, Events.UPDATE, ({ key: key }) => {
              onUpdate(key);
            })
          : (_config.onUpdate = onUpdate);
      }
    }
    function parseData(text) {
      if (_cloneOptions?.text) return _cloneOptions.text;
      if (!text || !text.includes("$DATA")) return text;
      for (; text.includes("$DATA");) {
        let code = text.split("$DATA")[1].split(" ")[0].split("\n")[0],
          line = "$DATA" + code;
        text = text.replace(line, eval(line.replace("$DATA", "_this.parent.data")));
      }
      return text;
    }
    function getFontObject() {
      let font = _config.get("fontStyle") || "",
        obj = {};
      return (
        (font = font.split("\n")),
        font.forEach((line) => {
          let key = (line = line.split(":"))[0],
            val = line[1];
          (val && (val = val.replace(/ /g, "")),
            key.length &&
              ((obj[key] = isNaN(Number(val)) ? val : Number(val)),
              "false" === val && (obj[key] = !1),
              "true" === val && (obj[key] = !0)));
        }),
        obj
      );
    }
    function initText() {
      if (!(_fontObject = JSON.parse(_config.get("data") || "{}")).size) return;
      (Text3D.FONT_CONFIG && (_fontObject.config = Text3D.FONT_CONFIG),
        Text3D.LANG_BREAK && (_fontObject.langBreak = Text3D.LANG_BREAK));
      let shaderName = _input.get("shader");
      (shaderName &&
        (shouldMergeCustomShader()
          ? Hydra.LOCAL && initHotReload()
          : Shaders.hasShader(shaderName + ".vs")
            ? (_fontObject.shader = shaderName)
            : console.warn(
                `Shader ${shaderName} not found, falling back to default Text3D shader`,
              )),
        _fontObject.shader || (_fontObject.shader = "Text3D"));
      let text = parseData(_config.get("text"));
      text && createText(text, _fontObject);
    }
    function initHotReload() {
      _this.events.sub(ShaderUIL.SHADER_UPDATE, ({ shader: shader }) => {
        let reloadedShaderName = shader.split(".")[0],
          shaderName = _input.get("shader");
        if (reloadedShaderName === shaderName || "Text3D" === reloadedShaderName) {
          let shader = $text.text?.shader;
          shader?.fragmentShader?.length &&
            (shader.resetProgram(),
            (shader.fragmentShader =
              shader.fragmentShader.split("void main")[0] +
              "\n" +
              Shaders.getShader(shaderName + ".fs")),
            Shader.renderer.hotReloadClearProgram(
              `${shader.vsName}_${shader.vsName}_${shader.customCompile}`,
            ));
        }
      });
    }
    async function overrideLocalize(text, fontObject, cb) {
      if (!text) return;
      ((_this.localized = !0),
        (fontObject.text = text),
        _this.text && _this.text.destroy && _this.text.destroy(),
        (_this.text = new Text3D.FallbackText()),
        _this.text.setColor(_fontObject.color),
        (_this.text.onSetText = (text) => _this.setText(text)));
      Text3D.createFallbackTexture(text, fontObject).then((texture) => {
        _this.text.setColor(fontObject.color);
        let geom = new PlaneGeometry(texture.width, texture.height);
        for (
          geom.computeBoundingBox(),
            "center" != fontObject.align &&
              geom.applyMatrix(new Matrix4().makeTranslation(texture.width / 2, 0, 0));
          _this.group.children.length;
        )
          _this.group.remove(_this.group.children[0]);
        return (_this.text.createMesh(geom, texture), _this.add(_this.text.group), _this.text);
      });
    }
    function shouldMergeCustomShader() {
      let shaderName = _input.get("shader");
      return (
        !!Shaders.hasShader(`${shaderName}.fs`) &&
        (!Shaders.hasShader(`${shaderName}.vs`) ||
          !/void\s+main/.test(Shaders.getShader(`${shaderName}.vs`)))
      );
    }
    function createText(text, fontObject) {
      if ((fontObject.localize || _input.forceLocalize) && Text3D.missingChars(text, fontObject))
        return overrideLocalize(text, fontObject);
      (($text = $glText(text, null, null, fontObject)).enable3D(_config.get("anchor2D")),
        GLUIUtils.setRetinaMode($text, _config.get("renderRetina"), _this),
        ($text.text.onCreateShader = (shader) => {
          let shaderName = _input.get("shader");
          (shaderName &&
            shouldMergeCustomShader() &&
            (shader.fragmentShader?.length &&
              (shader.fragmentShader =
                shader.fragmentShader.split("void main")[0] +
                "\n" +
                Shaders.getShader(shaderName + ".fs")),
            (shader.customCompile = shaderName)),
            ($text.text3d = _this),
            window[shaderName] &&
              ((_this.shaderClass = _this.parent.initClass(
                window[shaderName],
                $text,
                shader,
                _group,
                _input,
              )),
              ShaderUIL.add(shader, _group, { noGraph: !!_cloneOptions?.config }).setLabel(
                "Shader",
              )));
        }),
        (_this.text = $text));
      let setText = $text.setText.bind($text);
      (($text.setText = function (text, obj) {
        if (obj) for (let key in obj) _fontObject[key] = obj[key];
        ((_fontObject.text = text),
          setText(text, _fontObject),
          _this.events.fire(Events.UPDATE),
          defer(setUniforms));
      }),
        $text.loaded().then((_) => {
          $text &&
            ((_this.shader = $text.mesh.shader),
            _this.shader.addUniforms({
              uTransition: { value: 1, ignoreUIL: !0, enableTweenUIL: !0 },
              uOpacity: { value: 1, ignoreUIL: !0, enableTweenUIL: !0 },
              uTranslate: { value: _this.translate },
              uRotate: { value: _this.rotate },
              uWordCount: { value: 0, ignoreUIL: !0 },
              uLetterCount: { value: 0, ignoreUIL: !0 },
              uLineCount: { value: 0, ignoreUIL: !0 },
              uByWord: { value: 0, ignoreUIL: !0 },
              uByLine: { value: 0, ignoreUIL: !0 },
              uPadding: { value: 0.3, ignoreUIL: !0 },
              uFixed: { value: 0, ignoreUIL: !0 },
              uFixedCameraMatrix: { value: new Matrix4(), ignoreUIL: !0 },
              uBoundingMin: { value: new Vector3().copy($text.dimensions.min), ignoreUIL: !0 },
              uBoundingMax: { value: new Vector3().copy($text.dimensions.max), ignoreUIL: !0 },
            }),
            Text3D.onCreateShader && Text3D.onCreateShader(_this.shader));
        }),
        setUniforms());
    }
    async function setUniforms() {
      if (_this.wait) {
        if ((await _this.wait(_this, "shader"), await $text.loaded(), _input && _input.get)) {
          let depthWrite = _input.get("depthWrite"),
            depthTest = _input.get("depthTest");
          ("boolean" == typeof depthWrite && ($text.mesh.shader.depthWrite = depthWrite),
            "boolean" == typeof depthTest && ($text.mesh.shader.depthTest = depthTest));
          let blending = _input.get("blending");
          blending && ($text.mesh.shader.blending = blending);
        }
        _this.shader &&
          (_this.shader.set("uWordCount", $text.mesh.geometry.wordCount),
          _this.shader.set("uLetterCount", $text.mesh.geometry.letterCount),
          _this.shader.set("uLineCount", $text.mesh.geometry.lineCount),
          _this.shader.set("uBoundingMin", new Vector3().copy($text.dimensions.min)),
          _this.shader.set("uBoundingMax", new Vector3().copy($text.dimensions.max)));
      }
    }
    ((this.translate = new Vector3()),
      (this.rotate = new Vector3()),
      (_this.wildcard = _input.get("wildcard")),
      (async function () {
        ((_this.group.text = _this),
          initUIL(),
          initText(),
          Text3D.onCreate && Text3D.onCreate(_this));
      })(),
      this.get("fontObject", (_) => _fontObject),
      (this.setProperties = function (obj) {
        return (
          (obj = { ..._fontObject, ...obj }),
          $text ? ($text.setText(obj.text, obj), setUniforms()) : createText(obj.text, obj),
          _this.text.loaded()
        );
      }),
      (this.setPropertiesCheck = function (obj, force) {
        let applyProperties = !1;
        for (const key in obj)
          _fontObject[key] !== obj[key] && ((applyProperties = !0), (_fontObject[key] = obj[key]));
        return applyProperties || force ? _this.setProperties() : Promise.resolve();
      }),
      (this.setText = function (text) {
        if (((_fontObject.text = text), $text)) {
          if (_fontObject.localize && Text3D.missingChars(text, _fontObject))
            return (
              _this.group.remove($text.group),
              (_this.shader = void 0),
              ($text = null),
              void createText(text, _fontObject)
            );
          ($text.setText(text),
            setUniforms(),
            $text.mesh && ($text.mesh.onBeforeRender(), $text.mesh.updateMatrixWorld(!0)));
        } else createText(text, _fontObject);
      }),
      (this.setColor = function (color) {
        ((_fontObject.color = color), _this.text && _this.text.setColor(color));
      }),
      this.set("animateByWord", async (bool) => {
        _this.localized ||
          (await _this.wait(_this, "shader"), _this.shader.set("uByWord", bool ? 1 : 0));
      }),
      this.set("animateByLine", async (bool) => {
        _this.localized ||
          (await _this.wait(_this, "shader"), _this.shader.set("uByLine", bool ? 1 : 0));
      }),
      this.set("animationPadding", async (p) => {
        _this.localized || (await _this.wait(_this, "shader"), _this.shader.set("uPadding", p));
      }),
      this.set("transition", async (v) => {
        if (_this.localized) return (_this.text.alpha = v);
        (await _this.wait(_this, "shader"), _this.shader.set("uTransition", v));
      }),
      (this.tween = async function (val, time, ease, delay) {
        return _this.localized
          ? _this.text.tween(val, time, ease, delay)
          : (await _this.wait(_this, "shader"),
            _this.shader.tween("uTransition", val, time, ease, delay));
      }),
      (this.upload = function () {
        $text && $text.upload();
      }),
      (this.ready = function () {
        return _this.wait(_this, "shader");
      }),
      this.set("renderOrder", (v) => {
        $text && ($text.setZ(v), ($text.seoSortOrder = v));
      }),
      (this.getDimensions = async (_) => (
        await $text.loaded(),
        await $text.text.ready(),
        $text.dimensions
      )),
      (this.clone = function (text) {
        return _this.parent.initClass(Text3D, _input, _group, {
          text: text,
          config: _config,
          original: _this,
        });
      }));
  },
  (_) => {
    var _projection;
    ((Text3D.missingChars = function () {
      return !1;
    }),
      (Text3D.measureScreen = async function ($text, camera = World.CAMERA, z = 0) {
        (_projection || (_projection = new ScreenProjection(World.CAMERA)),
          $text instanceof Text3D && ($text = $text.text),
          await $text.loaded(),
          $text.mesh.onBeforeRender(),
          $text.mesh.updateMatrixWorld(!0),
          await defer(),
          (_projection.camera = camera));
        let bb = new Box3();
        (bb.setFromObject($text.mesh), (bb.min.z = bb.max.z = z));
        let min = _projection.project(bb.min).clone(),
          max = _projection.project(bb.max).clone();
        return { width: Math.abs(min.x - max.x), height: Math.abs(min.y - max.y) };
      }));
  },
);
