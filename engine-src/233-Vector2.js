class Vector2 {
  constructor(x = 0, y = 0) {
    ((this.x = x), (this.y = y));
  }
  set(x, y) {
    return ((this.x = x), (this.y = y), this);
  }
  get width() {
    return this.x;
  }
  get height() {
    return this.y;
  }
  setScalar(s) {
    return ((this.x = this.y = s), this);
  }
  clone() {
    return new Vector2(this.x, this.y);
  }
  copy(v) {
    return ((this.x = v.x), (this.y = v.y), this);
  }
  add(v) {
    return ((this.x += v.x), (this.y += v.y), this);
  }
  addScalar(s) {
    return ((this.x += s), (this.y += s), this);
  }
  addVectors(a, b) {
    return ((this.x = a.x + b.x), (this.y = a.y + b.y), this);
  }
  addScaledVector(v, s) {
    return ((this.x += v.x * s), (this.y += v.y * s), this);
  }
  sub(v) {
    return ((this.x -= v.x), (this.y -= v.y), this);
  }
  subScalar(s) {
    return ((this.x -= s), (this.y -= s), this);
  }
  subVectors(a, b) {
    return ((this.x = a.x - b.x), (this.y = a.y - b.y), this);
  }
  multiply(v) {
    return ((this.x *= v.x), (this.y *= v.y), this);
  }
  multiplyScalar(scalar) {
    return ((this.x *= scalar), (this.y *= scalar), this);
  }
  divide(v) {
    return ((this.x /= v.x), (this.y /= v.y), this);
  }
  divideScalar(scalar) {
    return this.multiplyScalar(1 / scalar);
  }
  applyMatrix3(m) {
    let x = this.x,
      y = this.y,
      e = m.elements;
    return ((this.x = e[0] * x + e[3] * y + e[6]), (this.y = e[1] * x + e[4] * y + e[7]), this);
  }
  min(v) {
    return ((this.x = Math.min(this.x, v.x)), (this.y = Math.min(this.y, v.y)), this);
  }
  max(v) {
    return ((this.x = Math.max(this.x, v.x)), (this.y = Math.max(this.y, v.y)), this);
  }
  clamp(min, max) {
    return (
      (this.x = Math.max(min.x, Math.min(max.x, this.x))),
      (this.y = Math.max(min.y, Math.min(max.y, this.y))),
      this
    );
  }
  clampScalar(minVal, maxVal) {
    let min = new Vector2(),
      max = new Vector2();
    return (min.set(minVal, minVal), max.set(maxVal, maxVal), this.clamp(min, max));
  }
  clampLength(min, max) {
    let length = this.length();
    return this.divideScalar(length || 1).multiplyScalar(Math.max(min, Math.min(max, length)));
  }
  floor() {
    return ((this.x = Math.floor(this.x)), (this.y = Math.floor(this.y)), this);
  }
  ceil() {
    return ((this.x = Math.ceil(this.x)), (this.y = Math.ceil(this.y)), this);
  }
  round() {
    return ((this.x = Math.round(this.x)), (this.y = Math.round(this.y)), this);
  }
  roundToZero() {
    return (
      (this.x = this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x)),
      (this.y = this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y)),
      this
    );
  }
  negate() {
    return ((this.x = -this.x), (this.y = -this.y), this);
  }
  dot(v) {
    return this.x * v.x + this.y * v.y;
  }
  lengthSq() {
    return this.x * this.x + this.y * this.y;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y);
  }
  normalize() {
    return this.divideScalar(this.length() || 1);
  }
  angle() {
    let angle = Math.atan2(this.y, this.x);
    return (angle < 0 && (angle += 2 * Math.PI), angle);
  }
  angleTo(a, b) {
    return (b || (b = this), Math.atan2(a.y - b.y, a.x - b.x));
  }
  distanceTo(v) {
    return Math.sqrt(this.distanceToSquared(v));
  }
  distanceToSquared(v) {
    let dx = this.x - v.x,
      dy = this.y - v.y;
    return dx * dx + dy * dy;
  }
  manhattanDistanceTo(v) {
    return Math.abs(this.x - v.x) + Math.abs(this.y - v.y);
  }
  setLength(length) {
    return this.normalize().multiplyScalar(length);
  }
  lerp(v, alpha, hz) {
    return (
      (this.x = Math.lerp(v.x, this.x, alpha, hz)),
      (this.y = Math.lerp(v.y, this.y, alpha, hz)),
      this
    );
  }
  lerpVectors(v1, v2, alpha) {
    return this.subVectors(v2, v1).multiplyScalar(alpha).add(v1);
  }
  equals(v) {
    return v.x === this.x && v.y === this.y;
  }
  setAngleRadius(a, r) {
    return ((this.x = Math.cos(a) * r), (this.y = Math.sin(a) * r), this);
  }
  addAngleRadius(a, r) {
    return ((this.x += Math.cos(a) * r), (this.y += Math.sin(a) * r), this);
  }
  fromArray(array, offset) {
    return (
      void 0 === offset && (offset = 0),
      (this.x = Number(array[offset])),
      (this.y = Number(array[offset + 1])),
      this
    );
  }
  toArray(array, offset) {
    return (
      void 0 === array && (array = []),
      void 0 === offset && (offset = 0),
      (array[offset] = this.x),
      (array[offset + 1] = this.y),
      array
    );
  }
  rotateAround(center, angle) {
    let c = Math.cos(angle),
      s = Math.sin(angle),
      x = this.x - center.x,
      y = this.y - center.y;
    return ((this.x = x * c - y * s + center.x), (this.y = x * s + y * c + center.y), this);
  }
  fromBufferAttribute(attribute, index) {
    ((this.x = attribute.array[2 * index + 0]), (this.y = attribute.array[2 * index + 1]));
  }
}
