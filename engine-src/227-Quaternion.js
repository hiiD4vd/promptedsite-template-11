class Quaternion {
  constructor(x, y, z, w) {
    ((this._x = x || 0),
      (this._y = y || 0),
      (this._z = z || 0),
      (this._w = void 0 !== w ? w : 1),
      (this.isQuaternion = !0));
  }
  get x() {
    return this._x;
  }
  set x(v) {
    if (zUtils3D.LOCAL && isNaN(v)) return console.trace("Quaternion::NaN");
    let dirty = Math.abs(this._x - v) > Base3D.DIRTY_EPSILON;
    ((this._x = v), dirty && this.onChangeCallback());
  }
  get y() {
    return this._y;
  }
  set y(v) {
    if (zUtils3D.LOCAL && isNaN(v)) return console.trace("Quaternion::NaN");
    let dirty = Math.abs(this._y - v) > Base3D.DIRTY_EPSILON;
    ((this._y = v), dirty && this.onChangeCallback());
  }
  get z() {
    return this._z;
  }
  set z(v) {
    if (zUtils3D.LOCAL && isNaN(v)) return console.trace("Quaternion::NaN");
    let dirty = Math.abs(this._z - v) > Base3D.DIRTY_EPSILON;
    ((this._z = v), dirty && this.onChangeCallback());
  }
  get w() {
    return this._w;
  }
  set w(v) {
    if (zUtils3D.LOCAL && isNaN(v)) return console.trace("Quaternion::NaN");
    let dirty = Math.abs(this._w - v) > Base3D.DIRTY_EPSILON;
    ((this._w = v), dirty && this.onChangeCallback());
  }
  clone() {
    return new Quaternion(this._x, this._y, this._z, this._w);
  }
  copy(quaternion) {
    const abs = Math.abs;
    let dirty =
      abs(this._x - quaternion.x) > Base3D.DIRTY_EPSILON ||
      abs(this._y - quaternion.y) > Base3D.DIRTY_EPSILON ||
      abs(this._z - quaternion.z) > Base3D.DIRTY_EPSILON ||
      abs(this._w - quaternion.w) > Base3D.DIRTY_EPSILON;
    return (
      (this._x = quaternion.x),
      (this._y = quaternion.y),
      (this._z = quaternion.z),
      (this._w = quaternion.w),
      dirty && this.onChangeCallback(),
      this
    );
  }
  set(x, y, z, w) {
    const abs = Math.abs;
    let dirty =
      abs(this._x - x) > Base3D.DIRTY_EPSILON ||
      abs(this._y - y) > Base3D.DIRTY_EPSILON ||
      abs(this._z - z) > Base3D.DIRTY_EPSILON ||
      abs(this._w - w) > Base3D.DIRTY_EPSILON;
    ((this._x = x), (this._y = y), (this._z = z), (this._w = w), dirty && this.onChangeCallback());
  }
  setFromEuler(euler, update) {
    let x = euler._x,
      y = euler._y,
      z = euler._z,
      order = euler.order,
      cos = Math.cos,
      sin = Math.sin,
      c1 = cos(x / 2),
      c2 = cos(y / 2),
      c3 = cos(z / 2),
      s1 = sin(x / 2),
      s2 = sin(y / 2),
      s3 = sin(z / 2);
    return (
      "XYZ" === order
        ? ((this._x = s1 * c2 * c3 + c1 * s2 * s3),
          (this._y = c1 * s2 * c3 - s1 * c2 * s3),
          (this._z = c1 * c2 * s3 + s1 * s2 * c3),
          (this._w = c1 * c2 * c3 - s1 * s2 * s3))
        : "YXZ" === order
          ? ((this._x = s1 * c2 * c3 + c1 * s2 * s3),
            (this._y = c1 * s2 * c3 - s1 * c2 * s3),
            (this._z = c1 * c2 * s3 - s1 * s2 * c3),
            (this._w = c1 * c2 * c3 + s1 * s2 * s3))
          : "ZXY" === order
            ? ((this._x = s1 * c2 * c3 - c1 * s2 * s3),
              (this._y = c1 * s2 * c3 + s1 * c2 * s3),
              (this._z = c1 * c2 * s3 + s1 * s2 * c3),
              (this._w = c1 * c2 * c3 - s1 * s2 * s3))
            : "ZYX" === order
              ? ((this._x = s1 * c2 * c3 - c1 * s2 * s3),
                (this._y = c1 * s2 * c3 + s1 * c2 * s3),
                (this._z = c1 * c2 * s3 - s1 * s2 * c3),
                (this._w = c1 * c2 * c3 + s1 * s2 * s3))
              : "YZX" === order
                ? ((this._x = s1 * c2 * c3 + c1 * s2 * s3),
                  (this._y = c1 * s2 * c3 + s1 * c2 * s3),
                  (this._z = c1 * c2 * s3 - s1 * s2 * c3),
                  (this._w = c1 * c2 * c3 - s1 * s2 * s3))
                : "XZY" === order &&
                  ((this._x = s1 * c2 * c3 - c1 * s2 * s3),
                  (this._y = c1 * s2 * c3 - s1 * c2 * s3),
                  (this._z = c1 * c2 * s3 + s1 * s2 * c3),
                  (this._w = c1 * c2 * c3 + s1 * s2 * s3)),
      !1 !== update && this.onChangeCallback(),
      this
    );
  }
  setFromAxisAngle(axis, angle) {
    let halfAngle = angle / 2,
      s = Math.sin(halfAngle);
    return (
      (this._x = axis.x * s),
      (this._y = axis.y * s),
      (this._z = axis.z * s),
      (this._w = Math.cos(halfAngle)),
      this.onChangeCallback(),
      this
    );
  }
  setFromRotationMatrix(m) {
    let s,
      te = m.elements,
      m11 = te[0],
      m12 = te[4],
      m13 = te[8],
      m21 = te[1],
      m22 = te[5],
      m23 = te[9],
      m31 = te[2],
      m32 = te[6],
      m33 = te[10],
      trace = m11 + m22 + m33;
    return (
      trace > 0
        ? ((s = 0.5 / Math.sqrt(trace + 1)),
          (this._w = 0.25 / s),
          (this._x = (m32 - m23) * s),
          (this._y = (m13 - m31) * s),
          (this._z = (m21 - m12) * s))
        : m11 > m22 && m11 > m33
          ? ((s = 2 * Math.sqrt(1 + m11 - m22 - m33)),
            (this._w = (m32 - m23) / s),
            (this._x = 0.25 * s),
            (this._y = (m12 + m21) / s),
            (this._z = (m13 + m31) / s))
          : m22 > m33
            ? ((s = 2 * Math.sqrt(1 + m22 - m11 - m33)),
              (this._w = (m13 - m31) / s),
              (this._x = (m12 + m21) / s),
              (this._y = 0.25 * s),
              (this._z = (m23 + m32) / s))
            : ((s = 2 * Math.sqrt(1 + m33 - m11 - m22)),
              (this._w = (m21 - m12) / s),
              (this._x = (m13 + m31) / s),
              (this._y = (m23 + m32) / s),
              (this._z = 0.25 * s)),
      this.onChangeCallback(),
      this
    );
  }
  setFromUnitVectors(vFrom, vTo) {
    let v1 = this.V1 || new Vector3();
    this.V1 = v1;
    let r = vFrom.dot(vTo) + 1;
    return (
      r < 1e-6
        ? ((r = 0),
          Math.abs(vFrom.x) > Math.abs(vFrom.z)
            ? v1.set(-vFrom.y, vFrom.x, 0)
            : v1.set(0, -vFrom.z, vFrom.y))
        : v1.crossVectors(vFrom, vTo),
      (this._x = v1.x),
      (this._y = v1.y),
      (this._z = v1.z),
      (this._w = r),
      this.normalize()
    );
  }
  inverse() {
    return this.conjugate();
  }
  conjugate() {
    return ((this._x *= -1), (this._y *= -1), (this._z *= -1), this.onChangeCallback(), this);
  }
  dot(v) {
    const w = void 0 === v._w ? 1 : v._w;
    return this._x * v._x + this._y * v._y + this._z * v._z + this._w * w;
  }
  lengthSq() {
    return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w;
  }
  length() {
    return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w);
  }
  normalize() {
    let l = this.length();
    return (
      0 === l
        ? ((this._x = 0), (this._y = 0), (this._z = 0), (this._w = 1))
        : ((l = 1 / l),
          (this._x = this._x * l),
          (this._y = this._y * l),
          (this._z = this._z * l),
          (this._w = this._w * l)),
      this.onChangeCallback(),
      this
    );
  }
  multiply(q) {
    return this.multiplyQuaternions(this, q);
  }
  premultiply(q) {
    return this.multiplyQuaternions(q, this);
  }
  multiplyQuaternions(a, b) {
    let qax = a._x,
      qay = a._y,
      qaz = a._z,
      qaw = a._w,
      qbx = b._x,
      qby = b._y,
      qbz = b._z,
      qbw = b._w;
    return (
      (this._x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby),
      (this._y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz),
      (this._z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx),
      (this._w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz),
      this.onChangeCallback(),
      this
    );
  }
  slerp(qb, t, hz = !0) {
    if (0 === (t = hz ? Math.framerateNormalizeLerpAlpha(t) : Math.clamp(t))) return this;
    if (1 === t) return this.copy(qb);
    let x = this._x,
      y = this._y,
      z = this._z,
      w = this._w,
      cosHalfTheta = w * qb._w + x * qb._x + y * qb._y + z * qb._z;
    if (
      (cosHalfTheta < 0
        ? ((this._w = -qb._w),
          (this._x = -qb._x),
          (this._y = -qb._y),
          (this._z = -qb._z),
          (cosHalfTheta = -cosHalfTheta))
        : this.copy(qb),
      cosHalfTheta >= 1)
    )
      return ((this._w = w), (this._x = x), (this._y = y), (this._z = z), this);
    let sinHalfTheta = Math.sqrt(1 - cosHalfTheta * cosHalfTheta);
    if (Math.abs(sinHalfTheta) < 0.001)
      return (
        (this._w = 0.5 * (w + this._w)),
        (this._x = 0.5 * (x + this._x)),
        (this._y = 0.5 * (y + this._y)),
        (this._z = 0.5 * (z + this._z)),
        this
      );
    let halfTheta = Math.atan2(sinHalfTheta, cosHalfTheta),
      ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta,
      ratioB = Math.sin(t * halfTheta) / sinHalfTheta;
    return (
      (this._w = w * ratioA + this._w * ratioB),
      (this._x = x * ratioA + this._x * ratioB),
      (this._y = y * ratioA + this._y * ratioB),
      (this._z = z * ratioA + this._z * ratioB),
      this.onChangeCallback(),
      this
    );
  }
  equals(quaternion) {
    return (
      quaternion._x === this._x &&
      quaternion._y === this._y &&
      quaternion._z === this._z &&
      quaternion._w === this._w
    );
  }
  fromArray(array, offset) {
    return (
      void 0 === offset && (offset = 0),
      (this._x = array[offset]),
      (this._y = array[offset + 1]),
      (this._z = array[offset + 2]),
      (this._w = array[offset + 3]),
      this.onChangeCallback(),
      this
    );
  }
  toArray(array, offset) {
    return (
      void 0 === array && (array = []),
      void 0 === offset && (offset = 0),
      (array[offset] = this._x),
      (array[offset + 1] = this._y),
      (array[offset + 2] = this._z),
      (array[offset + 3] = this._w),
      array
    );
  }
  onChange(callback) {
    this.onChangeCallback = callback;
  }
  onChangeCallback() {}
}
