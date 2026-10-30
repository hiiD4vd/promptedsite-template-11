class CameraBase3D extends Base3D {
  constructor() {
    (super(),
      (this.matrixWorldInverse = new Matrix4()),
      (this.projectionMatrix = new Matrix4()),
      (this.isCamera = !0));
  }
  copy(source, recursive) {
    return (
      Base3D.prototype.copy.call(this, source, recursive),
      this.matrixWorldInverse.copy(source.matrixWorldInverse),
      this.projectionMatrix.copy(source.projectionMatrix),
      this
    );
  }
  updateMatrixWorld(force) {
    (Base3D.prototype.updateMatrixWorld.call(this, force),
      this.offsetMatrixWorld && this.matrixWorld.multiply(this.offsetMatrixWorld),
      this.matrixWorldInverse.getInverse(this.matrixWorld));
  }
  clone() {
    return new this.constructor().copy(this);
  }
  destroy() {
    (this._interaction3d && (this._interaction3d.destroy(), (this._interaction3d = null)),
      super.destroy());
  }
}
