class Line extends Base3D {
  constructor(geometry, shader) {
    (super(),
      (this.geometry = geometry),
      (this.shader = shader),
      (this.isLine = !0),
      (this.id = Renderer.ID++));
  }
  clone() {
    return new Line(this.geometry, this.shader).copy(this);
  }
}
