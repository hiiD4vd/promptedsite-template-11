class LineCurve extends Curve3D {
  constructor(v1, v2) {
    (super(),
      (this.type = "LineCurve"),
      (this.v1 = v1 || new Vector3()),
      (this.v2 = v2 || new Vector3()),
      (this.isLineCurve = !0));
  }
  getPoint(t, optionalTarget) {
    var point = optionalTarget || new Vector3();
    return (
      1 === t
        ? point.copy(this.v2)
        : (point.copy(this.v2).sub(this.v1), point.multiplyScalar(t).add(this.v1)),
      point
    );
  }
  getPointAt(u, optionalTarget) {
    return this.getPoint(u, optionalTarget);
  }
  getTangent() {
    return this.v2.clone().sub(this.v1).normalize();
  }
  copy(source) {
    return (
      Curve3D.prototype.copy.call(this, source),
      this.v1.copy(source.v1),
      this.v2.copy(source.v2),
      this
    );
  }
  toJSON() {
    var data = Curve3D.prototype.toJSON.call(this);
    return ((data.v1 = this.v1.toArray()), (data.v2 = this.v2.toArray()), data);
  }
  fromJSON(json) {
    return (
      Curve.prototype.fromJSON.call(this, json),
      this.v1.fromArray(json.v1),
      this.v2.fromArray(json.v2),
      this
    );
  }
}
