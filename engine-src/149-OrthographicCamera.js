class OrthographicCamera extends CameraBase3D {
  constructor(left, right, top, bottom, near, far) {
    (super(),
      (this.isOrthographicCamera = !0),
      (this.zoom = 1),
      (this.left = left),
      (this.right = right),
      (this.top = top),
      (this.bottom = bottom),
      (this.near = void 0 !== near ? near : 0.1),
      (this.far = void 0 !== far ? far : 2e3),
      (this.position.z = 1),
      this.updateProjectionMatrix());
  }
  clone() {
    return new OrthographicCamera().copy(this);
  }
  copy(source, recursive) {
    return (
      CameraBase3D.prototype.copy.call(this, source, recursive),
      (this.left = source.left),
      (this.right = source.right),
      (this.top = source.top),
      (this.bottom = source.bottom),
      (this.near = source.near),
      (this.far = source.far),
      (this.zoom = source.zoom),
      (this.view = null === source.view ? null : Object.assign({}, source.view)),
      this
    );
  }
  updateProjectionMatrix() {
    let dx = (this.right - this.left) / (2 * this.zoom),
      dy = (this.top - this.bottom) / (2 * this.zoom),
      cx = (this.right + this.left) / 2,
      cy = (this.top + this.bottom) / 2,
      left = cx - dx,
      right = cx + dx,
      top = cy + dy,
      bottom = cy - dy;
    this.projectionMatrix.makeOrthographic(left, right, top, bottom, this.near, this.far);
  }
  setViewport(width, height) {
    ((this.left = width / -2),
      (this.right = width / 2),
      (this.top = height / 2),
      (this.bottom = height / -2),
      this.updateProjectionMatrix());
  }
}
