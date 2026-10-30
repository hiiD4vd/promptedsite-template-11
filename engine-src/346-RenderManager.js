Class(function RenderManager() {
  Inherit(this, Component);
  const _this = this;
  var _hasGLUI,
    _hasMetal,
    _firingEvt,
    _directRenderCallback,
    _dpr = null,
    _stringSchedules = new Map(),
    _objectSchedules = new WeakMap();
  function getSchedulesMap(evt) {
    return "string" == typeof evt ? _stringSchedules : _objectSchedules;
  }
  function getSchedule(evt) {
    return getSchedulesMap(evt).get(evt);
  }
  function fire(evt, data) {
    let array = getSchedule(evt);
    if (array) {
      let len = array.length;
      for (let i = 0; i < len; i++) {
        let cb = array[i];
        if (!array.markedForDeletion.has(cb)) {
          _firingEvt = evt;
          try {
            data ? cb(data) : cb(Render.TIME, Render.DELTA);
          } catch (error) {
            let errorEvt = { callback: cb, error: error, preventStopRender: !1 };
            (Events.emitter._fireEvent(Render.RENDER_CALLBACK_ERROR, errorEvt),
              evt.preventStopRender || _this.unschedule(cb, evt));
          }
        }
      }
      ((_firingEvt = void 0),
        array.markedForDeletion.size &&
          (array.markedForDeletion.forEach((_, cb) => {
            array.remove(cb);
          }),
          array.markedForDeletion.clear()));
    }
  }
  function startFrame() {
    fire(_this.FRAME_BEGIN);
  }
  function resizeHandler() {
    _this.renderer && _this.renderer.setSize(Stage.width, Stage.height);
  }
  function getDPR() {
    return window.AURA
      ? Device.pixelRatio
      : GPU.OVERSIZED
        ? 1
        : GPU.lt(0)
          ? Math.min(1.3, Device.pixelRatio)
          : GPU.lt(1)
            ? Math.min(1.8, Device.pixelRatio)
            : GPU.mobileLT(2)
              ? Math.min(2, Device.pixelRatio)
              : GPU.gt(4)
                ? Math.max(1.5, Device.pixelRatio)
                : Math.max(1.25, Device.pixelRatio);
  }
  ((this.NORMAL = "normal"),
    (this.MAGIC_WINDOW = "magic_window"),
    (this.VR = this.WEBVR = "webvr"),
    (this.AR = this.WEBAR = "webar"),
    (this.MR = "mixed_reality"),
    (this.RENDER = "RenderManager_render"),
    (this.BEFORE_RENDER = "RenderManager_before_render"),
    (this.POST_RENDER = this.FRAME_END = "RenderManager_post_render"),
    (this.EYE_RENDER = "RenderManager_eye_render"),
    (this.BEFORE_OBJECT_EYE_RENDER = "RenderManager_before_object_eye_render"),
    (this.FRAME_BEGIN = "RenderManager_frame_begin"),
    (this.AFTER_LOOPS = "RenderManager_after_loops"),
    (this.NATIVE_FRAMERATE = "RenderManager_native_framerate"),
    (this.READY = "render_gl_ready"),
    (this.initialized = Promise.create()),
    _this.events.sub(Events.RESIZE, resizeHandler),
    (Render.startFrame = startFrame),
    Hydra.ready((_) => {
      ((_hasGLUI = !!window.GLUI),
        (_hasMetal = !!window.Metal),
        _hasGLUI &&
          _hasMetal &&
          (_directRenderCallback = function (render) {
            GLUI.renderDirect(render);
          }));
    }),
    this.get("DPR", (v) => getDPR()),
    (this.initialize = function (type, params = {}) {
      if (
        (_this.camera && _this.camera.destroy(),
        _this.renderer && _this.renderer.destroy(),
        (type != _this.WEBVR && type != _this.WEBAR) ||
          ((params.xrCompatible = !0),
          (params.alpha = !1),
          window.Ares && (params.alpha = !0),
          window.XRDeviceManager && XRDeviceManager.antialias && (params.antialias = !0)),
        !_this.gl)
      ) {
        let camera = new PerspectiveCamera(45, Stage.width / Stage.height, 0.01, 200);
        ((_this.gl = (function () {
          ("safari" == Device.system.browser &&
            Device.system.browserVersion < 13 &&
            delete params.powerPreference,
            Utils.query("compat") && (params.forceWebGL1 = !0));
          let renderer = new Renderer(params);
          return (
            renderer.setSize(Stage.width, Stage.height),
            renderer.setPixelRatio(getDPR()),
            renderer
          );
        })()),
          (_this.scene = new Scene()),
          (_this.nuke = _this.initClass(
            Nuke,
            Stage,
            Object.assign(
              { renderer: _this.gl, scene: _this.scene, camera: camera, dpr: World.DPR },
              params,
            ),
          )));
      }
      switch (((_dpr = _dpr || World.DPR || 1), type)) {
        case _this.WEBVR:
          ((_this.renderer = _this.initClass(VRRenderer, _this.gl, _this.nuke)),
            (_this.camera = _this.initClass(VRCamera)));
          break;
        case _this.WEBAR:
          ((_this.renderer = _this.initClass(ARRenderer, _this.gl, _this.nuke)),
            (_this.camera = _this.initClass(ARCamera)),
            window.Ares
              ? (document.body.appendChild(_this.gl.domElement),
                (_this.gl.domElement.style.backgroundColor = "transparent"),
                (document.body.style.backgroundColor = "transparent"),
                (document.documentElement.style.backgroundColor = "transparent"),
                Stage.hide())
              : (Stage.div.style.backgroundColor = "transparent"));
          break;
        case _this.MAGIC_WINDOW:
          ((_this.renderer = _this.initClass(MagicWindowRenderer, _this.gl, _this.nuke)),
            (_this.camera = _this.initClass(VRCamera)));
          break;
        case _this.NORMAL:
          ((_this.renderer = _this.initClass(RenderManagerRenderer, _this.gl, _this.nuke)),
            (_this.camera = _this.initClass(RenderManagerCamera)));
      }
      ((_this.type = type),
        (_this.nuke.camera = _this.camera.worldCamera),
        _this.initialized.resolve());
    }),
    (this.render = function (scene, camera, renderTarget, forceClear) {
      (fire(_this.AFTER_LOOPS),
        _this.type == _this.VR && fire(World.NUKE),
        fire(_this.BEFORE_RENDER),
        _this.renderer.render(
          scene || _this.scene,
          _this.nuke.camera,
          renderTarget,
          forceClear,
          _directRenderCallback,
        ),
        _this.events.fire(_this.POST_RENDER),
        fire(_this.POST_RENDER));
    }),
    (this.schedule = function (callback, slot) {
      let schedules = getSchedulesMap(slot),
        array = schedules.get(slot);
      (array || ((array = []), (array.markedForDeletion = new Map()), schedules.set(slot, array)),
        array.indexOf(callback) >= 0
          ? array.markedForDeletion.delete(callback)
          : array.push(callback));
    }),
    (this.scheduleOne = function (callback, slot) {
      let result;
      "function" != typeof callback &&
        ((slot = callback), (result = Promise.create()), (callback = result.resolve));
      let array = getSchedule(slot);
      if (array) {
        if (array.find((h) => h.scheduleOneCallback === callback)) return;
      }
      let handler = function () {
        return (_this.unschedule(handler, slot), callback.apply(this, arguments));
      };
      return ((handler.scheduleOneCallback = callback), _this.schedule(handler, slot), result);
    }),
    (this.unschedule = function (callback, slot) {
      const array = getSchedule(slot);
      if (!array) return;
      const index = array.indexOf(callback);
      index < 0 ||
        (_firingEvt ? array.markedForDeletion.set(callback, !0) : array.splice(index, 1));
    }),
    (this.setSize = function (width, height) {
      (_this.events.unsub(Events.RESIZE, resizeHandler), _this.renderer.setSize(width, height));
    }),
    (this.fire = fire));
}, "static");
