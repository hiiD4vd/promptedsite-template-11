class Spherical {
  constructor(radius = 1, phi = 0, theta = 0) {
    ((this.radius = radius), (this.phi = phi), (this.theta = theta));
  }
  set(radius, phi, theta) {
    return ((this.radius = radius), (this.phi = phi), (this.theta = theta), this);
  }
  clone() {
    return new Spherical().copy(this);
  }
  copy(other) {
    return ((this.radius = other.radius), (this.phi = other.phi), (this.theta = other.theta), this);
  }
  makeSafe() {
    return ((this.phi = Math.max(1e-6, Math.min(Math.PI - 1e-6, this.phi))), this);
  }
  setFromVector3(vec3) {
    return (
      (this.radius = vec3.length()),
      0 === this.radius
        ? ((this.theta = 0), (this.phi = 0))
        : ((this.theta = Math.atan2(vec3.x, vec3.z)),
          (this.phi = Math.acos(Math.clamp(vec3.y / this.radius, -1, 1)))),
      this
    );
  }
}
