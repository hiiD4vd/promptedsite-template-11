class Plane {
  constructor(normal, constant) {
    ((this.normal = void 0 !== normal ? normal : new Vector3(1, 0, 0)),
      (this.constant = void 0 !== constant ? constant : 0));
  }
  set(normal, constant) {
    return (this.normal.copy(normal), (this.constant = constant), this);
  }
  setComponents(x, y, z, w) {
    return (this.normal.set(x, y, z), (this.constant = w), this);
  }
  setFromNormalAndCoplanarPoint(normal, point) {
    return (this.normal.copy(normal), (this.constant = -point.dot(this.normal)), this);
  }
  setFromCoplanarPoints(a, b, c) {
    let v1 = this.V1 || new Vector3(),
      v2 = this.V2 || new Vector3();
    ((this.V1 = v1), (this.V2 = v2));
    var normal = v1.subVectors(c, b).cross(v2.subVectors(a, b)).normalize();
    return (this.setFromNormalAndCoplanarPoint(normal, a), this);
  }
  clone() {
    return new Plane().copy(this);
  }
  copy(plane) {
    return (this.normal.copy(plane.normal), (this.constant = plane.constant), this);
  }
  normalize() {
    var inverseNormalLength = 1 / this.normal.length();
    return (
      this.normal.multiplyScalar(inverseNormalLength),
      (this.constant *= inverseNormalLength),
      this
    );
  }
  negate() {
    return ((this.constant *= -1), this.normal.negate(), this);
  }
  distanceToPoint(point) {
    return this.normal.dot(point) + this.constant;
  }
  distanceToSphere(sphere) {
    return this.distanceToPoint(sphere.center) - sphere.radius;
  }
  projectPoint(point, target) {
    return target.copy(this.normal).multiplyScalar(-this.distanceToPoint(point)).add(point);
  }
  intersectLine(line, target) {
    let v1 = this.V1 || new Vector3();
    this.V1 = v1;
    var direction = line.delta(v1),
      denominator = this.normal.dot(direction);
    if (0 === denominator)
      return 0 === this.distanceToPoint(line.start) ? target.copy(line.start) : void 0;
    var t = -(line.start.dot(this.normal) + this.constant) / denominator;
    return t < 0 || t > 1 ? void 0 : target.copy(direction).multiplyScalar(t).add(line.start);
  }
  intersectsLine(line) {
    var startSign = this.distanceToPoint(line.start),
      endSign = this.distanceToPoint(line.end);
    return (startSign < 0 && endSign > 0) || (endSign < 0 && startSign > 0);
  }
  intersectsBox(box) {
    return box.intersectsPlane(this);
  }
  intersectsSphere(sphere) {
    return sphere.intersectsPlane(this);
  }
  coplanarPoint(target) {
    return target.copy(this.normal).multiplyScalar(-this.constant);
  }
  applyMatrix4(matrix, optionalNormalMatrix) {
    let v1 = this.V1 || new Vector3();
    this.V1 = v1;
    let m1 = this.M1 || new Matrix3();
    this.M1 = m1;
    var normalMatrix = optionalNormalMatrix || m1.getNormalMatrix(matrix),
      referencePoint = this.coplanarPoint(v1).applyMatrix4(matrix),
      normal = this.normal.applyMatrix3(normalMatrix).normalize();
    return ((this.constant = -referencePoint.dot(normal)), this);
  }
  translate(offset) {
    return ((this.constant -= offset.dot(this.normal)), this);
  }
  equals(plane) {
    return plane.normal.equals(this.normal) && plane.constant === this.constant;
  }
}
