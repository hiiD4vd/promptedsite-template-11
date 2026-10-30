class Euler {
  constructor(x, y, z, order) {
    ((this._x = x || 0),
      (this._y = y || 0),
      (this._z = z || 0),
      (this._order = order || "XYZ"),
      (this.isEuler = !0));
  }
  get x() {
    return this._x;
  }
  set x(v) {
    if (zUtils3D.LOCAL && isNaN(v)) return console.trace("Euler::NaN");
    let dirty = Math.abs(this._x - v) > Base3D.DIRTY_EPSILON;
    ((this._x = v), dirty && this.onChangeCallback());
  }
  get y() {
    return this._y;
  }
  set y(v) {
    if (zUtils3D.LOCAL && isNaN(v)) return console.trace("Euler::NaN");
    let dirty = Math.abs(this._y - v) > Base3D.DIRTY_EPSILON;
    ((this._y = v), dirty && this.onChangeCallback());
  }
  get z() {
    return this._z;
  }
  set z(v) {
    if (zUtils3D.LOCAL && isNaN(v)) return console.trace("Euler::NaN");
    let dirty = Math.abs(this._z - v) > Base3D.DIRTY_EPSILON;
    ((this._z = v), dirty && this.onChangeCallback());
  }
  set order(value) {
    ((this._order = value), this.onChangeCallback());
  }
  get order() {
    return this._order;
  }
  set(x, y, z, order) {
    return (
      (this._x = x),
      (this._y = y),
      (this._z = z),
      (this._order = order || this._order),
      this.onChangeCallback(),
      this
    );
  }
  clone() {
    return new Euler(this._x, this._y, this._z, this._order);
  }
  copy(euler) {
    return (
      (this._x = euler.x),
      (this._y = euler.y),
      (this._z = euler.z),
      euler._order && (this._order = euler._order),
      this.onChangeCallback(),
      this
    );
  }
  setFromRotationMatrix(m, order, update) {
    let clamp = Math.clamp,
      te = m.elements,
      m11 = te[0],
      m12 = te[4],
      m13 = te[8],
      m21 = te[1],
      m22 = te[5],
      m23 = te[9],
      m31 = te[2],
      m32 = te[6],
      m33 = te[10];
    return (
      "XYZ" === (order = order || this._order)
        ? ((this._y = Math.asin(clamp(m13, -1, 1))),
          Math.abs(m13) < 1 - Base3D.DIRTY_EPSILON
            ? ((this._x = Math.atan2(-m23, m33)), (this._z = Math.atan2(-m12, m11)))
            : ((this._x = Math.atan2(m32, m22)), (this._z = 0)))
        : "YXZ" === order
          ? ((this._x = Math.asin(-clamp(m23, -1, 1))),
            Math.abs(m23) < 1 - Base3D.DIRTY_EPSILON
              ? ((this._y = Math.atan2(m13, m33)), (this._z = Math.atan2(m21, m22)))
              : ((this._y = Math.atan2(-m31, m11)), (this._z = 0)))
          : "ZXY" === order
            ? ((this._x = Math.asin(clamp(m32, -1, 1))),
              Math.abs(m32) < 1 - Base3D.DIRTY_EPSILON
                ? ((this._y = Math.atan2(-m31, m33)), (this._z = Math.atan2(-m12, m22)))
                : ((this._y = 0), (this._z = Math.atan2(m21, m11))))
            : "ZYX" === order
              ? ((this._y = Math.asin(-clamp(m31, -1, 1))),
                Math.abs(m31) < 1 - Base3D.DIRTY_EPSILON
                  ? ((this._x = Math.atan2(m32, m33)), (this._z = Math.atan2(m21, m11)))
                  : ((this._x = 0), (this._z = Math.atan2(-m12, m22))))
              : "YZX" === order
                ? ((this._z = Math.asin(clamp(m21, -1, 1))),
                  Math.abs(m21) < 1 - Base3D.DIRTY_EPSILON
                    ? ((this._x = Math.atan2(-m23, m22)), (this._y = Math.atan2(-m31, m11)))
                    : ((this._x = 0), (this._y = Math.atan2(m13, m33))))
                : "XZY" === order &&
                  ((this._z = Math.asin(-clamp(m12, -1, 1))),
                  Math.abs(m12) < 1 - Base3D.DIRTY_EPSILON
                    ? ((this._x = Math.atan2(m32, m22)), (this._y = Math.atan2(m13, m11)))
                    : ((this._x = Math.atan2(-m23, m33)), (this._y = 0))),
      (this._order = order),
      !1 !== update && this.onChangeCallback(),
      this
    );
  }
  setFromQuaternion(q, order, update) {
    let matrix = this.M1 || new Matrix4();
    return (
      (this.M1 = matrix),
      matrix.makeRotationFromQuaternion(q),
      this.setFromRotationMatrix(matrix, order, update)
    );
  }
  setFromVector3(v, order) {
    return this.set(v.x, v.y, v.z, order || this._order);
  }
  reorder(newOrder) {
    let q = this.Q1 || new Quaternion();
    return ((this.Q1 = q), q.setFromEuler(this), this.setFromQuaternion(q, newOrder));
  }
  lerp(euler, alpha) {
    ((this._x += (euler._x - this._x) * alpha),
      (this._y += (euler._y - this._y) * alpha),
      (this._z += (euler._z - this._z) * alpha),
      this.onChangeCallback());
  }
  equals(euler) {
    return (
      euler._x === this._x &&
      euler._y === this._y &&
      euler._z === this._z &&
      euler._order === this._order
    );
  }
  fromArray(array) {
    return (
      (this._x = array[0]),
      (this._y = array[1]),
      (this._z = array[2]),
      void 0 !== array[3] && (this._order = array[3]),
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
      (array[offset + 3] = this._order),
      array
    );
  }
  toVector3(optionalResult) {
    return optionalResult
      ? optionalResult.set(this._x, this._y, this._z)
      : new Vector3(this._x, this._y, this._z);
  }
  onChange(callback) {
    this.onChangeCallback = callback;
  }
  onChangeCallback() {}
}
