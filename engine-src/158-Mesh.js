class Mesh extends Base3D {
  constructor(geometry, shader, isQuery = !1) {
    (super(),
      shader || window.THREAD || (shader = new Shader("TestMaterial")),
      (this._geometry = geometry),
      (this._shader = shader && shader.shader ? shader.shader : shader),
      (this.isMesh = !0));
    if (((this.occlusionMesh = null), !isQuery && !window.THREAD && Renderer.useOcclusionQuery)) {
      let occShader = new Shader("OcclusionMaterial", {
        bbMin: { value: new Vector3() },
        bbMax: { value: new Vector3() },
      });
      occShader.side = Shader.DOUBLE_SIDE;
      let _occlusionMesh = new Mesh(World.BOX, occShader, !0);
      ((_occlusionMesh.occlusionCulled = !1),
        (_occlusionMesh.doNotProject = !0),
        (_occlusionMesh._queryMesh = this),
        (_occlusionMesh.isOcclusionMesh = !0),
        this.add(_occlusionMesh),
        (this._occlusionMesh = _occlusionMesh),
        (this._occlusionDirty = !0));
    }
    ((this.id = Utils.timestamp()), shader && (this._shader.mesh = this));
  }
  clone() {
    return new Mesh(this._geometry, this.shader).copy(this);
  }
  set geometry(g) {
    (Geometry.renderer.resetMeshGeom(this), (this._geometry = g));
  }
  get geometry() {
    return this._geometry;
  }
  set shader(shader) {
    this._shader = shader && shader.shader ? shader.shader : shader;
  }
  get shader() {
    return this._shader;
  }
  isInsideOf(mesh) {
    return (
      this.box3 || (this.box3 = new Box3()),
      this.box3.setFromObject(this),
      mesh.isMeshInside(this)
    );
  }
  isMeshInside(mesh) {
    return (
      this.box3 || (this.box3 = new Box3()),
      this.box3.setFromObject(this),
      mesh.box3.intersectsBox(this.box3)
    );
  }
  updateOcclusionMesh(force) {
    if (this.occlusionCulled && !Renderer.useOcclusionQuery && (this._occlusionDirty || force)) {
      this._geometry.computeBoundingBox();
      let bb = this._geometry.boundingBox;
      (this._occlusionMesh?.shader?.set("bbMin", bb.min.add(new Vector3(-0.01, -0.01, -0.01))),
        this._occlusionMesh?.shader?.set("bbMax", bb.max.add(new Vector3(0.01, 0.01, 0.01))),
        (this._occlusionMesh.renderOrder = this.renderOrder + 1e3),
        (this._occlusionDirty = !1));
    }
  }
}
