Class(function FXScene(_parentNuke, _type, ...rest) {
  Inherit(this, Component);
  var _nuke,
    _rt,
    _rtPool,
    _showManualRenderWarning,
    _this = this,
    _scene = new Scene(),
    _id = Utils.timestamp(),
    _objects = [],
    _renderTime = Render.TIME,
    _visible = !0;
  function releaseRT() {
    _rtPool && _rt && (_rtPool.putRT(_rt), _this.useRT(_rtPool.nullRT));
  }
  function resizeHandler() {
    (_rt.setSize &&
      _rt.setSize(
        _nuke.stage.width * _this.resolution * _nuke.dpr,
        _nuke.stage.height * _this.resolution * _nuke.dpr,
      ),
      _this.nuke.setSize(_rt.width, _rt.height),
      (_this.width = _rt.width),
      (_this.height = _rt.height));
  }
  ((this.resolution = 1),
    (this.autoVisible = !0),
    (this.enabled = !0),
    (this.scene = _scene),
    (this.renderShadows = !0),
    this.set("visible", (v) => {
      _this.scene && ((_this.scene.visible = _visible = v), _this.onFXSceneVisibility?.(v));
    }),
    this.get("visible", (_) => _visible),
    (this.onInvisible = this.fxInvisible =
      function () {
        (this.scene.visible && ((this.scene.visible = !1), _this.flag("needsOnVisible", !0)),
          releaseRT());
      }),
    this._bindOnDestroy(releaseRT),
    (this.onVisible = this.fxVisible =
      function () {
        (_this.flag("needsOnVisible") &&
          ((this.scene.visible = !0), _this.flag("needsOnVisible", !1)),
          _rtPool && (_this.useRT(_rtPool.getRT()), resizeHandler()));
      }),
    (this.create = function (nuke = World.NUKE, rt, options) {
      _this.nuke ||
        (rt instanceof RTPool && (rt = (_rtPool = rt).nullRT),
        nuke instanceof RTPool
          ? ((options = rt), (rt = (_rtPool = nuke).nullRT), (nuke = World.NUKE))
          : rt && "object" == typeof rt
            ? rt.isRT || ((options = rt), (rt = void 0))
            : !nuke || nuke instanceof Nuke || ((options = nuke), (nuke = World.NUKE)),
        options || (options = {}),
        (_this.rtFormat = options.format || Texture.RGBFormat),
        (_this.rtType = options.type || Texture.UNSIGNED_BYTE),
        (options.vr || options.vrMode) && (_this.vrRT = RenderManager.type == RenderManager.VR),
        options.parentNuke && (nuke = options.parentNuke),
        ((_this = this).scene = _scene),
        (_this.nuke = _nuke =
          _this.initClass(Nuke, nuke.stage, {
            renderer: nuke.renderer,
            camera: nuke.camera,
            scene: _scene,
            dpr: nuke.dpr,
            format: options.format,
            vrRT: _this.vrRT,
            multisample: options.multisample,
            samplesAmount: options.samplesAmount,
          })),
        options.customCompile && (_this.customCompile = options.customCompile),
        (_scene.nuke = _nuke),
        (function initRT(rt, options = {}) {
          options.type == Texture.FLOAT &&
            ((options.format = Texture.RGBAFormat),
            "ios" == Device.system.os &&
              ((options.type = Texture.HALF_FLOAT),
              (options.minFilter = Texture.NEAREST),
              (options.magFilter = Texture.NEAREST)));
          const RT =
            _this.nuke.useDrawBuffers && options.multiRenderTarget
              ? MultiRenderTarget
              : RenderTarget;
          ((_this.width = _nuke.stage.width * _this.resolution * _nuke.dpr),
            (_this.height = _nuke.stage.height * _this.resolution * _nuke.dpr));
          let magFilter = Texture.LINEAR,
            minFilter = options.mipmaps ? Texture.LINEAR_MIPMAP : Texture.LINEAR;
          ((_rt =
            rt ||
            new RT(
              _this.width,
              _this.height,
              Object.assign(
                {
                  minFilter: minFilter,
                  magFilter: magFilter,
                  generateMipmaps: options.mipmaps || !1,
                },
                options,
              ),
            )),
            (_nuke.rtt = _this.rt = _rt),
            (_rt.fxscene = _this),
            _this.vrRT && (_rt.vrRT = !0));
        })(rt, options),
        rt && _this.flag("recycle_rt", !0),
        (function addListeners() {
          _this.flag("recycle_rt")
            ? _rtPool &&
              _this.events.sub(_rtPool, Events.RESIZE, (e) => {
                ((_this.width = e.width), (_this.height = e.height));
              })
            : _this.events.sub(Events.RESIZE, resizeHandler);
        })(),
        FXScene.onCreate && FXScene.onCreate(_this),
        options.manualRender && (_this.manualRender = !0),
        _this.manualRender ||
          FXScene.manualRender ||
          (Hydra.LOCAL && (_showManualRenderWarning = !0),
          _this.vrRT
            ? _this.startRender(({ view: view }) => {
                0 !== view || _this.manualRender || FXScene.manualRender || _this.draw();
              }, RenderManager.EYE_RENDER)
            : _this.startRender((_) => {
                _this.manualRender || FXScene.manualRender || _this.draw();
              }, nuke)));
    }),
    (this.onDestroy = this.fxDestroy =
      function () {
        (_this.scene.destroy(),
          _this.flag("recycle_rt") ? releaseRT() : _rt && _rt.destroy && _rt.destroy());
      }),
    (this.setSize = function (width, height, exact) {
      _nuke &&
        (exact ||
          ((width = width * _this.resolution * _nuke.dpr),
          (height = height * _this.resolution * _nuke.dpr)),
        (_rt.width == width && _rt.height == height) ||
          (_this.events.unsub(Events.RESIZE, resizeHandler),
          (_this.width = width),
          (_this.height = height),
          _rt && _rt.setSize(_this.width, _this.height),
          _nuke.setSize(_this.width, _this.height)));
    }),
    (this.add = this.addObject =
      function (object) {
        if (!object.shader) return;
        if (!object) return console.error("FXScene addObject undefined!");
        let clone = object.clone();
        for (
          object["clone_" + _id] = clone,
            _scene.add(clone),
            _objects.push(object),
            _this.customCompile && (clone.shader.customCompile = _this.customCompile),
            object.shader._attachmentData = {
              format: _this.rtFormat,
              type: _this.rtType,
              attachments: 1,
            };
          clone.children.length;
        )
          clone.remove(clone.children[0]);
        return clone;
      }),
    (this.removeObject = function (object) {
      (_scene.remove(object["clone_" + _id]),
        _objects.remove(object),
        delete object["clone_" + _id]);
    }),
    (this.setScissor = function (x, y, w, h, invert) {
      if (null === x) return void (this.scissor = this.rt.scissor = null);
      let width = _rt.width,
        height = _rt.height;
      (this.scissor || (this.scissor = new Vector4()),
        (this.scissor.x = x * width),
        (this.scissor.y = invert ? y * height : height - h * height - y * height),
        (this.scissor.width = w * width),
        (this.scissor.height = h * height),
        (this.rt.scissor = this.scissor));
    }),
    (this.render = this.draw =
      function (stage, camera) {
        if (_this.preventRender) return;
        if (_this.isVrWorldMode) return void (_this.onBeforeRender && _this.onBeforeRender());
        if (
          !_this.manualRender &&
          !FXScene.manualRender &&
          Render.TIME - _renderTime < 1e3 / Render.REFRESH_RATE / 2
        )
          return void (
            _showManualRenderWarning &&
            (console.warn(
              `FXScene ${Utils.getConstructorName(_this)} rendering early (${Math.round(Render.TIME - _renderTime, 3)}ms elapsed, expected ~${Math.round(1e3 / Render.REFRESH_RATE, 3)}ms. Set manualRender option if using own render loop.`,
            ),
            (_showManualRenderWarning = !1))
          );
        if (((_renderTime = Render.TIME), _this.isVrSceneMode)) {
          let rt = World.NUKE.enabled && World.NUKE.passes.length ? World.NUKE.rttBuffer : void 0,
            autoClear = _nuke.renderer.autoClear;
          return (
            (_nuke.renderer.autoClear = !1),
            _nuke.renderer.clearDepth(rt),
            _this.onBeforeRender && _this.onBeforeRender(),
            _nuke.renderer.render(_scene, _nuke.camera, rt),
            void (_nuke.renderer.autoClear = autoClear)
          );
        }
        (stage &&
          (_this.events.unsub(Events.RESIZE, resizeHandler),
          (_this.nuke.stage = stage),
          _this.setSize(stage.width, stage.height)),
          camera && (_this.nuke.camera = camera));
        let clearColor = null,
          alpha = 1;
        (_this.clearColor &&
          ((clearColor = _nuke.renderer.getClearColor().getHex()),
          _nuke.renderer.setClearColor(_this.clearColor)),
          _this.clearAlpha > -1 &&
            ((alpha = _nuke.renderer.getClearAlpha()),
            _nuke.renderer.setClearAlpha(_this.clearAlpha)),
          _this.renderShadows || (_nuke.renderer.overridePreventShadows = !0));
        for (let i = _objects.length - 1; i > -1; i--) {
          let obj = _objects[i],
            clone = obj["clone_" + _id];
          (_this.forceVisible || obj.cloneVisible
            ? (clone.visible = "boolean" != typeof clone.isVisible || clone.isVisible)
            : (clone.visible = obj.determineVisible()),
            clone.visible &&
              (obj.updateMatrixWorld(!1 === obj.visible || void 0),
              obj.ignoreMatrix ||
                (Utils3D.decompose(obj, clone),
                clone.overrideScale && clone.scale.setScalar(clone.overrideScale))));
        }
        (_this.preventRTDraw ||
          (RenderStats.update("FXScene", 1, _this),
          _this.onBeforeRender && _this.onBeforeRender(),
          (_nuke.rtt = _rt),
          _nuke.render()),
          (_nuke.renderer.overridePreventShadows = !1),
          _this.clearColor && _nuke.renderer.setClearColor(clearColor),
          _this.clearAlpha > -1 && _nuke.renderer.setClearAlpha(_this.clearAlpha),
          RenderManager.fire(_this));
      }),
    (this.setDPR = function (dpr) {
      return _nuke ? ((_nuke.dpr = dpr), resizeHandler(), _this) : _this;
    }),
    (this.addPass = function (pass) {
      _nuke && _nuke.add(pass);
    }),
    (this.removePass = function (pass) {
      _nuke && _nuke.remove(pass);
    }),
    (this.setResolution = function (res) {
      return ((_this.resolution = res), _rt.vrRT && (_rt.vrRT = res), resizeHandler(), this);
    }),
    (this.useRT = function (rt) {
      ((_rt = _this.rt = rt), _this.vrRT && (rt.vrRT = !0), (_rt.fxscene = _this));
    }),
    (this.upload = function () {
      _rt && _rt.upload();
    }),
    (this.useCamera = function (camera) {
      _this.nuke && (_this.nuke.camera = camera.camera || camera);
    }),
    (this.useScene = function (scene) {
      _this.nuke.scene = scene;
    }),
    (this.vrWorldMode = function () {
      ((_this.isVrWorldMode = !0), (_this.group = new Group()));
      for (let i = 0; i < this.scene.children.length; i++) this.group.add(this.scene.children[i]);
      ((_scene = _this.scene = _this.group), World.SCENE.add(_this.group));
    }),
    (this.vrSceneMode = function () {
      ((_this.isVrSceneMode = !0),
        (World.NUKE.autoClear = !1),
        (RenderManager.renderer.autoClear = !1));
    }),
    (this.createDepthTexture = function (useRTTBuffer) {
      return (
        _this.depthTexture ||
          (_this.nuke.passes.length || useRTTBuffer
            ? (_this.nuke.rttBuffer.createDepthTexture(),
              (_this.depthTexture = _this.nuke.rttBuffer.depth))
            : (_this.rt.createDepthTexture(), (_this.depthTexture = _this.rt.depth))),
        _this.depthTexture
      );
    }),
    _parentNuke instanceof Nuke && this.create(_parentNuke, _type, ...rest));
});
