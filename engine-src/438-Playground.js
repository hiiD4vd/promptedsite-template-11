Class(function Playground() {
  Inherit(this, Component);
  const _this = this;
  let _view, _isRT, _mesh;
  function initGLUIView(element) {
    GLUI.Stage.add(element);
  }
  function handleInstanceReloaded({ oldInstance: oldInstance, newInstance: newInstance }) {
    if (oldInstance === _view) {
      if (((_view = newInstance), Dev.expose("view", _view), _isRT))
        _mesh.shader.set("tMap", _view);
      else {
        let group = _view.group || _view.mesh || _view.object3D;
        group && World.SCENE.add(group);
      }
      _view.animateIn?.();
    }
  }
  !(async function () {
    ((Global.PLAYGROUND = Utils.query("p")),
      await GPU.ready(),
      await UILStorage.ready(),
      await (async function bootFirebase() {
        let app = _this.initClass(App);
        app.firebaseData && (await Firebase.boot(app.firebaseData));
      })(),
      AppState.set("Global/loadComplete", !0),
      AppState.set("Global/playground", Global.PLAYGROUND),
      (function initThree() {
        (World.instance(),
          Stage.add(World.ELEMENT),
          (function initDoubleClick() {
            _this.lastClick = performance.now();
            const speed = 180;
            Stage.bind("click", function () {
              (performance.now() - _this.lastClick < speed &&
                (function onDoubleClick() {
                  let camera = _isRT ? _view.nuke.camera : World.NUKE.camera,
                    scene = _isRT ? _view.scene : World.SCENE,
                    raycaster = Raycaster.find(camera),
                    objs = [];
                  scene.traverse((obj) => {
                    objs.push(obj);
                  });
                  let intersects = raycaster.checkHit(objs, Mouse),
                    found = !1;
                  intersects.forEach((element) => {
                    if (found) return;
                    const uilGraph = element?.object?.uilGraph;
                    uilGraph &&
                      ((found = !0), uilGraph?.find?.(element?.object?.uilName)?.focus?.());
                  });
                })(),
                (_this.lastClick = performance.now()));
            });
          })());
      })(),
      (function initView() {
        let request = Global.PLAYGROUND.split("/")[0],
          view = window["Playground" + request] || window[request] || null;
        if (!view) throw `No Playground class ${request} found.`;
        ((_view = view.instance ? view.instance() : _this.initClass(view)),
          _view.element
            ? _view.element.mesh
              ? initGLUIView(_view.element)
              : ((World.RENDERER.domElement.style.zIndex = -1),
                Stage.add(_view.element),
                _view.animateIn?.())
            : _view.root &&
              _view.$gluiObject &&
              (function initUI3DView(ui3d) {
                Device.mobile
                  ? initGLUIView(ui3d.root)
                  : (GLUI.Scene.add(ui3d.$gluiObject),
                    (function addUIToWorldScene(uiGroup) {
                      let group = new Group(),
                        v3 = new Vector3(),
                        distance = USING_XR ? 1.5 : 2;
                      return (
                        v3.set(0, 0, -distance).applyQuaternion(World.CAMERA.quaternion),
                        group.position.copy(World.CAMERA.position).add(v3),
                        group.lookAt(World.CAMERA.position),
                        group.add(uiGroup),
                        World.SCENE.add(group),
                        group
                      );
                    })(ui3d.$gluiObject.anchor));
              })(_view));
        if (_view.rt && _view.scene && _view.nuke)
          if (request.includes("Figma")) {
            let dimensions = _view.dimensions,
              $obj = $gl(dimensions[0], dimensions[1], _view.rt.texture);
            (($obj.x = 40),
              ($obj.y = 40),
              "portrait" === Utils.query("orientation") && (($obj.scale = 0.5), ($obj.y = -300)),
              GLUI.Stage.add($obj));
          } else {
            let shader = _this.initClass(Shader, "ScreenQuad", { tMap: { value: _view } });
            ((_mesh = new Mesh(World.QUAD, shader)),
              (_mesh.frustumCulled = !1),
              World.SCENE.add(_mesh),
              (_isRT = !0));
          }
        else World.SCENE.add(_view.group || _view.mesh || _view.object3D || new Group());
        ((function initCameraHelper(nuke) {
          let orbitCamera = new PerspectiveCamera(
            30,
            nuke.stage.width / nuke.stage.height,
            0.1,
            1e3,
          );
          orbitCamera.position.z = 6;
          let lastCamera,
            timer0,
            timer1,
            timer2,
            wasdCamera = orbitCamera.clone();
          _this.onResize((_) => {
            ((orbitCamera.aspect = wasdCamera.aspect = nuke.stage.width / nuke.stage.height),
              orbitCamera.updateProjectionMatrix(),
              wasdCamera.updateProjectionMatrix());
          });
          let orbit = new DebugControls(orbitCamera, World.ELEMENT.div),
            wasd = new WASDControls(wasdCamera, World.ELEMENT.div);
          ((orbit.enabled = !1),
            (wasd.enabled = !1),
            _this.startRender((_) => {
              (orbit.update(), wasd.update());
            }),
            (_this.orbitControls = orbit),
            (_this.wasdControls = wasd));
          const clearTimers = (_) => {
              (clearTimeout(timer0), clearTimeout(timer1), clearTimeout(timer2));
            },
            goToMain = (_) => {
              ((orbit.enabled = !1),
                (wasd.enabled = !1),
                lastCamera && (nuke.camera = lastCamera),
                AppState.set("playground_camera_active", !1),
                clearTimers());
            },
            goToOrbit = (_) => {
              ((orbit.enabled = !0),
                (wasd.enabled = !1),
                nuke.camera != wasdCamera &&
                  nuke.camera != orbitCamera &&
                  (lastCamera = nuke.camera),
                (nuke.camera = orbitCamera),
                AppState.set("playground_camera_active", nuke.camera),
                (_this.activeControls = orbit),
                clearTimers());
            },
            goToWASD = (_) => {
              ((wasd.enabled = !0),
                (orbit.enabled = !1),
                nuke.camera != wasdCamera &&
                  nuke.camera != orbitCamera &&
                  (lastCamera = nuke.camera),
                (nuke.camera = wasdCamera),
                AppState.set("playground_camera_active", nuke.camera),
                (_this.activeControls = wasd),
                clearTimers());
            };
          Utils.query("orbit") &&
            (goToOrbit(),
            (timer0 = _this.delayedCall(goToOrbit, 500)),
            (timer1 = _this.delayedCall(goToOrbit, 1e3)),
            (timer2 = _this.delayedCall(goToOrbit, 3e3)));
          _this.events.sub(Keyboard.DOWN, (_) => {
            document.activeElement.tagName.toLowerCase().includes(["textarea", "input"]) ||
              (Keyboard.pressing.includes("!") && goToMain(),
              Keyboard.pressing.includes("@") && goToOrbit(),
              Keyboard.pressing.includes("#") && goToWASD());
          });
        })(_view.nuke || World.NUKE),
          Dev.expose("view", _view));
      })(),
      _this.events.sub(Component.HMR_INSTANCE_RELOADED, handleInstanceReloaded),
      Events._fireResize());
  })();
}, "singleton");
