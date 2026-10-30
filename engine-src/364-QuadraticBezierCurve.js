class QuadraticBezierCurve extends Curve3D {
  constructor(v0, v1, v2) {
    (super(),
      (this.type = "QuadraticBezierCurve"),
      (this.v0 = v0 || new Vector2()),
      (this.v1 = v1 || new Vector2()),
      (this.v2 = v2 || new Vector2()),
      (this.isQuadraticBezierCurve = !0));
  }
  getPoint(t, optionalTarget = new Vector2()) {
    let point = optionalTarget || new Vector2(),
      v0 = this.v0,
      v1 = this.v1,
      v2 = this.v2;
    const { QuadraticBezier: QuadraticBezier } = require("Shape2DInterpolations");
    return (
      point.set(QuadraticBezier(t, v0.x, v1.x, v2.x), QuadraticBezier(t, v0.y, v1.y, v2.y)),
      point
    );
  }
  copy(source) {
    return (
      Curve3D.prototype.copy.call(this, source),
      this.v0.copy(source.v0),
      this.v1.copy(source.v1),
      this.v2.copy(source.v2),
      this
    );
  }
  toJSON() {
    let data = Curve3D.prototype.toJSON.call(this);
    return (
      (data.v0 = this.v0.toArray()),
      (data.v1 = this.v1.toArray()),
      (data.v2 = this.v2.toArray()),
      data
    );
  }
  fromJSON(json) {
    return (
      Curve3D.prototype.fromJSON.call(this, json),
      this.v0.fromArray(json.v0),
      this.v1.fromArray(json.v1),
      this.v2.fromArray(json.v2),
      this
    );
  }
}
