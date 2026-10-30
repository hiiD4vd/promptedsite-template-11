class Box3 {
  constructor(min, max) {
    ((this.min = void 0 !== min ? min : new Vector3(1 / 0, 1 / 0, 1 / 0)),
      (this.max = void 0 !== max ? max : new Vector3(-1 / 0, -1 / 0, -1 / 0)));
  }
  set(min, max) {
    return (this.min.copy(min), this.max.copy(max), this);
  }
  setFromArray(array) {
    let minX = 1 / 0,
      minY = 1 / 0,
      minZ = 1 / 0,
      maxX = -1 / 0,
      maxY = -1 / 0,
      maxZ = -1 / 0;
    for (let i = 0, l = array.length; i < l; i += 3) {
      let x = array[i],
        y = array[i + 1],
        z = array[i + 2];
      (x < minX && (minX = x),
        y < minY && (minY = y),
        z < minZ && (minZ = z),
        x > maxX && (maxX = x),
        y > maxY && (maxY = y),
        z > maxZ && (maxZ = z));
    }
    return (this.min.set(minX, minY, minZ), this.max.set(maxX, maxY, maxZ), this);
  }
  setFromBufferAttribute(attribute) {
    let minX = 1 / 0,
      minY = 1 / 0,
      minZ = 1 / 0,
      maxX = -1 / 0,
      maxY = -1 / 0,
      maxZ = -1 / 0,
      tempV = this.min;
    for (let i = 0, l = attribute.count; i < l; i++) {
      tempV.fromBufferAttribute(attribute, i);
      let { x: x, y: y, z: z } = tempV;
      (x < minX && (minX = x),
        y < minY && (minY = y),
        z < minZ && (minZ = z),
        x > maxX && (maxX = x),
        y > maxY && (maxY = y),
        z > maxZ && (maxZ = z));
    }
    return (this.min.set(minX, minY, minZ), this.max.set(maxX, maxY, maxZ), this);
  }
  setFromPoints(points) {
    this.makeEmpty();
    for (let i = 0, il = points.length; i < il; i++) this.expandByPoint(points[i]);
    return this;
  }
  setFromCenterAndSize(center, size) {
    let v1 = this.V1 || new Vector3();
    this.V1 = v1;
    let halfSize = v1.copy(size).multiplyScalar(0.5);
    return (this.min.copy(center).sub(halfSize), this.max.copy(center).add(halfSize), this);
  }
  setFromObject(object) {
    return (this.makeEmpty(), this.expandByObject(object));
  }
  clone() {
    return new Box3().copy(this);
  }
  copy(box) {
    return (this.min.copy(box.min), this.max.copy(box.max), this);
  }
  makeEmpty() {
    return (
      (this.min.x = this.min.y = this.min.z = 1 / 0),
      (this.max.x = this.max.y = this.max.z = -1 / 0),
      this
    );
  }
  isEmpty() {
    return this.max.x < this.min.x || this.max.y < this.min.y || this.max.z < this.min.z;
  }
  getCenter(target) {
    return this.isEmpty()
      ? target.set(0, 0, 0)
      : target.addVectors(this.min, this.max).multiplyScalar(0.5);
  }
  getSize(target) {
    return this.isEmpty() ? target.set(0, 0, 0) : target.subVectors(this.max, this.min);
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
  expandByObject(object, local, onlyvisible) {
    let scope,
      i,
      l,
      v1 = this.V1 || new Vector3();
    return (
      (this.V1 = v1),
      (scope = this),
      object.updateMatrixWorld(!0),
      object.traverse((node) => {
        if (onlyvisible && !node.visible) return;
        if (node.isGizmo) return;
        let geometry = node.geometry;
        if (!geometry) return;
        let attribute = geometry.attributes.position;
        if (void 0 !== attribute)
          for (i = 0, l = attribute.count; i < l; i++)
            (v1
              .fromBufferAttribute(attribute, i)
              .applyMatrix4(local ? node.matrix : node.matrixWorld),
              scope.expandByPoint(v1));
      }),
      this
    );
  }
  containsPoint(point) {
    return !(
      point.x < this.min.x ||
      point.x > this.max.x ||
      point.y < this.min.y ||
      point.y > this.max.y ||
      point.z < this.min.z ||
      point.z > this.max.z
    );
  }
  containsBox(box) {
    return (
      this.min.x <= box.min.x &&
      box.max.x <= this.max.x &&
      this.min.y <= box.min.y &&
      box.max.y <= this.max.y &&
      this.min.z <= box.min.z &&
      box.max.z <= this.max.z
    );
  }
  getParameter(point, target) {
    return target.set(
      (point.x - this.min.x) / (this.max.x - this.min.x),
      (point.y - this.min.y) / (this.max.y - this.min.y),
      (point.z - this.min.z) / (this.max.z - this.min.z),
    );
  }
  intersectsBox(box) {
    return !(
      box.max.x < this.min.x ||
      box.min.x > this.max.x ||
      box.max.y < this.min.y ||
      box.min.y > this.max.y ||
      box.max.z < this.min.z ||
      box.min.z > this.max.z
    );
  }
  intersectsSphere(sphere) {
    let closestPoint = this.V1 || new Vector3();
    return (
      (this.V1 = closestPoint),
      this.clampPoint(sphere.center, closestPoint),
      closestPoint.distanceToSquared(sphere.center) <= sphere.radius * sphere.radius
    );
  }
  intersectsPlane(plane) {
    let min, max;
    return (
      plane.normal.x > 0
        ? ((min = plane.normal.x * this.min.x), (max = plane.normal.x * this.max.x))
        : ((min = plane.normal.x * this.max.x), (max = plane.normal.x * this.min.x)),
      plane.normal.y > 0
        ? ((min += plane.normal.y * this.min.y), (max += plane.normal.y * this.max.y))
        : ((min += plane.normal.y * this.max.y), (max += plane.normal.y * this.min.y)),
      plane.normal.z > 0
        ? ((min += plane.normal.z * this.min.z), (max += plane.normal.z * this.max.z))
        : ((min += plane.normal.z * this.max.z), (max += plane.normal.z * this.min.z)),
      min <= plane.constant && max >= plane.constant
    );
  }
  intersectsTriangle(triangle) {
    let v0 = this.V0 || new Vector3();
    this.V0 = v0;
    let v1 = this.V1 || new Vector3();
    this.V1 = v1;
    let v2 = this.V2 || new Vector3();
    this.V2 = v2;
    let f0 = this.F0 || new Vector3();
    this.F0 = f0;
    let f1 = this.F1 || new Vector3();
    this.F1 = f1;
    let f2 = this.F2 || new Vector3();
    this.F2 = f2;
    let testAxis = this.V3 || new Vector3();
    this.V3 = testAxis;
    let center = this.V4 || new Vector3();
    this.V4 = center;
    let extents = this.V5 || new Vector3();
    this.V5 = extents;
    let triangleNormal = this.V6 || new Vector3();
    function satForAxes(axes) {
      let i, j;
      for (i = 0, j = axes.length - 3; i <= j; i += 3) {
        testAxis.fromArray(axes, i);
        let r =
            extents.x * Math.abs(testAxis.x) +
            extents.y * Math.abs(testAxis.y) +
            extents.z * Math.abs(testAxis.z),
          p0 = v0.dot(testAxis),
          p1 = v1.dot(testAxis),
          p2 = v2.dot(testAxis);
        if (Math.max(-Math.max(p0, p1, p2), Math.min(p0, p1, p2)) > r) return !1;
      }
      return !0;
    }
    if (((this.V6 = triangleNormal), this.isEmpty())) return !1;
    (this.getCenter(center),
      extents.subVectors(this.max, center),
      v0.subVectors(triangle.a, center),
      v1.subVectors(triangle.b, center),
      v2.subVectors(triangle.c, center),
      f0.subVectors(v1, v0),
      f1.subVectors(v2, v1),
      f2.subVectors(v0, v2));
    let axes = [
      0,
      -f0.z,
      f0.y,
      0,
      -f1.z,
      f1.y,
      0,
      -f2.z,
      f2.y,
      f0.z,
      0,
      -f0.x,
      f1.z,
      0,
      -f1.x,
      f2.z,
      0,
      -f2.x,
      -f0.y,
      f0.x,
      0,
      -f1.y,
      f1.x,
      0,
      -f2.y,
      f2.x,
      0,
    ];
    return (
      !!satForAxes(axes) &&
      ((axes = [1, 0, 0, 0, 1, 0, 0, 0, 1]),
      !!satForAxes(axes) &&
        (triangleNormal.crossVectors(f0, f1),
        (axes = [triangleNormal.x, triangleNormal.y, triangleNormal.z]),
        satForAxes(axes)))
    );
  }
  clampPoint(point, target) {
    return target.copy(point).clamp(this.min, this.max);
  }
  distanceToPoint(point) {
    let v1 = this.V1 || new Vector3();
    return ((this.V1 = v1), v1.copy(point).clamp(this.min, this.max).sub(point).length());
  }
  getBoundingSphere(target = new Sphere()) {
    let v1 = this.V1 || new Vector3();
    return (
      (this.V1 = v1),
      this.getCenter(target.center),
      (target.radius = 0.5 * this.getSize(v1).length()),
      target
    );
  }
  intersect(box) {
    return (this.min.max(box.min), this.max.min(box.max), this.isEmpty() && this.makeEmpty(), this);
  }
  union(box) {
    return (this.min.min(box.min), this.max.max(box.max), this);
  }
  applyMatrix4(matrix) {
    if (this.isEmpty()) return this;
    let m = matrix.elements,
      xax = m[0] * this.min.x,
      xay = m[1] * this.min.x,
      xaz = m[2] * this.min.x,
      xbx = m[0] * this.max.x,
      xby = m[1] * this.max.x,
      xbz = m[2] * this.max.x,
      yax = m[4] * this.min.y,
      yay = m[5] * this.min.y,
      yaz = m[6] * this.min.y,
      ybx = m[4] * this.max.y,
      yby = m[5] * this.max.y,
      ybz = m[6] * this.max.y,
      zax = m[8] * this.min.z,
      zay = m[9] * this.min.z,
      zaz = m[10] * this.min.z,
      zbx = m[8] * this.max.z,
      zby = m[9] * this.max.z,
      zbz = m[10] * this.max.z;
    return (
      (this.min.x = Math.min(xax, xbx) + Math.min(yax, ybx) + Math.min(zax, zbx) + m[12]),
      (this.min.y = Math.min(xay, xby) + Math.min(yay, yby) + Math.min(zay, zby) + m[13]),
      (this.min.z = Math.min(xaz, xbz) + Math.min(yaz, ybz) + Math.min(zaz, zbz) + m[14]),
      (this.max.x = Math.max(xax, xbx) + Math.max(yax, ybx) + Math.max(zax, zbx) + m[12]),
      (this.max.y = Math.max(xay, xby) + Math.max(yay, yby) + Math.max(zay, zby) + m[13]),
      (this.max.z = Math.max(xaz, xbz) + Math.max(yaz, ybz) + Math.max(zaz, zbz) + m[14]),
      this
    );
  }
  translate(offset) {
    return (this.min.add(offset), this.max.add(offset), this);
  }
  equals(box) {
    return box.min.equals(this.min) && box.max.equals(this.max);
  }
}
