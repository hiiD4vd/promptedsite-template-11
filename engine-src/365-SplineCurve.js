class SplineCurve extends Curve3D {
  constructor() {
    (super(), (this.type = "SplineCurve"), (this.points = points || []), (this.isSplineCurve = !0));
  }
  getPoint(t, optionalTarget) {
    let point = optionalTarget || new Vector2(),
      points = this.points,
      p = (points.length - 1) * t,
      intPoint = Math.floor(p),
      weight = p - intPoint,
      p0 = points[0 === intPoint ? intPoint : intPoint - 1],
      p1 = points[intPoint],
      p2 = points[intPoint > points.length - 2 ? points.length - 1 : intPoint + 1],
      p3 = points[intPoint > points.length - 3 ? points.length - 1 : intPoint + 2];
    return (
      point.set(
        CatmullRom(weight, p0.x, p1.x, p2.x, p3.x),
        CatmullRom(weight, p0.y, p1.y, p2.y, p3.y),
      ),
      point
    );
  }
  copy(source) {
    (Curve3D.prototype.copy.call(this, source), (this.points = []));
    for (let i = 0, l = source.points.length; i < l; i++) {
      let point = source.points[i];
      this.points.push(point.clone());
    }
    return this;
  }
  toJSON() {
    let data = Curve.prototype.toJSON.call(this);
    data.points = [];
    for (let i = 0, l = this.points.length; i < l; i++) {
      let point = this.points[i];
      data.points.push(point.toArray());
    }
    return data;
  }
  fromJSON(json) {
    (Curve.prototype.fromJSON.call(this, json), (this.points = []));
    for (let i = 0, l = json.points.length; i < l; i++) {
      let point = json.points[i];
      this.points.push(new Vector2().fromArray(point));
    }
    return this;
  }
}
