class Points extends Base3D {
  constructor(geometry, shader) {
    (super(),
      (this._geometry = geometry),
      (this.shader = shader),
      (this.isPoints = !0),
      (this.id = Renderer.ID++),
      shader && (this.shader.mesh = this));
  }
  clone() {
    return new Points(this._geometry, this.shader).copy(this);
  }
  set geometry(g) {
    (Geometry.renderer.resetMeshGeom(this), (this._geometry = g));
  }
  get geometry() {
    return this._geometry;
  }
}
