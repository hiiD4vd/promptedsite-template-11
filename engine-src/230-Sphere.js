class Sphere {
  constructor(center = new Vector3(), radius = 0) {
    ((this.center = center), (this.radius = radius));
  }
  set(center, radius) {
    return (this.center.copy(center), (this.radius = radius), this);
  }
  setFromPoints(points, optionalCenter) {
    let box = this.V1 || new Box3();
    this.V1 = box;
    let center = this.center;
    void 0 !== optionalCenter
      ? center.copy(optionalCenter)
      : box.setFromPoints(points).getCenter(center);
    let maxRadiusSq = 0;
    for (let i = 0, il = points.length; i < il; i++)
      maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(points[i]));
    return ((this.radius = Math.sqrt(maxRadiusSq)), this);
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(sphere) {
    return (this.center.copy(sphere.center), (this.radius = sphere.radius), this);
  }
  empty() {
    return this.radius <= 0;
  }
  containsPoint(point) {
    return point.distanceToSquared(this.center) <= this.radius * this.radius;
  }
  distanceToPoint(point) {
    return point.distanceTo(this.center) - this.radius;
  }
  intersectsSphere(sphere) {
    let radiusSum = this.radius + sphere.radius;
    return sphere.center.distanceToSquared(this.center) <= radiusSum * radiusSum;
  }
  intersectsBox(box) {
    return box.intersectsSphere(this);
  }
  intersectsPlane(plane) {
    return Math.abs(plane.distanceToPoint(this.center)) <= this.radius;
  }
  clampPoint(point, target = new Vector3()) {
    let deltaLengthSq = this.center.distanceToSquared(point);
    return (
      target.copy(point),
      deltaLengthSq > this.radius * this.radius &&
        (target.sub(this.center).normalize(), target.multiplyScalar(this.radius).add(this.center)),
      target
    );
  }
  getBoundingBox(target = new Box3()) {
    return (target.set(this.center, this.center), target.expandByScalar(this.radius), target);
  }
  applyMatrix4(matrix) {
    return (
      this.center.applyMatrix4(matrix),
      (this.radius = this.radius * matrix.getMaxScaleOnAxis()),
      this
    );
  }
  translate(offset) {
    return (this.center.add(offset), this);
  }
  equals(sphere) {
    return sphere.center.equals(this.center) && sphere.radius === this.radius;
  }
}
