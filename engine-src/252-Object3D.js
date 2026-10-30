Class(function Object3D() {
  Inherit(this, Component);
  var _this = this,
    _visible = !0;
  ((this.__element = !0),
    (this.group = new Group()),
    (this.group.classRef = this),
    (this.add = function (child) {
      this.group.add(child.group || child);
    }),
    (this.remove = function (child) {
      child && this.group.remove(child.group || child);
    }),
    (this.onDestroy = function () {
      (this.group.destroy(), (this.group.classRef = null));
    }),
    this.set("visible", (v) => (_this.group.visible = _visible = v)),
    this.get("visible", (_) => _visible));
});
