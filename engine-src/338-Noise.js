Class(function Noise() {
  Inherit(this, Component);
  var v2 = new Vector2(),
    v3 = new Vector3();
  ((this.cnoise3d = function (vec) {
    let v = v3.copy(vec),
      t = 0.3 * v.z;
    v.y *= 0.8;
    let noise = 0,
      s = 0.5;
    return (
      (noise +=
        0.3 *
        (Math.sin((0.9 * v.x) / s + 10 * t) +
          Math.sin((2.4 * v.x) / s + 15 * t) +
          Math.sin((-3.5 * v.x) / s + 4 * t) +
          Math.sin((-2.5 * v.x) / s + 7.1 * t))),
      (noise +=
        0.3 *
        (Math.sin((-0.3 * v.y) / s + 18 * t) +
          Math.sin((1.6 * v.y) / s + 18 * t) +
          Math.sin((2.6 * v.y) / s + 8 * t) +
          Math.sin((-2.6 * v.y) / s + 4.5 * t))),
      noise
    );
  }),
    (this.cnoise2d = function (vec) {
      let v = v2.copy(vec),
        t = 0.3 * v.x;
      v.y *= 0.8;
      let noise = 0,
        s = 0.5;
      return (
        (noise +=
          0.3 *
          (Math.sin((0.9 * v.x) / s + 10 * t) +
            Math.sin((2.4 * v.x) / s + 15 * t) +
            Math.sin((-3.5 * v.x) / s + 4 * t) +
            Math.sin((-2.5 * v.x) / s + 7.1 * t))),
        (noise +=
          0.3 *
          (Math.sin((-0.3 * v.y) / s + 18 * t) +
            Math.sin((1.6 * v.y) / s + 18 * t) +
            Math.sin((2.6 * v.y) / s + 8 * t) +
            Math.sin((-2.6 * v.y) / s + 4.5 * t))),
        noise
      );
    }));
}, "static");
