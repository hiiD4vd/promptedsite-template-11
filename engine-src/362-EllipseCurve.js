class EllipseCurve extends Base3D {
  constructor(aX, aY, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation) {
    (super(),
      (this.type = "EllipseCurve"),
      (this.aX = aX || 0),
      (this.aY = aY || 0),
      (this.xRadius = xRadius || 1),
      (this.yRadius = yRadius || 1),
      (this.aStartAngle = aStartAngle || 0),
      (this.aEndAngle = aEndAngle || 2 * Math.PI),
      (this.aClockwise = aClockwise || !1),
      (this.aRotation = aRotation || 0),
      (this.isEllipseCurve = !0));
  }
  getPoint(t, optionalTarget) {
    let point = optionalTarget || new Vector2(),
      twoPi = 2 * Math.PI,
      deltaAngle = this.aEndAngle - this.aStartAngle,
      samePoints = Math.abs(deltaAngle) < Number.EPSILON;
    for (; deltaAngle < 0;) deltaAngle += twoPi;
    for (; deltaAngle > twoPi;) deltaAngle -= twoPi;
    (deltaAngle < Number.EPSILON && (deltaAngle = samePoints ? 0 : twoPi),
      !0 !== this.aClockwise ||
        samePoints ||
        (deltaAngle === twoPi ? (deltaAngle = -twoPi) : (deltaAngle -= twoPi)));
    let angle = this.aStartAngle + t * deltaAngle,
      x = this.aX + this.xRadius * Math.cos(angle),
      y = this.aY + this.yRadius * Math.sin(angle);
    if (0 !== this.aRotation) {
      let cos = Math.cos(this.aRotation),
        sin = Math.sin(this.aRotation),
        tx = x - this.aX,
        ty = y - this.aY;
      ((x = tx * cos - ty * sin + this.aX), (y = tx * sin + ty * cos + this.aY));
    }
    return point.set(x, y);
  }
  copy() {
    return (
      Curve3D.prototype.copy.call(this, source),
      (this.aX = source.aX),
      (this.aY = source.aY),
      (this.xRadius = source.xRadius),
      (this.yRadius = source.yRadius),
      (this.aStartAngle = source.aStartAngle),
      (this.aEndAngle = source.aEndAngle),
      (this.aClockwise = source.aClockwise),
      (this.aRotation = source.aRotation),
      this
    );
  }
  toJSON() {
    let data = Curve3D.prototype.toJSON.call(this);
    return (
      (data.aX = this.aX),
      (data.aY = this.aY),
      (data.xRadius = this.xRadius),
      (data.yRadius = this.yRadius),
      (data.aStartAngle = this.aStartAngle),
      (data.aEndAngle = this.aEndAngle),
      (data.aClockwise = this.aClockwise),
      (data.aRotation = this.aRotation),
      data
    );
  }
  fromJSON() {
    return (
      Curve3D.prototype.fromJSON.call(this, json),
      (this.aX = json.aX),
      (this.aY = json.aY),
      (this.xRadius = json.xRadius),
      (this.yRadius = json.yRadius),
      (this.aStartAngle = json.aStartAngle),
      (this.aEndAngle = json.aEndAngle),
      (this.aClockwise = json.aClockwise),
      (this.aRotation = json.aRotation),
      this
    );
  }
}
