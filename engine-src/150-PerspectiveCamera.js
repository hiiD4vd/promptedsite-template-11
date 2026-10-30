class PerspectiveCamera extends CameraBase3D {
  constructor(fov, aspect, near, far) {
    (super(),
      (this.type = "PerspectiveCamera"),
      (this.fov = fov || 50),
      (this.zoom = 1),
      (this.near = near || 0.1),
      (this.far = far || 2e3),
      (this.focus = 10),
      (this.aspect = aspect || 1),
      (this.filmGauge = 35),
      (this.filmOffset = 0),
      this.updateProjectionMatrix());
  }
  clone() {
    return new PerspectiveCamera().copy(this);
  }
  copy(source, recursive) {
    return (
      CameraBase3D.prototype.copy.call(this, source, recursive),
      (this.fov = source.fov),
      (this.zoom = source.zoom),
      (this.near = source.near),
      (this.far = source.far),
      (this.focus = source.focus),
      (this.aspect = source.aspect),
      (this.filmGauge = source.filmGauge),
      (this.filmOffset = source.filmOffset),
      this
    );
  }
  setFocalLength(focalLength) {
    let vExtentSlope = (0.5 * this.getFilmHeight()) / focalLength;
    ((this.fov = Math.degrees(2 * Math.atan(vExtentSlope))), this.updateProjectionMatrix());
  }
  getFocalLength() {
    let vExtentSlope = Math.tan(Math.radians(0.5 * this.fov));
    return (0.5 * this.getFilmHeight()) / vExtentSlope;
  }
  getEffectiveFOV() {
    return Math.degrees(2 * Math.atan(Math.tan(Math.radians(0.5 * this.fov)) / this.zoom));
  }
  getFilmWidth() {
    return this.filmGauge * Math.min(this.aspect, 1);
  }
  getFilmHeight() {
    return this.filmGauge / Math.max(this.aspect, 1);
  }
  updateProjectionMatrix() {
    let near = this.near,
      top = (near * Math.tan(Math.radians(0.5 * this.fov))) / this.zoom,
      height = 2 * top,
      width = this.aspect * height,
      left = -0.5 * width,
      skew = (this.view, this.filmOffset);
    (0 !== skew && (left += (near * skew) / this.getFilmWidth()),
      this.projectionMatrix.makePerspective(left, left + width, top, top - height, near, this.far));
  }
}
