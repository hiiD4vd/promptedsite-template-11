class Cylindrical {
  constructor(radius = 1, theta = 0, y = 0) {
    ((this.radius = radius), (this.theta = theta), (this.y = y));
  }
  set(radius, theta, y) {
    return ((this.radius = radius), (this.theta = theta), (this.y = y), this);
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(other) {
    return ((this.radius = other.radius), (this.theta = other.theta), (this.y = other.y), this);
  }
  setFromVector3(vec3) {
    return (
      (this.radius = Math.sqrt(vec3.x * vec3.x + vec3.z * vec3.z)),
      (this.theta = Math.atan2(vec3.x, vec3.z)),
      (this.y = vec3.y),
      this
    );
  }
}
