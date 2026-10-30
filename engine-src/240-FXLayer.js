Class(function FXLayer(_parentNuke, _type, _preventDrawBuffers) {
  Inherit(this, Component);
  var _nuke,
    _rt,
    _this = this,
    _scene = new Scene(),
    _objects = [],
    _textureIndex = -1,
    _visible = !0,
    _id = Utils.timestamp(),
    _name = Utils.getConstructorName(_this),
    _useDrawBuffers = !_preventDrawBuffers;
  ((this.resolution = 1), (this.enabled = !0), (this.renderShadows = !0));
  const CLEAR_COLOR = [0, 0, 0, 1];
  function resizeHandler() {
    _rt.setSize &&
      _rt.setSize(
        _nuke.stage.width * _this.resolution * _nuke.dpr,
        _nuke.stage.height * _this.resolution * _nuke.dpr,
      );
  }
  if (
    ((FXLayer.exists = !0),
    this.set("visible", (v) => (_this.scene.visible = _visible = v)),
    this.get("visible", (_) => _visible),
    (this.onInvisible = function () {
      _this.scene.visible = !1;
    }),
    (this.onVisible = function () {
      _this.scene.visible = !0;
    }),
    (this.create = function (nuke = World.NUKE, type, rt) {
      if (!nuke) return;
      let format, manualRender, mipmaps;
      ((_useDrawBuffers = nuke.useDrawBuffers && null == _preventDrawBuffers),
        type &&
          "object" == typeof type &&
          ("boolean" == typeof type.useDrawBuffers && (_useDrawBuffers = type.useDrawBuffers),
          (format = type.format),
          (manualRender = type.manualRender),
          (mipmaps = type.mipmaps),
          rt || (rt = type.rt),
          (type = type.type)),
        (_this.rtType = type || Texture.UNSIGNED_BYTE),
        (_this.rtFormat = format || Texture.RGBFormat),
        (_this.rtMipmaps = mipmaps),
        ((_this = this).scene = _scene),
        (_nuke = _this.initClass(Nuke, nuke.stage, {
          renderer: nuke.renderer,
          camera: nuke.camera,
          scene: _scene,
          dpr: nuke.dpr,
          useDrawBuffers: !1,
        })),
        (_parentNuke = _this.parent?.nuke || nuke),
        (_nuke.parentNuke = _parentNuke),
        (_this.nuke = _nuke),
        (function initRT(rt) {
          if (_useDrawBuffers) {
            let texture = new Texture();
            ((texture.minFilter = Texture.LINEAR),
              (texture.magFilter = Texture.LINEAR),
              (texture.format = Texture.RGBAFormat),
              _this.rtType && (texture.type = _this.rtType),
              _this.rtFormat && (texture.format = _this.rtFormat),
              _this.rtMipmaps
                ? ((texture.generateMipmaps = !0),
                  (texture.minFilter = texture.magFilter = Texture.LINEAR_MIPMAP))
                : (texture.generateMipmaps = !1),
              texture.type == Texture.FLOAT && (texture.format = Texture.RGBAFormat),
              (texture.wrapS = texture.wrapT = Texture.CLAMP_TO_EDGE),
              (texture.fxLayer = _this),
              (_this.textureIndex = _textureIndex = _parentNuke.attachDrawBuffer(texture)),
              (_rt = { texture: texture }));
          } else
            (_this.rtType &&
              _this.rtType == Texture.FLOAT &&
              "ios" == Device.system.os &&
              (_this.rtType = Texture.HALF_FLOAT),
              (_rt =
                rt ||
                Utils3D.createRT(
                  Math.round(_nuke.stage.width * _this.resolution * _nuke.dpr),
                  Math.round(_nuke.stage.height * _this.resolution * _nuke.dpr),
                  _this.rtType,
                  _this.rtFormat,
                )),
              _this.rtMipmaps
                ? ((_rt.texture.minFilter = _rt.texture.magFilter = Texture.LINEAR_MIPMAP),
                  (_rt.texture.generateMipmaps = !0))
                : (_rt.texture.generateMipmaps = !1));
          ((_this.rt = _rt), _this.nuke.setSize(_rt.width, _rt.height));
        })(rt),
        (function addListeners() {
          _this.events.sub(Events.RESIZE, resizeHandler);
        })(),
        manualRender || FXScene.manualRender || _this.startRender((_) => _this.draw(), nuke));
    }),
    (this.addObject = this.add =
      function (object) {
        if (_nuke) {
          if (!_useDrawBuffers) {
            let clone = object.clone();
            for (
              object["clone_" + _id] = clone,
                _scene.add(clone),
                _objects.push(object),
                object.shader &&
                  (function editShader(mesh) {
                    let applyShadow = (shader, bool) => {
                      let fs = shader.fragmentShader;
                      if (fs) {
                        for (; fs.includes("#applyShadow");) {
                          fs = fs.split("\n");
                          for (let i = 0; i < fs.length; i++)
                            bool
                              ? fs[i].includes("#applyShadow") &&
                                (fs[i] = fs[i].replace("#applyShadow", ""))
                              : fs[i].includes("#applyShadow") && (fs[i] = "");
                          fs = fs.join("\n");
                        }
                        shader.fragmentShader = fs;
                      }
                    };
                    mesh.shader._fragmentShader ||
                      (mesh.shader._fragmentShader = mesh.shader.fragmentShader);
                    let shader = mesh.shader.clone(!_this.renderShadows, `-${_this.name || _name}`);
                    (((shader, name) => {
                      let fs = shader._fragmentShader;
                      if (!fs) return;
                      let marker = "#drawbuffer " + name;
                      if (fs.includes(marker)) {
                        let split = fs.split(marker + " ");
                        fs = split.join("");
                      }
                      for (; fs.includes("#drawbuffer");) {
                        fs = fs.split("\n");
                        for (let i = 0; i < fs.length; i++)
                          fs[i].includes("#drawbuffer") && (fs[i] = "");
                        fs = fs.join("\n");
                      }
                      shader.fragmentShader = fs;
                    })(shader, _this.name || _name),
                      applyShadow(shader, _this.renderShadows),
                      applyShadow(mesh.shader, !0),
                      mesh.shader.copyUniformsTo(shader, !0),
                      (mesh.shader = shader));
                  })(clone);
              clone.children.length;
            )
              clone.remove(clone.children[0]);
            return clone;
          }
          object.shader &&
            object.shader.fragmentShader &&
            (!(function editDBShader(mesh) {
              const WEBGL2 = Renderer.type == Renderer.WEBGL2;
              let modifyMarker = (fs, name, index) => {
                  if (WEBGL2) {
                    if (fs.includes("layout(location=0) out vec4 reflectionsData")) return fs;
                    if (!fs.includes(`layout(location=${index})`)) {
                      let mainAt = (fs = fs.replace("out vec4 FragColor;", "")).indexOf(
                          "void main()",
                        ),
                        before = fs.slice(0, mainAt),
                        after = fs.slice(mainAt);
                      fs = before + `layout(location=${index}) out vec4 ${name};\n` + after;
                    }
                  }
                  let marker = "#drawbuffer " + name;
                  if (fs.includes(marker)) {
                    let split = fs.split(marker + " "),
                      finalOut = WEBGL2 ? name : `gl_FragData[${index}]`;
                    for (let i = 1; i < split.length; ++i)
                      split[i] = split[i].replace("gl_FragColor", finalOut);
                    fs = split.join("");
                  }
                  for (; fs.includes("#applyShadow");) {
                    fs = fs.split("\n");
                    for (let i = 0; i < fs.length; i++)
                      fs[i].includes("#applyShadow") && (fs[i] = fs[i].replace("#applyShadow", ""));
                    fs = fs.join("\n");
                  }
                  return fs;
                },
                shader = mesh.shader,
                fs = shader.fragmentShader,
                name = _this.name || _name;
              ((WEBGL2 && fs.includes("location=0")) || (fs = modifyMarker(fs, "Color", 0)),
                (fs = modifyMarker(fs, name, _textureIndex)),
                (shader.fragmentShader = fs));
            })(object),
            (object.shader._attachmentData = {
              format: _this.rtFormat,
              type: _this.rtType,
              attachments: _parentNuke.attachments,
            }));
        }
      }),
    (this.removeObject = function (object) {
      _nuke &&
        (_scene.remove(object["clone_" + _id]),
        _objects.remove(object),
        delete object["clone_" + _id]);
    }),
    (this.render = this.draw =
      function (stage, camera) {
        if (!_nuke || !_this.enabled || _useDrawBuffers) return;
        if (!_parentNuke.enabled || !_objects.length) return;
        const oldClear = Renderer.CLEAR;
        ((Renderer.CLEAR = CLEAR_COLOR),
          stage && ((_nuke.stage = stage), _this.setSize(stage.width, stage.height)),
          (_nuke.camera = camera || _nuke.parentNuke.camera),
          _this.renderShadows || (_nuke.renderer.overridePreventShadows = !0));
        for (let i = _objects.length - 1; i > -1; i--) {
          let obj = _objects[i],
            clone = obj["clone_" + _id];
          (_this.forceVisible ? (clone.visible = !0) : (clone.visible = obj.determineVisible()),
            clone.visible &&
              (obj.updateMatrixWorld(), obj.ignoreMatrix || Utils3D.decompose(obj, clone)));
        }
        ((_nuke.rtt = _rt),
          _nuke.render(),
          RenderStats.update("FXLayer"),
          (_nuke.renderer.overridePreventShadows = !1),
          (Renderer.CLEAR = oldClear));
      }),
    (this.addPass = function (pass) {
      _nuke && _nuke.add(pass);
    }),
    (this.removePass = function (pass) {
      _nuke && _nuke.remove(pass);
    }),
    (this.setSize = function (width, height) {
      _nuke &&
        ((_rt.width == width && _rt.height == height) ||
          (_this.events.unsub(Events.RESIZE, resizeHandler),
          _rt &&
            _rt.setSize(
              width * _this.resolution * _nuke.dpr,
              height * _this.resolution * _nuke.dpr,
            ),
          _nuke.setSize(
            width * _this.resolution * _nuke.dpr,
            height * _this.resolution * _nuke.dpr,
          )));
    }),
    (this.setDPR = function (dpr) {
      _nuke && ((_nuke.dpr = dpr), resizeHandler());
    }),
    (this.setResolution = function (res) {
      ((_this.resolution = res), resizeHandler());
    }),
    (this.getObjects = function () {
      return _objects;
    }),
    (this.useRT = function (rt) {
      _rt = _this.rt = rt;
    }),
    (this.getName = function () {
      return _this.name || _name;
    }),
    _parentNuke instanceof Nuke && this.create(_parentNuke, _type),
    _parentNuke.isAppState)
  ) {
    let config = _parentNuke;
    (this.create(_this.parent.nuke || config.nuke, config), (this.name = config.name));
  }
});
