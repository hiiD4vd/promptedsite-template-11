Class(
  function Interaction3D(_camera, _mouse, _stage) {
    Inherit(this, Component);
    const _this = this;
    let _hover, _click;
    var _lastOnUpdate,
      _maximumVRHitDistance,
      _v3 = new Vector3(),
      _plane = new Plane(),
      _input = {},
      _cacheHits = [],
      _enabled = !0;
    ((_this.ID = Utils.timestamp()),
      (_mouse = _mouse || Mouse),
      (_camera = _camera || World.CAMERA),
      (_stage = _stage || Stage));
    var _ray = _this.initClass(Raycaster, _camera),
      _meshes = [],
      _test = [],
      _event = {};
    const PROHIBITED_ELEMENTS = ["hit", "prevent_interaction3d"];
    function checkIfProhibited(element) {
      let el = element;
      for (; el;) {
        if (el.classList)
          for (let i = 0; i < PROHIBITED_ELEMENTS.length; i++)
            if (el.classList.contains(PROHIBITED_ELEMENTS[i])) return !0;
        el = el.parentNode;
      }
      return !1;
    }
    function parseMeshes(meshes) {
      Array.isArray(meshes) || (meshes = [meshes]);
      let output = [];
      return (
        meshes.forEach(function checkMesh(obj) {
          if (obj.isOcclusionMesh) return;
          (obj.hitArea || obj.hitMesh) &&
            (obj = (function initHitMesh(obj) {
              obj.hitMesh || (obj.hitMesh = new Mesh(obj.hitArea));
              return (
                obj.add(obj.hitMesh),
                (obj = obj.hitMesh),
                (obj.isHitMesh = !0),
                (obj.shader.neverRender = !0),
                obj
              );
            })(obj));
          "boolean" == typeof obj.isHitMesh
            ? ((obj.mouseEnabled = function (visible) {
                visible ? ~_meshes.indexOf(obj) || _meshes.push(obj) : _meshes.remove(obj);
              }),
              output.push(obj))
            : output.push(obj);
          obj.children.length && obj.children.forEach(checkMesh);
        }),
        output
      );
    }
    function testObjects() {
      _test.length = 0;
      for (let i = _meshes.length - 1; i > -1; i--) {
        let obj = _meshes[i];
        obj.determineVisible() && _test.push(obj);
      }
      return _test;
    }
    function start(e) {
      if ("2d" == _input.type && _stage == Stage) {
        let element = document.elementFromPoint(
          Math.clamp(e.x || 0, 0, Stage.width),
          Math.clamp(e.y || 0, 0, Stage.height),
        );
        if ((element && checkIfProhibited(element)) || GLUI.HIT) return;
      }
      if (!_enabled) return;
      let hit = move(e);
      ("3d" == _input.type && _this.events.fire(Interaction3D.EXTERNAL_PRESS),
        hit
          ? ((_click = hit.object),
            (_click.time = Render.TIME),
            (function triggerStart(mesh, hit) {
              ((_event.action = "start"),
                (_event.mesh = mesh),
                (_event.hit = hit),
                _this.events.fire(Interaction3D.START, _event, !0));
            })(_click, hit))
          : (_click = null));
    }
    function moveHand(e) {
      if (!_enabled) return;
      _cacheHits.length = 0;
      for (let i = 0; i < _input.obj.length; i++) {
        let obj = _input.obj[i];
        _v3.set(0, 0, -1).applyQuaternion(obj.quaternion);
        let hit = _ray.checkFromValues(testObjects(), obj.position, _v3)[0];
        hit && _cacheHits.push(hit);
      }
      _cacheHits.sort((a, b) => a.distance - b.distance);
      let hit = _cacheHits[0];
      if (
        ((hit && hit.object == _lastOnUpdate) ||
          (_lastOnUpdate && _lastOnUpdate.onMissUpdate && _lastOnUpdate.onMissUpdate(),
          (_lastOnUpdate = null)),
        hit)
      ) {
        let mesh = hit.object;
        if (mesh.onHitUpdate)
          return ((hit.usingFinger = !0), (_lastOnUpdate = mesh), mesh.onHitUpdate(hit), !1);
        !mesh._debounceFingerClick || Render.TIME - mesh._debounceFingerClick > 1e3
          ? hit.distance < 0.01
            ? ((_click = mesh), triggerClick(mesh, hit), (mesh._debounceFingerClick = Render.TIME))
            : _hover || ((_hover = mesh), triggerHover("over", mesh, hit))
          : _hover && (triggerHover("out", _hover), (_hover = null));
      } else _hover && (triggerHover("out", _hover), (_hover = null));
    }
    function move(e) {
      if ("2d" == _input.type && _stage == Stage) {
        let element = document.elementFromPoint(
          Math.clamp(e.x || 0, 0, Stage.width),
          Math.clamp(e.y || 0, 0, Stage.height),
        );
        if (element && checkIfProhibited(element)) return;
      }
      if (!_enabled) return void Interaction3D.requestCursor("auto", _this);
      let hit;
      if (
        ("2d" == _input.type
          ? (hit = _ray.checkHit(testObjects(), _input.position, _input.rect || _stage)[0])
          : (_input.obj.hideBeam(),
            _v3.set(0, 0, -1).applyQuaternion(_input.obj.group.getWorldQuaternion()),
            (hit = _ray.checkFromValues(
              testObjects(),
              _input.obj.group.getWorldPosition(),
              _v3,
            )[0])),
        (hit && hit.object == _lastOnUpdate) ||
          (_lastOnUpdate && _lastOnUpdate.onMissUpdate && _lastOnUpdate.onMissUpdate(),
          (_lastOnUpdate = null)),
        hit)
      ) {
        _this.intersecting = !0;
        let mesh = hit.object;
        if ("3d" == _input.type) {
          let max = _maximumVRHitDistance || Interaction3D.maximumVRHitDistance;
          if (
            ("number" == typeof mesh.maximumVRHitDistance &&
              mesh.maximumVRHitDistance > 0 &&
              (max = mesh.maximumVRHitDistance),
            mesh.onHitUpdate && hit.distance > max)
          )
            return !1;
          (_input.obj.showBeam(), _input.obj.setHitPosition && _input.obj.setHitPosition(hit));
        }
        return mesh.onHitUpdate
          ? (mesh.onHitUpdate(hit), (_lastOnUpdate = mesh), !1)
          : (_hover !== mesh
              ? (_hover && triggerHover("out", _hover, hit),
                (_hover = mesh),
                triggerHover("over", _hover, hit),
                _hover.__clickCallback
                  ? Interaction3D.requestCursor("pointer", _this)
                  : Interaction3D.requestCursor("auto", _this))
              : (function triggerMove(mesh, hit) {
                  ((_event.action = "move"),
                    (_event.mesh = mesh),
                    (_event.hit = hit),
                    _this.events.fire(Interaction3D.MOVE, _event, !0),
                    mesh["__moveCallback" + _this.ID] && mesh["__moveCallback" + _this.ID](_event));
                })(_hover, hit),
            hit);
      }
      return (
        (_this.intersecting = !1),
        end(),
        _input.obj && _input.obj.setHitPosition && _input.obj.setHitPosition(!1),
        !1
      );
    }
    function end() {
      _hover &&
        (triggerHover("out", _hover, null),
        (_hover = null),
        Interaction3D.requestCursor(_this.cursor, _this));
    }
    function click(e) {
      if (
        ("3d" == _input.type && _this.events.fire(Interaction3D.EXTERNAL_RELEASE), !_this.enabled)
      )
        return;
      if (!_click) return;
      if ("2d" == _input.type && _stage == Stage) {
        let element = document.elementFromPoint(
          Math.clamp(e.x || 0, 0, Stage.width),
          Math.clamp(e.y || 0, 0, Stage.height),
        );
        if (element && checkIfProhibited(element)) return;
      }
      let hit;
      if ("2d" == _input.type) {
        if (GLUI.HIT) return;
        hit = _ray.checkHit(testObjects(), _input.position, _input.rect)[0];
      } else
        (_v3.set(0, 0, -1).applyQuaternion(_input.obj.group.getWorldQuaternion()),
          (hit = _ray.checkFromValues(testObjects(), _input.obj.group.getWorldPosition(), _v3)[0]));
      (hit &&
        hit.object === _click &&
        (!e.button || (e.button >= 0 && e.button < 3)) &&
        triggerClick(_click, hit),
        (_click = null));
    }
    function triggerHover(action, mesh, hit) {
      ((_event.action = action),
        (_event.mesh = mesh),
        (_event.hit = hit),
        _this.events.fire(Interaction3D.HOVER, _event, !0),
        _hover.__hoverCallback && _hover.__hoverCallback(_event));
    }
    function triggerClick(mesh, hit) {
      ((_event.action = "click"),
        (_event.mesh = mesh),
        (_event.hit = hit),
        _this.events.fire(Interaction3D.CLICK, _event, !0),
        _click.__clickCallback && _click.__clickCallback(_event));
    }
    function vrInputButton(e) {
      "trigger" == e.label && (e.pressed ? start(e) : click(e));
    }
    ((this.cursor = "auto"),
      (_ray.testVisibility = !0),
      this.set("camera", (c) => {
        _ray.camera = c;
      }),
      (this.add = function (meshes, hover, click, move, seo) {
        let seoRoot;
        (Array.isArray(meshes) || (meshes = parseMeshes(meshes)),
          move && "function" != typeof move && ((seo = move), (move = null)),
          seo && seo.root && ((seoRoot = seo.root), (seo = seo.seo)),
          meshes.forEach((mesh, i) => {
            if (seo)
              try {
                ((mesh._divFocus = (_) => hover({ action: "over", seo: !0, mesh: mesh })),
                  (mesh._divBlur = (_) => hover({ action: "out", seo: !0, mesh: mesh })),
                  (mesh._divSelect = (_) => click({ action: "click", seo: !0, mesh: mesh })));
                let { url: url, label: label, ...options } = Array.isArray(seo) ? seo[i] : seo;
                (GLSEO.objectNode(mesh, seoRoot), mesh.seo.aLink(url, label, options));
              } catch (e) {
                Hydra.LOCAL && console.warn("Could not add SEO to Interaction3D meshes", e);
              }
            ((mesh.hitDestroy = (_) => _meshes.remove(mesh)),
              hover && (mesh.__hoverCallback = hover),
              click && (mesh.__clickCallback = click),
              move && (mesh["__moveCallback" + _this.ID] = move),
              _meshes.push(mesh));
          }));
      }),
      (this.remove = function (meshes) {
        (Array.isArray(meshes) || (meshes = parseMeshes(meshes)),
          meshes.forEach((mesh) => {
            (mesh === _hover && ((_hover = null), Interaction3D.requestCursor(_this.cursor, _this)),
              mesh.seo && mesh.seo.unlink());
            for (let i = _meshes.length - 1; i >= 0; i--)
              mesh === _meshes[i] && _meshes.splice(i, 1);
          }));
      }),
      this.set("testVisibility", (v) => (_ray.testVisibility = v)),
      this.set("input", (obj) => {
        (_input &&
          _input.obj &&
          (_input.obj.isVrController &&
            _this.events.unsub(_input.obj, VRInput.BUTTON, vrInputButton),
          _input.obj.setHitPosition && _input.obj.setHitPosition(!1),
          _input.obj.hideBeam && _input.obj.hideBeam()),
          ((_input = {}).obj = obj),
          (_input.position = obj.group ? obj.group.position : obj),
          (_input.quaternion = obj.group ? obj.group.quaternion : null),
          (_input.type = "number" == typeof _input.position.z || Array.isArray(obj) ? "3d" : "2d"),
          (_input.rect = obj.rect),
          "3d" == _input.type ? (new Vector3(), new Vector3()) : (new Vector2(), new Vector2()),
          obj.inverseNormal
            ? (function addHandlers() {
                (_this.events.sub(_mouse.input, Interaction.START, start),
                  Device.mobile && _this.events.sub(_mouse.input, Interaction.END, end),
                  _this.events.sub(_mouse.input, Interaction.MOVE, move),
                  _this.events.sub(_mouse.input, Interaction.CLICK, click));
              })()
            : (!(function removeHandlers() {
                (_this.events.unsub(_mouse.input, Interaction.START, start),
                  Device.mobile && _this.events.unsub(_mouse.input, Interaction.END, end),
                  _this.events.unsub(_mouse.input, Interaction.MOVE, move),
                  _this.events.unsub(_mouse.input, Interaction.CLICK, click));
              })(),
              Array.isArray(obj)
                ? (_this.startRender(moveHand), _this.stopRender(move))
                : (_this.events.sub(obj, VRInput.BUTTON, vrInputButton),
                  _this.startRender(move),
                  _this.stopRender(moveHand))));
      }),
      this.get("input", (_) => _input),
      this.get("enabled", (_) => _enabled),
      this.set("enabled", (v) => {
        (_enabled = v) ||
          (_hover && triggerHover("out", _hover, null),
          (_hover = null),
          _input &&
            _input.obj &&
            (_input.obj.setHitPosition && _input.obj.setHitPosition(!1),
            _input.obj.hideBeam && _input.obj.hideBeam()));
      }),
      (this.checkObjectHit = function (object, mouse, rect = Stage) {
        return _ray.checkHit(object, mouse, rect)[0];
      }),
      (this.checkObjectFromValues = function (object, origin, direction) {
        return _ray.checkFromValues(object, origin, direction)[0];
      }),
      (this.getObjectHitLocalCoords = function (v, object, mouse, rect = Stage) {
        let hit = _this.checkObjectHit(object, mouse, rect);
        return hit
          ? (v.copy(hit.point), hit.object.worldToLocal(v))
          : (_plane.normal.set(0, 0, 1).applyQuaternion(object.getWorldQuaternion()),
            (_plane.constant = -object.getWorldPosition().dot(_plane.normal)),
            _ray.ray.intersectPlane(_plane, v),
            object.worldToLocal(v));
      }),
      this.get("maximumVRHitDistance", () => _maximumVRHitDistance),
      this.set("maximumVRHitDistance", (value) => {
        value
          ? "number" == typeof value && value > 0 && (_maximumVRHitDistance = value)
          : (_maximumVRHitDistance = void 0);
      }));
  },
  () => {
    ((Interaction3D.HOVER = "interaction3d_hover"),
      (Interaction3D.CLICK = "interaction3d_click"),
      (Interaction3D.MOVE = "interaction3d_move"),
      (Interaction3D.START = "interaction3d_start"),
      (Interaction3D.EXTERNAL_PRESS = "interaction3d_ext_press"),
      (Interaction3D.EXTERNAL_RELEASE = "interaction3d_ext_release"));
    var _cursorObj,
      _interactions = new Set(),
      _input = Mouse,
      _maximumVRHitDistance = 5;
    ((Interaction3D.find = function (camera, mouse, stage) {
      if (!(camera = camera.camera || camera)._interaction3d) {
        let interaction = new Interaction3D(camera, mouse, stage);
        ((interaction.input = mouse || _input),
          (camera._interaction3d = interaction),
          _interactions.add(new WeakRef(interaction)));
      }
      return camera._interaction3d;
    }),
      (Interaction3D.useInput = function (obj) {
        _input != obj &&
          (_interactions.forEach((ref) => {
            let interaction = ref.deref();
            interaction ? (interaction.input = obj) : _interactions.delete(ref);
          }),
          (_input = obj));
      }),
      (Interaction3D.requestCursor = function (cursor, obj) {
        (obj.forceCursor && (cursor = obj.forceCursor),
          "pointer" == cursor && ((_cursorObj = obj), Stage.cursor(cursor)),
          "auto" == cursor && _cursorObj == obj && (Stage.cursor(cursor), (_cursorObj = null)));
      }),
      Object.defineProperty(Interaction3D, "maximumVRHitDistance", {
        get: () => _maximumVRHitDistance,
        set(value) {
          value
            ? "number" == typeof value && value > 0 && (_maximumVRHitDistance = value)
            : (_maximumVRHitDistance = 5);
        },
      }));
  },
);
