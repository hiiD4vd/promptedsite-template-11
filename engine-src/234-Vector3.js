class Vector3 {
  constructor(x, y, z) {
    ((this.x = x || 0), (this.y = y || 0), (this.z = z || 0));
  }
  set(x, y, z) {
    return ((this.x = x || 0), (this.y = y || 0), (this.z = z || 0), this);
  }
  setScalar(scalar) {
    return ((this.x = scalar), (this.y = scalar), (this.z = scalar), this);
  }
  clone() {
    return new Vector3(this.x, this.y, this.z);
  }
  copy(v) {
    return ((this.x = v.x), (this.y = v.y), (this.z = v.z), this);
  }
  add(v) {
    return ((this.x += v.x), (this.y += v.y), (this.z += v.z), this);
  }
  addScalar(s) {
    return ((this.x += s), (this.y += s), (this.z += s), this);
  }
  addVectors(a, b) {
    return ((this.x = a.x + b.x), (this.y = a.y + b.y), (this.z = a.z + b.z), this);
  }
  addScaledVector(v, s) {
    return ((this.x += v.x * s), (this.y += v.y * s), (this.z += v.z * s), this);
  }
  sub(v) {
    return ((this.x -= v.x), (this.y -= v.y), (this.z -= v.z), this);
  }
  subScalar(s) {
    return ((this.x -= s), (this.y -= s), (this.z -= s), this);
  }
  subVectors(a, b) {
    return ((this.x = a.x - b.x), (this.y = a.y - b.y), (this.z = a.z - b.z), this);
  }
  multiply(v) {
    return ((this.x *= v.x), (this.y *= v.y), (this.z *= v.z), this);
  }
  multiplyScalar(scalar) {
    return ((this.x *= scalar), (this.y *= scalar), (this.z *= scalar), this);
  }
  multiplyVectors(a, b) {
    return ((this.x = a.x * b.x), (this.y = a.y * b.y), (this.z = a.z * b.z), this);
  }
  applyEuler(euler) {
    let quaternion = this.Q1 || new Quaternion();
    return ((this.Q1 = quaternion), this.applyQuaternion(quaternion.setFromEuler(euler)));
  }
  applyAxisAngle(axis, angle) {
    let quaternion = this.Q1 || new Quaternion();
    return ((this.Q1 = quaternion), this.applyQuaternion(quaternion.setFromAxisAngle(axis, angle)));
  }
  applyMatrix3(m) {
    let x = this.x,
      y = this.y,
      z = this.z,
      e = m.elements;
    return (
      (this.x = e[0] * x + e[3] * y + e[6] * z),
      (this.y = e[1] * x + e[4] * y + e[7] * z),
      (this.z = e[2] * x + e[5] * y + e[8] * z),
      this
    );
  }
  applyMatrix4(m) {
    let x = this.x,
      y = this.y,
      z = this.z,
      e = m.elements,
      w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);
    return (
      (this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w),
      (this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w),
      (this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w),
      this
    );
  }
  applyQuaternion(q) {
    let x = this.x,
      y = this.y,
      z = this.z,
      qx = q.x,
      qy = q.y,
      qz = q.z,
      qw = q.w;
    if (0 == qx && 0 == qy && 0 == qz && 1 == qw) return this;
    let ix = qw * x + qy * z - qz * y,
      iy = qw * y + qz * x - qx * z,
      iz = qw * z + qx * y - qy * x,
      iw = -qx * x - qy * y - qz * z;
    return (
      (this.x = ix * qw + iw * -qx + iy * -qz - iz * -qy),
      (this.y = iy * qw + iw * -qy + iz * -qx - ix * -qz),
      (this.z = iz * qw + iw * -qz + ix * -qy - iy * -qx),
      this
    );
  }
  project(camera) {
    let matrix = this.M1 || new Matrix4();
    return (
      (this.M1 = matrix),
      matrix.multiplyMatrices(camera.projectionMatrix, matrix.getInverse(camera.matrixWorld)),
      this.applyMatrix4(matrix)
    );
  }
  unproject(camera) {
    let matrix = this.M1 || new Matrix4();
    return (
      (this.M1 = matrix),
      matrix.multiplyMatrices(camera.matrixWorld, matrix.getInverse(camera.projectionMatrix)),
      this.applyMatrix4(matrix)
    );
  }
  transformDirection(m) {
    let x = this.x,
      y = this.y,
      z = this.z,
      e = m.elements;
    return (
      (this.x = e[0] * x + e[4] * y + e[8] * z),
      (this.y = e[1] * x + e[5] * y + e[9] * z),
      (this.z = e[2] * x + e[6] * y + e[10] * z),
      this.normalize()
    );
  }
  divide(v) {
    return ((this.x /= v.x), (this.y /= v.y), (this.z /= v.z), this);
  }
  divideScalar(scalar) {
    return this.multiplyScalar(1 / scalar);
  }
  min(v) {
    return (
      (this.x = Math.min(this.x, v.x)),
      (this.y = Math.min(this.y, v.y)),
      (this.z = Math.min(this.z, v.z)),
      this
    );
  }
  max(v) {
    return (
      (this.x = Math.max(this.x, v.x)),
      (this.y = Math.max(this.y, v.y)),
      (this.z = Math.max(this.z, v.z)),
      this
    );
  }
  clamp(min, max) {
    return (
      (this.x = Math.max(min.x, Math.min(max.x, this.x))),
      (this.y = Math.max(min.y, Math.min(max.y, this.y))),
      (this.z = Math.max(min.z, Math.min(max.z, this.z))),
      this
    );
  }
  clampScalar(minVal, maxVal) {
    let min = new Vector3(),
      max = new Vector3();
    return (min.set(minVal, minVal, minVal), max.set(maxVal, maxVal, maxVal), this.clamp(min, max));
  }
  clampLength(min, max) {
    let length = this.length();
    return this.divideScalar(length || 1).multiplyScalar(Math.max(min, Math.min(max, length)));
  }
  floor() {
    return (
      (this.x = Math.floor(this.x)),
      (this.y = Math.floor(this.y)),
      (this.z = Math.floor(this.z)),
      this
    );
  }
  ceil() {
    return (
      (this.x = Math.ceil(this.x)),
      (this.y = Math.ceil(this.y)),
      (this.z = Math.ceil(this.z)),
      this
    );
  }
  round() {
    return (
      (this.x = Math.round(this.x)),
      (this.y = Math.round(this.y)),
      (this.z = Math.round(this.z)),
      this
    );
  }
  roundToZero() {
    return (
      (this.x = this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x)),
      (this.y = this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y)),
      (this.z = this.z < 0 ? Math.ceil(this.z) : Math.floor(this.z)),
      this
    );
  }
  negate() {
    return ((this.x = -this.x), (this.y = -this.y), (this.z = -this.z), this);
  }
  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }
  lengthSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }
  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
  }
  normalize() {
    return this.divideScalar(this.length() || 1);
  }
  setLength(length) {
    return this.normalize().multiplyScalar(length);
  }
  lerp(v, alpha, hz) {
    return (
      (this.x = Math.lerp(v.x, this.x, alpha, hz)),
      (this.y = Math.lerp(v.y, this.y, alpha, hz)),
      (this.z = Math.lerp(v.z, this.z, alpha, hz)),
      this
    );
  }
  lerpVectors(v1, v2, alpha) {
    return this.subVectors(v2, v1).multiplyScalar(alpha).add(v1);
  }
  cross(v) {
    return this.crossVectors(this, v);
  }
  crossVectors(a, b) {
    let ax = a.x,
      ay = a.y,
      az = a.z,
      bx = b.x,
      by = b.y,
      bz = b.z;
    return (
      (this.x = ay * bz - az * by),
      (this.y = az * bx - ax * bz),
      (this.z = ax * by - ay * bx),
      this
    );
  }
  projectOnVector(vector) {
    let scalar = vector.dot(this) / vector.lengthSq();
    return this.copy(vector).multiplyScalar(scalar);
  }
  projectOnPlane(planeNormal) {
    let v1 = this.V1 || new Vector3();
    return ((this.V1 = v1), v1.copy(this).projectOnVector(planeNormal), this.sub(v1));
  }
  reflect(normal) {
    let v1 = this.V1 || new Vector3();
    return ((this.V1 = v1), this.sub(v1.copy(normal).multiplyScalar(2 * this.dot(normal))));
  }
  angleTo(v) {
    let theta = this.dot(v) / Math.sqrt(this.lengthSq() * v.lengthSq());
    return Math.acos(Math.clamp(theta, -1, 1));
  }
  distanceTo(v) {
    return Math.sqrt(this.distanceToSquared(v));
  }
  distanceToSquared(v) {
    let dx = this.x - v.x,
      dy = this.y - v.y,
      dz = this.z - v.z;
    return dx * dx + dy * dy + dz * dz;
  }
  manhattanDistanceTo(v) {
    return Math.abs(this.x - v.x) + Math.abs(this.y - v.y) + Math.abs(this.z - v.z);
  }
  setFromCylindrical(c) {
    return (
      (this.x = c.radius * Math.sin(c.theta)),
      (this.y = c.y),
      (this.z = c.radius * Math.cos(c.theta)),
      this
    );
  }
  setFromMatrixPosition(m) {
    let e = m.elements;
    return ((this.x = e[12]), (this.y = e[13]), (this.z = e[14]), this);
  }
  setFromMatrixScale(m) {
    let sx = this.setFromMatrixColumn(m, 0).length(),
      sy = this.setFromMatrixColumn(m, 1).length(),
      sz = this.setFromMatrixColumn(m, 2).length();
    return ((this.x = sx), (this.y = sy), (this.z = sz), this);
  }
  setFromMatrixColumn(m, index) {
    return this.fromArray(m.elements, 4 * index);
  }
  setAngleRadius(a, r, dir = "xy") {
    return ((this[dir[0]] = Math.cos(a) * r), (this[dir[1]] = Math.sin(a) * r), this);
  }
  addAngleRadius(a, r, dir = "xy") {
    return ((this[dir[0]] += Math.cos(a) * r), (this[dir[1]] += Math.sin(a) * r), this);
  }
  equals(v) {
    return v.x === this.x && v.y === this.y && v.z === this.z;
  }
  fromArray(array, offset) {
    return (
      void 0 === offset && (offset = 0),
      (this.x = Number(array[offset])),
      (this.y = Number(array[offset + 1])),
      (this.z = Number(array[offset + 2])),
      this
    );
  }
  setFromSpherical(s) {
    this.setFromSphericalCoords(s.radius, s.phi, s.theta);
  }
  setFromSphericalCoords(radius, phi, theta) {
    let sinPhiRadius = Math.sin(phi) * radius;
    return (
      (this.x = sinPhiRadius * Math.sin(theta)),
      (this.y = Math.cos(phi) * radius),
      (this.z = sinPhiRadius * Math.cos(theta)),
      this
    );
  }
  toArray(array, offset) {
    return (
      void 0 === array && (array = []),
      void 0 === offset && (offset = 0),
      (array[offset] = this.x),
      (array[offset + 1] = this.y),
      (array[offset + 2] = this.z),
      array
    );
  }
  fromBufferAttribute(attribute, index) {
    return (
      attribute.isInterleaved
        ? ((this.x = attribute.data.array[attribute.offset + index * attribute.data.stride + 0]),
          (this.y = attribute.data.array[attribute.offset + index * attribute.data.stride + 1]),
          (this.z = attribute.data.array[attribute.offset + index * attribute.data.stride + 2]))
        : ((this.x = attribute.array[3 * index + 0]),
          (this.y = attribute.array[3 * index + 1]),
          (this.z = attribute.array[3 * index + 2])),
      this
    );
  }
}
