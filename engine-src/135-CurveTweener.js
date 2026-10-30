Class(function CurveTweener() {
  var _v1, _m, _e;
  this.create = function (object3d, curve, direction = 1) {
    object3d.rotation.order = "YXZ";
    let value = 0,
      yaw = 0,
      y = object3d.rotation.y;
    return {
      get value() {
        return value;
      },
      set value(v) {
        value = v;
        let t = Math.clamp(direction < 1 ? 1 - value : value),
          point = curve.getPointAt(t),
          tangent = curve.curve.getTangentAt(t);
        (direction < 1 && tangent.negate(),
          _v1 || (_v1 = new Vector3()),
          _m || (_m = new Matrix4()),
          _e || (_e = new Euler(0, 0, 0, "YXZ")));
        let eye = _v1.setScalar(0);
        (_m.lookAt(eye, tangent, object3d.up),
          object3d.position.copy(point),
          _e.setFromRotationMatrix(_m),
          (y = _e.y),
          (object3d.rotation.y = y + yaw));
      },
      get pitch() {
        return Math.degrees(object3d.rotation.x);
      },
      set pitch(x) {
        object3d.rotation.x = Math.radians(x);
      },
      get roll() {
        return Math.degrees(object3d.rotation.z);
      },
      set roll(z) {
        object3d.rotation.z = Math.radians(z);
      },
      get yaw() {
        return Math.degrees(yaw);
      },
      set yaw(nextYaw) {
        ((yaw = Math.radians(nextYaw)), (object3d.rotation.y = y + yaw));
      },
    };
  };
}, "static");
