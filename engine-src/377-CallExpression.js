Module(function Shape2DInterpolations() {
  this.exports = {
    QuadraticBezier: function QuadraticBezier(t, p0, p1, p2) {
      return (
        (function QuadraticBezierP0(t, p) {
          let k = 1 - t;
          return k * k * p;
        })(t, p0) +
        (function QuadraticBezierP1(t, p) {
          return 2 * (1 - t) * t * p;
        })(t, p1) +
        (function QuadraticBezierP2(t, p) {
          return t * t * p;
        })(t, p2)
      );
    },
    CubicBezier: function CubicBezier(t, p0, p1, p2, p3) {
      return (
        (function CubicBezierP0(t, p) {
          let k = 1 - t;
          return k * k * k * p;
        })(t, p0) +
        (function CubicBezierP1(t, p) {
          let k = 1 - t;
          return 3 * k * k * t * p;
        })(t, p1) +
        (function CubicBezierP2(t, p) {
          return 3 * (1 - t) * t * t * p;
        })(t, p2) +
        (function CubicBezierP3(t, p) {
          return t * t * t * p;
        })(t, p3)
      );
    },
    CatmullRom: function CatmullRom(t, p0, p1, p2, p3) {
      let v0 = 0.5 * (p2 - p0),
        v1 = 0.5 * (p3 - p1),
        t2 = t * t;
      return (
        (2 * p1 - 2 * p2 + v0 + v1) * (t * t2) + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1
      );
    },
  };
});
