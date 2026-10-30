class Vector3D {
  constructor(x, y, z) {
    ((this._x = x || 0), (this._y = y || 0), (this._z = z || 0));
  }
  get x() {
    return this._x;
  }
  set x(v) {
    if (zUtils3D.LOCAL && isNaN(v)) return console.trace("Vector3D::NaN");
    let dirty = Math.abs(this._x - v) > Base3D.DIRTY_EPSILON;
    ((this._x = v), dirty && this.onChangeCallback());
  }
  get y() {
    return this._y;
  }
  set y(v) {
    if (zUtils3D.LOCAL && isNaN(v)) return console.trace("Vector3D::NaN");
    let dirty = Math.abs(this._y - v) > Base3D.DIRTY_EPSILON;
    ((this._y = v), dirty && this.onChangeCallback());
  }
  get z() {
    return this._z;
  }
  set z(v) {
    if (zUtils3D.LOCAL && isNaN(v)) return console.trace("Vector3D::NaN");
    let dirty = Math.abs(this._z - v) > Base3D.DIRTY_EPSILON;
    ((this._z = v), dirty && this.onChangeCallback());
  }
  onChangeCallback() {}
  set(x = 0, y = 0, z = 0) {
    const abs = Math.abs;
    let dirty =
      abs(this._x - x) > Base3D.DIRTY_EPSILON ||
      abs(this._y - y) > Base3D.DIRTY_EPSILON ||
      abs(this._z - z) > Base3D.DIRTY_EPSILON;
    return ((this._x = x), (this._y = y), (this._z = z), dirty && this.onChangeCallback(), this);
  }
  setScalar(scalar) {
    const abs = Math.abs;
    let dirty =
      abs(this._x - scalar) > Base3D.DIRTY_EPSILON ||
      abs(this._y - scalar) > Base3D.DIRTY_EPSILON ||
      abs(this._z - scalar) > Base3D.DIRTY_EPSILON;
    return (
      (this._x = scalar),
      (this._y = scalar),
      (this._z = scalar),
      dirty && this.onChangeCallback(),
      this
    );
  }
  clone() {
    return new Vector3(this._x, this._y, this._z);
  }
  copy(v) {
    const abs = Math.abs;
    let dirty =
      abs(this._x - v.x) > Base3D.DIRTY_EPSILON ||
      abs(this._y - v.y) > Base3D.DIRTY_EPSILON ||
      abs(this._z - v.z) > Base3D.DIRTY_EPSILON;
    return (
      (this._x = v.x),
      (this._y = v.y),
      (this._z = v.z),
      dirty && this.onChangeCallback(),
      this
    );
  }
  add(v) {
    let nx = this._x + v.x,
      ny = this._y + v.y,
      nz = this._z + v.z;
    const abs = Math.abs;
    let dirty =
      abs(this._x - nx) > Base3D.DIRTY_EPSILON ||
      abs(this._y - ny) > Base3D.DIRTY_EPSILON ||
      abs(this._z - nz) > Base3D.DIRTY_EPSILON;
    return ((this._x = nx), (this._y = ny), (this._z = nz), dirty && this.onChangeCallback(), this);
  }
  addScalar(s) {
    let nx = this._x + s,
      ny = this._y + s,
      nz = this._z + s;
    const abs = Math.abs;
    let dirty =
      abs(this._x - nx) > Base3D.DIRTY_EPSILON ||
      abs(this._y - ny) > Base3D.DIRTY_EPSILON ||
      abs(this._z - nz) > Base3D.DIRTY_EPSILON;
    return ((this._x = nx), (this._y = ny), (this._z = nz), dirty && this.onChangeCallback(), this);
  }
  addVectors(a, b) {
    return (
      (this._x = a.x + b.x),
      (this._y = a.y + b.y),
      (this._z = a.z + b.z),
      this.onChangeCallback(),
      this
    );
  }
  addScaledVector(v, s) {
    return (
      (this._x += v.x * s),
      (this._y += v.y * s),
      (this._z += v.z * s),
      this.onChangeCallback(),
      this
    );
  }
  sub(v) {
    let nx = this._x - v.x,
      ny = this._y - v.y,
      nz = this._z - v.z;
    const abs = Math.abs;
    let dirty =
      abs(this._x - nx) > Base3D.DIRTY_EPSILON ||
      abs(this._y - ny) > Base3D.DIRTY_EPSILON ||
      abs(this._z - nz) > Base3D.DIRTY_EPSILON;
    return ((this._x = nx), (this._y = ny), (this._z = nz), dirty && this.onChangeCallback(), this);
  }
  subScalar(s) {
    let nx = this._x - s,
      ny = this._y - s,
      nz = this._z - s;
    const abs = Math.abs;
    let dirty =
      abs(this._x - nx) > Base3D.DIRTY_EPSILON ||
      abs(this._y - ny) > Base3D.DIRTY_EPSILON ||
      abs(this._z - nz) > Base3D.DIRTY_EPSILON;
    return ((this._x = nx), (this._y = ny), (this._z = nz), dirty && this.onChangeCallback(), this);
  }
  subVectors(a, b) {
    return (
      (this._x = a.x - b.x),
      (this._y = a.y - b.y),
      (this._z = a.z - b.z),
      this.onChangeCallback(),
      this
    );
  }
  multiply(v) {
    let nx = this._x * v.x,
      ny = this._y * v.y,
      nz = this._z * v.z;
    const abs = Math.abs;
    let dirty =
      abs(this._x - nx) > Base3D.DIRTY_EPSILON ||
      abs(this._y - ny) > Base3D.DIRTY_EPSILON ||
      abs(this._z - nz) > Base3D.DIRTY_EPSILON;
    return ((this._x = nx), (this._y = ny), (this._z = nz), dirty && this.onChangeCallback(), this);
  }
  multiplyScalar(scalar) {
    let nx = this._x * scalar,
      ny = this._y * scalar,
      nz = this._z * scalar;
    const abs = Math.abs;
    let dirty =
      abs(this._x - nx) > Base3D.DIRTY_EPSILON ||
      abs(this._y - ny) > Base3D.DIRTY_EPSILON ||
      abs(this._z - nz) > Base3D.DIRTY_EPSILON;
    return ((this._x = nx), (this._y = ny), (this._z = nz), dirty && this.onChangeCallback(), this);
  }
  multiplyVectors(a, b) {
    return (
      (this._x = a.x * b.x),
      (this._y = a.y * b.y),
      (this._z = a.z * b.z),
      this.onChangeCallback(),
      this
    );
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
    let x = this._x,
      y = this._y,
      z = this._z,
      e = m.elements;
    return (
      (this._x = e[0] * x + e[3] * y + e[6] * z),
      (this._y = e[1] * x + e[4] * y + e[7] * z),
      (this._z = e[2] * x + e[5] * y + e[8] * z),
      this.onChangeCallback(),
      this
    );
  }
  applyMatrix4(m) {
    let x = this._x,
      y = this._y,
      z = this._z,
      e = m.elements,
      w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);
    return (
      (this._x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w),
      (this._y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w),
      (this._z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w),
      this.onChangeCallback(),
      this
    );
  }
  applyQuaternion(q) {
    let x = this._x,
      y = this._y,
      z = this._z,
      qx = q.x,
      qy = q.y,
      qz = q.z,
      qw = q.w,
      ix = qw * x + qy * z - qz * y,
      iy = qw * y + qz * x - qx * z,
      iz = qw * z + qx * y - qy * x,
      iw = -qx * x - qy * y - qz * z;
    return (
      (this._x = ix * qw + iw * -qx + iy * -qz - iz * -qy),
      (this._y = iy * qw + iw * -qy + iz * -qx - ix * -qz),
      (this._z = iz * qw + iw * -qz + ix * -qy - iy * -qx),
      this.onChangeCallback(),
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
    let x = this._x,
      y = this._y,
      z = this._z,
      e = m.elements;
    return (
      (this._x = e[0] * x + e[4] * y + e[8] * z),
      (this._y = e[1] * x + e[5] * y + e[9] * z),
      (this._z = e[2] * x + e[6] * y + e[10] * z),
      this.onChangeCallback(),
      this.normalize()
    );
  }
  divide(v) {
    return ((this._x /= v.x), (this._y /= v.y), (this._z /= v.z), this.onChangeCallback(), this);
  }
  divideScalar(scalar) {
    return this.multiplyScalar(1 / scalar);
  }
  min(v) {
    return (
      (this._x = Math.min(this._x, v.x)),
      (this._y = Math.min(this._y, v.y)),
      (this._z = Math.min(this._z, v.z)),
      this.onChangeCallback(),
      this
    );
  }
  max(v) {
    return (
      (this._x = Math.max(this._x, v.x)),
      (this._y = Math.max(this._y, v.y)),
      (this._z = Math.max(this._z, v.z)),
      this
    );
  }
  clamp(min, max) {
    return (
      (this._x = Math.max(min.x, Math.min(max.x, this._x))),
      (this._y = Math.max(min.y, Math.min(max.y, this._y))),
      (this._z = Math.max(min.z, Math.min(max.z, this._z))),
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
      (this._x = Math.floor(this._x)),
      (this._y = Math.floor(this._y)),
      (this._z = Math.floor(this._z)),
      this.onChangeCallback(),
      this
    );
  }
  ceil() {
    return (
      (this._x = Math.ceil(this._x)),
      (this._y = Math.ceil(this._y)),
      (this._z = Math.ceil(this._z)),
      this.onChangeCallback(),
      this
    );
  }
  round() {
    return (
      (this._x = Math.round(this._x)),
      (this._y = Math.round(this._y)),
      (this._z = Math.round(this._z)),
      this.onChangeCallback(),
      this
    );
  }
  roundToZero() {
    return (
      (this._x = this._x < 0 ? Math.ceil(this._x) : Math.floor(this._x)),
      (this._y = this._y < 0 ? Math.ceil(this._y) : Math.floor(this._y)),
      (this._z = this._z < 0 ? Math.ceil(this._z) : Math.floor(this._z)),
      this.onChangeCallback(),
      this
    );
  }
  negate() {
    return (
      (this._x = -this._x),
      (this._y = -this._y),
      (this._z = -this._z),
      this.onChangeCallback(),
      this
    );
  }
  dot(v) {
    return this._x * v.x + this._y * v.y + this._z * v.z;
  }
  lengthSq() {
    return this._x * this._x + this._y * this._y + this._z * this._z;
  }
  length() {
    return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z);
  }
  manhattanLength() {
    return Math.abs(this._x) + Math.abs(this._y) + Math.abs(this._z);
  }
  normalize() {
    return (this.onChangeCallback(), this.divideScalar(this.length() || 1));
  }
  setLength(length) {
    return (this.onChangeCallback(), this.normalize().multiplyScalar(length));
  }
  lerp(v, alpha, hz) {
    return (
      (this._x = Math.lerp(v.x, this._x, alpha, hz)),
      (this._y = Math.lerp(v.y, this._y, alpha, hz)),
      (this._z = Math.lerp(v.z, this._z, alpha, hz)),
      this.onChangeCallback(),
      this
    );
  }
  lerpVectors(v1, v2, alpha) {
    return (this.onChangeCallback(), this.subVectors(v2, v1).multiplyScalar(alpha).add(v1));
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
      (this._x = ay * bz - az * by),
      (this._y = az * bx - ax * bz),
      (this._z = ax * by - ay * bx),
      this.onChangeCallback(),
      this
    );
  }
  projectOnVector(vector) {
    let scalar = vector.dot(this) / vector.lengthSq();
    return this.copy(vector).multiplyScalar(scalar);
  }
  projectOnPlane(planeNormal) {
    let v1 = this.V1 || new Vector3();
    return (
      (this.V1 = v1),
      this.onChangeCallback(),
      v1.copy(this).projectOnVector(planeNormal),
      this.sub(v1)
    );
  }
  reflect(normal) {
    let v1 = this.V1 || new Vector3();
    return (
      (this.V1 = v1),
      this.onChangeCallback(),
      this.sub(v1.copy(normal).multiplyScalar(2 * this.dot(normal)))
    );
  }
  angleTo(v) {
    let theta = this.dot(v) / Math.sqrt(this.lengthSq() * v.lengthSq());
    return Math.acos(Math.clamp(theta, -1, 1));
  }
  distanceTo(v) {
    return Math.sqrt(this.distanceToSquared(v));
  }
  distanceToSquared(v) {
    let dx = this._x - v.x,
      dy = this._y - v.y,
      dz = this._z - v.z;
    return dx * dx + dy * dy + dz * dz;
  }
  manhattanDistanceTo(v) {
    return Math.abs(this._x - v.x) + Math.abs(this._y - v.y) + Math.abs(this._z - v.z);
  }
  setFromSpherical(s) {
    let sinPhiRadius = Math.sin(s.phi) * s.radius;
    return (
      (this._x = sinPhiRadius * Math.sin(s.theta)),
      (this._y = Math.cos(s.phi) * s.radius),
      (this._z = sinPhiRadius * Math.cos(s.theta)),
      this.onChangeCallback(),
      this
    );
  }
  setFromCylindrical(c) {
    return (
      (this._x = c.radius * Math.sin(c.theta)),
      (this._y = c.y),
      (this._z = c.radius * Math.cos(c.theta)),
      this.onChangeCallback(),
      this
    );
  }
  setFromMatrixPosition(m) {
    let e = m.elements;
    return ((this._x = e[12]), (this._y = e[13]), (this._z = e[14]), this.onChangeCallback(), this);
  }
  setFromMatrixScale(m) {
    let sx = this.setFromMatrixColumn(m, 0).length(),
      sy = this.setFromMatrixColumn(m, 1).length(),
      sz = this.setFromMatrixColumn(m, 2).length();
    return (this.onChangeCallback(), (this._x = sx), (this._y = sy), (this._z = sz), this);
  }
  setFromMatrixColumn(m, index) {
    return (this.onChangeCallback(), this.fromArray(m.elements, 4 * index));
  }
  equals(v) {
    return v.x === this._x && v.y === this._y && v.z === this._z;
  }
  fromArray(array, offset) {
    return (
      void 0 === offset && (offset = 0),
      (this._x = Number(array[offset])),
      (this._y = Number(array[offset + 1])),
      (this._z = Number(array[offset + 2])),
      this.onChangeCallback(),
      this
    );
  }
  toArray(array, offset) {
    return (
      void 0 === array && (array = []),
      void 0 === offset && (offset = 0),
      (array[offset] = Number(this._x)),
      (array[offset + 1] = Number(this._y)),
      (array[offset + 2] = Number(this._z)),
      array
    );
  }
  fromBufferAttribute(attribute, index) {
    ((this._x = attribute.array[3 * index + 0]),
      (this._y = attribute.array[3 * index + 1]),
      (this._z = attribute.array[3 * index + 2]),
      this.onChangeCallback());
  }
  onChange(callback) {
    this.onChangeCallback = callback;
  }
  onChangeCallback() {}
}
