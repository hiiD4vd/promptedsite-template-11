Class(function Frag3D(_name) {
  Inherit(this, Object3D);
  const _this = this;
  ((this.layout = this.initClass(SceneLayout, _name)),
    (this.uploadSync = function () {
      return Initializer3D.uploadAll(_this.layout);
    }));
});
