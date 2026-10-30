class Triangle {
  constructor(a = new Vector3(), b = new Vector3(), c = new Vector3()) {
    ((this.a = a), (this.b = b), (this.c = c));
  }
  set(a, b, c) {
    return (this.a.copy(a), this.b.copy(b), this.c.copy(c), this);
  }
  setFromPointsAndIndices(points, i0, i1, i2) {
    return (this.a.copy(points[i0]), this.b.copy(points[i1]), this.c.copy(points[i2]), this);
  }
  clone() {
    return new Triangle().copy(this);
  }
  copy(triangle) {
    return (this.a.copy(triangle.a), this.b.copy(triangle.b), this.c.copy(triangle.c), this);
  }
  getArea() {
    let v0 = this.V0 || new Vector3(),
      v1 = this.V1 || new Vector3();
    return (
      (this.V0 = v0),
      (this.V1 = v1),
      v0.subVectors(this.c, this.b),
      v1.subVectors(this.a, this.b),
      0.5 * v0.cross(v1).length()
    );
  }
  getMidpoint(target = new Vector3()) {
    return target
      .addVectors(this.a, this.b)
      .add(this.c)
      .multiplyScalar(1 / 3);
  }
  getNormal(target) {
    return Triangle.getNormal(this.a, this.b, this.c, target);
  }
  getPlane(target = new Vector3()) {
    return target.setFromCoplanarPoints(this.a, this.b, this.c);
  }
  getBarycoord(point, target) {
    return Triangle.getBarycoord(point, this.a, this.b, this.c, target);
  }
  containsPoint(point) {
    return Triangle.containsPoint(point, this.a, this.b, this.c);
  }
  intersectsBox(box) {
    return box.intersectsTriangle(this);
  }
  equals(triangle) {
    return triangle.a.equals(this.a) && triangle.b.equals(this.b) && triangle.c.equals(this.c);
  }
}
