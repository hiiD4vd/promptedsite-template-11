Class(
  function ScreenProjection(_camera) {
    Inherit(this, Component);
    var _v3 = new Vector3(),
      _v32 = new Vector3(),
      _value = new Vector3();
    ((_camera = _camera.camera || _camera),
      this.set("camera", function (v) {
        _camera = v.camera || v;
      }),
      this.get("camera", (_) => _camera),
      (this.unproject = function (mouse, rect = Stage, distance = 1) {
        ("number" == typeof rect && ((distance = rect), (rect = Stage)),
          _v3.set((mouse.x / rect.width) * 2 - 1, (-mouse.y / rect.height) * 2 + 1, 0.5),
          _v3.unproject(_camera));
        let pos = _camera.getWorldPosition();
        return (
          _v3.sub(pos).normalize().multiplyScalar(distance),
          _value.copy(pos).add(_v3),
          _value
        );
      }),
      (this.project = function (pos, screen) {
        return (
          (screen = screen || Stage),
          pos instanceof Base3D
            ? (pos.updateMatrixWorld(), _v32.set(0, 0, 0).setFromMatrixPosition(pos.matrixWorld))
            : _v32.copy(pos),
          _v32.project(_camera),
          (_v32.x = ((_v32.x + 1) / 2) * screen.width),
          (_v32.y = (-(_v32.y - 1) / 2) * screen.height),
          _v32
        );
      }));
  },
  (_) => {
    var _screen,
      _map = new WeakMap();
    ((ScreenProjection.unproject = function (mouse, distance) {
      return (
        _screen || (_screen = new ScreenProjection(World.CAMERA)),
        _screen.unproject(mouse, distance)
      );
    }),
      (ScreenProjection.project = function (pos, screen) {
        return (
          _screen || (_screen = new ScreenProjection(World.CAMERA)),
          _screen.project(pos, screen)
        );
      }),
      (ScreenProjection.find = function (camera) {
        if (!_map.has(camera)) {
          let projection = new ScreenProjection(camera);
          _map.set(camera, projection);
        }
        return _map.get(camera);
      }));
  },
);
