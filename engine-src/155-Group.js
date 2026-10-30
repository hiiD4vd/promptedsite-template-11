class Group extends Base3D {
  constructor() {
    (super(), (this.isGroup = !0), (this._occlusionMesh = null));
  }
  generateOcclusionMesh() {
    this._bbVertices = [];
    for (let i = 0; i < 8; i++) this._bbVertices.push(new Vector3());
    if (!this.occlusionCulled) {
      this.occlusionCulled = !0;
      let occShader = new Shader("OcclusionMaterial", {
        bbMin: { value: new Vector3(0, 0, 0) },
        bbMax: { value: new Vector3(1, 1, 1) },
      });
      occShader.wireframe = !0;
      let _occlusionMesh = new Mesh(World.BOX, occShader);
      ((_occlusionMesh.occlusionCulled = !0),
        (_occlusionMesh._occlusionGroup = this),
        (_occlusionMesh.renderOrder = -1e3),
        (_occlusionMesh.hideByOcclusion = !0),
        (_occlusionMesh._occlusionMesh.renderOrder = 1e3),
        this.add(_occlusionMesh),
        (this._occlusionMesh = _occlusionMesh),
        (this.bb = new Box3()));
    }
  }
  updateOcclusionBoundingBox() {
    this.bb.makeEmpty();
    const _this = this;
    (_this.children.forEach((child) => {
      if (void 0 === child._occlusionGroup) {
        child.updateOcclusionMesh();
        let bb = child._geometry.boundingBox,
          m = bb.min,
          M = bb.max;
        (_this._bbVertices[0].set(m.x, m.y, m.z),
          _this._bbVertices[1].set(m.x, m.y, M.z),
          _this._bbVertices[2].set(m.x, M.y, m.z),
          _this._bbVertices[3].set(M.x, m.y, m.z),
          _this._bbVertices[4].set(M.x, M.y, m.z),
          _this._bbVertices[5].set(M.x, m.y, M.z),
          _this._bbVertices[6].set(m.x, M.y, M.z),
          _this._bbVertices[7].set(M.x, M.y, M.z),
          _this._bbVertices.forEach((vertex) => {
            (vertex.applyMatrix4(child.matrix),
              (_this.bb.min.x = Math.min(_this.bb.min.x, vertex.x)),
              (_this.bb.min.y = Math.min(_this.bb.min.y, vertex.y)),
              (_this.bb.min.z = Math.min(_this.bb.min.z, vertex.z)),
              (_this.bb.max.x = Math.max(_this.bb.max.x, vertex.x)),
              (_this.bb.max.y = Math.max(_this.bb.max.y, vertex.y)),
              (_this.bb.max.z = Math.max(_this.bb.max.z, vertex.z)));
          }));
      }
    }),
      this._occlusionMesh?.shader?.set("bbMin", this.bb.min),
      this._occlusionMesh?.shader?.set("bbMax", this.bb.max),
      this._occlusionMesh?._occlusionMesh?.shader?.set(
        "bbMin",
        this.bb.min.add(new Vector3(-0.01, -0.01, -0.01)),
      ),
      this._occlusionMesh?._occlusionMesh?.shader?.set(
        "bbMax",
        this.bb.max.add(new Vector3(0.01, 0.01, 0.01)),
      ),
      this._occlusionMesh.position.copy(this.bb.max.clone().add(this.bb.min).multiplyScalar(0.5)));
  }
  updateOcclusionVisibility(doHide) {
    this.children.forEach((child) => {
      void 0 === child._occlusionGroup && (child.hideByOcclusion = doHide);
    });
  }
}
