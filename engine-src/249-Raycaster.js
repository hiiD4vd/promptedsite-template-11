Class(
  function Raycaster(_camera) {
    Inherit(this, Component);
    const _this = this;
    let _mouse = new Vector3(),
      _raycaster = new RayManager();
    function ascSort(a, b) {
      return a.distance - b.distance;
    }
    function intersectObject(object, raycaster, intersects, recursive) {
      let obj = object;
      for (; obj && _this.testVisibility;) {
        if (!1 === obj.visible && !obj.forceRayVisible && !1 !== obj.testVisibility) return;
        obj = obj.parent;
      }
      if (object.raycast && (object.raycast(raycaster, intersects), !0 === recursive)) {
        let children = object.children;
        for (let i = 0, l = children.length; i < l; i++)
          intersectObject(children[i], raycaster, intersects, !0);
      }
    }
    function intersect(objects) {
      Array.isArray(objects) || (objects = [objects]);
      let intersects = [];
      return (
        objects.forEach((object) => {
          intersectObject(object, _raycaster, intersects, !1);
        }),
        intersects.sort(ascSort),
        intersects
      );
    }
    ((this.testVisibility = !0),
      this.set("camera", function (camera) {
        _camera = camera;
      }),
      this.set("pointsThreshold", function (value) {
        _raycaster.params.Points.threshold = value;
      }),
      this.get("ray", () => _raycaster.ray),
      (this.checkHit = function (objects, mouse, rect = Stage) {
        return (
          (mouse = mouse || Mouse),
          (_mouse.x = (mouse.x / rect.width) * 2 - 1),
          (_mouse.y = (-mouse.y / rect.height) * 2 + 1),
          _raycaster.setFromCamera(_mouse, _camera),
          intersect(objects)
        );
      }),
      (this.checkFromValues = function (objects, origin, direction) {
        return (_raycaster.set(origin, direction, 0, Number.POSITIVE_INFINITY), intersect(objects));
      }));
  },
  (_) => {
    var _ray,
      _map = new WeakMap();
    ((Raycaster.checkHit = function (objects, mouse) {
      return (_ray || (_ray = new Raycaster(World.CAMERA)), _ray.checkHit(objects, mouse));
    }),
      (Raycaster.checkFromValues = function (objects, origin, direction) {
        return (
          _ray || (_ray = new Raycaster(World.CAMERA)),
          _ray.checkFromValues(objects, origin, direction)
        );
      }),
      (Raycaster.find = function (camera) {
        if (!_map.has(camera)) {
          let ray = new Raycaster(camera);
          _map.set(camera, ray);
        }
        return _map.get(camera);
      }));
  },
);
