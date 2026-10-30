Class(function QuadRenderer(
  _texture,
  {
    width: width = 1,
    height: height = 1,
    uniforms: uniforms = {},
    shaderName: shaderName,
    ...options
  } = {},
) {
  Inherit(this, Component);
  const _this = this;
  let _mesh;
  ((_this.rt = null),
    (function () {
      _this.rt = new RenderTarget(width, height, options);
      let shader = _this.initClass(Shader, shaderName || "ScreenQuad", {
        tMap: { value: _texture },
        ...uniforms,
        depthWrite: !1,
        depthTest: !1,
      });
      ((_this.shader = shader), (_mesh = new Mesh(World.QUAD, shader)), (_mesh.frustumCulled = !1));
    })(),
    (_this.render = function () {
      World.RENDERER.renderSingle(_mesh, World.CAMERA, _this.rt);
    }),
    (_this.onDestroy = function () {
      (_mesh.destroy(), _this.rt.destroy());
    }));
});
