class Box2 {
  constructor(min, max) {
    ((this.min = void 0 !== min ? min : new Vector2(1 / 0, 1 / 0)),
      (this.max = void 0 !== max ? max : new Vector2(-1 / 0, -1 / 0)));
  }
  set(min, max) {
    return (this.min.copy(min), this.max.copy(max), this);
  }
  setFromPoints(points) {
    this.makeEmpty();
    for (let i = 0, il = points.length; i < il; i++) this.expandByPoint(points[i]);
    return this;
  }
  setFromCenterAndSize(center, size) {
    let v1 = this.V1 || new Vector2();
    this.V1 = v1;
    let halfSize = v1.copy(size).multiplyScalar(0.5);
    return (this.min.copy(center).sub(halfSize), this.max.copy(center).add(halfSize), this);
  }
  clone() {
    return new Box2().copy(this);
  }
  copy(box) {
    return (this.min.copy(box.min), this.max.copy(box.max), this);
  }
  makeEmpty() {
    return ((this.min.x = this.min.y = 1 / 0), (this.max.x = this.max.y = -1 / 0), this);
  }
  isEmpty() {
    return this.max.x < this.min.x || this.max.y < this.min.y;
  }
  getCenter(target) {
    return this.isEmpty()
      ? target.set(0, 0)
      : target.addVectors(this.min, this.max).multiplyScalar(0.5);
  }
  getSize(target) {
    return this.isEmpty() ? target.set(0, 0) : target.subVectors(this.max, this.min);
  }
  expandByPoint(point) {
    return (this.min.min(point), this.max.max(point), this);
  }
  expandByVector(vector) {
    return (this.min.sub(vector), this.max.add(vector), this);
  }
  expandByScalar(scalar) {
    return (this.min.addScalar(-scalar), this.max.addScalar(scalar), this);
  }
  containsPoint(point) {
    return !(
      point.x < this.min.x ||
      point.x > this.max.x ||
      point.y < this.min.y ||
      point.y > this.max.y
    );
  }
  containsBox(box) {
    return (
      this.min.x <= box.min.x &&
      box.max.x <= this.max.x &&
      this.min.y <= box.min.y &&
      box.max.y <= this.max.y
    );
  }
  getParameter(point, target) {
    return target.set(
      (point.x - this.min.x) / (this.max.x - this.min.x),
      (point.y - this.min.y) / (this.max.y - this.min.y),
    );
  }
  intersectsBox(box) {
    return !(
      box.max.x < this.min.x ||
      box.min.x > this.max.x ||
      box.max.y < this.min.y ||
      box.min.y > this.max.y
    );
  }
  clampPoint(point, target) {
    return target.copy(point).clamp(this.min, this.max);
  }
  distanceToPoint(point) {
    let v1 = this.V1 || new Vector2();
    return ((this.V1 = v1), v1.copy(point).clamp(this.min, this.max).sub(point).length());
  }
  intersect(box) {
    return (this.min.max(box.min), this.max.min(box.max), this);
  }
  union(box) {
    return (this.min.min(box.min), this.max.max(box.max), this);
  }
  translate(offset) {
    return (this.min.add(offset), this.max.add(offset), this);
  }
  equals(box) {
    return box.min.equals(this.min) && box.max.equals(this.max);
  }
}
