class CubicBezierCurve2D extends Curve3D {
  constructor(v0, v1, v2, v3) {
    (super(),
      (this.type = "CubicBezierCurve"),
      (this.v0 = v0 || new Vector2()),
      (this.v1 = v1 || new Vector2()),
      (this.v2 = v2 || new Vector2()),
      (this.v3 = v3 || new Vector2()),
      (this.isCubicBezierCurve = !0));
  }
  getPoint(t, optionalTarget) {
    var point = optionalTarget || new Vector2(),
      v0 = this.v0,
      v1 = this.v1,
      v2 = this.v2,
      v3 = this.v3;
    const { CubicBezier: CubicBezier } = require("Shape2DInterpolations");
    return (
      point.set(CubicBezier(t, v0.x, v1.x, v2.x, v3.x), CubicBezier(t, v0.y, v1.y, v2.y, v3.y)),
      point
    );
  }
  copy(source) {
    return (
      Curve3D.prototype.copy.call(this, source),
      this.v0.copy(source.v0),
      this.v1.copy(source.v1),
      this.v2.copy(source.v2),
      this.v3.copy(source.v3),
      this
    );
  }
  let() {
    var data = Curve3D.prototype.let.call(this);
    return (
      (data.v0 = this.v0.toArray()),
      (data.v1 = this.v1.toArray()),
      (data.v2 = this.v2.toArray()),
      (data.v3 = this.v3.toArray()),
      data
    );
  }
  fromJSON(json) {
    return (
      Curve.prototype.fromJSON.call(this, json),
      this.v0.fromArray(json.v0),
      this.v1.fromArray(json.v1),
      this.v2.fromArray(json.v2),
      this.v3.fromArray(json.v3),
      this
    );
  }
}
