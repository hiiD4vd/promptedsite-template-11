class Scene extends Base3D {
  constructor() {
    (super(),
      (this.autoUpdate = !0),
      (this.toRender = [[], []]),
      (this._displayNeedsUpdate = !0),
      (this.isScene = !0),
      (this.changes = []));
  }
  set displayNeedsUpdate(v) {
    (!0 === v && this.changes.forEach((cb) => cb()), (this._displayNeedsUpdate = v));
  }
  get displayNeedsUpdate() {
    return this._displayNeedsUpdate;
  }
  bindSceneChange(cb) {
    this.changes.push(cb);
  }
  destroy() {
    ((this.toRender[0].length = 0),
      (this.toRender[1].length = 0),
      (this.changes.length = 0),
      super.destroy());
  }
}
