class Vector4 {
  constructor(x = 0, y = 0, z = 0, w = 0) {
    ((this.x = x), (this.y = y), (this.z = z), (this.w = w));
  }
  multiplyScalar(s) {
    return ((this.x *= s), (this.y *= s), (this.z *= s), (this.w *= s), this);
  }
  set(x, y, z, w) {
    return ((this.x = x), (this.y = y), (this.z = z), (this.w = w), this);
  }
  copy(v) {
    return ((this.x = v.x), (this.y = v.y), (this.z = v.z), (this.w = v.w), this);
  }
  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
  }
  lengthSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
  }
  equals(v) {
    return v.x === this.x && v.y === this.y && v.z === this.z && v.w === this.w;
  }
  lerp(v, alpha, hz) {
    return (
      (this.x = Math.lerp(v.x, this.x, alpha, hz)),
      (this.y = Math.lerp(v.y, this.y, alpha, hz)),
      (this.z = Math.lerp(v.z, this.z, alpha, hz)),
      (this.w = Math.lerp(v.w, this.w, alpha, hz)),
      this
    );
  }
  applyMatrix4(m) {
    let x = this.x,
      y = this.y,
      z = this.z,
      w = this.w,
      e = m.elements;
    return (
      (this.x = e[0] * x + e[4] * y + e[8] * z + e[12] * w),
      (this.y = e[1] * x + e[5] * y + e[9] * z + e[13] * w),
      (this.z = e[2] * x + e[6] * y + e[10] * z + e[14] * w),
      (this.w = e[3] * x + e[7] * y + e[11] * z + e[15] * w),
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
      (array[offset + 3] = this.w),
      array
    );
  }
  fromArray(array, offset) {
    return (
      void 0 === offset && (offset = 0),
      (this.x = Number(array[offset])),
      (this.y = Number(array[offset + 1])),
      (this.z = Number(array[offset + 2])),
      (this.w = Number(array[offset + 3])),
      this
    );
  }
  set width(v) {
    this.z = v;
  }
  set height(v) {
    this.w = v;
  }
  get width() {
    return this.z;
  }
  get height() {
    return this.w;
  }
  clone() {
    return new Vector4(this.x, this.y, this.z, this.w);
  }
}
