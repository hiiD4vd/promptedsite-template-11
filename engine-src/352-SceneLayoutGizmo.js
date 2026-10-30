Class(
  function SceneLayoutGizmo() {
    Inherit(this, Object3D);
    const _this = this;
    var _controls,
      _update,
      _attached,
      _lastVal,
      _shouldBeVisible = !1;
    function findCamera() {
      let camera = World.CAMERA,
        p = _this.group._parent;
      for (; p;) (p instanceof Scene && p.nuke && (camera = p.nuke.camera), (p = p._parent));
      return camera;
    }
    function update() {
      if (!_controls.visible) return (clearInterval(_update), void (_update = null));
      let uil = _attached._cameraUIL || _attached._meshUIL,
        key = "translate" == _controls.getMode() ? "position" : "scale",
        value = _attached[key].toArray();
      (function same(a, b) {
        return !(
          !a ||
          !b ||
          Math.abs(a[0] - b[0]) > Base3D.DIRTY_EPSILON ||
          Math.abs(a[1] - b[1]) > Base3D.DIRTY_EPSILON ||
          Math.abs(a[2] - b[2]) > Base3D.DIRTY_EPSILON
        );
      })(value, _lastVal) ||
        ((_lastVal = value),
        _attached._cameraUIL && "position" == key && (key = "groupPos"),
        uil?.[`forceUpdate${key.toUpperCase()}`]?.(value));
    }
    function handleVisibility(bool) {
      _controls.visible = !!bool && _shouldBeVisible;
    }
    function startMoving() {
      _controls.visible && (_update = setInterval(update, 250));
    }
    function stopMoving() {
      (clearInterval(_update), (_update = null), update());
    }
    function keyDown(e) {
      document.activeElement.tagName.toLowerCase().includes(["textarea", "input"]) ||
        ("." == e.key && _controls.setMode("translate"),
        "/" == e.key && _controls.setMode("scale"));
    }
    function playgroundEvent(camera) {
      (camera || ((_controls.visible = !1), (camera = findCamera())), (_controls.camera = camera));
    }
    async function nodeFocused(e) {
      if (((_controls.visible = !1), "Config" != e.name)) {
        if (((_shouldBeVisible = !1), e.layoutInstance == _this.parent)) {
          let layer = await _this.parent.getLayer(e.name),
            group = layer.group || layer;
          if (!group || !group.updateMatrixWorld) return;
          (_controls.attach(group),
            (_attached = group),
            (_controls.visible = !!AppState.get("SceneLayoutGizmo/visible")),
            (_shouldBeVisible = !0));
        }
      } else _controls.detach();
    }
    ((this.isGizmo = !0),
      ((_controls = new TransformControls(findCamera(), World.ELEMENT.div)).onChange =
        _controls.onMouseDown =
        _controls.onMouseUp =
        _controls.onObjectChange =
          (e) => {}),
      (_controls.onMouseDown = startMoving),
      (_controls.onMouseUp = stopMoving),
      (_controls.draggingChanged = (e) => {
        let activeControls = Playground.instance().activeControls;
        activeControls && (activeControls.enabled = !e.value);
      }),
      (_controls.visible = !1),
      _this.group.add(_controls),
      AppState.bind("playground_camera_active", playgroundEvent),
      AppState.bind("SceneLayoutGizmo/visible", handleVisibility),
      (function addListeners() {
        (_this.events.sub(Keyboard.DOWN, keyDown),
          _this.events.sub(UILGraphNode.FOCUSED, nodeFocused));
      })(),
      _this.delayedCall((_) => {
        _controls.camera = findCamera();
      }, 500),
      _this.group.traverse((obj) => {
        obj.isGizmo = !0;
      }));
  },
  (_) => {
    let toggled = !1;
    Hydra.ready().then((_) => {
      Events.emitter._addEvent(Keyboard.PRESS, (e) => {
        (103 != e.keyCode && "=" !== e.key && "+" !== e.key) ||
          ((toggled = !toggled), AppState.set("SceneLayoutGizmo/visible", toggled));
      });
    });
  },
);
