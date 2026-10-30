Class(function FXAA() {
  Inherit(this, NukePass);
  ((this.uniforms = { tMask: { value: null } }),
    this.init("FXAA", "FXAA"),
    (this.setMask = function (texture) {
      this.uniforms.tMask.value = texture;
    }));
});
