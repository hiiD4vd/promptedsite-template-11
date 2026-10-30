Class(
  function World() {
    Inherit(this, Component);
    const _this = this;
    let _renderer, _scene, _camera, _nuke, _controls;
    function resize() {
      (_renderer.setSize(Stage.width, Stage.height),
        (_camera.aspect = Stage.width / Stage.height),
        _camera.updateProjectionMatrix());
    }
    function loop(t, delta) {
      (_controls && _controls.enabled && _controls.update(), RenderManager.render());
    }
    ((World.DPR = Tests.getDPR()),
      (function initWorld() {
        (((World.PLANE = new PlaneGeometry(1, 1)).keepAlive = !0),
          (World.PLANE.destroyDataAfterUpload = !1),
          ((World.PLANE_MID_RES = new PlaneGeometry(1, 1, 4, 4)).keepAlive = !0),
          (World.PLANE_MID_RES.destroyDataAfterUpload = !1),
          ((World.PLANE_HIGH_RES = new PlaneGeometry(1, 1, 10, 10)).keepAlive = !0),
          (World.PLANE_HIGH_RES.destroyDataAfterUpload = !1),
          ((World.QUAD = Utils3D.getQuad()).keepAlive = !0),
          (World.QUAD.destroyDataAfterUpload = !1),
          ((World.BOX = new BoxGeometry(1, 1, 1)).keepAlive = !0),
          (World.BOX.destroyDataAfterUpload = !1),
          ((World.SPHERE = new SphereGeometry(1, 8, 16)).keepAlive = !0),
          (World.SPHERE.destroyDataAfterUpload = !1),
          ((World.SPHERE_LOW_RES = new SphereGeometry(1, 8, 6)).keepAlive = !0),
          (World.SPHERE_LOW_RES.destroyDataAfterUpload = !1),
          ((World.SPHERE_HIGH_RES = new SphereGeometry(1, 64, 64)).keepAlive = !0),
          (World.SPHERE_HIGH_RES.destroyDataAfterUpload = !1),
          ((World.CONE = new CylinderGeometry(1.1, 0, 1, 32, 1, !1, 0, 2 * Math.PI, !1)).keepAlive =
            !0),
          (World.CONE.destroyDataAfterUpload = !1),
          (World.LIGHT_BEAM = new CylinderGeometry(
            1,
            1,
            1,
            64,
            64,
            !0,
            -Math.PI / 2,
            2 * Math.PI,
            !1,
          )),
          (World.CYLINDER = new CylinderGeometry(1, 1, 1, 28, 1, !0, 0, 2 * Math.PI, !1)));
        let options = { powerPreference: "high-performance", enabled: !1, antialias: !0 };
        (Tests.enableWorldNukeMSAA() &&
          ((options.samplesAmount = Tests.msaaSamples() || void 0),
          (options.multisample = !!options.samplesAmount)),
          RenderManager.initialize(RenderManager.NORMAL, options),
          (_renderer = RenderManager.gl),
          (_scene = RenderManager.scene),
          (_camera = RenderManager.camera.worldCamera),
          (_nuke = RenderManager.nuke),
          (World.SCENE = _scene),
          (World.RENDERER = _renderer),
          (World.ELEMENT = $(_renderer.domElement)),
          (World.CAMERA = _camera),
          (World.NUKE = _nuke),
          World.RENDERER.setClearColor("#121212"),
          World.ELEMENT.css({ position: "absolute", top: 0, left: 0 }),
          Tests.renderFXAA() && _nuke.add(new FXAA()));
      })(),
      RenderManager.type == RenderManager.NORMAL &&
        (Camera.instance(_camera), (Render.capFPS = Tests.capFPS())),
      (function initControls() {
        if (!window.DebugControls || !Utils.query("orbit")) {
          const camera = new BaseCamera();
          return (camera.group.position.set(0, 0, 6), void camera.lock());
        }
        const Controls = Utils.query("wasd") ? WASDControls : DebugControls;
        ((_controls = new Controls(_camera, World.ELEMENT.div)),
          RenderManager.type === RenderManager.NORMAL
            ? (_controls.target = new Vector3(0, 0, 0))
            : (_controls.enabled = !1),
          (World.CONTROLS = _controls),
          (World.CAMERA.position.z = 6));
      })(),
      (function addHandlers() {
        _this.events.sub(Events.RESIZE, resize);
      })(),
      Utils.query("uilOnly") || Render.onDrawFrame(loop));
  },
  function () {
    var _instance;
    World.instance = function () {
      return (_instance || (_instance = new World()), _instance);
    };
  },
);
