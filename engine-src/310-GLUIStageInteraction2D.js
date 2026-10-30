Class(function GLUIStageInteraction2D(_camera, _scene, _stage, _custom) {
  Inherit(this, Component);
  const _this = this;
  var _ray,
    _over,
    _click,
    _customTest,
    _disabled,
    _blocked,
    _test = [],
    _objects = (this.objects = []),
    _hold = new Vector2(),
    _lastTestedPoint = (new Vector2(), new Vector2()),
    _plane = new Plane();
  function cacheTopScene(obj) {
    let scene = (function findTopScene(obj) {
      let p = obj.glui;
      for (; p;) {
        if (p.gluiToRT) return (p.gluiToRT.GLUIStage?.() || GLUI.Stage).scene;
        p = p.parent;
      }
      for (p = obj; p;) {
        if (p.gluiToRT) return (p.gluiToRT.GLUIStage?.() || GLUI.Stage).scene;
        if (p instanceof Scene) return p;
        p = p._parent;
      }
    })(obj);
    scene && (obj.interactionScene = scene);
  }
  function testObjects() {
    let objects = GLUI.Stage.interaction.objects;
    _test.length = 0;
    for (let i = objects.length - 1; i > -1; i--) {
      let obj = objects[i];
      (obj.interactionScene || cacheTopScene(obj),
        (obj.forceGLUIInteraction || (obj.determineVisible() && _scene == obj.interactionScene)) &&
          _test.push(obj));
    }
    return _test;
  }
  function externalStart() {
    _this._invisible || start(_lastTestedPoint);
  }
  function externalRelease() {
    _this._invisible || end(_lastTestedPoint);
  }
  function move(e) {
    if (GLUI.PREVENT_INTERACTION || _this._invisible || _disabled || _blocked) return;
    _ray || ((_ray = new Raycaster(_camera)).testVisibility = !1);
    let objects = testObjects();
    if (!objects.length)
      return void (
        _over &&
        (_over._onOver({ action: "out", object: _over }), (_over = null), Stage.cursor("auto"))
      );
    let hit = _ray.checkHit(objects, e, _stage);
    try {
      if (hit[0]) {
        _customTest || (GLUI.HIT = !0);
        let obj = hit[0].object.glui;
        (_over || ((_over = obj)._onOver({ action: "over", object: obj }), Stage.cursor("pointer")),
          _over != obj &&
            (_over._onOver({ action: "out", object: _over }),
            (_over = obj)._onOver({ action: "over", object: obj }),
            Stage.cursor("pointer")));
      } else
        (_customTest || (GLUI.HIT = !1),
          _over &&
            (_over._onOver({ action: "out", object: _over }),
            (_over = null),
            Stage.cursor("auto")));
    } catch (e) {
      console.warn(e);
    }
  }
  function start(e) {
    let handlingEvent = !(e instanceof Vector2),
      checkDefault = GLUI.PREVENT_DEFAULT_INTERACTION && handlingEvent,
      checkPrevention = GLUI.PREVENT_INTERACTION || _this._invisible || _disabled || _blocked;
    checkDefault ||
      checkPrevention ||
      ((_custom && handlingEvent) ||
        (Device.hoverCapable && RenderManager.type != RenderManager.WEBVR) ||
        move(e),
      _over && !_click && ((_click = _over), _hold.copy(e), (_hold.time = Date.now())));
  }
  function end(e) {
    if (!(GLUI.PREVENT_INTERACTION || _this._invisible || _disabled || _blocked)) {
      if (
        (_customTest && (Device.hoverCapable || (_click && null == _over && (_over = _click))),
        (GLUI.HIT = !1),
        _click)
      ) {
        if (Date.now() - _hold.time > 750) return (_click = null);
        if (_click == _over)
          try {
            ((_blocked = !0),
              _this.delayedCall((_) => {
                _blocked = !1;
              }, _this.preventDoubleClickTime),
              _click._onClick({ action: "click", object: _click }),
              (Device.hoverCapable && !_custom) ||
                !_over ||
                (_over._onOver({ action: "out", object: _over }),
                (_over = null),
                Stage.cursor("auto")));
          } catch (e) {
            console.warn(e);
          }
      }
      _click = null;
    }
  }
  function findCapture(object) {
    let capture = object.__slc;
    return void 0 === capture && window.UI3D
      ? (object.__slc = UI3D.findStageLayoutCapture(object) || null)
      : capture;
  }
  ((this.preventDoubleClickTime = 300),
    (function addListeners() {
      (_custom || _this.events.sub(Mouse.input, Interaction.MOVE, move),
        _this.events.sub(Mouse.input, Interaction.START, start),
        _this.events.sub(Mouse.input, Interaction.END, end),
        _this.events.sub(Interaction3D.EXTERNAL_PRESS, externalStart),
        _this.events.sub(Interaction3D.EXTERNAL_RELEASE, externalRelease));
    })(),
    _this.startRender((_) => {}),
    (this.add = function (obj) {
      obj && _objects.push(obj.mesh || obj);
    }),
    (this.remove = function (obj) {
      obj && _objects.remove(obj.mesh || obj);
    }),
    (this.testWith = function (point, id) {
      ((point.customTest = !0),
        _lastTestedPoint.copy(point),
        (_lastTestedPoint.customTest = !0),
        (_customTest = !0),
        move(point),
        Device.hoverCapable ||
          RenderManager.type == RenderManager.WEBVR ||
          (_over && start(point)));
    }),
    (this.testWithFinger = function (point, distance, minDistance) {
      (_ray || ((_ray = new Raycaster(_camera)).testVisibility = !1), (_customTest = !0));
      let objects = testObjects();
      if (objects.length)
        if (distance < 0.02) {
          let hit = _ray.checkHit(objects, point, _stage);
          try {
            if (hit[0]) {
              let obj = hit[0].object.glui;
              (!obj._preventClickTime ||
                Render.TIME - obj._preventClickTime > _this.preventDoubleClickTime) &&
                (obj._requiresClear ||
                  ((_over = obj),
                  obj._onOver({ action: "over", object: obj }),
                  obj._onClick({ action: "click", object: obj }),
                  (obj._preventClickTime = Render.TIME),
                  (obj._requiresClear = !0)));
            } else
              _over &&
                ((_over._requiresClear = !1),
                _over._onOver({ action: "out", object: _over }),
                (_over = null));
          } catch (e) {
            console.warn(e);
          }
        } else
          _over &&
            ((_over._requiresClear = !1),
            _over._onOver({ action: "out", object: _over }),
            (_over = null));
    }),
    (this.checkObjectHit = function (object, mouse) {
      let capture = findCapture(object);
      return capture
        ? capture.checkObjectHit(object.mesh || object, mouse)
        : (_ray || ((_ray = new Raycaster(_camera)).testVisibility = !1),
          _ray.checkHit(object.mesh || object, mouse, _stage)[0]);
    }),
    (this.checkObjectFromValues = function (object, origin, direction) {
      let capture = findCapture(object);
      return capture
        ? capture.checkObjectFromValues(object.mesh || object, origin, direction)
        : (_ray || ((_ray = new Raycaster(_camera)).testVisibility = !1),
          _ray.checkFromValues(object.mesh || object, origin, direction)[0]);
    }),
    (this.getObjectHitLocalCoords = function (v, object, mouse) {
      let capture = findCapture(object);
      if (capture) return capture.getObjectHitLocalCoords(v, object, mouse);
      let hit = _this.checkObjectHit(object, mouse);
      if (hit) return (v.copy(hit.point), hit.object.worldToLocal(v));
      {
        let mesh = object.mesh || object;
        return (
          _plane.normal.set(0, 0, 1).applyQuaternion(mesh.getWorldQuaternion()),
          (_plane.constant = -mesh.getWorldPosition().dot(_plane.normal)),
          _ray.ray.intersectPlane(_plane, v),
          mesh.worldToLocal(v)
        );
      }
    }),
    this.set("_disabled", (v) => {
      (_disabled = v) &&
        ((_click = null),
        _over &&
          (_over._onOver({ action: "out", object: _over }), (_over = null), Stage.cursor("auto")));
    }),
    (this.onInvisible = () => {
      ((_click = null),
        _over &&
          (_over._onOver({ action: "out", object: _over }), (_over = null), Stage.cursor("auto")));
    }));
});
