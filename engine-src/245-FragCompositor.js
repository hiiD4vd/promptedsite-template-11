Class(function FragCompositor() {
  Inherit(this, Component);
  const _this = this;
  this._initCompositor = function (obj) {
    let uniforms = obj.uniforms ? _this[obj.uniforms.slice(1)] : {};
    if (
      ((_this.shader = _this.initClass(Shader, obj.shader, uniforms)),
      (_this.basicShader = _this.initClass(Shader, obj.basicShader || "ScreenQuad", uniforms)),
      (_this.compositor = _this.initClass(FXSceneCompositor, _this.shader, {
        basicShader: _this.basicShader,
        uniforms: uniforms,
      })),
      RenderManager.type == RenderManager.NORMAL)
    ) {
      ((obj.scene?.slice ? _this[obj.scene.slice(1)] : obj.scene) || World.SCENE).add(
        _this.compositor.group,
      );
    }
  };
});
