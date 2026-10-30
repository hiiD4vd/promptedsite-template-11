Class(function BlitPass(_forceNuke) {
  Inherit(this, NukePass);
  ((this.uniforms = {}), this.init("BlitPass"), _forceNuke || (this.blitFramebuffer = !0));
});
